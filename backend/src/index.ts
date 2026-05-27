import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors, { type CorsOptions } from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// Import routes
import otpRoutes from './routes/otp.routes.js';
import authRoutes from './routes/auth.routes.js';
import walletRoutes from './routes/wallet.routes.js';
import skillsRoutes from './routes/skills.routes.js';
import sessionRoutes from './routes/sessions.routes.js';

const app = express();
const httpServer = createServer(app);
const HOST = process.env.HOST || '0.0.0.0';

const defaultDevOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'];
const configuredOrigins = [
  process.env.FRONTEND_URL,
  process.env.APP_URL,
  process.env.ALLOWED_ORIGINS,
]
  .filter(Boolean)
  .flatMap((value) => String(value).split(','))
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(new Set(configuredOrigins.length > 0 ? configuredOrigins : defaultDevOrigins));
const corsOrigin: CorsOptions['origin'] = (origin, callback) => {
  // In development, allow all origins to make network testing easier
  if (process.env.NODE_ENV === 'development') {
    callback(null, true);
    return;
  }

  if (!origin || allowedOrigins.includes(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error(`Origin ${origin} is not allowed by CORS.`));
};

const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'development' ? true : allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/otp', otpRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/sessions', sessionRoutes);

// WebRTC Signaling with Socket.io
io.on('connection', (socket) => {
  console.log('User connected to signaling network:', socket.id);

  socket.on('join-room', (roomId: string, userId: string) => {
    socket.join(roomId);
    console.log(`User ${userId} joined room ${roomId}`);
    socket.to(roomId).emit('user-connected', userId);

    socket.on('disconnect', () => {
      console.log('User disconnected:', userId);
      socket.to(roomId).emit('user-disconnected', userId);
    });
  });

  socket.on('signal', (data: { roomId: string; signal: any; from: string }) => {
    socket.to(data.roomId).emit('signal', {
      signal: data.signal,
      from: data.from,
    });
  });

  socket.on('chat-message', (data: { roomId: string; message: string; from: string; timestamp: string }) => {
    io.to(data.roomId).emit('chat-message', data);
  });

  socket.on('end-call', (data: { roomId: string; userId: string }) => {
    io.to(data.roomId).emit('call-ended', { userId: data.userId });
    console.log(`Call ended in room ${data.roomId} by user ${data.userId}`);
  });
});

const PORT = Number(process.env.PORT || 5000);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

httpServer.listen(PORT, HOST, () => {
  console.log(`\n========================================`);
  console.log(`  UniSkill Backend Server`);
  console.log(`========================================`);
  console.log(`  Host: ${HOST}`);
  console.log(`  Port: ${PORT}`);
  console.log(`  Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Allowed Origins: ${allowedOrigins.join(', ')}`);
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD || '';
  const emailServiceLabel =
    gmailAppPassword.trim()
      ? 'Gmail SMTP'
      : 'Not configured';
  console.log(`  Email Service: ${emailServiceLabel}`);
  console.log(`========================================\n`);
});

export { app, io };
