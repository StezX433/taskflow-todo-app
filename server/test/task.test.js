
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

// Use a temporary file so tests don't modify your actual tasks.json.
const testDir = path.join(
  os.tmpdir(),
  `taskflow-tests-${process.pid}`
);

const testDataFile = path.join(testDir, "tasks.json");

// Tell the backend to use the temporary test data file.
process.env.TASKS_DATA_FILE = testDataFile;

// Import the Express application after setting the environment variable.
const app = require("../src/app");

before(async () => {
  await fs.mkdir(testDir, { recursive: true });

  await fs.writeFile(
    testDataFile,
    JSON.stringify({ tasks: [], nextId: 1 }, null, 2),
    "utf8"
  );
});

after(async () => {
  await fs.rm(testDir, { recursive: true, force: true });
  delete process.env.TASKS_DATA_FILE;
});

test("GET /api/tasks returns an empty array", async () => {
  const response = await request(app).get("/api/tasks");

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, []);
});

test("POST /api/tasks creates a task", async () => {
  const response = await request(app)
    .post("/api/tasks")
    .send({ title: "Learn API testing" });

  assert.equal(response.status, 201);
  assert.equal(response.body.title, "Learn API testing");
  assert.ok(response.body.id !== undefined);
});

test("PUT /api/tasks/:id updates a task", async () => {
  const createResponse = await request(app)
    .post("/api/tasks")
    .send({ title: "Original task" });

  assert.equal(createResponse.status, 201);

  const taskId = createResponse.body.id;

  const updateResponse = await request(app)
    .put(`/api/tasks/${taskId}`)
    .send({ title: "Updated task" });

  assert.equal(updateResponse.status, 200);
  assert.equal(updateResponse.body.title, "Updated task");
});

test("DELETE /api/tasks/:id deletes a task", async () => {
  const createResponse = await request(app)
    .post("/api/tasks")
    .send({ title: "Task to delete" });

  assert.equal(createResponse.status, 201);

  const taskId = createResponse.body.id;

  const deleteResponse = await request(app)
    .delete(`/api/tasks/${taskId}`);

  assert.equal(deleteResponse.status, 200);
});

test("POST /api/tasks rejects an empty title", async () => {
  const response = await request(app)
    .post("/api/tasks")
    .send({ title: "" });

  assert.equal(response.status, 400);
});

test("PUT rejects an ID that does not exist", async () => {
  const response = await request(app)
    .put("/api/tasks/999")
    .send({ title: "Updated task" });

  assert.equal(response.status, 404);
});

test("DELETE rejects an ID that does not exist", async () => {
  const response = await request(app)
    .delete("/api/tasks/999");

  assert.equal(response.status, 404);
});
