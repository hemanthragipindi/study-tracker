require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

/* ===============================
   BASIC MIDDLEWARE
================================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===============================
   MONGODB CONNECTION
================================= */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.error("MongoDB Error ❌", err));

/* ===============================
   SCHEMA
================================= */

const weeklySchema = new mongoose.Schema({
  startDate: String,
  endDate: String,
  subject: String,
  unit: String,
  topics: String,
});

const Weekly = mongoose.model("Weekly", weeklySchema);

/* ===============================
   API ROUTES
================================= */

/* ---- Save Weekly Target ---- */
app.post("/api/tasks", async (req, res) => {
  try {
    const { startDate, endDate, subject, unit, topics } = req.body;

    const newTask = new Weekly({
      startDate,
      endDate,
      subject,
      unit,
      topics,
    });

    await newTask.save();
    res.json({ message: "Task Saved ✅" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save task" });
  }
});

/* ---- Get All Weekly Targets ---- */
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await Weekly.find();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

/* ===============================
   GEMINI AI CHAT ROUTE
================================= */

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: message }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    console.log("Gemini Raw Response:", data);

    if (
      data &&
      data.candidates &&
      data.candidates.length > 0 &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts.length > 0
    ) {
      const reply = data.candidates[0].content.parts[0].text;
      return res.json({ reply });
    } else {
      return res.status(500).json({
        error: "Invalid Gemini response",
        details: data,
      });
    }
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/* ===============================
   STATIC FILES
================================= */

app.use(express.static(path.join(__dirname, "public")));

/* ===============================
   FALLBACK ROUTE
================================= */

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ===============================
   START SERVER
================================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
