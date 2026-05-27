import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Root Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to UniSkill API' });
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'UniSkill API is running' });
});

// Authentication (Placeholder)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, name, studentIdCard } = req.body;
    
    // Validate if edu email (Basic validation)
    if (!email.endsWith('.edu') && !email.includes('ac.in')) {
      return res.status(400).json({ error: 'Must use a valid institutional email' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        studentIdCard,
        isVerified: false, // Wait for OCR validation
        wallet: {
          create: {
            balance: 0
          }
        }
      },
    });

    res.status(201).json({ message: 'User registered. Pending verification.', user });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
