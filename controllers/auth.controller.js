const crypto = require("crypto");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password, role });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        avatar: user.avatar,
        enrolledCourses: user.enrolledCourses,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Password reset token store (in-memory for demo; use DB/Redis in production)
const resetTokens = new Map();

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    const token = crypto.randomBytes(32).toString("hex");
    resetTokens.set(token, { userId: user._id, expires: Date.now() + 1000 * 60 * 15 }); // 15 min
    // Send email (demo: log to console)
    // In production, use nodemailer with real SMTP
    console.log(`Password reset link: http://localhost:5000/reset-password?token=${token}`);
    res.status(200).json({ message: "Password reset link sent to email (check console in dev)" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const data = resetTokens.get(token);
    if (!data || data.expires < Date.now()) return res.status(400).json({ message: "Invalid or expired token" });
    const user = await User.findById(data.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.password = password;
    await user.save();
    resetTokens.delete(token);
    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("_id name email role bio avatar enrolledCourses createdAt");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (name) user.name = name;
    if (bio) user.bio = bio;
    if (avatar) user.avatar = avatar;
    await user.save();
    res.status(200).json({ message: "Profile updated", user: { _id: user._id, name: user.name, email: user.email, role: user.role, bio: user.bio, avatar: user.avatar, enrolledCourses: user.enrolledCourses, createdAt: user.createdAt } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
