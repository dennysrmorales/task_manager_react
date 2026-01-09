import React from 'react';
import TaskItem from './TaskItem';
import './TaskList.css';

function TaskList({ tasks, onEdit, onDelete, onToggle }) {
  // const safeTasks = Array.isArray(tasks) ? tasks : [];

  // if (safeTasks.length === 0) {
  //   return (
  //     <div className="empty-state">
  //       <p>No tasks yet. Create your first task!</p>
  //     </div>
  //   );

  if (!Array.isArray(tasks) || tasks.length === 0) {
    return (
      <div className="empty-state">
        <p>No tasks yet. Create your first task!</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}

export default TaskList;
