import express from 'express';
import { 
  register, 
  login, 
  verifyOTP, 
  verifyCollegeId,
  uploadVideo,
  getMe
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', protect, verifyOTP);
router.post('/verify-id', protect, upload.single('idCard'), verifyCollegeId);
router.post('/upload-video', protect, upload.single('video'), uploadVideo);
router.get('/me', protect, getMe);

export default router;
