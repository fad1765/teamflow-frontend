import { useMemo, useRef, useState } from "react";
import { toLocalDateTimeString } from "../utils/dateValue";
import "../styles/timeline.css";

const DAY_WIDTH = 180;
const LEFT_WIDTH = 300;
const WEEK_DAYS = 7;
const MIN_DURATION_DAYS = 1;

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

function diffDays(start, end) {
  return Math.round(
    (startOfDay(end).getTime() - startOfDay(start).getTime()) /
      (1000 * 60 * 60 * 24),
  );
}

function formatDate(date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function formatDateInput(date) {
  const pad = (num) => String(num).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}`;
}

function getWeekStart(date) {
  const target = startOfDay(date);
  const day = target.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(target, diff);
}

function getAssigneeName(task, members) {
  const member = members.find(
    (item) => String(item.user_id) === String(task.assignee_id),
  );

  return task.assignee_name || member?.name || "Unassigned";
}

function getStatusText(status, language) {
  const map = {
    todo: language === "zh" ? "待處理" : "Todo",
    doing: language === "zh" ? "進行中" : "Doing",
    done: language === "zh" ? "已完成" : "Done",
  };

  return map[status] || status;
}

function normalizeTaskDate(task) {
  const start = task.start_date
    ? new Date(task.start_date)
    : task.created_at
      ? new Date(task.created_at)
      : new Date();

  let end = task.deadline ? new Date(task.deadline) : null;

  if (!end && task.estimated_days) {
    end = addDays(start, Number(task.estimated_days) - 1);
  }

  if (!end) {
    end = addDays(start, 1);
  }

  return { start, end };
}

function isTaskInWeek(task, weekStart, weekEnd) {
  return (
    startOfDay(task.timelineStart).getTime() <= startOfDay(weekEnd).getTime() &&
    startOfDay(task.timelineEnd).getTime() >= startOfDay(weekStart).getTime()
  );
}

export default function ProjectTimeline({
  tasks,
  members = [],
  language,
  isEditMode,
  onTaskClick,
  onPreviewTaskChange,
}) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    getWeekStart(new Date()),
  );
  const [keyword, setKeyword] = useState("");
  const [dragState, setDragState] = useState(null);
  const dragMovedRef = useRef(false);

  const weekDates = useMemo(() => {
    return Array.from({ length: WEEK_DAYS }, (_, index) =>
      addDays(currentWeekStart, index),
    );
  }, [currentWeekStart]);

  const weekEnd = weekDates[WEEK_DAYS - 1];

  const filteredTasks = useMemo(() => {
    return tasks
      .map((task) => {
        const dates = normalizeTaskDate(task);

        return {
          ...task,
          timelineStart: dates.start,
          timelineEnd: dates.end,
        };
      })
      .filter((task) => {
        const search = keyword.trim().toLowerCase();

        if (!search) return true;

        return (
          task.title?.toLowerCase().includes(search) ||
          task.category?.toLowerCase().includes(search) ||
          getAssigneeName(task, members).toLowerCase().includes(search)
        );
      });
  }, [tasks, keyword, members]);

  const timelineTasks = useMemo(() => {
    return filteredTasks.filter((task) =>
      isTaskInWeek(task, currentWeekStart, weekEnd),
    );
  }, [filteredTasks, currentWeekStart, weekEnd]);

  const handleSearchChange = (value) => {
    setKeyword(value);

    const search = value.trim().toLowerCase();

    if (!search) return;

    const matchedTask = tasks
      .map((task) => {
        const dates = normalizeTaskDate(task);

        return {
          ...task,
          timelineStart: dates.start,
          timelineEnd: dates.end,
        };
      })
      .find((task) => {
        return (
          task.title?.toLowerCase().includes(search) ||
          task.category?.toLowerCase().includes(search) ||
          getAssigneeName(task, members).toLowerCase().includes(search)
        );
      });

    if (matchedTask) {
      setCurrentWeekStart(getWeekStart(matchedTask.timelineStart));
    }
  };

  const handlePointerDown = (event, task, mode) => {
    event.preventDefault();
    event.stopPropagation();

    dragMovedRef.current = false;

    setDragState({
      task,
      mode,
      startX: event.clientX,
      originalStart: new Date(task.timelineStart),
      originalEnd: new Date(task.timelineEnd),
    });
  };

  const handlePointerMove = (event) => {
    if (!dragState) return;

    const deltaX = event.clientX - dragState.startX;
    const deltaDays = Math.round(deltaX / DAY_WIDTH);

    if (Math.abs(deltaX) > 4) {
      dragMovedRef.current = true;
    }

    setDragState((prev) => ({
      ...prev,
      deltaDays,
    }));
  };

  const handlePointerUp = () => {
    if (!dragState) return;

    const deltaDays = dragState.deltaDays || 0;

    if (deltaDays !== 0) {
      let nextStart = new Date(dragState.originalStart);
      let nextEnd = new Date(dragState.originalEnd);

      if (dragState.mode === "move") {
        nextStart = addDays(dragState.originalStart, deltaDays);
        nextEnd = addDays(dragState.originalEnd, deltaDays);
      }

      if (dragState.mode === "resize-left") {
        nextStart = addDays(dragState.originalStart, deltaDays);

        if (diffDays(nextStart, nextEnd) < MIN_DURATION_DAYS - 1) {
          nextStart = addDays(nextEnd, -(MIN_DURATION_DAYS - 1));
        }
      }

      if (dragState.mode === "resize-right") {
        nextEnd = addDays(dragState.originalEnd, deltaDays);

        if (diffDays(nextStart, nextEnd) < MIN_DURATION_DAYS - 1) {
          nextEnd = addDays(nextStart, MIN_DURATION_DAYS - 1);
        }
      }

      onPreviewTaskChange?.(dragState.task.id, {
        start_date: toLocalDateTimeString(nextStart),
        deadline: toLocalDateTimeString(nextEnd),
      });
    }

    setDragState(null);
  };

  const jumpToDate = (value) => {
    if (!value) return;
    setCurrentWeekStart(getWeekStart(new Date(value)));
  };

  return (
    <div
      className="timeline-panel"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div className="timeline-panel-header">
        <div>
          <h2>{language === "zh" ? "專案時程" : "Project Timeline"}</h2>
          <p>
            {isEditMode
              ? language === "zh"
                ? "拖拉後請按「儲存變更」才會寫入資料庫"
                : "Drag tasks, then click Save Changes"
              : language === "zh"
                ? "請先進入編輯模式才可調整時程"
                : "Enter edit mode to adjust schedule"}
          </p>
        </div>

        <div className="timeline-tools">
          <input
            type="text"
            className="timeline-search"
            placeholder={
              language === "zh" ? "搜尋任務 / 分類 / 成員" : "Search tasks"
            }
            value={keyword}
            onChange={(e) => handleSearchChange(e.target.value)}
          />

          <input
            type="date"
            className="timeline-date-jump"
            value={formatDateInput(currentWeekStart)}
            onChange={(e) => jumpToDate(e.target.value)}
          />

          <div className="timeline-week-actions">
            <button
              type="button"
              onClick={() => setCurrentWeekStart((prev) => addDays(prev, -7))}
            >
              ←
            </button>

            <button
              type="button"
              onClick={() => setCurrentWeekStart(getWeekStart(new Date()))}
            >
              {language === "zh" ? "本週" : "This Week"}
            </button>

            <button
              type="button"
              onClick={() => setCurrentWeekStart((prev) => addDays(prev, 7))}
            >
              →
            </button>
          </div>
        </div>
      </div>

      <div className="timeline-legend-row">
        <span className="legend-item todo">
          {getStatusText("todo", language)}
        </span>
        <span className="legend-item doing">
          {getStatusText("doing", language)}
        </span>
        <span className="legend-item done">
          {getStatusText("done", language)}
        </span>
      </div>

      <div className="timeline-scroll">
        <div className="timeline-board">
          <div className="timeline-header">
            <div className="timeline-left-header">
              {language === "zh" ? "任務資訊" : "Task Info"}
            </div>

            <div
              className="timeline-date-header"
              style={{
                width: `${weekDates.length * DAY_WIDTH}px`,
              }}
            >
              {weekDates.map((date) => {
                const isToday =
                  startOfDay(date).getTime() ===
                  startOfDay(new Date()).getTime();

                return (
                  <div
                    key={date.toISOString()}
                    className={`timeline-date-cell ${isToday ? "is-today" : ""}`}
                  >
                    <span className="timeline-date-main">
                      {formatDate(date)}
                    </span>
                    <span className="timeline-date-sub">
                      {date.toLocaleDateString(
                        language === "zh" ? "zh-TW" : "en-US",
                        {
                          weekday: "short",
                        },
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="timeline-body">
            {timelineTasks.length === 0 ? (
              <div className="timeline-empty-row">
                {language === "zh"
                  ? "這週沒有符合條件的任務"
                  : "No matching tasks this week"}
              </div>
            ) : (
              timelineTasks.map((task) => {
                const visibleStart =
                  task.timelineStart < currentWeekStart
                    ? currentWeekStart
                    : task.timelineStart;

                const visibleEnd =
                  task.timelineEnd > weekEnd ? weekEnd : task.timelineEnd;

                const left = diffDays(currentWeekStart, visibleStart);
                const duration = Math.max(
                  diffDays(visibleStart, visibleEnd) + 1,
                  1,
                );

                const activeDrag =
                  dragState && String(dragState.task.id) === String(task.id)
                    ? dragState
                    : null;

                const previewDelta = activeDrag?.deltaDays || 0;

                let previewLeft = left;
                let previewDuration = duration;

                if (activeDrag?.mode === "move") {
                  previewLeft = left + previewDelta;
                }

                if (activeDrag?.mode === "resize-left") {
                  previewLeft = left + previewDelta;
                  previewDuration = Math.max(duration - previewDelta, 1);
                }

                if (activeDrag?.mode === "resize-right") {
                  previewDuration = Math.max(duration + previewDelta, 1);
                }

                const isOverdue =
                  task.status !== "done" &&
                  startOfDay(task.timelineEnd).getTime() <
                    startOfDay(new Date()).getTime();

                return (
                  <div key={task.id} className="timeline-row">
                    <div className="timeline-task-card">
                      <div className="timeline-task-title">{task.title}</div>
                      <div className="timeline-task-sub">
                        {task.category} · {getAssigneeName(task, members)}
                      </div>
                    </div>

                    <div
                      className="timeline-track"
                      style={{
                        width: `${weekDates.length * DAY_WIDTH}px`,
                      }}
                    >
                      <button
                        type="button"
                        className={`timeline-bar ${task.status} ${
                          isOverdue ? "overdue" : ""
                        } ${isEditMode ? "editable" : ""}`}
                        style={{
                          left: `calc(${(previewLeft / WEEK_DAYS) * 100}% + 8px)`,
                          width: `calc(${(previewDuration / WEEK_DAYS) * 100}% - 16px)`,
                        }}
                        onPointerDown={(event) => {
                          if (!isEditMode) return;
                          handlePointerDown(event, task, "move");
                        }}
                        onClick={() => {
                          if (dragMovedRef.current) {
                            dragMovedRef.current = false;
                            return;
                          }

                          onTaskClick(task);
                        }}
                      >
                        <span
                          className="timeline-resize-handle left"
                          onPointerDown={(event) => {
                            if (!isEditMode) return;
                            handlePointerDown(event, task, "resize-left");
                          }}
                        />
                        <span className="timeline-bar-label">{task.title}</span>
                        <span
                          className="timeline-resize-handle right"
                          onPointerDown={(event) => {
                            if (!isEditMode) return;
                            handlePointerDown(event, task, "resize-right");
                          }}
                        />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
