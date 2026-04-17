import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserAvatar from "../components/UserAvatar";
import KanbanBoard from "../components/KanbanBoard";
import ConfirmModal from "../components/ConfirmModal";
import EditTaskModal from "../components/EditTaskModal";
import Toast from "../components/Toast";
import api from "../services/api";
import useLanguage from "../components/useLanguage";
import DatePicker from "react-datepicker";
import { getDateLocaleName, getDateFormat } from "../utils/dateLocale";
import { toLocalDateTimeString } from "../utils/dateValue";
import "../styles/board.css";

export default function Board() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const { language, toggleLanguage, t } = useLanguage();

  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isEditMode, setIsEditMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalTasks, setOriginalTasks] = useState([]);

  const [enterEditModalOpen, setEnterEditModalOpen] = useState(false);
  const [cancelEditModalOpen, setCancelEditModalOpen] = useState(false);

  const [editingTask, setEditingTask] = useState(null);
  const [editTaskModalOpen, setEditTaskModalOpen] = useState(false);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "info",
  });

  const toastTimerRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "todo",
    category: "Frontend",
    assignee_id: "",
    deadline: "",
    estimated_days: "",
  });

  useEffect(() => {
    const initializePage = async () => {
      try {
        setLoading(true);

        const [tasksRes, usersRes] = await Promise.all([
          api.get("/tasks"),
          api.get("/users"),
        ]);

        const tasksData = Array.isArray(tasksRes.data) ? tasksRes.data : [];
        const usersData = Array.isArray(usersRes.data) ? usersRes.data : [];

        setTasks(tasksData);
        setOriginalTasks(tasksData);
        setUsers(usersData);

        if (usersData.length > 0) {
          setForm((prev) => ({
            ...prev,
            assignee_id: String(usersData[0].id),
          }));
        }
      } catch (err) {
        console.error(err);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [navigate]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const selectedAssignee = useMemo(() => {
    return (
      users.find((user) => String(user.id) === String(form.assignee_id)) || null
    );
  }, [users, form.assignee_id]);

  const showToastMessage = (message, type = "info") => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({
      open: true,
      message,
      type,
    });

    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, open: false }));
    }, 2500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      alert(t.task.enterTitle);
      return;
    }

    if (!form.assignee_id) {
      alert(t.task.chooseAssignee);
      return;
    }

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        status: form.status,
        category: form.category,
        assignee_id: Number(form.assignee_id),
        deadline: form.deadline || null,
        estimated_days: form.estimated_days
          ? Number(form.estimated_days)
          : null,
      };

      const res = await api.post("/tasks", payload);

      const newTasks = [res.data, ...tasks];
      setTasks(newTasks);
      setOriginalTasks(newTasks);

      setForm((prev) => ({
        ...prev,
        title: "",
        description: "",
        status: "todo",
        category: "Frontend",
        deadline: "",
        estimated_days: "",
      }));

      showToastMessage(t.task.taskCreated, "success");
    } catch (err) {
      console.error(err);
      showToastMessage(t.task.taskCreateFailed, "error");
    }
  };

  const handleOpenEditTask = (task) => {
    if (isEditMode) return;
    setEditingTask(task);
    setEditTaskModalOpen(true);
  };

  const handleCloseEditTask = () => {
    setEditingTask(null);
    setEditTaskModalOpen(false);
  };

  const handleUpdateTask = async (taskId, payload) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, payload);

      const updatedTasks = tasks.map((task) =>
        task.id === taskId ? res.data : task,
      );

      setTasks(updatedTasks);
      setOriginalTasks(updatedTasks);
      setEditTaskModalOpen(false);
      setEditingTask(null);
      showToastMessage(t.task.taskUpdated, "success");
    } catch (err) {
      console.error(err);
      showToastMessage(t.task.taskUpdateFailed, "error");
    }
  };

  const handleEnterEditMode = () => {
    setEnterEditModalOpen(true);
  };

  const confirmEnterEditMode = () => {
    setOriginalTasks(tasks);
    setIsEditMode(true);
    setHasUnsavedChanges(false);
    setEnterEditModalOpen(false);
    showToastMessage(t.board.editModeEnabled, "info");
  };

  const handleCancelEdit = () => {
    if (hasUnsavedChanges) {
      setCancelEditModalOpen(true);
      return;
    }

    setIsEditMode(false);
    showToastMessage(t.board.editModeClosed, "info");
  };

  const confirmCancelEdit = () => {
    setTasks(originalTasks);
    setIsEditMode(false);
    setHasUnsavedChanges(false);
    setCancelEditModalOpen(false);
    showToastMessage(t.board.changesDiscarded, "warning");
  };

  const handleSaveChanges = async () => {
    try {
      const changedTasks = tasks.filter((task) => {
        const original = originalTasks.find((item) => item.id === task.id);
        if (!original) return false;

        return (
          original.status !== task.status || original.position !== task.position
        );
      });

      if (changedTasks.length === 0) {
        setIsEditMode(false);
        setHasUnsavedChanges(false);
        showToastMessage(t.board.noChangesToSave, "info");
        return;
      }

      const payload = {
        tasks: changedTasks.map((task) => ({
          id: Number(task.id),
          status: String(task.status),
          position: Number(task.position),
        })),
      };

      await api.put("/tasks/reorder", payload);

      setOriginalTasks(tasks);
      setHasUnsavedChanges(false);
      setIsEditMode(false);
      showToastMessage(t.board.boardChangesSaved, "success");
    } catch (err) {
      console.error("save error:", err);
      console.error("save error response:", err.response?.data);
      showToastMessage(t.toast.failedToSave, "error");
    }
  };

  const logout = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(t.board.logoutConfirm);
      if (!confirmed) return;
    }

    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="board-page">
      <div className="topbar">
        <div>
          <h1>{t.board.title}</h1>
          <p className="topbar-subtitle">{t.board.subtitle}</p>
        </div>

        <div className="topbar-right">
          <button className="language-btn" onClick={toggleLanguage}>
            {language === "zh" ? "EN" : "中文"}
          </button>

          {currentUser && (
            <div className="current-user-chip">
              <UserAvatar
                name={currentUser.name}
                color={currentUser.color}
                size="sm"
              />
              <span>{currentUser.name}</span>
            </div>
          )}

          {!isEditMode ? (
            <button className="edit-btn" onClick={handleEnterEditMode}>
              {t.common.editBoard}
            </button>
          ) : (
            <div className="edit-actions">
              <button className="save-btn" onClick={handleSaveChanges}>
                {t.common.saveChanges}
              </button>
              <button className="cancel-btn" onClick={handleCancelEdit}>
                {t.common.cancel}
              </button>
            </div>
          )}

          <button className="logout-btn" onClick={logout}>
            {t.common.logout}
          </button>
        </div>
      </div>

      {isEditMode && (
        <div className="board-edit-banner">
          <span>{t.board.editModeBanner}</span>
          {hasUnsavedChanges && (
            <strong className="board-edit-banner__status">
              {t.board.unsavedChanges}
            </strong>
          )}
        </div>
      )}

      <div className="board-toolbar">
        <form className="task-form" onSubmit={handleCreateTask}>
          <div className="task-form-grid">
            <input
              type="text"
              name="title"
              placeholder={t.task.title}
              value={form.title}
              onChange={handleChange}
            />

            <input
              type="text"
              name="description"
              placeholder={t.task.description}
              value={form.description}
              onChange={handleChange}
            />

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              <option value="SA">{t.category.SA}</option>
              <option value="Frontend">{t.category.Frontend}</option>
              <option value="Backend">{t.category.Backend}</option>
              <option value="Testing">{t.category.Testing}</option>
              <option value="UIUX">{t.category.UIUX}</option>
            </select>

            <select name="status" value={form.status} onChange={handleChange}>
              <option value="todo">{t.status.todo}</option>
              <option value="doing">{t.status.doing}</option>
              <option value="done">{t.status.done}</option>
            </select>

            <select
              name="assignee_id"
              value={form.assignee_id}
              onChange={handleChange}
            >
              {users.length === 0 ? (
                <option value="">{t.common.noUsersAvailable}</option>
              ) : (
                users.map((user) => (
                  <option key={user.id} value={String(user.id)}>
                    {user.name}
                  </option>
                ))
              )}
            </select>

            <div className="date-picker-field">
              <DatePicker
                selected={form.deadline ? new Date(form.deadline) : null}
                onChange={(date) =>
                  setForm((prev) => ({
                    ...prev,
                    deadline: date ? toLocalDateTimeString(date) : "",
                  }))
                }
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat={getDateFormat(language)}
                locale={getDateLocaleName(language)}
                placeholderText={
                  language === "zh" ? "選擇日期時間" : "Select date & time"
                }
                className="date-picker-input"
                popperPlacement="bottom-start"
              />
            </div>

            <input
              type="number"
              name="estimated_days"
              placeholder={t.task.estimatedDays}
              min="1"
              value={form.estimated_days}
              onChange={handleChange}
            />

            <button
              type="submit"
              className="task-submit-btn"
              disabled={users.length === 0}
            >
              {t.task.addTask}
            </button>
          </div>
        </form>

        <div className="board-meta">
          <span>
            {t.common.users}: {users.length}
          </span>
          <span>
            {t.common.tasks}: {tasks.length}
          </span>
          {selectedAssignee && (
            <span className="board-meta-assignee">
              {t.common.currentAssignee}: {selectedAssignee.name}
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <p>{t.common.loading}</p>
      ) : (
        <KanbanBoard
          tasks={tasks}
          setTasks={setTasks}
          isEditMode={isEditMode}
          setHasUnsavedChanges={setHasUnsavedChanges}
          showToastMessage={showToastMessage}
          onTaskClick={handleOpenEditTask}
        />
      )}

      <ConfirmModal
        open={enterEditModalOpen}
        title={t.board.enterEditModeTitle}
        message={t.board.enterEditModeMessage}
        confirmText={t.common.enter}
        cancelText={t.common.cancel}
        onConfirm={confirmEnterEditMode}
        onCancel={() => setEnterEditModalOpen(false)}
      />

      <ConfirmModal
        open={cancelEditModalOpen}
        title={t.board.discardChangesTitle}
        message={t.board.discardChangesMessage}
        confirmText={t.common.discard}
        cancelText={t.common.keepEditing}
        onConfirm={confirmCancelEdit}
        onCancel={() => setCancelEditModalOpen(false)}
        danger
      />

      <EditTaskModal
        key={editingTask?.id || "empty-task"}
        open={editTaskModalOpen}
        task={editingTask}
        users={users}
        onClose={handleCloseEditTask}
        onSave={handleUpdateTask}
      />

      <Toast open={toast.open} message={toast.message} type={toast.type} />
    </div>
  );
}
