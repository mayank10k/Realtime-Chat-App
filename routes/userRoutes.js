import express from 'express';
import User from '../models/user.js';
import Message from '../models/message.js';
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

router.get('/contacts', jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    // Return all users except the current user
    const users = await User.find({ _id: { $ne: userId } }).select('-password');
    
    // Fetch last message and unread count for each user
    const contactsWithLastMessage = await Promise.all(users.map(async (user) => {
      const lastMessage = await Message.findOne({
        $or: [
          { sender: userId, receiver: user._id },
          { sender: user._id, receiver: userId }
        ]
      }).sort({ createdAt: -1 });

      const unreadCount = await Message.countDocuments({
        sender: user._id,
        receiver: userId,
        status: { $ne: 'read' }
      });

      return {
        ...user.toJSON(),
        lastMessageAt: lastMessage ? lastMessage.createdAt : new Date(0), // Default to epoch
        lastMessage: lastMessage ? lastMessage.content : null,
        unreadCount
      };
    }));

    // Sort contacts by last message time (most recent first)
    contactsWithLastMessage.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

    return res.status(200).json({ contacts: contactsWithLastMessage });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;