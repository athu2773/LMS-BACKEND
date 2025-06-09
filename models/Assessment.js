const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: {
    type: [String],
    validate: v => Array.isArray(v) && v.length > 1,
    required: true
  },
  correctAnswer: { type: String, required: true },
  points: { type: Number, default: 1, min: 1 },
  type: { type: String, enum: ["multiple-choice", "true-false", "short-answer", "essay"], default: "multiple-choice" },
  rubric: { type: String }, // for subjective questions
});

const assessmentSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  title: { type: String, required: true },
  questions: [questionSchema],
  dueDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Assessment", assessmentSchema);
