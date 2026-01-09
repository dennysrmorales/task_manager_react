# Task Manager - React + Django REST API

A modern task management application with a React frontend and Django REST API backend.

## Project Structure

```
task_manager_react/
├── backend/          # Django REST API
│   ├── manage.py
│   ├── myproject/
│   ├── tasks/
│   └── requirements.txt
└── frontend/         # React application
    ├── public/
    ├── src/
    └── package.json
```

## Features

- ✅ Create, read, update, and delete tasks
- ✅ Toggle task completion status
- ✅ Modern React UI with beautiful styling
- ✅ RESTful API with Django REST Framework
- ✅ CORS configured for frontend-backend communication

## Setup Instructions

### Backend Setup (Django)

1. **Navigate to backend directory:**
   ```bash
   cd task_manager_react/backend
   ```

2. **Create and activate virtual environment (recommended):**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

5. **Create superuser (optional, for admin panel):**
   ```bash
   python manage.py createsuperuser
   ```

6. **Start Django server:**
   ```bash
   python manage.py runserver
   ```

   The API will be available at: `http://localhost:8000/api/`

### Frontend Setup (React)

1. **Navigate to frontend directory:**
   ```bash
   cd task_manager_react/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start React development server:**
   ```bash
   npm start
   ```

   The app will open at: `http://localhost:3000`

## API Endpoints

- `GET /api/tasks/` - List all tasks
- `POST /api/tasks/` - Create a new task
- `GET /api/tasks/{id}/` - Get a specific task
- `PUT /api/tasks/{id}/` - Update a task
- `PATCH /api/tasks/{id}/` - Partially update a task
- `DELETE /api/tasks/{id}/` - Delete a task
- `POST /api/tasks/{id}/toggle/` - Toggle task completion status

## Usage

1. **Start the backend server** (port 8000)
2. **Start the frontend server** (port 3000)
3. Open `http://localhost:3000` in your browser
4. Create, edit, delete, and toggle tasks!

## Development Notes

- The React app is configured to proxy API requests to `http://localhost:8000`
- CORS is configured in Django settings to allow requests from `http://localhost:3000`
- The backend uses SQLite database by default
- Both servers need to be running simultaneously for the app to work

## Troubleshooting

**Issue**: CORS errors in browser console
- **Solution**: Make sure Django backend is running and CORS settings are correct

**Issue**: API requests failing
- **Solution**: Verify Django server is running on port 8000 and check the API URL in `App.js`

**Issue**: Module not found errors
- **Solution**: Run `npm install` in the frontend directory and `pip install -r requirements.txt` in the backend directory
