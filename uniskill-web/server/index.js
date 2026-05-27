const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 5001;

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the client dist folder
const staticPath = path.join(__dirname, '../client/dist');
app.use(express.static(staticPath));

// Mock Data
let users = [
  { id: 'user1', studentId: '12345', email: 'student@university.edu', verified: true, skillsHave: ['Math', 'Physics'], skillsWant: ['Programming', 'Design'], balance: 50, role: 'student' },
  { id: 'tutor1', studentId: '67890', email: 'tutor@university.edu', verified: true, skillsHave: ['Programming', 'React'], skillsWant: ['History'], balance: 120, role: 'tutor' }
];

// --- API Routes ---
app.post('/api/auth/register', (req, res) => {
  const { studentId, email } = req.body;
  if (!studentId || !email) return res.status(400).json({ message: 'Missing fields' });
  const existing = users.find(u => u.studentId === studentId);
  if (existing) return res.json({ message: 'User already exists', user: existing });
  const newUser = { id: Math.random().toString(36).substr(2, 9), studentId, email, verified: false, skillsHave: [], skillsWant: [], balance: 0, role: 'student' };
  users.push(newUser);
  res.json({ message: 'Registration successful', user: newUser });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { otp } = req.body;
  if (otp === '1234') res.json({ success: true, message: 'OTP Verified' });
  else res.status(400).json({ success: false, message: 'Invalid OTP' });
});

const upload = multer({ dest: 'uploads/' });
app.post('/api/auth/upload-id', upload.single('idCard'), (req, res) => {
  const { userId } = req.body;
  const user = users.find(u => u.id === userId);
  if (user) { user.verified = true; res.json({ success: true, message: 'ID Verified' }); }
  else res.status(404).json({ success: false, message: 'User not found' });
});

app.get('/api/user/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (user) res.json(user);
  else res.status(404).json({ message: 'User not found' });
});

app.get('/api/matches', (req, res) => {
  const { skill, type } = req.query;
  if (!skill) return res.json([]);
  const matches = users.filter(u => {
    if (type === 'tutor') return u.skillsHave.some(s => s.toLowerCase().includes(skill.toLowerCase()));
    return u.skillsWant.some(s => s.toLowerCase().includes(skill.toLowerCase()));
  });
  res.json(matches);
});

// Serve React App for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 DEPLOYMENT SUCCESSFUL`);
  console.log(`👉 URL: http://127.0.0.1:${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ ERROR: Port ${PORT} is already in use. Run 'npx kill-port ${PORT}'`);
  } else {
    console.error(`\n❌ ERROR:`, err.message);
  }
});