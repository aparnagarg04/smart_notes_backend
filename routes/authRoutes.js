const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { generateToken } = require("../utils/jwtUtils");
const bcrypt = require("bcryptjs");

// Signup Route
router.post("/signup", async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log("Signup request received:", { email, password });
  
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log("User already exists:", email);
        return res.status(400).json({ error: "User already exists" });
      }
  
      // Create new user
      const user = new User({ email, password });
      await user.save();
      console.log("User created:", user);
  
      // Generate JWT
      const token = generateToken(user._id);
      res.status(201).json({ token });
    } catch (err) {
      console.error("Signup error:", err); // Log the error
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate JWT
    const token = generateToken(user._id);
    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Export the router
module.exports = router;