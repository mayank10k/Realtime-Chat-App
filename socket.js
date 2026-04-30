import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Message from './models/message.js';

const onlineUsers = {};
let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    // 1. Added explicit CORS for Socket.io to prevent connection refused
    cors: { 
      origin: ['http://localhost:5173', 'http://localhost:5174'], 
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Unauthorized'));
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    // 2. FIXED: Accessing 'id' instead of '_id' to prevent the .toString() crash
    const userId = socket.user?.id || socket.user?._id;
    
    if (!userId) {
      console.error("Connection error: User ID not found in token");
      return socket.disconnect();
    }

    const userIdStr = userId.toString();
    onlineUsers[userIdStr] = socket.id;
    
    io.emit('onlineUsers', Object.keys(onlineUsers));
    console.log(`User ${userIdStr} connected`);

    socket.on('sendMessage', async ({ receiverId, message, tempId }) => {
      try {
        const senderId = userId; // Use the verified ID from the socket

        const newMessage = await Message.create({
          sender: senderId,
          receiver: receiverId,
          content: message,
          status: 'sent'
        });

        socket.emit('messageSent', { ...newMessage.toObject(), tempId });

        const receiverSocketId = onlineUsers[receiverId];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receiveMessage', newMessage.toObject());
        }
      } catch (err) {
        console.error('sendMessage error:', err);
        socket.emit('messageError', { error: 'Message could not be sent' });
      }
    });

    socket.on('messageDelivered', async ({ messageId, senderId }) => {
      try {
        await Message.findByIdAndUpdate(messageId, { status: 'delivered' });
        const senderSocketId = onlineUsers[senderId];
        if (senderSocketId) {
          io.to(senderSocketId).emit('messageStatusUpdate', { messageId, status: 'delivered' });
        }
      } catch (err) {
        console.error('messageDelivered error:', err);
      }
    });

    socket.on('messageRead', async ({ messageId, senderId }) => {
      try {
        await Message.findByIdAndUpdate(messageId, { status: 'read', isRead: true, readAt: new Date() });
        const senderSocketId = onlineUsers[senderId];
        if (senderSocketId) {
          io.to(senderSocketId).emit('messageStatusUpdate', { messageId, status: 'read' });
        }
      } catch (err) {
        console.error('messageRead error:', err);
      }
    });

    // ... existing typing listeners ...

    socket.on('disconnect', () => {
      delete onlineUsers[userIdStr];
      io.emit('onlineUsers', Object.keys(onlineUsers));
      console.log(`User ${userIdStr} disconnected`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
};