import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const EMAIL_USER = process.env.EMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const FROM_EMAIL = process.env.FROM_EMAIL || 'UniSkill <uniskill4@gmail.com>';
const REPLY_TO_EMAIL = process.env.REPLY_TO_EMAIL || 'uniskill4@gmail.com';
const APP_NAME = process.env.APP_NAME || 'UniSkill';

export type EmailErrorCode =
  | 'EMAIL_NOT_CONFIGURED'
  | 'EMAIL_SEND_FAILED'
  | 'INVALID_RECIPIENT';

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  errorCode?: EmailErrorCode;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Create Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
});

async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const { to, subject, html, text } = options;

  if (!to) {
    return {
      success: false,
      error: 'Recipient email is required.',
      errorCode: 'INVALID_RECIPIENT',
    };
  }

  if (!EMAIL_USER || !GMAIL_APP_PASSWORD) {
    return {
      success: false,
      error: 'Email delivery is not configured. Add EMAIL_USER and GMAIL_APP_PASSWORD to .env.',
      errorCode: 'EMAIL_NOT_CONFIGURED',
    };
  }

  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      text: text || subject,
      html,
      replyTo: REPLY_TO_EMAIL,
    });

    console.log(`[EMAIL SENT] Message ID: ${info.messageId} to ${to}`);
    
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error('Nodemailer Error:', error);
    
    return {
      success: false,
      error: error.message || 'An unexpected error occurred while sending the email.',
      errorCode: 'EMAIL_SEND_FAILED',
    };
  }
}

export async function sendOTPEmail(
  email: string,
  otp: string,
  type: 'personal_email' | 'college_email' | 'phone' | 'signup_complete',
  userName?: string
): Promise<EmailResult> {
  const typeLabels: Record<string, string> = {
    'personal_email': 'Personal Email',
    'college_email': 'College Email',
    'phone': 'Phone Number',
    'signup_complete': 'Account Verification',
  };

  const subject = `${APP_NAME} - Your Verification Code`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${APP_NAME} Verification</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #020617; }
    .container { max-width: 480px; margin: 0 auto; padding: 40px 20px; }
    .card { background: linear-gradient(145deg, #0f172a, #1e293b); border-radius: 24px; padding: 40px; border: 1px solid rgba(255,255,255,0.1); }
    .logo { font-size: 28px; font-weight: 900; color: white; margin-bottom: 30px; display: flex; align-items: center; gap: 10px; }
    .logo-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    h1 { color: white; font-size: 24px; margin: 0 0 20px; }
    p { color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 20px; }
    .code-box { background: rgba(59, 130, 246, 0.1); border: 2px solid rgba(59, 130, 246, 0.3); border-radius: 16px; padding: 24px; text-align: center; margin: 30px 0; }
    .code { font-size: 36px; font-weight: 900; color: #3b82f6; letter-spacing: 8px; font-family: 'Courier New', monospace; }
    .warning { background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 12px; padding: 16px; margin-top: 24px; }
    .warning p { color: #fbbf24; font-size: 14px; margin: 0; }
    .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">
        <div class="logo-icon">✨</div>
        ${APP_NAME}
      </div>
      <h1>Your Verification Code</h1>
      <p>Hello${userName ? ' ' + userName : ''},</p>
      <p>Welcome to ${APP_NAME}. To keep your account secure, use the verification code below to confirm your ${typeLabels[type] || 'account'}.</p>
      <div class="code-box">
        <div class="code">${otp}</div>
      </div>
      <p>This code expires in <strong style="color: white;">10 minutes</strong>. If you did not request this code, you can safely ignore this email.</p>
      <div class="warning">
        <p>⚠️ Security Notice: Never share this code with anyone. ${APP_NAME} staff will never ask for your verification code.</p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
        <p>Need help? Contact us at ${REPLY_TO_EMAIL}</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

  const text = `
${APP_NAME} - Verification Code
================================

Hello${userName ? ' ' + userName : ''},

Welcome to ${APP_NAME}. Use the verification code below to confirm your ${typeLabels[type] || 'account'}.

Your verification code is: ${otp}

This code expires in 10 minutes.

If you did not request this code, please ignore this email.

Need help? Contact us at ${REPLY_TO_EMAIL}.

© ${new Date().getFullYear()} ${APP_NAME}
`;

  return sendEmail({ to: email, subject, html, text });
}

export async function sendWelcomeEmail(email: string, userName: string): Promise<EmailResult> {
  const subject = `Welcome to ${APP_NAME}! 👋`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${APP_NAME}</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #020617; }
    .container { max-width: 480px; margin: 0 auto; padding: 40px 20px; }
    .card { background: linear-gradient(145deg, #0f172a, #1e293b); border-radius: 24px; padding: 40px; border: 1px solid rgba(255,255,255,0.1); }
    .logo { font-size: 28px; font-weight: 900; color: white; margin-bottom: 30px; display: flex; align-items: center; gap: 10px; }
    .logo-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    h1 { color: white; font-size: 24px; margin: 0 0 20px; }
    p { color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 20px; }
    .cta { display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 700; margin-top: 20px; }
    .features { list-style: none; padding: 0; margin: 20px 0; }
    .features li { color: #94a3b8; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; gap: 12px; }
    .features li::before { content: '✓'; color: #10b981; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">
        <div class="logo-icon">✨</div>
        ${APP_NAME}
      </div>
      <h1>Welcome aboard, ${userName}!</h1>
      <p>Your UniSkill account has been verified and is ready to use.</p>
      <p>Here is what you can do next:</p>
      <ul class="features">
        <li>Browse and connect with expert mentors</li>
        <li>Book 1-on-1 skill sessions</li>
        <li>Start earning by sharing your skills</li>
        <li>Track your learning progress</li>
      </ul>
      <a href="#" class="cta">Get Started →</a>
    </div>
  </div>
</body>
</html>
`;

  const text = `Welcome to ${APP_NAME}, ${userName}! Need help? Contact us at ${REPLY_TO_EMAIL}.`;

  return sendEmail({ to: email, subject, html, text });
}

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<EmailResult> {
  const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  const subject = `${APP_NAME} - Password Reset Request`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Password Reset</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #020617; }
    .container { max-width: 480px; margin: 0 auto; padding: 40px 20px; }
    .card { background: linear-gradient(145deg, #0f172a, #1e293b); border-radius: 24px; padding: 40px; border: 1px solid rgba(255,255,255,0.1); }
    .logo { font-size: 28px; font-weight: 900; color: white; margin-bottom: 30px; }
    .cta { display: inline-block; background: #ef4444; color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 700; margin-top: 20px; }
    .warning { background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 12px; padding: 16px; margin-top: 24px; color: #fbbf24; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">✨ ${APP_NAME}</div>
      <h1 style="color: white;">Reset Your Password</h1>
      <p style="color: #94a3b8;">Click the button below to reset your password. This link expires in 1 hour.</p>
      <a href="${resetUrl}" class="cta">Reset Password →</a>
      <div class="warning">
        If you did not request this, ignore this email. The link will become invalid.
      </div>
    </div>
  </div>
</body>
</html>
`;

  return sendEmail({ to: email, subject, html });
}

export default {
  sendEmail,
  sendOTPEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
};
