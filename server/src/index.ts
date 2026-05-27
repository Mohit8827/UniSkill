import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

export const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Import routes (deferred to after prisma export to avoid circular dependency issues if any, 
// though standard practice is fine as long as they are imported after prisma is initialized)
import authRoutes from './routes/authRoutes';
import marketplaceRoutes from './routes/marketplaceRoutes';
import walletRoutes from './routes/walletRoutes';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/wallet', walletRoutes);

// Socket.io Logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('register', (userId) => {
    console.log(`Socket ${socket.id} registered for user ${userId}`);
  });

  socket.on('call_offer', (data) => {
    io.to(data.to).emit('call_offer', { from: data.from, offer: data.offer });
  });

  socket.on('call_answer', (data) => {
    io.to(data.to).emit('call_answer', { from: data.from, answer: data.answer });
  });

  socket.on('ice_candidate', (data) => {
    io.to(data.to).emit('ice_candidate', { from: data.from, candidate: data.candidate });
  });

  socket.on('end_call', ({ to }) => {
    io.to(to).emit('call_ended');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
