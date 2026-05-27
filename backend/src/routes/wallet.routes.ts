import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET /api/wallet/:userId - Get user wallet info
router.get('/:userId', async (req: express.Request, res: express.Response) => {
  try {
    const { userId } = req.params;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('credits, total_earned')
      .eq('id', userId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Get recent transactions
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    res.json({
      success: true,
      wallet: {
        credits: profile.credits,
        totalEarned: profile.total_earned,
        transactions: transactions || [],
      },
    });
  } catch (error: any) {
    console.error('Get Wallet Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/wallet/add-credits - Add credits to wallet (payment gateway callback)
router.post('/add-credits', async (req: express.Request, res: express.Response) => {
  try {
    const { userId, amount, paymentMethod, transactionId } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid user ID and amount required' });
    }

    // Get current credits
    const { data: profile, error: fetchErr } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();

    if (fetchErr) throw fetchErr;

    const newCredits = (profile?.credits || 0) + amount;

    // Update credits
    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', userId);

    if (updateErr) throw updateErr;

    // Log transaction
    const { error: txErr } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        title: 'Credits Purchased',
        amount: amount,
        type: 'credit',
        status: 'completed',
        payment_method: paymentMethod || 'unknown',
        transaction_id: transactionId || null,
      });

    if (txErr) console.error('Transaction log error:', txErr);

    res.json({
      success: true,
      message: 'Credits added successfully',
      credits: newCredits,
    });
  } catch (error: any) {
    console.error('Add Credits Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/wallet/transfer - Transfer credits between users
router.post('/transfer', async (req: express.Request, res: express.Response) => {
  try {
    const { fromUserId, toUserId, amount, sessionId, sessionTitle } = req.body;

    if (!fromUserId || !toUserId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid sender, receiver, and amount required' });
    }

    if (fromUserId === toUserId) {
      return res.status(400).json({ error: 'Cannot transfer to yourself' });
    }

    // Get sender profile
    const { data: sender, error: senderErr } = await supabase
      .from('profiles')
      .select('credits, name')
      .eq('id', fromUserId)
      .single();

    if (senderErr || !sender) {
      return res.status(404).json({ error: 'Sender profile not found' });
    }

    if (sender.credits < amount) {
      return res.status(400).json({ error: 'Insufficient credits' });
    }

    // Get receiver profile
    const { data: receiver, error: receiverErr } = await supabase
      .from('profiles')
      .select('credits, total_earned, name')
      .eq('id', toUserId)
      .single();

    if (receiverErr || !receiver) {
      return res.status(404).json({ error: 'Receiver profile not found' });
    }

    // Update sender credits
    const { error: debitErr } = await supabase
      .from('profiles')
      .update({ credits: sender.credits - amount })
      .eq('id', fromUserId);

    if (debitErr) throw debitErr;

    // Update receiver credits
    const { error: creditErr } = await supabase
      .from('profiles')
      .update({
        credits: receiver.credits + amount,
        total_earned: (receiver.total_earned || 0) + amount,
      })
      .eq('id', toUserId);

    if (creditErr) throw creditErr;

    // Log transactions
    await supabase.from('transactions').insert([
      {
        user_id: fromUserId,
        session_id: sessionId || null,
        title: `Paid for: ${sessionTitle || 'Session'}`,
        amount: amount,
        type: 'debit',
        status: 'completed',
      },
      {
        user_id: toUserId,
        session_id: sessionId || null,
        title: `Earned from: ${sessionTitle || 'Session'}`,
        amount: amount,
        type: 'credit',
        status: 'completed',
      },
    ]);

    res.json({
      success: true,
      message: 'Transfer successful',
      newBalance: sender.credits - amount,
    });
  } catch (error: any) {
    console.error('Transfer Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/wallet/transactions/:userId - Get transaction history
router.get('/transactions/:userId', async (req: express.Request, res: express.Response) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const { data: transactions, error, count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) throw error;

    res.json({
      success: true,
      transactions: transactions || [],
      total: count || 0,
    });
  } catch (error: any) {
    console.error('Get Transactions Error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
