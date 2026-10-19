
const express = require("express");

const router = express.Router();

// Temporary in-memory storage
let tasks = [];
let nextId = 1;

// GET /api/tasks
// Retrieve all tasks
router.get("/", (req, res) => {
  res.status(200).json(tasks);
});

// POST /api/tasks
// Create a new task
router.post("/", (req, res) => {
  const { title, description } = req.body;

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({
      error: "Task title is required",
    });
  }

  if (
    description !== undefined &&
    typeof description !== "string"
  ) {
    return res.status(400).json({
      error: "Description must be a string",
    });
  }

  const task = {
    id: nextId++,
    title: title.trim(),
    description: description || "",
    completed: false,
    createdAt: new Date().toISOString(),
  };

  tasks.push(task);

  res.status(201).json(task);
});

// PUT /api/tasks/:id
// Update a task
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "Invalid task ID",
    });
  }

  const task = tasks.find((task) => task.id === id);

  if (!task) {
    return res.status(404).json({
      error: "Task not found",
    });
  }

  const { title, description, completed } = req.body;

  if (
    title !== undefined &&
    (typeof title !== "string" || !title.trim())
  ) {
    return res.status(400).json({
      error: "Title must be a non-empty string",
    });
  }

  if (
    description !== undefined &&
    typeof description !== "string"
  ) {
    return res.status(400).json({
      error: "Description must be a string",
    });
  }

  if (
    completed !== undefined &&
    typeof completed !== "boolean"
  ) {
    return res.status(400).json({
      error: "Completed must be true or false",
    });
  }

  if (title !== undefined) {
    task.title = title.trim();
  }

  if (description !== undefined) {
    task.description = description;
  }

  if (completed !== undefined) {
    task.completed = completed;
  }

  res.status(200).json(task);
});

// DELETE /api/tasks/:id
// Delete a task
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "Invalid task ID",
    });
  }

  const index = tasks.findIndex((task) => task.id === id);

  if (index === -1) {
    return res.status(404).json({
      error: "Task not found",
    });
  }

  const deletedTask = tasks.splice(index, 1)[0];

  res.status(200).json({
    message: "Task deleted successfully",
    task: deletedTask,
  });
});

module.exports = router;
