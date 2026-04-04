import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file"],  // ✅ future-proof for media messages
      default: "text",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,   // ✅ track exactly when message was read
    },
  },
  { timestamps: true }
);

// ✅ Single compound index — handles conversation queries sorted by time
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

// ✅ Extra index for fetching all messages for a user (inbox)
messageSchema.index({ receiver: 1, isRead: 1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;