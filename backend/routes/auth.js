const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({ name, email, password });
    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: {
        _id:      user._id,
        name:     user.name,
        email:    user.email,
        joinDate: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error during signup" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(user._id);

    res.json({
      token,
      user: {
        _id:      user._id,
        name:     user.name,
        email:    user.email,
        joinDate: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// GET /api/auth/profile  (called by Signup.jsx after token-only response)
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({
      _id:      user._id,
      name:     user.name,
      email:    user.email,
      joinDate: user.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: "Could not fetch profile" });
  }
});

// PUT /api/auth/profile  (Profile page edit)
router.put("/profile", protect, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);

    if (name)  user.name  = name;
    if (email) user.email = email;

    await user.save();
    res.json({ _id: user._id, name: user.name, email: user.email, joinDate: user.createdAt });
  } catch (err) {
    res.status(500).json({ message: "Could not update profile" });
  }
});

// PUT /api/auth/change-password  (Profile page password modal)
router.put("/change-password", protect, async (req, res) => {
  try {
    const { current, new: newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await user.comparePassword(current);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters" });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Could not change password" });
  }
});

module.exports = router;
