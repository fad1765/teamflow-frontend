import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import KanbanColumn from "./KanbanColumn";
import useLanguage from "../components/useLanguage";
import "../styles/kanban.css";

const COLUMN_IDS = ["todo", "doing", "done"];

function sortByPosition(tasks) {
  return [...tasks].sort((a, b) => a.position - b.position);
}

function groupTasks(tasks) {
  return {
    todo: sortByPosition(tasks.filter((t) => t.status === "todo")),
    doing: sortByPosition(tasks.filter((t) => t.status === "doing")),
    done: sortByPosition(tasks.filter((t) => t.status === "done")),
  };
}

function flattenAndRecalculate(grouped) {
  return COLUMN_IDS.flatMap((status) =>
    grouped[status].map((task, index) => ({
      ...task,
      status,
      position: index + 1,
    })),
  );
}

function findTaskById(tasks, id) {
  return tasks.find((task) => String(task.id) === String(id));
}

function getOverColumnId(tasks, overId) {
  if (!overId) return null;

  if (COLUMN_IDS.includes(String(overId))) {
    return String(overId);
  }

  const overTask = findTaskById(tasks, overId);
  return overTask ? overTask.status : null;
}

export default function KanbanBoard({
  tasks,
  setTasks,
  isEditMode,
  setHasUnsavedChanges,
  showToastMessage,
  onTaskClick,
}) {
  const { t } = useLanguage();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const grouped = groupTasks(tasks);

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!isEditMode) {
      showToastMessage(t.toast.clickEditBoardFirst, "warning");
      return;
    }

    if (!over || String(active.id) === String(over.id)) return;

    const activeTask = findTaskById(tasks, active.id);
    if (!activeTask) return;

    const activeColumnId = activeTask.status;
    const overColumnId = getOverColumnId(tasks, over.id);

    if (!overColumnId) return;

    const currentGrouped = groupTasks(tasks);

    if (activeColumnId === overColumnId) {
      const columnTasks = [...currentGrouped[activeColumnId]];
      const oldIndex = columnTasks.findIndex(
        (task) => String(task.id) === String(active.id),
      );
      const newIndex = columnTasks.findIndex(
        (task) => String(task.id) === String(over.id),
      );

      if (oldIndex === -1 || newIndex === -1) return;

      const reorderedColumn = arrayMove(columnTasks, oldIndex, newIndex);

      const nextGrouped = {
        ...currentGrouped,
        [activeColumnId]: reorderedColumn,
      };

      setTasks(flattenAndRecalculate(nextGrouped));
      setHasUnsavedChanges(true);
      return;
    }

    const sourceTasks = [...currentGrouped[activeColumnId]];
    const targetTasks = [...currentGrouped[overColumnId]];

    const sourceIndex = sourceTasks.findIndex(
      (task) => String(task.id) === String(active.id),
    );
    if (sourceIndex === -1) return;

    const [movedTask] = sourceTasks.splice(sourceIndex, 1);

    const updatedMovedTask = {
      ...movedTask,
      status: overColumnId,
    };

    if (COLUMN_IDS.includes(String(over.id))) {
      targetTasks.push(updatedMovedTask);
    } else {
      const targetIndex = targetTasks.findIndex(
        (task) => String(task.id) === String(over.id),
      );

      if (targetIndex === -1) {
        targetTasks.push(updatedMovedTask);
      } else {
        targetTasks.splice(targetIndex, 0, updatedMovedTask);
      }
    }

    const nextGrouped = {
      ...currentGrouped,
      [activeColumnId]: sourceTasks,
      [overColumnId]: targetTasks,
    };

    setTasks(flattenAndRecalculate(nextGrouped));
    setHasUnsavedChanges(true);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board">
        <KanbanColumn
          title={t.status.todo}
          tasks={grouped.todo}
          columnId="todo"
          isEditMode={isEditMode}
          onTaskClick={onTaskClick}
        />
        <KanbanColumn
          title={t.status.doing}
          tasks={grouped.doing}
          columnId="doing"
          isEditMode={isEditMode}
          onTaskClick={onTaskClick}
        />
        <KanbanColumn
          title={t.status.done}
          tasks={grouped.done}
          columnId="done"
          isEditMode={isEditMode}
          onTaskClick={onTaskClick}
        />
      </div>
    </DndContext>
  );
}
