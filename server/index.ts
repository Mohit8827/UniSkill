import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for development
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// In-Memory Database for rapid prototyping
interface User {
  id: string; // College ID
  name: string;
  credits: number;
  skills: string[];
}

interface CallSession {
  roomId: string;
  mentorId: string;
  learnerId: string;
  startTime: number;
}

const users: Map<string, User> = new Map();
const activeCalls: Map<string, CallSession> = new Map();
let callInterval: NodeJS.Timeout | null = null;

// Mock some initial users
users.set('12345', { id: '12345', name: 'Alice (Mentor)', credits: 100, skills: ['Python', 'Math'] });
users.set('67890', { id: '67890', name: 'Bob (Learner)', credits: 100, skills: [] });

// --- API Endpoints ---

app.post('/api/login', (req, res) => {
  const { id, name } = req.body;
  if (!id || !name) {
    return res.status(400).json({ error: 'ID and name required' });
  }
  
  if (!users.has(id)) {
    users.set(id, { id, name, credits: 100, skills: [] });
  } else {
    // Update name on login just in case
    const u = users.get(id)!;
    u.name = name;
    users.set(id, u);
  }
  
  res.json(users.get(id));
});

app.get('/api/user/:id', (req, res) => {
  const user = users.get(req.params.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.post('/api/skills', (req, res) => {
  const { id, skills } = req.body;
  const user = users.get(id);
  if (user) {
    user.skills = skills;
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Matchmaking State
const searchingUsers: { socketId: string, userId: string, topic: string }[] = [];
// Map socket ID to user ID for easy cleanup
const socketUserMap: Map<string, string> = new Map();

// --- Socket.io (Signaling & Credit Engine) ---

io.on('connection', (socket: Socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('register', (userId: string) => {
    socketUserMap.set(socket.id, userId);
  });

  // Matchmaking
  socket.on('join-matchmaking', ({ userId, topic }: { userId: string, topic: string }) => {
    console.log(`User ${userId} searching for ${topic}`);
    
    // 1. Try to find an online user who HAS this skill (Mentor)
    const mentorSocketId = Object.keys(io.sockets.sockets).find(sid => {
        const uId = socketUserMap.get(sid);
        if (uId && uId !== userId) {
            const user = users.get(uId);
            return user?.skills.map(s => s.toLowerCase()).includes(topic.toLowerCase());
        }
        return false;
    });

    if (mentorSocketId) {
        // Match found with an online mentor!
        const mentorId = socketUserMap.get(mentorSocketId)!;
        const roomId = `room_${userId}_${mentorId}_${Date.now()}`;
        
        socket.join(roomId);
        io.sockets.sockets.get(mentorSocketId)?.join(roomId);
        
        // Notify both parties
        io.to(roomId).emit('match-found', { roomId, mentorId, learnerId: userId, topic });
        return;
    }

    // 2. If no mentor is immediately found, check if someone else is SEARCHING for this topic
    // (Maybe we can match two people searching for the same thing? 
    // Or just wait for a mentor to become available)
    
    // For this prototype, let's just add them to the searching pool
    searchingUsers.push({ socketId: socket.id, userId, topic });
    socket.emit('match-status', { status: 'searching' });
  });

  // WebRTC Signaling
  socket.on('offer', (data) => {
    socket.to(data.roomId).emit('offer', data.offer);
  });

  socket.on('answer', (data) => {
    socket.to(data.roomId).emit('answer', data.answer);
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.roomId).emit('ice-candidate', data.candidate);
  });

  // Call Lifecycle & Credits
  socket.on('call-started', ({ roomId, mentorId, learnerId }) => {
    if (!activeCalls.has(roomId)) {
      console.log(`Call started in room ${roomId}`);
      activeCalls.set(roomId, { roomId, mentorId, learnerId, startTime: Date.now() });
      io.to(roomId).emit('call-started', { startTime: Date.now() });
    }
  });

  socket.on('end-call', ({ roomId }) => {
    endCall(roomId);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    const userId = socketUserMap.get(socket.id);
    socketUserMap.delete(socket.id);
    
    // Remove from searching pool
    const index = searchingUsers.findIndex(u => u.socketId === socket.id);
    if (index !== -1) {
        searchingUsers.splice(index, 1);
    }
    
    // End any active calls for this user
    for (const [roomId, call] of activeCalls.entries()) {
      if (call.mentorId === userId || call.learnerId === userId) {
        endCall(roomId);
      }
    }
  });
});

function endCall(roomId: string) {
    if (activeCalls.has(roomId)) {
      console.log(`Call ended in room ${roomId}`);
      activeCalls.delete(roomId);
      io.to(roomId).emit('call-ended', { roomId });
      // Remove all sockets from the room
      io.in(roomId).socketsLeave(roomId);
    }
}

// --- Credit Deduction Engine ---
// Runs every second to check active calls and process credits
callInterval = setInterval(() => {
  activeCalls.forEach((call, roomId) => {
    const learner = users.get(call.learnerId);
    const mentor = users.get(call.mentorId);

    if (learner && mentor) {
      if (learner.credits > 0) {
        // Deduct 1 credit per second for simplicity in prototype, 
        // real world would be per minute or similar
        learner.credits -= 1;
        mentor.credits += 1;
        
        // Broadcast updated credits to the room
        io.to(roomId).emit('credit-update', { 
            learnerCredits: learner.credits, 
            mentorCredits: mentor.credits 
        });
      } else {
        // Learner ran out of credits, end the call
        endCall(roomId);
      }
    }
  });
}, 1000); // 1 credit per second for dramatic demo effect


const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
