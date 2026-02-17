const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.static("public"));

/* ================== MONGODB CONNECT ================== */

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log(err));

/* ================== SCHEMA ================== */

const TopicSchema = new mongoose.Schema({
  name: String,
  revision: { type: Boolean, default: false },
  completed: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false }
});

const UnitSchema = new mongoose.Schema({
  name: String,
  topics: [TopicSchema]
});

const SubjectSchema = new mongoose.Schema({
  name: String,
  units: [UnitSchema]
});

const Subject = mongoose.model("Subject", SubjectSchema);

/* ================== ROUTES ================== */

/* Add Subject */
app.post("/api/subject", async (req, res) => {
  const { name } = req.body;
  const subject = new Subject({ name, units: [] });
  await subject.save();
  res.json(subject);
});

/* Get Subjects */
app.get("/api/subject", async (req, res) => {
  const subjects = await Subject.find();
  res.json(subjects);
});

/* Add Unit (max 6) */
app.post("/api/unit/:subjectId", async (req, res) => {
  const { name } = req.body;
  const subject = await Subject.findById(req.params.subjectId);

  if (subject.units.length >= 6)
    return res.status(400).json({ error: "Max 6 units allowed" });

  subject.units.push({ name, topics: [] });
  await subject.save();
  res.json(subject);
});

/* Add Topic */
app.post("/api/topic/:subjectId/:unitIndex", async (req, res) => {
  const { name } = req.body;
  const subject = await Subject.findById(req.params.subjectId);

  subject.units[req.params.unitIndex].topics.push({ name });
  await subject.save();
  res.json(subject);
});

/* Mark Revision */
app.put("/api/revision/:subjectId/:unitIndex/:topicIndex", async (req, res) => {
  const subject = await Subject.findById(req.params.subjectId);
  subject.units[req.params.unitIndex].topics[req.params.topicIndex].revision = true;
  await subject.save();
  res.json(subject);
});

/* Mark Completed */
app.put("/api/completed/:subjectId/:unitIndex/:topicIndex", async (req, res) => {
  const subject = await Subject.findById(req.params.subjectId);
  subject.units[req.params.unitIndex].topics[req.params.topicIndex].completed = true;
  await subject.save();
  res.json(subject);
});

/* Delete Topic (move to recycle) */
app.put("/api/delete/:subjectId/:unitIndex/:topicIndex", async (req, res) => {
  const subject = await Subject.findById(req.params.subjectId);
  subject.units[req.params.unitIndex].topics[req.params.topicIndex].deleted = true;
  await subject.save();
  res.json(subject);
});

/* Get Revision Topics */
app.get("/api/revision", async (req, res) => {
  const subjects = await Subject.find();
  const revision = [];

  subjects.forEach(sub => {
    sub.units.forEach(unit => {
      unit.topics.forEach(topic => {
        if (topic.revision && !topic.deleted)
          revision.push({ subject: sub.name, unit: unit.name, topic: topic.name });
      });
    });
  });

  res.json(revision);
});

/* Get Recycle Bin */
app.get("/api/recycle", async (req, res) => {
  const subjects = await Subject.find();
  const recycle = [];

  subjects.forEach(sub => {
    sub.units.forEach(unit => {
      unit.topics.forEach(topic => {
        if (topic.deleted)
          recycle.push({ subject: sub.name, unit: unit.name, topic: topic.name });
      });
    });
  });

  res.json(recycle);
});

/* Serve Frontend */
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

/* ================== SERVER ================== */

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running on port", PORT));
