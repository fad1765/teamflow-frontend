import { useMemo, useState } from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import TaskCard from "./TaskCard";
import useLanguage from "../components/useLanguage";

const EMPTY_TEXT = {
  todo: {
    zh: {
      title: "目前沒有待處理任務",
      desc: "新增任務後會出現在這裡。",
    },
    en: {
      title: "No todo tasks",
      desc: "New tasks will appear here.",
    },
  },
  doing: {
    zh: {
      title: "尚未有進行中的任務",
      desc: "拖曳任務到這裡開始追蹤進度。",
    },
    en: {
      title: "No tasks in progress",
      desc: "Move tasks here to track progress.",
    },
  },
  done: {
    zh: {
      title: "還沒有完成的任務",
      desc: "完成的任務會顯示在這裡。",
    },
    en: {
      title: "No completed tasks",
      desc: "Completed tasks will appear here.",
    },
  },
};

export default function KanbanColumn({
  title,
  tasks,
  columnId,
  isEditMode,
  onTaskClick,
}) {
  const { language } = useLanguage();
  const [search, setSearch] = useState("");

  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
  });

  const filteredTasks = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return tasks;

    return tasks.filter((task) => {
      return (
        task.title?.toLowerCase().includes(keyword) ||
        task.description?.toLowerCase().includes(keyword) ||
        task.category?.toLowerCase().includes(keyword) ||
        task.assignee_name?.toLowerCase().includes(keyword)
      );
    });
  }, [tasks, search]);

  const emptyText =
    EMPTY_TEXT[columnId]?.[language] || EMPTY_TEXT[columnId]?.en;

  const isSearching = search.trim().length > 0;

  return (
    <div className={`column ${isOver ? "column-over" : ""}`} ref={setNodeRef}>
      <div className="column-header">
        <h2>{title}</h2>

        <div className="column-header-actions">
          <input
            type="text"
            className="kanban-search"
            placeholder={language === "zh" ? "搜尋任務" : "Search"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <span className="column-count">{filteredTasks.length}</span>
        </div>
      </div>

      <div className="kanban-column-content">
        <SortableContext
          items={filteredTasks.map((task) => String(task.id))}
          strategy={verticalListSortingStrategy}
        >
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isEditMode={isEditMode}
                onClick={onTaskClick}
              />
            ))
          ) : (
            <div className="kanban-empty-text">
  {isSearching
    ? language === "zh"
      ? "找不到符合的任務"
      : "No matching tasks"
    : emptyText.title}
</div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}