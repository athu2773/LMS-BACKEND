const Progress = require("../models/Progress");
const Course = require("../models/Course");
const Assessment = require("../models/Assessment");

exports.getCourseCompletionRate = async (req, res) => {
  try {
    const courseId = req.params.courseId;

    const totalUsers = await Progress.countDocuments({ course: courseId });
    if (totalUsers === 0) return res.status(200).json({ completionRate: 0 });

    // Let's define completion as completed all units
    const course = await Course.findById(courseId);
    const totalUnits = course.syllabus.length;

    const completedUsers = await Progress.countDocuments({
      course: courseId,
      $expr: { $eq: [{ $size: "$completedUnits" }, totalUnits] },
    });

    const completionRate = (completedUsers / totalUsers) * 100;
    res.status(200).json({ completionRate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAverageAssessmentScore = async (req, res) => {
  try {
    const courseId = req.params.courseId;

    const assessments = await Assessment.find({ course: courseId }).select("_id");
    const assessmentIds = assessments.map((a) => a._id);

    const result = await Progress.aggregate([
      { $match: { course: mongoose.Types.ObjectId(courseId) } },
      { $unwind: "$assessmentScores" },
      { $match: { "assessmentScores.assessment": { $in: assessmentIds } } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$assessmentScores.score" },
        },
      },
    ]);

    const avgScore = result.length > 0 ? result[0].avgScore : 0;
    res.status(200).json({ averageAssessmentScore: avgScore });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
