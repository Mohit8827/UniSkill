# UniSkill Backend Setup Guide

## OTP Email Verification System

This backend provides a complete OTP (One-Time Password) verification system that sends real emails for user verification.

---

## Quick Start

### 1. Install Dependencies

The backend already has most dependencies. If you need to install:

```bash
cd backend
npm install
```

### 2. Get Resend API Key (Required for Real Emails)

1. Go to https://resend.com and sign up (free tier available)
2. Navigate to API Keys section
3. Create a new API key
4. Copy the key (starts with `re_`)

### 3. Configure Environment

Edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL="https://gmtitzdkeepvhtdovwuk.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Resend Email API (Get free key at https://resend.com)
RESEND_API_KEY=re_your_actual_api_key_here
FROM_EMAIL=onboarding@resend.dev

# App Configuration
APP_NAME=UniSkill
APP_URL=http://localhost:3000
```

### 4. Run the Backend

```bash
cd backend
npm run dev
```

Backend will run at http://localhost:5000

---

## API Endpoints

### OTP Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/otp/send` | Send OTP to email/phone |
| POST | `/api/otp/verify` | Verify OTP |
| GET | `/api/otp/status/:userId` | Check verification status |

### Auth Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/forgot-password` | Request password reset |
| GET | `/api/auth/profile/:userId` | Get user profile |
| PUT | `/api/auth/profile/:userId` | Update user profile |

### Wallet Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wallet/:userId` | Get wallet info |
| POST | `/api/wallet/add-credits` | Add credits |
| POST | `/api/wallet/transfer` | Transfer credits |
| GET | `/api/wallet/transactions/:userId` | Get transaction history |

---

## Development Mode

Without a Resend API key, OTP codes are logged to the console:

```
[EMAIL SERVICE - DEV MODE]
To: user@example.com
Subject: UniSkill - Your Verification Code
---
Your verification code is: 123456
---
```

The frontend shows a toast notification with the OTP in development mode.

---

## Production Setup

1. Get a Resend API key from https://resend.com
2. Add your domain for verified emails
3. Set `RESEND_API_KEY` in environment variables
4. Set `FROM_EMAIL` to your verified domain (e.g., `hello@uniskill.com`)
5. Remove `devOtp` from responses in production

---

## Socket.io for Real-time Features

The backend includes Socket.io for WebRTC signaling:

- `join-room` - Join a video call room
- `signal` - Send WebRTC signaling data
- `chat-message` - Real-time chat
- `end-call` - End a call

---

## Troubleshooting

### OTP Not Sending
1. Check if RESEND_API_KEY is set correctly
2. Check backend console for errors
3. Verify Supabase database connection

### OTP Not Being Verified
1. Check if `otp_verifications` table exists
2. Verify RLS policies allow inserts
3. Check if OTP has expired (10 min default)

### Database Connection Issues
1. Verify DATABASE_URL in `.env`
2. Run migrations in Supabase
3. Check Supabase project status
