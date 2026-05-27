import express from 'express';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const router = express.Router();
const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/['"]+/g, '');
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').replace(/['"]+/g, '');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// POST /api/sessions/request - Create a new swap request
router.post('/request', async (req, res) => {
  try {
    const { mentorId, studentId, title, price, skillCategory } = req.body;

    if (!mentorId || !studentId || !title) {
      return res.status(400).json({ error: 'Missing required session details' });
    }

    // 1. Create the pending session
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        id: crypto.randomUUID(),
        mentor_id: mentorId,
        student_id: studentId,
        title,
        price: price || 0,
        skill_category: skillCategory,
        status: 'pending',
        room_id: `room-${crypto.randomUUID().slice(0, 8)}`
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    // 2. Get Student Name for Notification
    const { data: student } = await supabase
      .from('profiles')
      .select('name, display_name')
      .eq('id', studentId)
      .single();

    const studentName = student?.display_name || student?.name || 'A student';

    // 3. Create notification for the Mentor
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: mentorId,
        type: 'session_request',
        title: 'New Swap Request!',
        message: `${studentName} wants to swap skills for: ${title}`,
        data: { sessionId: session.id, studentId }
      });

    if (notifError) console.error('Notification Error:', notifError);

    res.status(201).json({ success: true, session });
  } catch (error: any) {
    console.error('Session Request Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/sessions/respond - Accept or Reject a request
router.post('/respond', async (req, res) => {
  try {
    const { sessionId, action } = req.body; // action: 'accept' or 'reject'

    if (!sessionId || !['accept', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid response action' });
    }

    const newStatus = action === 'accept' ? 'confirmed' : 'rejected';

    // 1. Update session status
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .update({ status: newStatus })
      .eq('id', sessionId)
      .select('*, mentor:profiles!mentor_id(name, display_name)')
      .single();

    if (sessionError) throw sessionError;

    // 2. Notify the student
    const mentorName = session.mentor?.display_name || session.mentor?.name || 'The mentor';
    
    await supabase.from('notifications').insert({
      user_id: session.student_id,
      type: `session_${action}`,
      title: action === 'accept' ? 'Request Accepted!' : 'Request Declined',
      message: action === 'accept' 
        ? `${mentorName} accepted your swap request for "${session.title}".` 
        : `${mentorName} is unable to swap skills right now for "${session.title}".`,
      data: { sessionId: session.id }
    });

    res.json({ success: true, status: newStatus });
  } catch (error: any) {
    console.error('Session Response Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/sessions/review - Submit a review for a session
router.post('/review', async (req, res) => {
  try {
    const { sessionId, reviewerId, revieweeId, rating, comment } = req.body;

    if (!sessionId || !reviewerId || !revieweeId || rating === undefined) {
      return res.status(400).json({ error: 'Missing required review details' });
    }

    // 1. Insert Review
    const { error: reviewError } = await supabase
      .from('reviews')
      .insert({
        id: crypto.randomUUID(),
        session_id: sessionId,
        reviewer_id: reviewerId,
        reviewee_id: revieweeId,
        rating: Number(rating),
        comment: comment || '',
      });

    if (reviewError) throw reviewError;

    // 2. Update Reviewee Profile Rating (simple average for now)
    const { data: allReviews, error: fetchReviewsError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewee_id', revieweeId);

    if (!fetchReviewsError && allReviews && allReviews.length > 0) {
      const totalScore = allReviews.reduce((sum, r) => sum + r.rating, 0);
      const newRating = totalScore / allReviews.length;

      await supabase
        .from('profiles')
        .update({ rating: newRating })
        .eq('id', revieweeId);
    }

    res.status(201).json({ success: true });
  } catch (error: any) {
    console.error('Session Review Error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
