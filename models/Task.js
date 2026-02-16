const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  subject: String,
  topic: String,
  completed: {
    type: Boolean,
    default: false
  },
  doubt: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Task", taskSchema);
