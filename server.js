const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// =====================
// MongoDB Connection
// =====================
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected ✅"))
.catch(err => console.log(err));

// =====================
// Weekly Schema
// =====================
const weeklySchema = new mongoose.Schema({
  weekStart: String,
  weekEnd: String,
  subject: String,
  unit: String,
  topic: String,
  status: {
    type: String,
    default: "pending"
  }
});

const Weekly = mongoose.model("Weekly", weeklySchema);

// =====================
// Add Weekly Topic
// =====================
app.post("/api/weekly", async (req, res) => {
  const data = new Weekly(req.body);
  await data.save();
  res.json(data);
});

// =====================
// Get Weekly Topics
// =====================
app.get("/api/weekly", async (req, res) => {
  const data = await Weekly.find();
  res.json(data);
});

// =====================
// Update Status
// =====================
app.put("/api/weekly/:id", async (req, res) => {
  await Weekly.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status }
  );
  res.json({ message: "Updated" });
});

// =====================
// Delete Topic
// =====================
app.delete("/api/weekly/:id", async (req, res) => {
  await Weekly.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
