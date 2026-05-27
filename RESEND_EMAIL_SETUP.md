# UniSkill Email OTP Setup Guide

This guide will help you set up real email OTP sending for UniSkill.

---

## How It Currently Works

**Development Mode (Without Resend API):**
- OTP is generated and stored in localStorage
- OTP is shown in a toast notification on screen
- Perfect for testing during development

**Production Mode (With Resend API):**
- OTP is sent as a real email to the user
- Professional email template with branding

---

## Step 1: Get a Free Resend API Key

1. Go to **https://resend.com**
2. Click **Sign Up** (free tier available)
3. Verify your email
4. Go to **API Keys** section
5. Click **Create API Key**
6. Copy the key (starts with `re_`)

---

## Step 2: Add API Key to .env.local

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://gmtitzdkeepvhtdovwuk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_h61Xp7aXU6D-36XSrT05tg_NWo_uN-3
NEXT_PUBLIC_API_URL=http://localhost:5000/api
SUPABASE_SERVICE_ROLE_KEY=sb_service_role_h61Xp7aXU6D-36XSrT05tg_NWo_uN-3

# Resend API - GET FREE KEY FROM https://resend.com
RESEND_API_KEY=re_your_actual_resend_api_key_here
FROM_EMAIL=onboarding@resend.dev
APP_NAME=UniSkill
```

---

## Step 3: Verify Your Domain (Optional for Production)

### Free Tier (Using Resend Domain):
- You can use `onboarding@resend.dev` immediately
- Emails will work right away

### Production (Your Own Domain):
1. In Resend dashboard, go to **Domains**
2. Add your domain (e.g., `uniskill.com`)
3. Add the DNS records shown
4. Wait for verification (few minutes to 24 hours)
5. Update `FROM_EMAIL` to `hello@uniskill.com`

---

## Step 4: Test OTP Flow

1. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

2. Go to http://localhost:3000/signup

3. Fill in email and click "Send OTP"

4. **Without Resend API:** OTP will appear in a toast notification

5. **With Resend API:** OTP will be sent to the email address

---

## Email Template Preview

When users receive the OTP email, they will see:

```
+-----------------------------------------+
¦                                         ¦
¦  ? UniSkill                            ¦
¦                                         ¦
¦  Your Verification Code                ¦
¦                                         ¦
¦  Hello [Name],                         ¦
¦                                         ¦
¦  +---------------------------------+   ¦
¦  ¦   Your verification code:       ¦   ¦
¦  ¦                                 ¦   ¦
¦  ¦      1 2 3 4 5 6               ¦   ¦
¦  ¦                                 ¦   ¦
¦  ¦   Expires in 10 minutes        ¦   ¦
¦  +---------------------------------+   ¦
¦                                         ¦
¦  ?? Never share this code with anyone ¦
¦                                         ¦
¦  © 2026 UniSkill                       ¦
+-----------------------------------------+
```

---

## Troubleshooting

### "Email not received"
1. Check spam/junk folder
2. Verify RESEND_API_KEY is correct
3. Check browser console for errors

### "Invalid API key"
1. Make sure the key starts with `re_`
2. Key might be expired - generate a new one

### "Domain not verified"
1. Use `onboarding@resend.dev` for testing
2. Or verify your domain in Resend dashboard

---

## Quick Checklist

- [ ] Signed up at https://resend.com
- [ ] Created API key
- [ ] Added RESEND_API_KEY to .env.local
- [ ] Tested OTP send
- [ ] Checked email inbox

---

## Cost

**Resend Free Tier:**
- 100 emails per day
- 3,000 emails per month

**More than enough for development and moderate production use!**

For higher volumes, Resend has affordable paid plans starting at $20/month for 50,000 emails.
