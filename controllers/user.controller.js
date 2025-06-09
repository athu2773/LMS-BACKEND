const User = require("../models/User");

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select(
      "_id name email role bio avatar enrolledCourses createdAt"
    );
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
