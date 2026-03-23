import express from "express";
import Message from "../models/message.js";
import { jwtAuthMiddleware as verifyToken } from "../jwt.js";

const router = express.Router();

// ── POST /api/messages/send ───────────────────────────────────────────────
// Send a new message
// Body: { receiverId, content }
router.post("/send", verifyToken, async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ message: "receiverId and content are required" });
    }

    const message = await Message.create({
      sender:   req.user.id,   // set by verifyToken middleware
      receiver: receiverId,
      content,
    });

    await message.populate("sender", "username email");

    res.status(201).json({ success: true, message });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── GET /api/messages/:userId ─────────────────────────────────────────────
// Get full conversation between logged-in user and another user
// Sorted oldest → newest for chat display
router.get("/:userId", verifyToken, async (req, res) => {
  try {
    const myId    = req.user.id;
    const otherId = req.params.userId;
    const page    = parseInt(req.query.page)  || 1;
    const limit   = parseInt(req.query.limit) || 50;
    const skip    = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { sender: myId,    receiver: otherId },
        { sender: otherId, receiver: myId    },
      ],
    })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate("sender",   "username email")
      .populate("receiver", "username email");

    res.json({ success: true, messages, page, limit });
  } catch (err) {
    console.error("Fetch messages error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── PATCH /api/messages/read/:userId ─────────────────────────────────────
// Mark all messages from a user as read
router.patch("/read/:userId", verifyToken, async (req, res) => {
  try {
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user.id, isRead: false },
      { isRead: true }
    );
    res.json({ success: true, message: "Messages marked as read" });
  } catch (err) {
    console.error("Mark read error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── DELETE /api/messages/:messageId ──────────────────────────────────────
// Delete a message (only sender can delete)
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
