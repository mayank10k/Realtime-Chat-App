import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors'; // Import CORS
import { createServer } from 'http';
import connectDB from './db.js';
import { initSocket } from './socket.js';  
import userRoutes from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);

// Apply CORS to standard Express routes
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

app.use(express.json());

initSocket(httpServer);  

app.use('/user', userRoutes);
app.use('/messages', messageRoutes);

const PORT = process.env.PORT || 3000;

const __dirname = path.resolve();
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});