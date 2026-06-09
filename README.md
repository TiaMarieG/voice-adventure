Chatlink - https://claude.ai/share/f96a3957-106c-47d9-8246-d2509e4cc36b

Steps to get working:

Frontend:
cd frontend/ && npm install 2>&1 | tail -5
cd frontend/ && npx vite build 2>&1

Backend:
cd backend/ && npm install 2>&1 | tail -5

Run application:

# Terminal 1 — backend
cd backend
cp .env.example .env
npm run dev        # → http://localhost:3001

# Terminal 2 — frontend
cd frontend
npm run dev        # → http://localhost:5173

Steps left - AI creation, training, integration
I left comments in the code where the AI functionality should be added in. I suggest using the AI chat link I shared so everything stays cohesive