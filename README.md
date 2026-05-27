<div align="center">
  <img src="./client/public/vite.svg" alt="UniSkill Logo" width="120" />
  <h1>UniSkill</h1>
  <p><strong>A student-first marketplace to teach, learn, and trade skills on campus.</strong></p>
  <p>
    <img src="https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/Express.js-Backend-blue?style=flat&logo=express" alt="Express" />
    <img src="https://img.shields.io/badge/WebRTC-Video_Rooms-green?style=flat&logo=webrtc" alt="WebRTC" />
    <img src="https://img.shields.io/badge/Supabase-Database-1E4C40?style=flat&logo=supabase" alt="Supabase" />
  </p>
</div>

<hr />

## 📖 About The Project

**UniSkill** is a peer-to-peer skill exchange platform designed exclusively for university students. It solves the problem of finding reliable, on-campus help by allowing students to trade knowledge using a virtual credit system. 

Whether you need help passing a Python exam, want to learn UI/UX design, or are ready to teach others how to edit videos—UniSkill connects you with verified peers and provides the tools (including live video rooms) to make learning happen seamlessly.

## ✨ Core Features

*   **🎓 Verified Campus Network:** Sign-ups require a `.edu` or college email address with OTP verification, ensuring a safe and trusted student-only environment.
*   **🤝 Smart Skill Matching:** Our custom matching engine pairs your "Learning Goals" with other students' "Teaching Skills" to find Perfect Swaps and Potential Matches instantly.
*   **💳 Virtual Credit System:** No real money changes hands. Teach a skill to earn credits, and spend those credits to book sessions when you need help.
*   **🎥 WebRTC Video Rooms:** Built-in, high-quality video calling. Rooms feature live text chat, full-screen focus modes, and auto-play retry logic for strict networks.
*   **🔔 Real-Time Notifications:** Stay updated with instant alerts for new swap requests, session confirmations, and incoming messages using Supabase real-time subscriptions.
*   **⭐ Post-Session Reviews:** Rate your mentors and leave feedback after every session to build community trust and maintain quality.

## 🛠️ Tech Stack

### Frontend (Client)
*   **Framework:** Next.js (App Router, Turbopack)
*   **Styling:** Tailwind CSS & Framer Motion (for fluid, 3D-like animations)
*   **Icons:** Lucide React
*   **Real-time & Auth:** Supabase Auth & Realtime Channels

### Backend (API)
*   **Framework:** Node.js with Express
*   **Database ORM:** Prisma
*   **Signaling Server:** Socket.io (for WebRTC handshakes and real-time chat)
*   **Peer-to-Peer:** `simple-peer` (WebRTC implementation with custom STUN server fallbacks)
*   **Database Provider:** Supabase (PostgreSQL)

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites
*   Node.js (v18+)
*   npm or yarn
*   A Supabase Project (for Postgres DB and Auth)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/uniskill.git
cd uniskill
```

### 2. Set up the Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory based on the following template:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
ALLOWED_ORIGINS="http://localhost:3000,http://10.0.0.3:3000"
APP_URL="http://localhost:3000"

# Optional: Email Service (For OTPs)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```
Push the database schema using Prisma:
```bash
npx prisma db push
```
Start the backend server:
```bash
npm run dev
```

### 3. Set up the Frontend
Open a new terminal window and navigate to the frontend directory:
```bash
cd frontend
npm install
```
Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
NEXT_PUBLIC_SOCKET_URL="http://localhost:5000"
```
Start the Next.js development server:
```bash
npm run dev
```

### 4. Open the App
Visit `http://localhost:3000` in your browser. If testing WebRTC video over a local network (e.g., `http://10.0.0.x:3000`), ensure you configure your browser to treat the insecure origin as secure to allow camera access.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

## 💡 Acknowledgments
* UI Inspiration from modern neobrutalism and spatial design.
* Built to help students succeed together.
