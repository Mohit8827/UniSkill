# UniSkill OAuth Setup Guide

This guide will help you set up Google and GitHub OAuth login for your UniSkill platform.

---

## Step 1: Run Database Setup

First, run the SQL to create all necessary tables:

1. Go to: https://supabase.com/dashboard/project/gmtitzdkeepvhtdovwuk/sql
2. Copy the contents of `SUPABASE_SETUP.sql` (in the root folder)
3. Click **Run** to execute

---

## Step 2: Set Up Google OAuth

### 2.1: Get Google OAuth Credentials

1. Go to: https://console.cloud.google.com/
2. Create a new project or select existing one
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth client ID**
5. Set Application type to **Web application**
6. Add Authorized redirect URI:
   ```
   https://gmtitzdkeepvhtdovwuk.supabase.co/auth/v1/callback
   ```
7. Click **Create**
8. Copy the **Client ID** and **Client Secret**

### 2.2: Configure in Supabase

1. Go to: https://supabase.com/dashboard/project/gmtitzdkeepvhtdovwuk/auth/providers
2. Find **Google** and click to expand
3. Toggle **Enable Sign in with Google** to ON
4. Paste your Google Client ID
5. Paste your Google Client Secret
6. Add this **Authorized callback URL** (displayed in Supabase):
   ```
   https://gmtitzdkeepvhtdovwuk.supabase.co/auth/v1/callback
   ```
7. Click **Save**

---

## Step 3: Set Up GitHub OAuth

### 3.1: Get GitHub OAuth Credentials

1. Go to: https://github.com/settings/developers
2. Click **New OAuth App**
3. Fill in details:
   - **Application name**: UniSkill
   - **Homepage URL**: `http://localhost:3000` (for development)
   - **Authorization callback URL**:
     ```
     https://gmtitzdkeepvhtdovwuk.supabase.co/auth/v1/callback
     ```
4. Click **Register application**
5. Copy the **Client ID**
6. Click **Generate a new client secret**
7. Copy the **Client Secret**

### 3.2: Configure in Supabase

1. Go to: https://supabase.com/dashboard/project/gmtitzdkeepvhtdovwuk/auth/providers
2. Find **GitHub** and click to expand
3. Toggle **Enable Sign in with GitHub** to ON
4. Paste your GitHub Client ID
5. Paste your GitHub Client Secret
6. Add the callback URL if prompted
7. Click **Save**

---

## Step 4: Update Environment Variables

Make sure your `.env.local` has the correct Supabase URL:

```env
NEXT_PUBLIC_SUPABASE_URL=https://gmtitzdkeepvhtdovwuk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Step 5: Test OAuth Login

1. Start your frontend: `cd frontend && npm run dev`
2. Go to http://localhost:3000/login
3. Click **Google** or **GitHub** button
4. You should be redirected to the OAuth provider
5. After authorization, you will be redirected back to the dashboard

---

## Troubleshooting

### "OAuth provider not configured"
- Make sure you enabled the provider in Supabase Dashboard
- Check that Client ID and Secret are correct
- Verify callback URL matches exactly

### "Redirect URL mismatch"
- Ensure callback URL is exactly:
  `https://gmtitzdkeepvhtdovwuk.supabase.co/auth/v1/callback`
- In Google Console, add this URL to authorized redirect URIs

### "User not created"
- The database trigger `handle_new_user` should create the profile automatically
- Check Supabase Logs if profile is not being created
- Manually check the `profiles` table

### "CORS errors"
- Make sure your Supabase project URL is correct
- Check browser console for specific CORS errors

---

## Quick Checklist

- [ ] Ran `SUPABASE_SETUP.sql` in SQL Editor
- [ ] Created Google OAuth credentials
- [ ] Created GitHub OAuth credentials
- [ ] Enabled Google in Supabase Auth Providers
- [ ] Enabled GitHub in Supabase Auth Providers
- [ ] Added callback URLs to both providers
- [ ] Tested login with Google
- [ ] Tested login with GitHub

---

## Support

If you face issues, check:
1. Supabase Dashboard > Authentication > Logs
2. Browser Developer Tools (F12) > Console
3. Network tab for failed requests
