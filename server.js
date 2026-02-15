const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

const DATA_FILE = "data.json";

// Create data.json if not exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Get all tasks
app.get("/api/tasks", (req, res) => {
  const data = fs.readFileSync(DATA_FILE);
  res.json(JSON.parse(data));
});

// Add new task
app.post("/api/tasks", (req, res) => {
  const tasks = JSON.parse(fs.readFileSync(DATA_FILE));
  const newTask = { id: Date.now(), ...req.body };
  tasks.push(newTask);
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
  res.json(newTask);
});

// Delete task
app.delete("/api/tasks/:id", (req, res) => {
  let tasks = JSON.parse(fs.readFileSync(DATA_FILE));
  tasks = tasks.filter(task => task.id != req.params.id);
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
  res.json({ message: "Task deleted" });
});

// IMPORTANT FOR RENDER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
