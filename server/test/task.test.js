
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const request = require("supertest");

const tempDirectory = path.join(
  os.tmpdir(),
  `taskflow-test-${process.pid}`
);

process.env.TASKS_DATA_FILE = path.join(
  tempDirectory,
  "tasks.json"
);

const app = require("../src/app");

before(async () => {
  await fs.mkdir(tempDirectory, { recursive: true });
  await fs.writeFile(
    process.env.TASKS_DATA_FILE,
    JSON.stringify({ tasks: [], nextId: 1 })
  );
});

after(async () => {
  await fs.rm(tempDirectory, { recursive: true, force: true });
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
    .send({
      title: "Test Task",
      description: "Created by an automated test",
    });

  assert.equal(response.status, 201);
  assert.equal(response.body.title, "Test Task");
  assert.equal(response.body.completed, false);
  assert.equal(typeof response.body.id, "number");
});

test("PUT /api/tasks/:id updates a task", async () => {
  const response = await request(app)
    .put("/api/tasks/1")
    .send({ completed: true });

  assert.equal(response.status, 200);
  assert.equal(response.body.completed, true);
});

test("DELETE /api/tasks/:id deletes a task", async () => {
  const response = await request(app).delete("/api/tasks/1");

  assert.equal(response.status, 200);

  const listResponse = await request(app).get("/api/tasks");
  assert.deepEqual(listResponse.body, []);
});

test("POST rejects an empty title", async () => {
  const response = await request(app)
    .post("/api/tasks")
    .send({ title: "   " });

  assert.equal(response.status, 400);
});
