import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { zhTW, enUS } from "date-fns/locale";
import UserAvatar from "./UserAvatar";
import useLanguage from "../components/useLanguage";
import "../styles/taskcard.css";

const CATEGORY_COLORS = {
  SA: "#a78bfa",
  Frontend: "#60a5fa",
  Backend: "#34d399",
  Testing: "#f59e0b",
  UIUX: "#f472b6",
};

export default function TaskCard({ task, isEditMode, onClick }) {
  const { t, language } = useLanguage();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: String(task.id),
    disabled: !isEditMode,
    data: {
      type: "task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
    cursor: isEditMode ? "grab" : "pointer",
  };

  const now = new Date();
  const deadlineDate = task.deadline ? new Date(task.deadline) : null;
  const completedDate = task.completed_at ? new Date(task.completed_at) : null;

  const isOverdue =
    task.status !== "done" &&
    deadlineDate &&
    !Number.isNaN(deadlineDate.getTime()) &&
    deadlineDate < now;

  const isCompletedLate =
    task.status === "done" &&
    deadlineDate &&
    completedDate &&
    !Number.isNaN(deadlineDate.getTime()) &&
    !Number.isNaN(completedDate.getTime()) &&
    completedDate > deadlineDate;

  const formatDateByLanguage = (date) => {
    if (!date) return "";

    const locale = language === "zh" ? zhTW : enUS;

    return format(new Date(date), "PPP p", { locale });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card ${isDragging ? "task-card--dragging" : ""} ${
        isEditMode ? "task-card--editable" : ""
      } ${isOverdue ? "task-card--overdue" : ""}`}
      onClick={!isEditMode ? () => onClick?.(task) : undefined}
      {...attributes}
      {...listeners}
    >
      <div className="task-card-top">
        <span
          className="task-category-badge"
          style={{
            backgroundColor: CATEGORY_COLORS[task.category] || "#999",
          }}
        >
          {t.category[task.category] || task.category}
        </span>
      </div>

      <h3>{task.title}</h3>
      <p>{task.description || t.common.noDescription}</p>

      {(task.deadline || task.estimated_days || task.completed_at) && (
        <div className="task-meta">
          {task.deadline && (
            <div
              className={`task-meta-row ${
                isOverdue ? "task-meta-row--overdue" : ""
              }`}
            >
              <span className="task-meta-label">{t.task.deadline}</span>
              <span className="task-meta-value">
                {formatDateByLanguage(task.deadline)}
              </span>
            </div>
          )}

          {task.estimated_days ? (
            <div className="task-meta-row">
              <span className="task-meta-label">{t.task.estimate}</span>
              <span className="task-meta-value">
                {task.estimated_days} {t.task.days}
              </span>
            </div>
          ) : null}

          {task.completed_at && (
            <div
              className={`task-meta-row ${
                isCompletedLate ? "task-meta-row--late" : ""
              }`}
            >
              <span className="task-meta-label">{t.task.completed}</span>
              <span className="task-meta-value">
                {formatDateByLanguage(task.completed_at)}
              </span>
            </div>
          )}
        </div>
      )}

      {task.assignee_name ? (
        <div className="task-assignee">
          <UserAvatar
            name={task.assignee_name}
            color={task.assignee_color}
            size="sm"
          />
          <div className="task-assignee-info">
            <span className="task-assignee-label">{t.task.assignee}</span>
            <span className="task-assignee-name">{task.assignee_name}</span>
          </div>
        </div>
      ) : (
        <div className="task-assignee task-assignee--empty">
          <div className="task-assignee-empty-dot" />
          <span>{t.common.unassigned}</span>
        </div>
      )}
    </div>
  );
}
