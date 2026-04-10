import express from "express";
import mongoose from "mongoose";
import Message from "../models/message.js";
import User from "../models/user.js";
import { jwtAuthMiddleware as verifyToken } from "../jwt.js";

const router = express.Router();

router.post("/send", verifyToken, async (req, res) => {
  try {
    const { receiverId, content, messageType = "text" } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ message: "receiverId and content are required" });
    }

    // ✅ Validate receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    const message = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      content,
      messageType
    });

    await message.populate("sender", "name username email");

    res.status(201).json({ success: true, message });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:userId", verifyToken, async (req, res) => {
  try {
    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const myId = req.user.id;
    const otherId = req.params.userId;
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip  = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { sender: myId,    receiver: otherId },
        { sender: otherId, receiver: myId    },
      ],
    })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate("sender",   "name username email")
      .populate("receiver", "name username email");

    // ✅ Auto mark messages as read when conversation is opened
    await Message.updateMany(
      { sender: otherId, receiver: myId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ success: true, messages, page, limit });
  } catch (err) {
    console.error("Fetch messages error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/read/:userId", verifyToken, async (req, res) => {
  try {
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user.id, isRead: false },
      { isRead: true, readAt: new Date() }  // ✅ set readAt timestamp
    );
    res.json({ success: true, message: "Messages marked as read" });
  } catch (err) {
    console.error("Mark read error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:messageId", verifyToken, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorised to delete this message" });
    }

    await message.deleteOne();
    res.json({ success: true, message: "Message deleted" });
  } catch (err) {
    console.error("Delete message error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;