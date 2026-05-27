import { createClient } from '@supabase/supabase-js';
import { sendOTPEmail } from './email.service.js';

const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/['"]+/g, '');
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').replace(/['"]+/g, '');
const supabaseAnonKey =
  (process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').replace(/['"]+/g, '');
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || '';
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || '';
const twilioFromNumber = process.env.TWILIO_FROM_NUMBER || '';
const twilioMessagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID || '';

const otpSupabase = createClient(supabaseUrl, supabaseAnonKey || supabaseServiceKey);
const adminSupabase = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

const OTP_EXPIRY_SECONDS = 600;

interface OTPResult {
  success: boolean;
  otpId?: string;
  expiresAt?: string;
  error?: string;
  errorCode?: string;
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getExpiresAt(): string {
  const date = new Date();
  date.setSeconds(date.getSeconds() + OTP_EXPIRY_SECONDS);
  return date.toISOString();
}

function normalizePhoneNumber(phone: string) {
  const trimmed = phone.trim();

  if (trimmed.startsWith('+')) {
    const digits = trimmed.slice(1).replace(/\D/g, '');
    if (digits.length >= 10 && digits.length <= 15) {
      return `+${digits}`;
    }
    return null;
  }

  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length >= 11 && digits.length <= 15) {
    return `+${digits}`;
  }

  return null;
}

function hasTwilioConfig() {
  return Boolean(
    twilioAccountSid &&
      twilioAuthToken &&
      (twilioMessagingServiceSid || twilioFromNumber)
  );
}

async function sendPhoneOTP(phone: string, otp: string) {
  const recipient = normalizePhoneNumber(phone);

  if (!recipient) {
    return {
      success: false,
      error: 'Enter a valid phone number with country code support.',
      errorCode: 'INVALID_PHONE',
    };
  }

  // Development / Mock mode
  const isDev = process.env.NODE_ENV === 'development';
  const isBypass = process.env.BYPASS_TWILIO === 'true';
  const hasConfig = hasTwilioConfig();

  if (isDev || isBypass || !hasConfig) {
    console.log('\n========================================');
    console.log(`  [SMS SERVICE - ${isBypass ? 'BYPASS' : (!hasConfig ? 'NOT CONFIG' : 'DEV')} MODE]`);
    console.log(`  To: ${recipient}`);
    console.log(`  OTP: ${otp}`);
    console.log('========================================\n');
    
    if (!hasConfig && !isBypass && process.env.NODE_ENV === 'production') {
      return { 
        success: false, 
        error: 'Phone verification is not configured on the server.',
        errorCode: 'PHONE_OTP_NOT_CONFIGURED'
      };
    }
    return { success: true };
  }

  const body = new URLSearchParams({
    To: recipient,
    Body: `${otp} is your UniSkill verification code. It expires in 10 minutes.`,
  });

  if (twilioMessagingServiceSid) {
    body.append('MessagingServiceSid', twilioMessagingServiceSid);
  } else {
    body.append('From', twilioFromNumber);
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      }
    );

    const raw = await response.text();
    const data = raw ? JSON.parse(raw) : null;

    if (!response.ok) {
      console.error('Twilio API Error:', data ?? raw);
      return {
        success: false,
        error: data?.message || 'Failed to send phone verification code.',
        errorCode: 'PHONE_OTP_SEND_FAILED',
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Phone OTP sending error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send phone verification code.',
      errorCode: 'PHONE_OTP_SEND_FAILED',
    };
  }
}

async function storeOTPRecord(params: {
  email?: string | undefined;
  phone?: string | undefined;
  userId?: string | undefined;
  otp: string;
  type: 'personal_email' | 'college_email' | 'phone' | 'signup_complete';
  expiresAt: string;
}) {
  const { data, error } = await otpSupabase
    .from('otp_verifications')
    .insert({
      user_id: params.userId || null,
      email: params.email || null,
      phone: params.phone || null,
      otp: params.otp,
      otp_type: params.type,
      expires_at: params.expiresAt,
      verified: false,
      attempts: 0,
    })
    .select()
    .single();

  return { data, error };
}

export async function createAndSendOTP(
  email: string,
  type: 'personal_email' | 'college_email' | 'phone' | 'signup_complete',
  userId?: string,
  phone?: string,
  userName?: string
): Promise<OTPResult> {
  const otp = generateOTP();
  const expiresAt = getExpiresAt();

  if (type === 'phone') {
    if (!phone) {
      return { success: false, error: 'Phone number is required for phone verification.' };
    }

    const smsResult = await sendPhoneOTP(phone, otp);
    if (!smsResult.success) {
      return smsResult;
    }

    const { data, error } = await storeOTPRecord({
      phone,
      userId,
      otp,
      type,
      expiresAt,
    });

    if (error) {
      console.error('OTP storage error:', error);
      return { success: false, error: 'Failed to generate phone verification code. Please try again.' };
    }

    return {
      success: true,
      otpId: data.id,
      expiresAt,
    };
  }

  if (!email) {
    return { success: false, error: 'Email is required for email verification.' };
  }

  const emailResult = await sendOTPEmail(email, otp, type, userName);

  if (!emailResult.success) {
    const failure: OTPResult = {
      success: false,
      error: emailResult.error || 'Failed to send verification email.',
    };
    if (emailResult.errorCode) {
      failure.errorCode = emailResult.errorCode;
    }
    return failure;
  }

  const { data, error } = await storeOTPRecord({
    email,
    phone,
    userId,
    otp,
    type,
    expiresAt,
  });

  if (error) {
    console.error('OTP storage error:', error);
    return { success: false, error: 'Failed to store verification code. Please try again.' };
  }

  const successResult: OTPResult = {
    success: true,
    otpId: data.id,
    expiresAt,
  };

  return successResult;
}

export async function verifyOTP(
  otp: string,
  type: string,
  email?: string,
  phone?: string,
  userId?: string
): Promise<{ success: boolean; error?: string; verified?: boolean }> {
  let query = otpSupabase
    .from('otp_verifications')
    .select('*')
    .eq('otp', otp)
    .eq('verified', false)
    .eq('otp_type', type);

  if (userId) {
    query = query.eq('user_id', userId);
  } else if (email) {
    query = query.eq('email', email);
  } else if (phone) {
    query = query.eq('phone', phone);
  }

  const { data: otpRecord, error } = await query
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !otpRecord) {
    return { success: false, error: 'Invalid OTP or OTP expired' };
  }

  if (otpRecord.attempts >= 3) {
    return { success: false, error: 'Too many attempts. Please request a new OTP.' };
  }

  if (new Date(otpRecord.expires_at) < new Date()) {
    return { success: false, error: 'OTP has expired. Please request a new one.' };
  }

  const { error: updateError } = await otpSupabase
    .from('otp_verifications')
    .update({ verified: true })
    .eq('id', otpRecord.id);

  if (updateError) {
    console.error('Error marking OTP as verified:', updateError);
    return { success: false, error: 'Failed to verify OTP' };
  }

  if (userId && adminSupabase) {
    const fieldMap: Record<string, string> = {
      personal_email: 'personal_email_verified',
      college_email: 'college_email_verified',
      phone: 'phone_verified',
    };

    const profileField = fieldMap[type];
    const verificationStepMap: Record<string, number> = {
      personal_email: 2,
      college_email: 3,
      phone: 4,
      signup_complete: 5,
    };

    const updates: Record<string, unknown> = {};
    if (profileField) updates[profileField] = true;
    if (verificationStepMap[type]) updates.verification_step = verificationStepMap[type];

    if (Object.keys(updates).length > 0) {
      const { error: profileError } = await adminSupabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (profileError) {
        console.warn('Profile verification flags were not updated:', profileError.message);
      }
    }
  }

  return { success: true, verified: true };
}

export default {
  createAndSendOTP,
  verifyOTP,
};
