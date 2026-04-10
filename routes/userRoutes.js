import express from 'express';
import User from '../models/user.js';
import { jwtAuthMiddleware, generateToken } from '../jwt.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, name, username } = req.body;

    if (!email || !password || !name || !username) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: "Username already taken" });
    }

    // ✅ Only pass trusted fields
    const newUser = new User({ name, username, email, password });
    const response = await newUser.save();

    const token = generateToken({ id: response._id });

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: response  // toJSON() auto-strips password
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken({ id: user._id });

    // ✅ Return user info alongside token
    res.status(200).json({
      message: "Login successful",
      token,
      user  // toJSON() auto-strips password
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/profile', jwtAuthMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.status(200).json({ user }); // toJSON() strips password
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;