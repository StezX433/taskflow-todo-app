
const express = require("express");
const cors = require("cors");
const taskRoutes = require("./routes/tasks");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "To-Do API is running!" });
});

app.use("/api/tasks", taskRoutes);

module.exports = app;

// Start the server only when this file is run directly.
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}
