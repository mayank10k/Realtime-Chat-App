import { Server } from 'socket.io';
import Message from './models/message.js';

const onlineUsers = {};
let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*', // Replace with your frontend URL in production
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // User registers with their userId after login
    socket.on('register', (userId) => {
      onlineUsers[userId] = socket.id;
      console.log(`User ${userId} registered with socket ${socket.id}`);
      io.emit('onlineUsers', Object.keys(onlineUsers));
    });

    // Handle sending a message
    socket.on('sendMessage', async ({ senderId, receiverId, message }) => {
      try {
        // ✅ Save to DB first
        const newMessage = await Message.create({
          sender: senderId,
          receiver: receiverId,
          content: message
        });

        const receiverSocketId = onlineUsers[receiverId];

        if (receiverSocketId) {
          // ✅ Receiver is online — deliver in real time
          io.to(receiverSocketId).emit('receiveMessage', {
            senderId,
            message,
            timestamp: newMessage.createdAt
          });
        }
        // ✅ If offline, message is already saved in DB — they'll get it on next fetch

      } catch (err) {
        console.error('sendMessage error:', err);
        socket.emit('messageError', { error: 'Message could not be sent' });
      }
    });

    // Handle typing indicator
    socket.on('typing', ({ senderId, receiverId }) => {
      const receiverSocketId = onlineUsers[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing', { senderId });
      }
    });

    // Handle stop typing
    socket.on('stopTyping', ({ senderId, receiverId }) => {
      const receiverSocketId = onlineUsers[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('stopTyping', { senderId });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      const userId = Object.keys(onlineUsers).find(
        (key) => onlineUsers[key] === socket.id
      );
      if (userId) {
        delete onlineUsers[userId];
        io.emit('onlineUsers', Object.keys(onlineUsers));
        console.log(`User ${userId} disconnected`);
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
};