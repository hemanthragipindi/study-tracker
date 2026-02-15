const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("MongoDB Error ❌", err));

// ✅ Task Schema
const taskSchema = new mongoose.Schema({
  subject: String,
  topic: String,
  status: String,
  deadline: String
});

const Task = mongoose.model("Task", taskSchema);

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// ✅ Get all tasks
app.get("/api/tasks", async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

// ✅ Add new task
app.post("/api/tasks", async (req, res) => {
  const newTask = new Task(req.body);
  await newTask.save();
  res.json(newTask);
});

// ✅ Delete task
app.delete("/api/tasks/:id", async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Task deleted" });
});

// Render Port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
