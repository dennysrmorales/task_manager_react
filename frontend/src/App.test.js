import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock axios before importing App
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: { results: [] } })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
}));

import axios from 'axios';
import App from './App';

// Mock child components
jest.mock('./components/TaskList', () => {
  return function MockTaskList({ tasks, onEdit, onDelete, onToggle }) {
    return (
      <div data-testid="task-list">
        {tasks.length === 0 ? (
          <div>No tasks yet. Create your first task!</div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} data-testid={`task-${task.id}`}>
              <span>{task.title}</span>
              <button onClick={() => onEdit(task)}>Edit</button>
              <button onClick={() => onDelete(task.id)}>Delete</button>
              <button onClick={() => onToggle(task.id)}>Toggle</button>
            </div>
          ))
        )}
      </div>
    );
  };
});

jest.mock('./components/TaskForm', () => {
  return function MockTaskForm({ task, onSubmit, onCancel }) {
    return (
      <form data-testid="task-form" onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ title: 'Test Task', description: 'Test Description', completed: false });
      }}>
        <h2>{task ? 'Update Task' : 'Create New Task'}</h2>
        <button type="submit">{task ? 'Update Task' : 'Create Task'}</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </form>
    );
  };
});

describe('App', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Mock console.error to avoid noise in test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
    // Mock window.confirm
    window.confirm = jest.fn(() => true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initial render and data fetching', () => {
    it('renders the app title', () => {
      axios.get.mockResolvedValueOnce({ data: { results: [] } });
      render(<App />);
      expect(screen.getByText('Task Manager')).toBeInTheDocument();
    });

    it('fetches tasks on mount', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', description: 'Description 1', completed: false, created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: 2, title: 'Task 2', description: 'Description 2', completed: true, created_at: '2024-01-02', updated_at: '2024-01-02' },
      ];
      axios.get.mockResolvedValueOnce({ data: { results: mockTasks } });

      render(<App />);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('http://localhost:8000/api/tasks/');
      });

      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
    });

    it('handles paginated response format', async () => {
      const mockTasks = [{ id: 1, title: 'Task 1', completed: false, created_at: '2024-01-01', updated_at: '2024-01-01' }];
      axios.get.mockResolvedValueOnce({ data: { results: mockTasks } });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });
    });

    it('handles non-paginated response format', async () => {
      const mockTasks = [{ id: 1, title: 'Task 1', completed: false, created_at: '2024-01-01', updated_at: '2024-01-01' }];
      axios.get.mockResolvedValueOnce({ data: mockTasks });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });
    });

    it('displays error message when fetching tasks fails', async () => {
      axios.get.mockRejectedValueOnce(new Error('Network error'));

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Error fetching tasks')).toBeInTheDocument();
      });
    });
  });

  describe('Create task', () => {
    it('shows form when "Create New Task" button is clicked', async () => {
      axios.get.mockResolvedValueOnce({ data: { results: [] } });
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('+ Create New Task')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('+ Create New Task'));

      expect(screen.getByTestId('task-form')).toBeInTheDocument();
      expect(screen.getByText('Create New Task')).toBeInTheDocument();
    });

    it('creates a new task successfully', async () => {
      axios.get.mockResolvedValueOnce({ data: { results: [] } });
      axios.post.mockResolvedValueOnce({ data: { id: 1, title: 'New Task' } });
      axios.get.mockResolvedValueOnce({ data: { results: [{ id: 1, title: 'New Task', completed: false, created_at: '2024-01-01', updated_at: '2024-01-01' }] } });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('+ Create New Task')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('+ Create New Task'));

      const submitButton = await screen.findByText('Create Task');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith('http://localhost:8000/api/tasks/', {
          title: 'Test Task',
          description: 'Test Description',
          completed: false,
        });
      });

      await waitFor(() => {
        expect(screen.getByText('Task created successfully!')).toBeInTheDocument();
      });
    });

    it('displays error message when creating task fails', async () => {
      axios.get.mockResolvedValueOnce({ data: { results: [] } });
      axios.post.mockRejectedValueOnce(new Error('Network error'));

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('+ Create New Task')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('+ Create New Task'));

      const submitButton = await screen.findByText('Create Task');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Error creating task')).toBeInTheDocument();
      });
    });
  });

  describe('Edit task', () => {
    it('shows form with task data when edit is clicked', async () => {
      const mockTasks = [{ id: 1, title: 'Task 1', description: 'Description 1', completed: false, created_at: '2024-01-01', updated_at: '2024-01-01' }];
      axios.get.mockResolvedValueOnce({ data: { results: mockTasks } });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });

      const editButton = screen.getAllByText('Edit')[0];
      fireEvent.click(editButton);

      expect(screen.getByRole('heading', { name: 'Update Task' })).toBeInTheDocument();
      expect(screen.getByTestId('task-form')).toBeInTheDocument();
    });

    it('updates a task successfully', async () => {
      const mockTasks = [{ id: 1, title: 'Task 1', description: 'Description 1', completed: false, created_at: '2024-01-01', updated_at: '2024-01-01' }];
      axios.get.mockResolvedValueOnce({ data: { results: mockTasks } });
      axios.put.mockResolvedValueOnce({ data: { id: 1, title: 'Updated Task' } });
      axios.get.mockResolvedValueOnce({ data: { results: [{ id: 1, title: 'Updated Task', completed: false, created_at: '2024-01-01', updated_at: '2024-01-01' }] } });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });

      const editButton = screen.getAllByText('Edit')[0];
      fireEvent.click(editButton);

      const updateButton = await screen.findByRole('button', { name: 'Update Task' });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(axios.put).toHaveBeenCalledWith('http://localhost:8000/api/tasks/1/', {
          title: 'Test Task',
          description: 'Test Description',
          completed: false,
        });
      });

      await waitFor(() => {
        expect(screen.getByText('Task updated successfully!')).toBeInTheDocument();
      });
    });

    it('displays error message when updating task fails', async () => {
      const mockTasks = [{ id: 1, title: 'Task 1', completed: false, created_at: '2024-01-01', updated_at: '2024-01-01' }];
      axios.get.mockResolvedValueOnce({ data: { results: mockTasks } });
      axios.put.mockRejectedValueOnce(new Error('Network error'));

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });

      const editButton = screen.getAllByText('Edit')[0];
      fireEvent.click(editButton);

      const updateButton = await screen.findByRole('button', { name: 'Update Task' });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(screen.getByText('Error updating task')).toBeInTheDocument();
      });
    });
  });

  describe('Delete task', () => {
    it('deletes a task successfully after confirmation', async () => {
      const mockTasks = [{ id: 1, title: 'Task 1', completed: false, created_at: '2024-01-01', updated_at: '2024-01-01' }];
      axios.get.mockResolvedValueOnce({ data: { results: mockTasks } });
      axios.delete.mockResolvedValueOnce({});
      axios.get.mockResolvedValueOnce({ data: { results: [] } });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });

      const deleteButton = screen.getAllByText('Delete')[0];
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this task?');
      });

      await waitFor(() => {
        expect(axios.delete).toHaveBeenCalledWith('http://localhost:8000/api/tasks/1/');
      });

      await waitFor(() => {
        expect(screen.getByText('Task deleted successfully!')).toBeInTheDocument();
      });
    });

    it('does not delete task if user cancels confirmation', async () => {
      window.confirm.mockReturnValueOnce(false);
      const mockTasks = [{ id: 1, title: 'Task 1', completed: false, created_at: '2024-01-01', updated_at: '2024-01-01' }];
      axios.get.mockResolvedValueOnce({ data: { results: mockTasks } });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });

      const deleteButton = screen.getAllByText('Delete')[0];
      fireEvent.click(deleteButton);

      expect(axios.delete).not.toHaveBeenCalled();
    });

    it('displays error message when deleting task fails', async () => {
      const mockTasks = [{ id: 1, title: 'Task 1', completed: false, created_at: '2024-01-01', updated_at: '2024-01-01' }];
      axios.get.mockResolvedValueOnce({ data: { results: mockTasks } });
      axios.delete.mockRejectedValueOnce(new Error('Network error'));

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });

      const deleteButton = screen.getAllByText('Delete')[0];
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('Error deleting task')).toBeInTheDocument();
      });
    });
  });

  describe('Toggle task completion', () => {
    it('toggles task completion status successfully', async () => {
      const mockTasks = [{ id: 1, title: 'Task 1', completed: false, created_at: '2024-01-01', updated_at: '2024-01-01' }];
      axios.get.mockResolvedValueOnce({ data: { results: mockTasks } });
      axios.post.mockResolvedValueOnce({ data: { id: 1, completed: true } });
      axios.get.mockResolvedValueOnce({ data: { results: [{ id: 1, title: 'Task 1', completed: true, created_at: '2024-01-01', updated_at: '2024-01-01' }] } });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });

      const toggleButton = screen.getAllByText('Toggle')[0];
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith('http://localhost:8000/api/tasks/1/toggle/');
      });

      await waitFor(() => {
        expect(screen.getByText(/Task marked as completed/)).toBeInTheDocument();
      });
    });

    it('displays error message when toggling task fails', async () => {
      const mockTasks = [{ id: 1, title: 'Task 1', completed: false, created_at: '2024-01-01', updated_at: '2024-01-01' }];
      axios.get.mockResolvedValueOnce({ data: { results: mockTasks } });
      axios.post.mockRejectedValueOnce(new Error('Network error'));

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });

      const toggleButton = screen.getAllByText('Toggle')[0];
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByText('Error toggling task')).toBeInTheDocument();
      });
    });
  });

  describe('Cancel form', () => {
    it('hides form and returns to task list when cancel is clicked', async () => {
      axios.get.mockResolvedValueOnce({ data: { results: [] } });
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('+ Create New Task')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('+ Create New Task'));

      expect(screen.getByTestId('task-form')).toBeInTheDocument();

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(screen.queryByTestId('task-form')).not.toBeInTheDocument();
      expect(screen.getByText('+ Create New Task')).toBeInTheDocument();
    });
  });

  describe('Message display', () => {
    it('displays success messages', async () => {
      axios.get.mockResolvedValueOnce({ data: { results: [] } });
      axios.post.mockResolvedValueOnce({ data: { id: 1 } });
      axios.get.mockResolvedValueOnce({ data: { results: [] } });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('+ Create New Task')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('+ Create New Task'));

      const submitButton = await screen.findByText('Create Task');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Task created successfully!')).toBeInTheDocument();
      });

      // Message should auto-hide after 3 seconds (we'll just verify it appears)
      expect(screen.getByText('Task created successfully!')).toHaveClass('message-success');
    });
  });
});
