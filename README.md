# PRISM

Smart traffic and emergency response app for Surat, India.

## Stack
- Frontend: React 18 + Vite + TomTom Maps
- Backend: Express + MongoDB (native driver) + sessions
- AI: Google Gemini (with offline fallback)

## Features
- Emergency routes, nearby hospitals/police/fire stations
- Blood donor search and requests
- Voice commands, live location share, AI safety assistant
- User auth + admin dashboard

## Structure
- `frontend/` — React SPA
- `backend/` — Express API (`/api/*`, docs at `/api/docs`)
- `scripts/` — Cloudflare tunnel helper

## Run
```bash
npm install
npm --prefix backend install
npm --prefix frontend install
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5000

## Env (`backend/.env`)
```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/prism_surat
CLIENT_ORIGIN=http://localhost:5173
SESSION_SECRET=your_secret
GEMINI_API_KEY=your_key
TOMTOM_API_KEY=your_key
```
