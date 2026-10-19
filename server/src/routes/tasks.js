
const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const router = express.Router();

const DATA_FILE =
  process.env.TASKS_DATA_FILE ||
  path.join(__dirname, "../data/tasks.json");
  
// Read saved data
async function readData() {
  const content = await fs.readFile(DATA_FILE, "utf8");
  return JSON.parse(content);
}

// Write data to disk
async function writeData(data) {
  await fs.writeFile(
    DATA_FILE,
    JSON.stringify(data, null, 2),
    "utf8"
  );
}

// GET /api/tasks
router.get("/", async (req, res) => {
  try {
    const data = await readData();
    res.status(200).json(data.tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not load tasks" });
  }
});

// POST /api/tasks
router.post("/", async (req, res) => {
  try {
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

    const data = await readData();

    const task = {
      id: data.nextId,
      title: title.trim(),
      description: description || "",
      completed: false,
      createdAt: new Date().toISOString(),
    };

    data.tasks.push(task);
    data.nextId += 1;

    await writeData(data);

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not create task" });
  }
});

// PUT /api/tasks/:id
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid task ID" });
    }

    const data = await readData();
    const task = data.tasks.find((item) => item.id === id);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
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

    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description;
    if (completed !== undefined) task.completed = completed;

    await writeData(data);

    res.status(200).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not update task" });
  }
});

// DELETE /api/tasks/:id
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid task ID" });
    }

    const data = await readData();
    const index = data.tasks.findIndex((item) => item.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "Task not found" });
    }

    const deletedTask = data.tasks.splice(index, 1)[0];

    await writeData(data);

    res.status(200).json({
      message: "Task deleted successfully",
      task: deletedTask,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not delete task" });
  }
});

module.exports = router;
