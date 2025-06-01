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
