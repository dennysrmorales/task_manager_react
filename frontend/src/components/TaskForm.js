import React, { useState, useEffect } from 'react';
import './TaskForm.css';

function TaskForm({ task, onSubmit, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setCompleted(task.completed || false);
    } else {
      setTitle('');
      setDescription('');
      setCompleted(false);
    }
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Title is required!');
      return;
    }
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      completed,
    });
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h2>{task ? 'Update Task' : 'Create New Task'}</h2>

      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="4"
        />
      </div>

      {task && (
        <div className="form-group">
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="completed"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
            />
            <label htmlFor="completed" style={{ fontWeight: 'normal' }}>
              Completed
            </label>
          </div>
        </div>
      )}

      <div className="form-actions">
        <button type="submit" className="btn btn-success">
          {task ? 'Update Task' : 'Create Task'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default TaskForm;
