@echo off
echo [1/4] Killing old processes on port 5001...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5001') do taskkill /f /pid %%a 2>nul

echo [2/4] Installing server dependencies...
cd server
call npm install --quiet
cd ..

echo [3/4] Building frontend (skipping strict errors)...
cd client
call npm install --quiet
set "VITE_SKIP_TS_CHECK=true"
call npx vite build
cd ..

echo [4/4] Starting server...
cd server
node index.js
pause