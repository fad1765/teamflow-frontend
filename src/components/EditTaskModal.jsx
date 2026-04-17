import { useState } from "react";
import useLanguage from "../components/useLanguage";
import "../styles/modal.css";
import DatePicker from "react-datepicker";
import { getDateLocaleName, getDateFormat } from "../utils/dateLocale";
import { toLocalDateTimeString } from "../utils/dateValue";

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
    deadline: task?.deadline ? formatForDateTimeLocal(task.deadline) : "",
    estimated_days: task?.estimated_days ? String(task.estimated_days) : "",
  };
}

export default function EditTaskModal({ open, task, users, onClose, onSave }) {
  const { t, language } = useLanguage();

  const [form, setForm] = useState(() => createInitialForm(task));

  if (!open || !task) return null;

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
      deadline: form.deadline || null,
      estimated_days: form.estimated_days ? Number(form.estimated_days) : null,
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="confirm-modal edit-task-modal"
        onClick={(e) => e.stopPropagation()}
      >
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
              {users.map((user) => (
                <option key={user.id} value={String(user.id)}>
                  {user.name}
                </option>
              ))}
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
  );
}
