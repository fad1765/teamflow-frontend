import { useMemo } from "react";
import {
  FaListCheck,
  FaClock,
  FaCircleCheck,
  FaTriangleExclamation,
  FaCalendarDay,
  FaChartSimple,
} from "react-icons/fa6";
import { MdGroups } from "react-icons/md";
import "../styles/dashboard.css";

function startOfDay(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDate(value, language) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString(language === "zh" ? "zh-TW" : "en-US", {
    month: "short",
    day: "numeric",
  });
}

function getStatusLabel(status, language) {
  const map = {
    todo: language === "zh" ? "待處理" : "Todo",
    doing: language === "zh" ? "進行中" : "Doing",
    done: language === "zh" ? "已完成" : "Done",
  };

  return map[status] || status;
}

export default function ProjectDashboard({
  tasks = [],
  members = [],
  language = "zh",
}) {
  const stats = useMemo(() => {
    const total = tasks.length;

    const todo = tasks.filter((t) => t.status === "todo").length;
    const doing = tasks.filter((t) => t.status === "doing").length;
    const done = tasks.filter((t) => t.status === "done").length;

    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    const now = new Date();

    const overdue = tasks.filter((task) => {
      if (task.status === "done") return false;
      if (!task.deadline) return false;

      return new Date(task.deadline) < now;
    }).length;

    return {
      total,
      todo,
      doing,
      done,
      completionRate,
      overdue,
    };
  }, [tasks]);

  const memberStats = useMemo(() => {
    return members.map((member) => {
      const memberTasks = tasks.filter(
        (task) => String(task.assignee_id) === String(member.user_id),
      );

      return {
        id: member.user_id,
        name: member.name,
        count: memberTasks.length,
      };
    });
  }, [members, tasks]);

  const dueThisWeekTasks = useMemo(() => {
    const today = startOfDay(new Date());
    const weekEnd = addDays(today, 7);

    return tasks
      .filter((task) => {
        if (!task.deadline) return false;

        const deadline = startOfDay(task.deadline);

        return deadline >= today && deadline <= weekEnd;
      })
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 5);
  }, [tasks]);

  const statusItems = [
    {
      key: "todo",
      label: getStatusLabel("todo", language),
      value: stats.todo,
    },
    {
      key: "doing",
      label: getStatusLabel("doing", language),
      value: stats.doing,
    },
    {
      key: "done",
      label: getStatusLabel("done", language),
      value: stats.done,
    },
  ];

  return (
    <div className="project-dashboard">
      <div className="dashboard-header">
        <div>
          <h2>{language === "zh" ? "專案總覽" : "Project Dashboard"}</h2>

          <p>
            {language === "zh"
              ? "快速掌握目前專案進度與團隊狀況"
              : "Quickly track project progress and team status"}
          </p>
        </div>
      </div>

      <div className="dashboard-stats-grid">
        <div className="dashboard-card">
          <div className="dashboard-card-icon total">
            <FaListCheck />
          </div>

          <div>
            <span className="dashboard-card-label">
              {language === "zh" ? "總任務" : "Total Tasks"}
            </span>

            <h3>{stats.total}</h3>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-icon doing">
            <FaClock />
          </div>

          <div>
            <span className="dashboard-card-label">
              {language === "zh" ? "進行中" : "In Progress"}
            </span>

            <h3>{stats.doing}</h3>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-icon done">
            <FaCircleCheck />
          </div>

          <div>
            <span className="dashboard-card-label">
              {language === "zh" ? "完成率" : "Completion"}
            </span>

            <h3>{stats.completionRate}%</h3>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-icon overdue">
            <FaTriangleExclamation />
          </div>

          <div>
            <span className="dashboard-card-label">
              {language === "zh" ? "逾期任務" : "Overdue"}
            </span>

            <h3>{stats.overdue}</h3>
          </div>
        </div>
      </div>

      <div className="dashboard-main-grid">
        <div className="dashboard-section-card">
          <div className="dashboard-section-header">
            <div className="dashboard-section-title">
              <FaCalendarDay />
              <h3>{language === "zh" ? "本週截止任務" : "Due This Week"}</h3>
            </div>

            <span>{dueThisWeekTasks.length}</span>
          </div>

          <div className="dashboard-due-list">
            {dueThisWeekTasks.length > 0 ? (
              dueThisWeekTasks.map((task) => (
                <div key={task.id} className="dashboard-due-item">
                  <div>
                    <strong>{task.title}</strong>
                    <p>
                      {getStatusLabel(task.status, language)} ·{" "}
                      {task.category || "-"}
                    </p>
                  </div>

                  <span>{formatDate(task.deadline, language)}</span>
                </div>
              ))
            ) : (
              <div className="dashboard-empty">
                {language === "zh"
                  ? "本週沒有即將截止的任務"
                  : "No tasks due this week"}
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-section-card">
          <div className="dashboard-section-header">
            <div className="dashboard-section-title">
              <FaChartSimple />
              <h3>{language === "zh" ? "任務狀態分布" : "Task Status"}</h3>
            </div>
          </div>

          <div className="dashboard-status-list">
            {statusItems.map((item) => {
              const percent =
                stats.total > 0 ? Math.round((item.value / stats.total) * 100) : 0;

              return (
                <div key={item.key} className="dashboard-status-item">
                  <div className="dashboard-status-row">
                    <span>{item.label}</span>
                    <strong>
                      {item.value} / {percent}%
                    </strong>
                  </div>

                  <div className="dashboard-progress-track">
                    <div
                      className={`dashboard-progress-fill ${item.key}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="dashboard-member-section">
        <div className="dashboard-member-header">
          <MdGroups />

          <h3>{language === "zh" ? "成員任務分配" : "Member Workload"}</h3>
        </div>

        <div className="dashboard-member-grid">
          {memberStats.length > 0 ? (
            memberStats.map((member) => (
              <div key={member.id} className="dashboard-member-card">
                <span className="dashboard-member-name">{member.name}</span>

                <span className="dashboard-member-count">
                  {member.count}
                  {language === "zh" ? " 個任務" : " tasks"}
                </span>
              </div>
            ))
          ) : (
            <div className="dashboard-empty">
              {language === "zh" ? "目前尚無專案成員" : "No project members"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}