const Progress = require("../models/Progress");
const Course = require("../models/Course");

exports.getUserProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({ user: req.user.id, course: req.params.courseId });
    if (!progress) return res.status(404).json({ message: "Progress not found" });
    res.status(200).json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get aggregated progress analytics for a course (for instructors/admins)
 * Returns average completion, at-risk students, and other metrics
 */
exports.getCourseProgressAnalytics = async (req, res) => {
  try {
    // RBAC: Only instructors or admins can access
    if (!req.user || !['instructor', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    const courseId = req.params.courseId;
    const progresses = await Progress.find({ course: courseId });
    if (!progresses.length) return res.status(404).json({ message: 'No progress data found' });

    // Example analytics: average completion, at-risk students (less than 30% units completed)
    const course = await Course.findById(courseId);
    const totalUnits = course ? course.syllabus.length : 0;
    let totalCompletion = 0;
    let atRisk = [];
    progresses.forEach(p => {
      const completed = p.completedUnits ? p.completedUnits.length : 0;
      const percent = totalUnits ? (completed / totalUnits) * 100 : 0;
      totalCompletion += percent;
      if (percent < 30) atRisk.push({ user: p.user, percentCompleted: percent });
    });
    const avgCompletion = progresses.length ? (totalCompletion / progresses.length) : 0;
    res.status(200).json({
      courseId,
      averageCompletion: avgCompletion,
      atRiskStudents: atRisk,
      totalStudents: progresses.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get student-specific progress analytics for a course
 * Returns percent completed, time spent, attendance, and assessment scores
 */
exports.getStudentCourseAnalytics = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ message: 'Forbidden: Only students can view their analytics' });
    }
    const courseId = req.params.courseId;
    const progress = await Progress.findOne({ user: req.user.id, course: courseId });
    if (!progress) return res.status(404).json({ message: 'Progress not found' });
    const course = await Course.findById(courseId);
    const totalUnits = course ? course.syllabus.length : 0;
    const completed = progress.completedUnits ? progress.completedUnits.length : 0;
    const percentCompleted = totalUnits ? (completed / totalUnits) * 100 : 0;
    res.status(200).json({
      courseId,
      percentCompleted,
      timeSpent: progress.timeSpent,
      attendance: progress.attendance,
      assessmentScores: progress.assessmentScores
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Progress: add engagement metrics and RBAC enforcement
exports.updateProgress = async (req, res) => {
  try {
    // RBAC: Only students can update their own progress
    const { courseId } = req.params;
    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ message: 'Forbidden: Only students can update their own progress' });
    }
    // userId param is not required, use req.user.id from JWT
    const { completedUnits, assessmentScores, timeSpent, attendance } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    let progress = await Progress.findOne({ user: req.user.id, course: courseId });

    if (!progress) {
      progress = new Progress({
        user: req.user.id,
        course: courseId,
        completedUnits: completedUnits || [],
        assessmentScores: assessmentScores || [],
        timeSpent: typeof timeSpent === 'number' ? timeSpent : 0,
        attendance: attendance || [],
        lastAccessed: Date.now(),
      });
    } else {
      if (completedUnits) progress.completedUnits = completedUnits;
      if (assessmentScores) progress.assessmentScores = assessmentScores;
      if (typeof timeSpent === 'number') progress.timeSpent = timeSpent;
      if (attendance) progress.attendance = attendance;
      progress.lastAccessed = Date.now();
    }
    await progress.save();
    res.status(200).json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
