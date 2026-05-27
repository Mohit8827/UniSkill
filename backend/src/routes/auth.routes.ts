import express from 'express';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const router = express.Router();
const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/['"]+/g, '');
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').replace(/['"]+/g, '');
const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || '').replace(/['"]+/g, '');

function createSupabaseClient(key: string) {
  return createClient(supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

const databaseSupabase = createSupabaseClient(supabaseAnonKey || supabaseServiceKey);
const publicSupabase = createSupabaseClient(supabaseAnonKey || supabaseServiceKey);
const adminSupabase = createSupabaseClient(supabaseServiceKey || supabaseAnonKey);

function isInvalidAdminKeyError(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('invalid api key') ||
    normalized.includes('invalid jwt') ||
    normalized.includes('unauthorized') ||
    normalized.includes('forbidden')
  );
}

async function findAuthUserByEmail(email: string) {
  let page = 1;

  while (page <= 20) {
    const { data, error } = await adminSupabase.auth.admin.listUsers({ page, perPage: 200 });

    if (error) {
      throw error;
    }

    const matchedUser = data.users.find((user) => user.email?.toLowerCase() === email);
    if (matchedUser) {
      return matchedUser;
    }

    if (data.users.length < 200) {
      break;
    }

    page += 1;
  }

  return null;
}

async function loadProfileByEmail(email: string) {
  const { data, error } = await databaseSupabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

// POST /api/auth/register - Create new user with profile
router.post('/register', async (req: express.Request, res: express.Response) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const phone = typeof req.body.phone === 'string' ? req.body.phone.trim() : null;
    const college = typeof req.body.college === 'string' ? req.body.college.trim() : null;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const existingProfile = await loadProfileByEmail(email);

    if (existingProfile) {
      try {
        const existingAuthUser = await findAuthUserByEmail(email);

        if (existingAuthUser) {
          return res.status(409).json({ error: 'User with this email already exists' });
        }

        return res.status(409).json({
          error: 'Profile exists without a matching Supabase Auth user. Run the auth re-sync script with a valid service role key.',
          code: 'profile_auth_desync',
          profileId: existingProfile.id,
        });
      } catch (lookupError: any) {
        if (isInvalidAdminKeyError(lookupError.message || '')) {
          return res.status(409).json({
            error: 'User with this email already exists in profiles. The admin key is invalid, so Auth sync could not be verified.',
            code: 'profile_exists_admin_unavailable',
          });
        }

        throw lookupError;
      }
    }

    const { data: authUser, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        phone,
        college,
      },
    });

    if (authError) {
      if (isInvalidAdminKeyError(authError.message)) {
        const { data: signupData, error: signupError } = await publicSupabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              phone,
              college,
            },
          },
        });

        if (signupError || !signupData.user) {
          console.error('Public signup fallback error:', signupError);
          return res.status(400).json({ error: signupError?.message || 'Unable to create account' });
        }

        const fallbackProfile = await loadProfileByEmail(email);

        return res.status(201).json({
          success: true,
          user: {
            id: signupData.user.id,
            email: signupData.user.email,
            name,
          },
          profile: fallbackProfile || { id: signupData.user.id, name, email },
          usedFallback: true,
          requiresEmailConfirmation: !signupData.session,
        });
      }

      console.error('Auth creation error:', authError);
      return res.status(400).json({ error: authError.message });
    }

    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .upsert({
        id: authUser.user!.id,
        name,
        display_name: name,
        email,
        phone,
        college,
        verification_step: 1,
      }, { onConflict: 'id' })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
    }

    res.status(201).json({
      success: true,
      user: {
        id: authUser.user!.id,
        email: authUser.user!.email,
        name,
      },
      profile: profile || { id: authUser.user!.id, name, email },
    });
  } catch (error: any) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /api/auth/login - Login with email/password (using Supabase Auth)
router.post('/login', async (req: express.Request, res: express.Response) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await publicSupabase.auth.signInWithPassword({ email, password });

    if (error) {
      const normalized = error.message.toLowerCase();
      const status = normalized.includes('email not confirmed') ? 403 : 401;
      const code = normalized.includes('email not confirmed') ? 'email_not_confirmed' : 'invalid_credentials';
      return res.status(status).json({ error: error.message, code });
    }

    const { data: profile } = await databaseSupabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    res.json({
      success: true,
      user: data.user,
      profile,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in,
        expires_at: data.session.expires_at,
      },
    });
  } catch (error: any) {
    console.error('Login Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /api/auth/logout - Logout user
router.post('/logout', async (req: express.Request, res: express.Response) => {
  try {
    // Client should handle clearing tokens
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('Logout Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/forgot-password - Send password reset email
router.post('/forgot-password', async (req: express.Request, res: express.Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // 1. Check if user exists
    const { data: user, error: userError } = await databaseSupabase
      .from('profiles')
      .select('name, email')
      .eq('email', email)
      .single();

    if (userError || !user) {
      // For security, don't reveal if user exists, but we won't send email
      return res.json({
        success: true,
        message: 'If an account exists with this email, you will receive a reset link.',
      });
    }

    // 2. Generate reset token (in real app, store this in DB with expiry)
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // 3. Send real email using our service
    const { default: emailService } = await import('../services/email.service.js');
    const emailResult = await emailService.sendPasswordResetEmail(email, resetToken);

    if (!emailResult.success) {
      return res.status(500).json({ 
        error: emailResult.error || 'Failed to send reset email. Please try again later.' 
      });
    }

    res.json({
      success: true,
      message: 'Password reset link has been sent to your email.',
    });
  } catch (error: any) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// GET /api/auth/profile/:userId - Get user profile
router.get('/profile/:userId', async (req: express.Request, res: express.Response) => {
  try {
    const { userId } = req.params;

    const { data: profile, error } = await databaseSupabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ success: true, profile });
  } catch (error: any) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/auth/profile/:userId - Update user profile
router.put('/profile/:userId', async (req: express.Request, res: express.Response) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Remove sensitive fields
    delete updates.id;
    delete updates.email;
    delete updates.credits;
    delete updates.is_verified;

    const { data: profile, error } = await databaseSupabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ success: true, profile });
  } catch (error: any) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/profile/update-master - Master key powered update
router.post('/profile/update-master', async (req: express.Request, res: express.Response) => {
  try {
    const { userId, updates } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'UserId is required' });
    }

    // This uses the Service Role Key (adminSupabase) which bypasses all RLS
    const { data: profile, error } = await adminSupabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ success: true, profile });
  } catch (error: any) {
    console.error('Master Update Error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
