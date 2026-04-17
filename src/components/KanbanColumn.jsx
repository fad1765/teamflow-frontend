import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import TaskCard from "./TaskCard";

export default function KanbanColumn({
  title,
  tasks,
  columnId,
  isEditMode,
  onTaskClick,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
  });

  return (
    <div className={`column ${isOver ? "column-over" : ""}`} ref={setNodeRef}>
      <div className="column-header">
        <h2>{title}</h2>
        <span className="column-count">{tasks.length}</span>
      </div>

      <SortableContext
        items={tasks.map((task) => String(task.id))}
        strategy={verticalListSortingStrategy}
      >
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            isEditMode={isEditMode}
            onClick={onTaskClick}
          />
        ))}
      </SortableContext>
    </div>
  );
}
