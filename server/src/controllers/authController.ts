import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import Tesseract from 'tesseract.js';
import nodemailer from 'nodemailer';
import fs from 'fs';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

const otpStore: { [key: string]: string } = {};

export const register = async (req: Request, res: Response) => {
  const { name, email, phone, college, password, collegeEmail } = req.body;
  try {
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { 
        name, email, phone, college, password: hashedPassword, collegeEmail,
        verificationStep: 2 // Move to Email OTP step
      }
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[collegeEmail] = otp;
    console.log(`OTP for ${collegeEmail}: ${otp}`);

    res.status(201).json({
      id: user.id,
      token: generateToken(user.id),
      verificationStep: 2,
      message: 'Registration successful. Verify your college email OTP.'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  const { collegeEmail, otp } = req.body;
  const user = (req as any).user;

  if (otpStore[collegeEmail] === otp) {
    delete otpStore[collegeEmail];
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationStep: 3 }
    });
    res.json({ success: true, verificationStep: 3, message: 'College email verified. Now upload your ID card.' });
  } else {
    res.status(400).json({ message: 'Invalid OTP' });
  }
};

export const verifyCollegeId = async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ message: 'No ID card uploaded' });

  try {
    const { data: { text } } = await Tesseract.recognize(req.file.path, 'eng');
    const user = (req as any).user;

    const lowerText = text.toLowerCase();
    const nameMatch = lowerText.includes(user.name.toLowerCase());
    const collegeMatch = lowerText.includes(user.college.toLowerCase());

    if (nameMatch || collegeMatch) {
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          verificationStep: 4, 
          collegeIdUrl: req.file.path 
        }
      });
      // In a real app, we might keep the ID for manual review, but for this prototype:
      // fs.unlinkSync(req.file.path); 
      res.json({ success: true, verificationStep: 4, message: 'ID verified. Now record your 3-minute intro video.' });
    } else {
      fs.unlinkSync(req.file.path);
      res.status(400).json({ success: false, message: 'Verification failed. ID details do not match profile.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'OCR process failed' });
  }
};

export const uploadVideo = async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ message: 'No video uploaded' });
  const user = (req as any).user;

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        verificationStep: 5,
        isVerified: true,
        videoUrl: req.file.path 
      }
    });
    res.json({ success: true, verificationStep: 5, message: 'Video uploaded. You are now fully verified!' });
  } catch (error) {
    res.status(500).json({ message: 'Video upload failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        verificationStep: user.verificationStep,
        token: generateToken(user.id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  res.json((req as any).user);
};
