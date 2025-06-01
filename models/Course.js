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
      unitTitle: String,
      objectives: [String],
      timeline: String,
    },
  ],
  content: [versionSchema],
  status: {
    type: String,
    enum: ["draft", "pending", "published"],
    default: "draft",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Course", courseSchema);
