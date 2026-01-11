import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import TaskItem from './components/TaskItem';

const API_URL = 'http://localhost:8000/api/tasks/';

function App() {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      const response = await axios.get(API_URL);
      // Handle paginated response (results array) or direct array
      setTasks(response.data.results || response.data);
    } catch (error) {
      showMessage('Error fetching tasks', 'error');
      console.error('Error fetching tasks:', error);
    }
  };

  // Load tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Create a new task
  const handleCreate = async (taskData) => {
    try {
      await axios.post(API_URL, taskData);
      showMessage('Task created successfully!', 'success');
      setShowForm(false);
      fetchTasks();
    } catch (error) {
      showMessage('Error creating task', 'error');
      console.error('Error creating task:', error);
    }
  };

  // Update an existing task
  const handleUpdate = async (id, taskData) => {
    try {
      await axios.put(`${API_URL}${id}/`, taskData);
      showMessage('Task updated successfully!', 'success');
      setEditingTask(null);
      fetchTasks();
    } catch (error) {
      showMessage('Error updating task', 'error');
      console.error('Error updating task:', error);
    }
  };

  // Delete a task
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`${API_URL}${id}/`);
        showMessage('Task deleted successfully!', 'success');
        fetchTasks();
      } catch (error) {
        showMessage('Error deleting task', 'error');
        console.error('Error deleting task:', error);
      }
    }
  };

  // Toggle task completion
  const handleToggle = async (id) => {
    try {
      console.log('toggling tasasfasdfsk', id);
      const response = await axios.post(`${API_URL}${id}/toggle/`);
      showMessage(
        `Task marked as ${response.data.completed ? 'completed' : 'incomplete'}!`,
        'success'
      );
      fetchTasks();
    } catch (error) {
      showMessage('Error toggling task', 'error');
      console.error('Error toggling task:', error);
    }
  };

  // Show message and auto-hide after 3 seconds
  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage({ text: '', type: '' });
    }, 3000);
  };

  // Handle edit button click
  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  // Handle cancel
  const handleCancel = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  return (
    <div className="App">
      <div className="container">
        <h1>Task Manager</h1>

        {message.text && (
          <div className={`message message-${message.type}`}>
            {message.text}
          </div>
        )}

        {!showForm ? (
          <>
            <div style={{ marginBottom: '20px' }}>
              <button
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
              >
                + Create New Task
              </button>
            </div>
            {/* Sentry Test Button - Remove in production */}
            <div style={{ marginBottom: '20px' }}>
              <button
                className="btn btn-danger"
                onClick={() => {
                  throw new Error('This is your first error!');
                }}
              >
                Break the world
              </button>
            </div>
            <TaskList
              tasks={tasks}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          </>
        ) : (
          <TaskForm
            task={editingTask}
            onSubmit={editingTask ? (data) => handleUpdate(editingTask.id, data) : handleCreate}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}

export default App;
