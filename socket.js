import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Message from './models/message.js';

const onlineUsers = {};
let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
  });

  // 🔐 Auth middleware — runs before every connection
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
    const userId = socket.user._id.toString();
    onlineUsers[userId] = socket.id;
    io.emit('onlineUsers', Object.keys(onlineUsers));
    console.log(`User ${userId} connected`);

    socket.on('sendMessage', async ({ receiverId, message }) => {
      try {
        const senderId = socket.user._id;

        const newMessage = await Message.create({
          sender: senderId,
          receiver: receiverId,
          content: message
        });

        // Confirm to sender
        socket.emit('messageSent', {
          _id: newMessage._id,
          receiverId,
          message,
          timestamp: newMessage.createdAt
        });

        // Deliver to receiver if online
        const receiverSocketId = onlineUsers[receiverId];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receiveMessage', {
            senderId,
            message,
            timestamp: newMessage.createdAt,
            _id: newMessage._id
          });
        }
      } catch (err) {
        console.error('sendMessage error:', err);
        socket.emit('messageError', { error: 'Message could not be sent' });
      }
    });

    socket.on('typing', ({ receiverId }) => {
      const receiverSocketId = onlineUsers[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing', { senderId: socket.user._id });
      }
    });

    socket.on('stopTyping', ({ receiverId }) => {
      const receiverSocketId = onlineUsers[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('stopTyping', { senderId: socket.user._id });
      }
    });

    socket.on('disconnect', () => {
      delete onlineUsers[userId];
      io.emit('onlineUsers', Object.keys(onlineUsers));
      console.log(`User ${userId} disconnected`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
};