import { Server } from 'socket.io';

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

    socket.on('register', (userId) => {
      onlineUsers[userId] = socket.id;
      io.emit('onlineUsers', Object.keys(onlineUsers));
    });

    socket.on('sendMessage', ({ senderId, receiverId, message }) => {
      const receiverSocketId = onlineUsers[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receiveMessage', {
          senderId,
          message,
          timestamp: new Date()
        });
      }
    });

    socket.on('typing', ({ senderId, receiverId }) => {
      const receiverSocketId = onlineUsers[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing', { senderId });
      }
    });

    socket.on('stopTyping', ({ senderId, receiverId }) => {
      const receiverSocketId = onlineUsers[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('stopTyping', { senderId });
      }
    });

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

// Export io instance to use in other files (e.g. routes)
export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
};