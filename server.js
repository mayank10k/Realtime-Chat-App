import express from 'express';
import dotenv from 'dotenv';
import { createServer } from 'http';
import connectDB from './db.js';
import { initSocket } from './socket.js';  
import userRoutes from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);

initSocket(httpServer);  //  connect socket to server

app.use(express.json());
app.use('/user', userRoutes);
app.use('/messages', messageRoutes);

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});