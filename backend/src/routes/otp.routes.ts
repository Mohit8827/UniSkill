import express from 'express';
import { createAndSendOTP, verifyOTP } from '../services/otp.service.js';

const router = express.Router();

// POST /api/otp/send - Send OTP to email/phone
router.post('/send', async (req: express.Request, res: express.Response) => {
  try {
    const { email, phone, type, userId, userName } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ error: 'Email or phone required' });
    }

    if (!type) {
      return res.status(400).json({ error: 'OTP type required' });
    }

    const validTypes = ['personal_email', 'college_email', 'phone', 'signup_complete'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid OTP type' });
    }

    const result = await createAndSendOTP(
      email || '',
      type,
      userId,
      phone,
      userName
    );

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      message: 'Verification code sent successfully.',
      expiresAt: result.expiresAt,
      otpId: result.otpId,
    });
  } catch (error: any) {
    console.error('OTP Send Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /api/otp/verify - Verify OTP
router.post('/verify', async (req: express.Request, res: express.Response) => {
  try {
    const { email, phone, otp, type, userId } = req.body;

    if (!otp || otp.length !== 6) {
      return res.status(400).json({ error: '6-digit OTP required' });
    }

    const result = await verifyOTP(otp, type, email, phone, userId);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      message: 'OTP verified successfully',
    });
  } catch (error: any) {
    console.error('OTP Verify Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// GET /api/otp/status/:userId - Check verification status
router.get('/status/:userId', async (req: express.Request, res: express.Response) => {
  try {
    const { userId } = req.params;
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseKey =
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      '';
    const supabase = createClient(
      process.env.SUPABASE_URL || '',
      supabaseKey
    );

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('personal_email_verified, college_email_verified, phone_verified, verification_step')
      .eq('id', userId)
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch verification status' });
    }

    res.json({
      success: true,
      verification: {
        personalEmail: profile?.personal_email_verified || false,
        collegeEmail: profile?.college_email_verified || false,
        phone: profile?.phone_verified || false,
        step: profile?.verification_step || 1,
        allVerified:
          (profile?.personal_email_verified || false) &&
          (profile?.college_email_verified || false) &&
          (profile?.phone_verified || false),
      },
    });
  } catch (error: any) {
    console.error('Verification Status Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
