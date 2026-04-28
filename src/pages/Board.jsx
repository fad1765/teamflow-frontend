import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UserAvatar from "../components/UserAvatar";
import KanbanBoard from "../components/KanbanBoard";
import ConfirmModal from "../components/ConfirmModal";
import EditTaskModal from "../components/EditTaskModal";
import InviteMembersModal from "../components/InviteMembersModal";
import Toast from "../components/Toast";
import api from "../services/api";
import useLanguage from "../components/useLanguage";
import DatePicker from "react-datepicker";
import { getDateLocaleName, getDateFormat } from "../utils/dateLocale";
import { toLocalDateTimeString } from "../utils/dateValue";
import "../styles/board.css";

export default function Board() {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token") || "";
  const { language, toggleLanguage } = useLanguage();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingTask, setEditingTask] = useState(null);
  const [editTaskModalOpen, setEditTaskModalOpen] = useState(false);

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteConfirmOpen, setInviteConfirmOpen] = useState(false);
  const [pendingInviteMembers, setPendingInviteMembers] = useState([]);

  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalTasks, setOriginalTasks] = useState([]);
  const [enterEditModalOpen, setEnterEditModalOpen] = useState(false);
  const [cancelEditModalOpen, setCancelEditModalOpen] = useState(false);

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
    const init = async () => {
      try {
        setLoading(true);

        const [projectRes, tasksRes, membersRes, usersRes] = await Promise.all([
          api.get(`/projects/${projectId}`),
          api.get(`/projects/${projectId}/tasks`),
          api.get(`/projects/${projectId}/members`),
          api.get("/users"),
        ]);

        const projectData = projectRes.data || null;
        const tasksData = Array.isArray(tasksRes.data) ? tasksRes.data : [];
        const membersData = Array.isArray(membersRes.data)
          ? membersRes.data
          : [];
        const usersData = Array.isArray(usersRes.data) ? usersRes.data : [];

        setProject(projectData);
        setTasks(tasksData);
        setOriginalTasks(tasksData);
        setMembers(membersData);
        setAllUsers(usersData);

        if (membersData.length > 0) {
          setForm((prev) => ({
            ...prev,
            assignee_id: String(membersData[0].user_id),
          }));
        }
      } catch (err) {
        console.error(err);
        navigate("/projects");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [projectId, navigate]);

  const showToast = (message, type = "info") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

    setToast({ open: true, message, type });

    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, open: false }));
    }, 2500);
  };

  const refreshMembers = async () => {
    try {
      const res = await api.get(`/projects/${projectId}/members`);
      const membersData = Array.isArray(res.data) ? res.data : [];
      setMembers(membersData);

      if (
        membersData.length > 0 &&
        !membersData.some(
          (member) => String(member.user_id) === String(form.assignee_id),
        )
      ) {
        setForm((prev) => ({
          ...prev,
          assignee_id: String(membersData[0].user_id),
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const refreshAllUsers = async () => {
    try {
      const res = await api.get("/users");
      const usersData = Array.isArray(res.data) ? res.data : [];
      setAllUsers(usersData);
    } catch (err) {
      console.error(err);
    }
  };

  const inviteCandidates = useMemo(() => {
    const memberIds = new Set(members.map((member) => member.user_id));

    return allUsers.filter((user) => {
      if (user.id === currentUser?.id) return false;
      return !memberIds.has(user.id);
    });
  }, [allUsers, members, currentUser]);

  const selectedAssignee = useMemo(() => {
    return (
      members.find(
        (member) => String(member.user_id) === String(form.assignee_id),
      ) || null
    );
  }, [members, form.assignee_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      showToast(
        language === "zh" ? "請輸入任務標題" : "Please enter a title",
        "warning",
      );
      return;
    }

    if (!form.assignee_id) {
      showToast(
        language === "zh" ? "請選擇指派成員" : "Please choose an assignee",
        "warning",
      );
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

      const res = await api.post(`/projects/${projectId}/tasks`, payload);
      const nextTasks = [res.data, ...tasks];

      setTasks(nextTasks);
      setOriginalTasks(nextTasks);

      setForm((prev) => ({
        ...prev,
        title: "",
        description: "",
        status: "todo",
        category: "Frontend",
        deadline: "",
        estimated_days: "",
      }));

      showToast(language === "zh" ? "任務建立成功" : "Task created", "success");
    } catch (err) {
      console.error(err);
      showToast(
        language === "zh" ? "建立任務失敗" : "Failed to create task",
        "error",
      );
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

      showToast(language === "zh" ? "任務更新成功" : "Task updated", "success");
    } catch (err) {
      console.error(err);
      showToast(
        language === "zh" ? "更新任務失敗" : "Failed to update task",
        "error",
      );
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

    showToast(
      language === "zh" ? "已進入編輯模式" : "Edit mode enabled",
      "info",
    );
  };

  const handleCancelEdit = () => {
    if (hasUnsavedChanges) {
      setCancelEditModalOpen(true);
      return;
    }

    setIsEditMode(false);

    showToast(
      language === "zh" ? "已離開編輯模式" : "Edit mode closed",
      "info",
    );
  };

  const confirmCancelEdit = () => {
    setTasks(originalTasks);
    setIsEditMode(false);
    setHasUnsavedChanges(false);
    setCancelEditModalOpen(false);

    showToast(
      language === "zh" ? "已捨棄未儲存變更" : "Changes discarded",
      "warning",
    );
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

        showToast(
          language === "zh" ? "沒有需要儲存的變更" : "No changes to save",
          "info",
        );
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

      showToast(
        language === "zh" ? "看板變更已儲存" : "Board changes saved",
        "success",
      );
    } catch (err) {
      console.error(err);
      showToast(
        language === "zh" ? "儲存失敗" : "Failed to save changes",
        "error",
      );
    }
  };

  const handleInviteMembers = (selectedMembers) => {
    if (!selectedMembers || selectedMembers.length === 0) {
      showToast(
        language === "zh"
          ? "請先選擇要邀請的成員"
          : "Please choose a member first",
        "warning",
      );
      return;
    }

    setPendingInviteMembers(selectedMembers);
    setInviteModalOpen(false);
    setInviteConfirmOpen(true);
  };

  const confirmSendInvitations = async () => {
    if (!pendingInviteMembers.length) return;

    try {
      for (const member of pendingInviteMembers) {
        await api.post(`/projects/${projectId}/invitations`, {
          user_id: member.id,
        });
      }

      await refreshMembers();
      setInviteConfirmOpen(false);
      setInviteModalOpen(false);
      setPendingInviteMembers([]);

      showToast(
        language === "zh" ? "邀請已送出" : "Invitations sent",
        "success",
      );
    } catch (err) {
      console.error(err);
      showToast(
        err.response?.data?.detail ||
          (language === "zh" ? "邀請失敗" : "Failed to invite"),
        "error",
      );
    }
  };

  const cancelSendInvitations = () => {
    setInviteConfirmOpen(false);
    setInviteModalOpen(true);
  };

  const logout = () => {
    setLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="board-page">
      <div className="topbar">
        <div>
          <h1>{project?.name || "Loading..."}</h1>
          <p className="topbar-subtitle">
            {project?.type === "team"
              ? language === "zh"
                ? "團體專案"
                : "Team Project"
              : language === "zh"
                ? "個人專案"
                : "Personal Project"}
          </p>
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

          <button
            type="button"
            className="back-projects-btn"
            onClick={() => navigate("/projects")}
          >
            {language === "zh" ? "返回專案" : "Back to Projects"}
          </button>

          {project?.type === "team" && (
            <button
              type="button"
              className="invite-btn"
              onClick={async () => {
                await refreshAllUsers();
                setInviteModalOpen(true);
              }}
            >
              {language === "zh" ? "邀請成員" : "Invite Members"}
            </button>
          )}

          {!isEditMode ? (
            <button
              type="button"
              className="edit-btn"
              onClick={handleEnterEditMode}
            >
              {language === "zh" ? "編輯看板" : "Edit Board"}
            </button>
          ) : (
            <div className="edit-actions">
              <button
                type="button"
                className="save-btn"
                onClick={handleSaveChanges}
              >
                {language === "zh" ? "儲存變更" : "Save Changes"}
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={handleCancelEdit}
              >
                {language === "zh" ? "取消" : "Cancel"}
              </button>
            </div>
          )}

          <button type="button" className="logout-btn" onClick={logout}>
            {language === "zh" ? "登出" : "Logout"}
          </button>
        </div>
      </div>

      <div className="board-toolbar">
        <form className="task-form" onSubmit={handleCreateTask}>
          <div className="task-form-grid">
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={form.title}
              onChange={handleChange}
            />

            <input
              type="text"
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
            />

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              <option value="SA">SA</option>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Testing">Testing</option>
              <option value="UIUX">UIUX</option>
            </select>

            <select name="status" value={form.status} onChange={handleChange}>
              <option value="todo">
                {language === "zh" ? "待處理" : "Todo"}
              </option>
              <option value="doing">
                {language === "zh" ? "進行中" : "Doing"}
              </option>
              <option value="done">
                {language === "zh" ? "已完成" : "Done"}
              </option>
            </select>

            <select
              name="assignee_id"
              value={form.assignee_id}
              onChange={handleChange}
            >
              {members.length === 0 ? (
                <option value="">
                  {language === "zh" ? "尚無專案成員" : "No project members"}
                </option>
              ) : (
                members.map((member) => (
                  <option key={member.user_id} value={String(member.user_id)}>
                    {member.name}
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
              placeholder={language === "zh" ? "預估天數" : "Estimated days"}
              min="1"
              value={form.estimated_days}
              onChange={handleChange}
            />

            <button type="submit" className="task-submit-btn">
              {language === "zh" ? "新增任務" : "Add Task"}
            </button>
          </div>
        </form>

        <div className="board-meta">
          <span>
            {language === "zh" ? "成員" : "Members"}: {members.length}
          </span>
          <span>
            {language === "zh" ? "任務" : "Tasks"}: {tasks.length}
          </span>
          {selectedAssignee && (
            <span className="board-meta-assignee">
              {language === "zh" ? "目前指派人" : "Current Assignee"}:{" "}
              {selectedAssignee.name}
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <p>{language === "zh" ? "載入中..." : "Loading..."}</p>
      ) : (
        <KanbanBoard
          tasks={tasks}
          setTasks={setTasks}
          isEditMode={isEditMode}
          setHasUnsavedChanges={setHasUnsavedChanges}
          showToastMessage={showToast}
          onTaskClick={handleOpenEditTask}
        />
      )}

      <InviteMembersModal
        key={inviteModalOpen ? "open" : "closed"}
        open={inviteModalOpen}
        users={inviteCandidates}
        onClose={() => setInviteModalOpen(false)}
        onSave={handleInviteMembers}
      />

      <ConfirmModal
        open={inviteConfirmOpen}
        title={language === "zh" ? "發出邀請" : "Send Invitation"}
        message={
          pendingInviteMembers.length > 0
            ? language === "zh"
              ? `確定要邀請 ${pendingInviteMembers
                  .map((member) => member.name)
                  .join("、")} 加入這個專案嗎？`
              : `Are you sure you want to invite ${pendingInviteMembers
                  .map((member) => member.name)
                  .join(", ")} to this project?`
            : ""
        }
        confirmText={language === "zh" ? "確認邀請" : "Confirm"}
        cancelText={language === "zh" ? "取消" : "Cancel"}
        onConfirm={confirmSendInvitations}
        onCancel={cancelSendInvitations}
      />

      <ConfirmModal
        open={logoutModalOpen}
        title={language === "zh" ? "登出帳戶" : "Logout"}
        message={
          language === "zh"
            ? "確定要登出目前帳戶嗎？"
            : "Are you sure you want to log out?"
        }
        confirmText={language === "zh" ? "登出" : "Logout"}
        cancelText={language === "zh" ? "取消" : "Cancel"}
        onConfirm={confirmLogout}
        onCancel={() => setLogoutModalOpen(false)}
      />

      <ConfirmModal
        open={enterEditModalOpen}
        title={language === "zh" ? "進入編輯模式" : "Enter Edit Mode"}
        message={
          language === "zh"
            ? "進入後可拖曳任務並重新排序。"
            : "You can drag tasks and reorder the board in edit mode."
        }
        confirmText={language === "zh" ? "進入" : "Enter"}
        cancelText={language === "zh" ? "取消" : "Cancel"}
        onConfirm={confirmEnterEditMode}
        onCancel={() => setEnterEditModalOpen(false)}
      />

      <ConfirmModal
        open={cancelEditModalOpen}
        title={language === "zh" ? "捨棄變更" : "Discard Changes"}
        message={
          language === "zh"
            ? "尚有未儲存變更，確定要離開嗎？"
            : "You have unsaved changes. Are you sure you want to leave?"
        }
        confirmText={language === "zh" ? "捨棄" : "Discard"}
        cancelText={language === "zh" ? "繼續編輯" : "Keep Editing"}
        onConfirm={confirmCancelEdit}
        onCancel={() => setCancelEditModalOpen(false)}
        danger
      />

      <EditTaskModal
        key={editingTask?.id || "empty-task"}
        open={editTaskModalOpen}
        task={editingTask}
        users={members}
        onClose={handleCloseEditTask}
        onSave={handleUpdateTask}
        token={token}
        currentUser={currentUser}
      />

      <Toast open={toast.open} message={toast.message} type={toast.type} />
    </div>
  );
}
