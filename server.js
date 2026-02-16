const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Node 18+ has fetch built in
// If error happens, install node-fetch and uncomment below
// const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();

app.use(cors());
app.use(express.json());

/* ================================
   MONGODB CONNECTION
================================ */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log(err));

/* ================================
   WEEKLY SCHEDULE SCHEMA
================================ */
const weeklySchema = new mongoose.Schema({
  weekStart: String,
  weekEnd: String,
  subjects: [
    {
      name: String,
      units: [
        {
          unitNumber: Number,
          topics: [
            {
              title: String,
              status: {
                type: String,
                default: "pending" // pending | complete | doubt | revise
              }
            }
          ]
        }
      ]
    }
  ]
});

const Weekly = mongoose.model("Weekly", weeklySchema);

/* ================================
   REVISION SCHEMA
================================ */
const revisionSchema = new mongoose.Schema({
  subject: String,
  unit: Number,
  topic: String,
  date: String
});

const Revision = mongoose.model("Revision", revisionSchema);

/* ================================
   WEEKLY ROUTES
================================ */

// Create weekly schedule
app.post("/api/weekly", async (req, res) => {
  try {
    const weekly = new Weekly(req.body);
    await weekly.save();
    res.json(weekly);
  } catch (err) {
    res.status(500).json({ error: "Failed to save weekly data" });
  }
});

// Get all weekly schedules
app.get("/api/weekly", async (req, res) => {
  const data = await Weekly.find();
  res.json(data);
});

// Update topic status
app.put("/api/weekly/:id", async (req, res) => {
  await Weekly.findByIdAndUpdate(req.params.id, req.body);
  res.json({ message: "Updated successfully" });
});

// Delete weekly
app.delete("/api/weekly/:id", async (req, res) => {
  await Weekly.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted successfully" });
});

/* ================================
   REVISION ROUTES
================================ */

app.post("/api/revision", async (req, res) => {
  const revision = new Revision(req.body);
  await revision.save();
  res.json(revision);
});

app.get("/api/revision", async (req, res) => {
  const data = await Revision.find();
  res.json(data);
});

app.delete("/api/revision/:id", async (req, res) => {
  await Revision.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted successfully" });
});

/* ================================
   GEMINI AI CHAT ROUTE
================================ */
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY not set in Render" });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: message }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!data.candidates) {
      return res.status(500).json({ error: "Invalid Gemini response", details: data });
    }

    res.json({
      reply: data.candidates[0].content.parts[0].text
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI Server Error" });
  }
});

/* ================================
   SERVE FRONTEND (IMPORTANT LAST)
================================ */
app.use(express.static("public"));

/* ================================
   START SERVER
================================ */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
