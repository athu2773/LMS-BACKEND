const Progress = require("../models/Progress");

exports.getUserProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({ user: req.user.id, course: req.params.courseId });
    if (!progress) return res.status(404).json({ message: "Progress not found" });
    res.status(200).json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { completedUnits, assessmentScores } = req.body;
    let progress = await Progress.findOne({ user: req.user.id, course: req.params.courseId });

    if (!progress) {
      progress = new Progress({
        user: req.user.id,
        course: req.params.courseId,
        completedUnits: completedUnits || [],
        assessmentScores: assessmentScores || [],
      });
    } else {
      if (completedUnits) progress.completedUnits = completedUnits;
      if (assessmentScores) progress.assessmentScores = assessmentScores;
      progress.lastAccessed = Date.now();
    }

    await progress.save();
    res.status(200).json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
