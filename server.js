require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


// ==========================
// MongoDB Connection
// ==========================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log(err));


// ==========================
// Weekly Schema
// ==========================
const weekSchema = new mongoose.Schema({
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
              status: { type: String, default: "pending" } // pending, complete, doubt, revise
            }
          ]
        }
      ]
    }
  ]
});

const Week = mongoose.model("Week", weekSchema);


// ==========================
// CREATE WEEK
// ==========================
app.post("/api/week", async (req, res) => {
  const week = new Week(req.body);
  await week.save();
  res.json(week);
});


// ==========================
// GET ALL WEEKS
// ==========================
app.get("/api/week", async (req, res) => {
  const weeks = await Week.find();
  res.json(weeks);
});


// ==========================
// UPDATE TOPIC STATUS
// ==========================
app.put("/api/topic/:weekId/:subjectIndex/:unitIndex/:topicIndex", async (req, res) => {
  const { weekId, subjectIndex, unitIndex, topicIndex } = req.params;
  const { status } = req.body;

  const week = await Week.findById(weekId);

  week.subjects[subjectIndex]
      .units[unitIndex]
      .topics[topicIndex]
      .status = status;

  await week.save();
  res.json({ message: "Updated" });
});


// ==========================
// GEMINI AI CHAT
// ==========================
app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: userMessage }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "AI not responding.";

    res.json({ reply });

  } catch (error) {
    console.log(error);
    res.status(500).json({ reply: "AI Error" });
  }
});

// Serve frontend safely (Express 5 compatible)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


// ==========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
