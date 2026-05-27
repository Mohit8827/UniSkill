import express from 'express';
import { getMentors, getSwapMatches, getMySessions } from '../controllers/marketplaceController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/mentors', protect, getMentors);
router.get('/swap-matches', protect, getSwapMatches);
router.get('/my-sessions', protect, getMySessions);

export default router;
