const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  completedUnits: [String], // Array of unit titles completed
  assessmentScores: [{ assessment: { type: mongoose.Schema.Types.ObjectId, ref: "Assessment" }, score: Number }],
  timeSpent: { type: Number, default: 0 }, // in minutes or seconds
  attendance: [{
    date: { type: Date, default: Date.now },
    present: { type: Boolean, default: true }
  }],
  lastAccessed: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Progress", progressSchema);
