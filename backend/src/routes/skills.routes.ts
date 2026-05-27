import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();
const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/['"]+/g, '');
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').replace(/['"]+/g, '');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET /api/skills/match/:userId - Find perfect skill swaps
router.get('/match/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // 1. Get the current user's skills and goals
    const { data: currentUser, error: userError } = await supabase
      .from('profiles')
      .select('skills, learning_goals, college')
      .eq('id', userId)
      .single();

    if (userError || !currentUser) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const mySkills = (currentUser.skills || []).map((s: string) => s.toLowerCase().trim());
    const myGoals = (currentUser.learning_goals || []).map((s: string) => s.toLowerCase().trim());

    if (mySkills.length === 0 && myGoals.length === 0) {
      return res.json({ 
        perfectMatches: [], 
        partialMatches: [],
        message: 'Add skills and learning goals to your profile to find matches!' 
      });
    }

    // 2. Fetch potential candidates
    // We fetch a set and then filter/score in code for maximum reliability
    const { data: allProfiles, error: fetchError } = await supabase
      .from('profiles')
      .select('id, name, display_name, email, avatar_url, skills, learning_goals, college, rating, is_mentor')
      .neq('id', userId)
      .limit(100);

    if (fetchError) throw fetchError;

    function processMatches(profiles: any[] | null) {
      const perfectMatches: any[] = [];
      const partialMatches: any[] = [];

      profiles?.forEach(profile => {
        const theirSkills = (profile.skills || []).map((s: string) => s.toLowerCase().trim());
        const theirGoals = (profile.learning_goals || []).map((s: string) => s.toLowerCase().trim());

        // Skills they teach that I want to learn
        const overlapIWant = theirSkills.filter((s: string) => myGoals.includes(s));
        // Skills I teach that they want to learn
        const overlapTheyWant = mySkills.filter((s: string) => theirGoals.includes(s));

        if (overlapIWant.length > 0 || overlapTheyWant.length > 0) {
          const isPerfect = overlapIWant.length > 0 && overlapTheyWant.length > 0;
          
          const matchScore = Math.round(
            ((overlapIWant.length * 2 + overlapTheyWant.length) / 
            (myGoals.length + mySkills.length || 1)) * 100
          );

          const matchObj = {
            ...profile,
            matchType: isPerfect ? 'perfect' : 'partial',
            score: matchScore,
            overlap: {
              youLearn: overlapIWant,
              theyLearn: overlapTheyWant
            },
            isSameCollege: profile.college === currentUser.college
          };

          if (isPerfect) {
            perfectMatches.push(matchObj);
          } else {
            partialMatches.push(matchObj);
          }
        }
      });

      // Sort by score and college proximity
      const sortByScore = (a: any, b: any) => {
        if (a.isSameCollege && !b.isSameCollege) return -1;
        if (!a.isSameCollege && b.isSameCollege) return 1;
        return b.score - a.score;
      };

      return {
        perfectMatches: perfectMatches.sort(sortByScore).slice(0, 10),
        partialMatches: partialMatches.sort(sortByScore).slice(0, 10),
        count: perfectMatches.length + partialMatches.length
      };
    }

    res.json(processMatches(allProfiles));

  } catch (error: any) {
    console.error('Matching Error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
