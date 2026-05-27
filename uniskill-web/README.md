# UniSkill Prototype

A P2P Learning Marketplace for University Students.

## Features
- **Student Verification:** Student ID, Email OTP (Mock: use `1234`), and ID Card Upload.
- **Matching Engine:** Find tutors or students based on skills.
- **Video Session:** Integrated video call interface (UI Mockup).
- **Wallet:** Top-up and Redeem credits.

## Prerequisites
- Node.js (v18+)

## Quick Start (Recommended)

Run both the server and the client with a single command:

1. Open a terminal in the `uniskill-web` folder.
2. Run:
   ```bash
   npm start
   ```
3. Open your browser to: `http://127.0.0.1:5173`

## Manual Setup

If you prefer to run them separately:

### 1. Start the Backend Server
The backend runs on port 5001.

```bash
cd server
node index.js
```

### 2. Start the Frontend Application
Open a new terminal window.

```bash
cd client
npm run dev
```

## Usage Guide
- **URL:** Use `http://127.0.0.1:5173` in your browser.
  - Enter any Student ID & Email.
  - Click "Send Verification Code".
  - Enter OTP `1234`.
  - Upload any file to simulate ID verification.
- **Dashboard:**
  - Type "Math" or "Physics" to find tutors.
  - Click "Start Session" on a match.
- **Wallet:**
  - Enter an amount to top up your balance.
