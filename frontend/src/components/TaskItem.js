import React from 'react';
import './TaskItem.css';

function TaskItem({ task, onEdit, onDelete, onToggle }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`}>
      <div className="task-title">{task.title}</div>
      {task.description && (
        <div className="task-description">{task.description}</div>
      )}
      <div className="task-meta">
        Created: {formatDate(task.created_at)}
      </div>
      <div className="task-actions">
        <button
          className={`btn ${task.completed ? 'btn-secondary' : 'btn-success'}`}
          onClick={() => onToggle(task.id)}
        >
          {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
        </button>
        <button className="btn" onClick={() => onEdit(task)}>
          Edit
        </button>
        <button className="btn btn-danger" onClick={() => onDelete(task.id)}>
          Delete
        </button>
      </div>
    </div>
  );
}

export default TaskItem;
