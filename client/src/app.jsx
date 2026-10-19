
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/tasks";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTasks() {
    try {
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Could not load tasks");
      }

      const data = await response.json();
      setTasks(data);
    } catch {
      setError("Cannot connect to the backend. Is the server running?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function addTask(event) {
    event.preventDefault();

    if (!title.trim()) return;

    try {
      setError("");

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not create task");
      }

      setTasks((currentTasks) => [...currentTasks, data]);
      setTitle("");
      setDescription("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleTask(task) {
    try {
      setError("");

      const response = await fetch(`${API_URL}/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: !task.completed,
        }),
      });

      const updatedTask = await response.json();

      if (!response.ok) {
        throw new Error(updatedTask.error || "Could not update task");
      }

      setTasks((currentTasks) =>
        currentTasks.map((item) =>
          item.id === task.id ? updatedTask : item
        )
      );
    } catch (err) {
      setError(err.message);
    }
  }

  async function editTask(task) {
    const newTitle = window.prompt("Edit task title:", task.title);

    if (newTitle === null) return;

    if (!newTitle.trim()) {
      setError("Task title cannot be empty");
      return;
    }

    try {
      setError("");

      const response = await fetch(`${API_URL}/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTitle.trim(),
        }),
      });

      const updatedTask = await response.json();

      if (!response.ok) {
        throw new Error(updatedTask.error || "Could not edit task");
      }

      setTasks((currentTasks) =>
        currentTasks.map((item) =>
          item.id === task.id ? updatedTask : item
        )
      );
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteTask(id) {
    if (!window.confirm("Delete this task?")) return;

    try {
      setError("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not delete task");
      }

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== id)
      );
    } catch (err) {
      setError(err.message);
    }
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === "pending") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  const completedCount = tasks.filter((task) => task.completed).length;

  return (
    <main className="app">
      <header className="header">
        <div className="brand">
          <span className="brand-icon">✓</span>
          <span>TaskFlow</span>
        </div>
        <span className="header-label">MY WORKSPACE</span>
      </header>

      <section className="dashboard">
        <div className="welcome">
          <p className="eyebrow">YOUR PERSONAL WORKSPACE</p>
          <h1>Get things done.</h1>
          <p className="subtitle">
            Organize your tasks and make progress every day.
          </p>
        </div>

        <div className="stats">
          <div className="stat-card">
            <span>Total tasks</span>
            <strong>{tasks.length}</strong>
          </div>
          <div className="stat-card">
            <span>Pending</span>
            <strong>{tasks.length - completedCount}</strong>
          </div>
          <div className="stat-card">
            <span>Completed</span>
            <strong>{completedCount}</strong>
          </div>
        </div>

        <section className="panel">
          <h2>Add a new task</h2>

          <form className="task-form" onSubmit={addTask}>
            <input
              type="text"
              placeholder="What needs to get done?"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Description (optional)"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />

            <button type="submit">+ Add task</button>
          </form>
        </section>

        <section className="task-section">
          <div className="task-heading">
            <div>
              <h2>Your tasks</h2>
              <p>{tasks.length} tasks in your workspace</p>
            </div>

            <div className="filters">
              {["all", "pending", "completed"].map((option) => (
                <button
                  key={option}
                  className={filter === option ? "filter active" : "filter"}
                  onClick={() => setFilter(option)}
                >
                  {option[0].toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="error">{error}</p>}

          {loading ? (
            <p className="empty">Loading tasks...</p>
          ) : filteredTasks.length === 0 ? (
            <p className="empty">No tasks here. Add one to get started!</p>
          ) : (
            <div className="task-list">
              {filteredTasks.map((task) => (
                <article className="task-card" key={task.id}>
                  <input
                    className="task-checkbox"
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task)}
                    aria-label={`Complete ${task.title}`}
                  />

                  <div className="task-content">
                    <h3 className={task.completed ? "done" : ""}>
                      {task.title}
                    </h3>
                    {task.description && <p>{task.description}</p>}
                  </div>

                  <div className="task-actions">
                    <button onClick={() => editTask(task)}>Edit</button>
                    <button
                      className="delete-button"
                      onClick={() => deleteTask(task.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>

      <footer>TaskFlow · Built with React and Node.js</footer>
    </main>
  );
}

export default App;
