const Assessment = require("../models/Assessment");

exports.createAssessment = async (req, res) => {
  try {
    const { course, title, questions } = req.body;
    const assessment = await Assessment.create({ course, title, questions });
    res.status(201).json(assessment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAssessmentsByCourse = async (req, res) => {
  try {
    const assessments = await Assessment.find({ course: req.params.courseId });
    if (!assessments || assessments.length === 0) {
      return res.status(404).json({ message: "No assessments found for this course" });
    }
    res.status(200).json(assessments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) return res.status(404).json({ message: "Assessment not found" });
    res.status(200).json(assessment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateAssessment = async (req, res) => {
  try {
    const { title, questions, dueDate } = req.body;
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) return res.status(404).json({ message: "Assessment not found" });
    if (title) assessment.title = title;
    if (questions) assessment.questions = questions;
    if (dueDate) assessment.dueDate = dueDate;
    await assessment.save();
    res.status(200).json(assessment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) return res.status(404).json({ message: "Assessment not found" });
    await assessment.deleteOne();
    res.status(200).json({ message: "Assessment deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
