
# TaskFlow — Full-Stack To-Do App

A task management application built with React and Node.js.

## Features

- Create tasks with titles and descriptions
- Edit existing tasks
- Mark tasks as completed
- Delete tasks
- Filter tasks by status
- View task statistics
- REST API built with Express

## Tech Stack

**Frontend**
- React
- Vite
- JavaScript
- CSS

**Backend**
- Node.js
- Express.js
- REST API

## Project Structure

```text
TODOAPP/
├── client/
│   └── src/
├── server/
│   └── src/
│       ├── routes/
│       │   └── tasks.js
│       └── app.js
├── .gitignore
└── README.md
```

## Run Locally

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd TODOAPP
```

### 2. Start the backend

```bash
cd server
npm install
npm run dev
```

Backend URL: http://localhost:5000

### 3. Start the frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Frontend URL: http://localhost:5173

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/tasks | Get all tasks |
| POST | /api/tasks | Create a task |
| PUT | /api/tasks/:id | Update a task |
| DELETE | /api/tasks/:id | Delete a task |

## Current Limitations

Tasks are currently stored in server memory.
Persistent storage is a planned improvement.

## Future Improvements

- Persistent data storage
- Better task validation
- Automated API tests
- Deployment
