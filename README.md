# Rabuste Coffee — Full Stack

Immersive, mobile-first experience for a Robusta-only café. Scroll-led storytelling, backend-powered data, explainable rule-based AI cues.

## Structure
- `backend/` Node.js + Express + MongoDB (Mongoose)
- `frontend/` React (Vite) + Axios + React Router

## Quick start
1) Backend  
```bash
cd backend
copy env.example .env   # or set MONGO_URI, PORT
npm install
npm run seed            # load sample coffee, art, workshops
npm run dev             # starts http://localhost:5000
```

2) Frontend  
```bash
cd frontend
copy env.example .env   # set VITE_API_BASE if backend differs
npm install
npm run dev             # starts http://localhost:5173
```

## API (backend)
- `GET /api/coffee` — curated Robusta menu
- `GET /api/art` — art with pricing & availability (pricing managed server-side)
- `GET /api/workshops` — sessions with seat counts
- `POST /api/workshops/register` — validates seat limits
- `POST /api/franchise/enquiry` — saves enquiry
- `GET /api/insights/popular` — simple popularity insights
- `POST /api/ai/coffee|art|workshop` — rule-based explainable recommendations

## AI & Privacy
- Rule-based, explainable suggestions (mood/time → coffee; mood → art; vibe → workshop). Implemented both in frontend (`src/utils/aiLogic.js`) and mirrored in backend (`src/utils/aiLogic.js`).
- No tracking or personal data beyond explicit form submissions.

## Design notes
- Coffee-first, art-centric, warm dark palette, subtle motion.
- Scroll-based layout with minimal navigation chips.
- Mobile-first CSS (no Tailwind), strong imagery placeholders.

## Sample data
Seed script loads signature robusta drinks, three art pieces with pricing/availability, and workshops with seat counts to demo validation and insights.









