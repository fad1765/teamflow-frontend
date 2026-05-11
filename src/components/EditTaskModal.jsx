import { useEffect, useMemo, useState } from "react";
import useLanguage from "../components/useLanguage";
import "../styles/modal.css";
import DatePicker from "react-datepicker";
import { getDateLocaleName, getDateFormat } from "../utils/dateLocale";
import { toLocalDateTimeString } from "../utils/dateValue";
import ConfirmModal from "./ConfirmModal";
import { useToast } from "../context/ToastContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function formatForDateTimeLocal(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (num) => String(num).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function createInitialForm(task) {
  return {
    title: task?.title || "",
    description: task?.description || "",
    status: task?.status || "todo",
    category: task?.category || "Frontend",
    assignee_id: task?.assignee_id ? String(task.assignee_id) : "",
    start_date: task?.start_date ? formatForDateTimeLocal(task.start_date) : "",
    deadline: task?.deadline ? formatForDateTimeLocal(task.deadline) : "",
    estimated_days: task?.estimated_days ? String(task.estimated_days) : "",
  };
}

export default function EditTaskModal({
  open,
  task,
  users,
  onClose,
  onSave,
  token,
  currentUser,
}) {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const [form, setForm] = useState(() => createInitialForm(task));
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [expandedComments, setExpandedComments] = useState([]);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const normalizedUsers = useMemo(() => {
    return Array.isArray(users) ? users : [];
  }, [users]);

  const getUserId = (user) => user?.user_id ?? user?.id;

  useEffect(() => {
    if (!open || !task) return;

    setForm(createInitialForm(task));
    setNewComment("");
    setEditingId(null);
    setEditText("");
    setExpandedComments([]);
    setDeleteTargetId(null);
  }, [open, task]);

  useEffect(() => {
    if (!open || !task?.id || !token) return;
    fetchComments();
  }, [open, task?.id, token]);

  if (!open || !task) return null;

  async function fetchComments() {
    try {
      setCommentsLoading(true);
      setCommentError("");

      const res = await fetch(`${API_BASE_URL}/comments/task/${task.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("取得留言失敗");
      }

      const data = await res.json();
      setComments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setCommentError("取得留言失敗");
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.title.trim()) return;

    onSave(task.id, {
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      category: form.category,
      assignee_id: form.assignee_id ? Number(form.assignee_id) : null,
      start_date: form.start_date || null,
      deadline: form.deadline || null,
      estimated_days: form.estimated_days ? Number(form.estimated_days) : null,
    });
  };

  const handleAddComment = async () => {
    const content = newComment.trim();
    if (!content || !token) return;

    try {
      setSubmittingComment(true);
      setCommentError("");

      const res = await fetch(`${API_BASE_URL}/comments/task/${task.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        throw new Error("新增留言失敗");
      }

      setNewComment("");
      await fetchComments();

      showToast(language === "zh" ? "留言已送出" : "Comment added", "success");
    } catch (error) {
      console.error(error);
      showToast(
        language === "zh" ? "新增留言失敗" : "Failed to add comment",
        "error",
      );
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleLike = async (commentId) => {
    if (!token) return;

    try {
      setActionLoadingId(commentId);
      setCommentError("");

      const res = await fetch(`${API_BASE_URL}/comments/${commentId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("按讚失敗");
      }
      await fetchComments();

      showToast(language === "zh" ? "已按讚" : "Liked", "success");
    } catch (error) {
      console.error(error);
      showToast(language === "zh" ? "按讚失敗" : "Failed to like", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStartEdit = (comment) => {
    setEditingId(comment.id);
    setEditText(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const handleSaveEdit = async (commentId) => {
    const content = editText.trim();
    if (!content || !token) return;

    try {
      setActionLoadingId(commentId);
      setCommentError("");

      const res = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        throw new Error("更新留言失敗");
      }

      setEditingId(null);
      setEditText("");
      await fetchComments();

      showToast(
        language === "zh" ? "留言已更新" : "Comment updated",
        "success",
      );
    } catch (error) {
      console.error(error);
      showToast(
        language === "zh" ? "更新留言失敗" : "Failed to update comment",
        "error",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAskDelete = (commentId) => {
    setDeleteTargetId(commentId);
  };

  const handleConfirmDelete = async () => {
    if (!token || !deleteTargetId) return;

    try {
      setActionLoadingId(deleteTargetId);
      setCommentError("");

      const res = await fetch(`${API_BASE_URL}/comments/${deleteTargetId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("刪除留言失敗");
      }

      setDeleteTargetId(null);
      await fetchComments();

      showToast(
        language === "zh" ? "留言已刪除" : "Comment deleted",
        "warning",
      );
    } catch (error) {
      console.error(error);
      showToast(
        language === "zh" ? "刪除留言失敗" : "Failed to delete comment",
        "error",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteTargetId(null);
  };

  const handleToggleExpand = (id) => {
    setExpandedComments((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="confirm-modal edit-task-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="edit-task-modal-scroll">
          <div className="confirm-modal-header">
            <h3>{t.task.editTask}</h3>
            <button
              type="button"
              className="confirm-modal-close"
              onClick={onClose}
              aria-label={t.modal.close}
            >
              ×
            </button>
          </div>

          <form className="edit-task-form" onSubmit={handleSubmit}>
            <div className="edit-task-grid">
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
                <option value="">{t.common.unassigned}</option>
                {normalizedUsers.map((userItem) => (
                  <option
                    key={getUserId(userItem)}
                    value={String(getUserId(userItem))}
                  >
                    {userItem.name}
                  </option>
                ))}
              </select>

              <div className="date-picker-field">
                <DatePicker
                  selected={form.start_date ? new Date(form.start_date) : null}
                  onChange={(date) =>
                    setForm((prev) => ({
                      ...prev,
                      start_date: date ? toLocalDateTimeString(date) : "",
                    }))
                  }
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat={getDateFormat(language)}
                  locale={getDateLocaleName(language)}
                  placeholderText={
                    language === "zh" ? "選擇開始日期" : "Select start date"
                  }
                  className="date-picker-input"
                  popperPlacement="bottom-start"
                  portalId="root"
                />
              </div>

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
                    language === "zh" ? "選擇截止日期" : "Select date & time"
                  }
                  className="date-picker-input"
                  popperPlacement="bottom-start"
                  portalId="root"
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
            </div>

            <div className="task-comments-section">
              <div className="task-comments-header">
                <h4 className="comments-title">Comments</h4>
                <button
                  type="button"
                  className="comments-refresh-btn"
                  onClick={fetchComments}
                >
                  {language === "zh" ? "重新整理" : "Refresh"}
                </button>
              </div>

              {commentError ? (
                <p className="comments-error">{commentError}</p>
              ) : null}

              <div className="comments-list">
                {commentsLoading ? (
                  <div className="comments-empty">
                    {language === "zh"
                      ? "留言載入中..."
                      : "Loading comments..."}
                  </div>
                ) : comments.length === 0 ? (
                  <div className="comments-empty">
                    {language === "zh" ? "目前還沒有留言" : "No comments yet"}
                  </div>
                ) : (
                  comments.map((comment) => {
                    const canEditOrDelete =
                      currentUser && comment.user_id === currentUser.id;

                    return (
                      <div key={comment.id} className="comment-item">
                        <div className="comment-header">
                          <div className="comment-author-meta">
                            <div
                              className="comment-avatar"
                              style={{
                                background:
                                  normalizedUsers.find(
                                    (u) => getUserId(u) === comment.user_id,
                                  )?.color || "#94a3b8",
                              }}
                            >
                              {comment.user_name?.slice(0, 1)?.toUpperCase() ||
                                "U"}
                            </div>

                            <div className="comment-author-text">
                              <span className="comment-user">
                                {comment.user_name}
                              </span>
                              <span className="comment-time">
                                {new Date(comment.created_at).toLocaleString()}
                                {comment.updated_at ? (
                                  <span className="comment-edited-tag">
                                    {" "}
                                    · {language === "zh" ? "已編輯" : "edited"}
                                  </span>
                                ) : null}
                              </span>
                            </div>
                          </div>
                        </div>

                        {editingId === comment.id ? (
                          <div className="comment-edit-box">
                            <textarea
                              className="comment-edit-textarea"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              rows={3}
                            />
                            <div className="comment-edit-actions">
                              <button
                                type="button"
                                className="comment-secondary-btn"
                                onClick={handleCancelEdit}
                              >
                                {language === "zh" ? "取消" : "Cancel"}
                              </button>
                              <button
                                type="button"
                                className="comment-primary-btn"
                                onClick={() => handleSaveEdit(comment.id)}
                                disabled={
                                  actionLoadingId === comment.id ||
                                  !editText.trim()
                                }
                              >
                                {language === "zh" ? "儲存" : "Save"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="comment-body-row">
                            <div
                              className={`comment-content ${
                                expandedComments.includes(comment.id)
                                  ? "expanded"
                                  : "collapsed"
                              }`}
                              onClick={() => handleToggleExpand(comment.id)}
                            >
                              {comment.content}
                            </div>

                            <div className="comment-actions comment-actions--right">
                              <button
                                type="button"
                                className={`comment-action-btn like-btn ${
                                  comment.is_liked ? "is-liked" : ""
                                }`}
                                onClick={() => handleLike(comment.id)}
                                disabled={actionLoadingId === comment.id}
                              >
                                <span className="comment-action-icon">❤</span>
                                <span>{comment.likes_count || 0}</span>
                              </button>

                              {canEditOrDelete ? (
                                <>
                                  <button
                                    type="button"
                                    className="comment-action-btn"
                                    onClick={() => handleStartEdit(comment)}
                                    disabled={actionLoadingId === comment.id}
                                  >
                                    {language === "zh" ? "編輯" : "Edit"}
                                  </button>

                                  <button
                                    type="button"
                                    className="comment-action-btn danger"
                                    onClick={() => handleAskDelete(comment.id)}
                                    disabled={actionLoadingId === comment.id}
                                  >
                                    {language === "zh" ? "刪除" : "Delete"}
                                  </button>
                                </>
                              ) : null}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="comment-input-box">
                <textarea
                  className="comment-textarea"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={
                    language === "zh"
                      ? "寫下目前進度、卡住的地方，或提醒事項..."
                      : "Write progress, blockers, or reminders..."
                  }
                  rows={3}
                />
                <div className="comment-input-actions">
                  <button
                    type="button"
                    className="comment-send-btn"
                    onClick={handleAddComment}
                    disabled={submittingComment || !newComment.trim()}
                  >
                    {submittingComment
                      ? language === "zh"
                        ? "送出中..."
                        : "Sending..."
                      : language === "zh"
                        ? "送出留言"
                        : "Send"}
                  </button>
                </div>
              </div>
            </div>

            <div className="confirm-modal-actions">
              <button
                type="button"
                className="confirm-modal-cancel"
                onClick={onClose}
              >
                {t.common.cancel}
              </button>
              <button type="submit" className="confirm-modal-confirm">
                {t.common.saveChanges}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmModal
        open={deleteTargetId !== null}
        title={language === "zh" ? "刪除留言" : "Delete Comment"}
        message={
          language === "zh"
            ? "確定要刪除這則留言嗎？刪除後將無法復原。"
            : "Are you sure you want to delete this comment? This action cannot be undone."
        }
        confirmText={language === "zh" ? "刪除" : "Delete"}
        cancelText={language === "zh" ? "取消" : "Cancel"}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        danger
      />
    </div>
  );
}
