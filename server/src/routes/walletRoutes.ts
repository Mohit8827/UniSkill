import express from 'express';
import { getTransactions, deposit, withdraw } from '../controllers/walletController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/transactions', protect, getTransactions);
router.post('/deposit', protect, deposit);
router.post('/withdraw', protect, withdraw);

export default router;
