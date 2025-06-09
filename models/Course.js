const mongoose = require("mongoose");

const versionSchema = new mongoose.Schema({
  content: String,
  updatedAt: { type: Date, default: Date.now },
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  syllabus: [
    {
      unitTitle: { type: String, required: true },
      objectives: [{ type: String }],
      timeline: { type: String },
      lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
      assessments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Assessment" }],
    },
  ],
  content: [versionSchema],
  tags: [{ type: String }],
  status: {
    type: String,
    enum: ["draft", "pending", "published"],
    default: "draft",
  },
  approvalStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Course", courseSchema);
