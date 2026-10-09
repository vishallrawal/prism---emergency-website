# PRISM: Smart Traffic & Emergency Response 🚦🚑

PRISM is a comprehensive Smart Traffic and Emergency Response application designed for Surat, India. It provides real-time emergency routing, blood donation services, AI-assisted safety guidance, and nearby service locators.

## 🌟 Live Deployment

**Live Link**: [Your Live App URL Here]

*(Once deployed, replace the above link with your live URL)*

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/vishallrawal/prism---emergency-website)

## 🚀 Features

- **Emergency Routes**: Real-time optimal routing for emergency vehicles using TomTom Maps.
- **Nearby Services**: Locate nearby hospitals, police stations, and fire stations.
- **Blood Donor Network**: Search for donors by blood group and request blood.
- **Voice Commands**: Hands-free navigation and system interaction.
- **AI Safety Assistant**: Offline-capable Gemini AI for emergency safety guidance.
- **Admin Dashboard**: Comprehensive dashboard for system management.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS (assumed), TomTom Maps API
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Native Driver)
- **AI Integration**: Google Gemini API

## 📂 Project Structure

- `frontend/` — React Single Page Application (SPA)
- `backend/` — Express API (`/api/*`, Swagger docs available at `/api/docs`)
- `scripts/` — Helper scripts for Cloudflare tunneling during dev

## ⚙️ Local Development Setup

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Running locally on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI)

### 2. Environment Variables
Create a `.env` file in the `backend/` directory with the following variables:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/prism_surat
CLIENT_ORIGIN=http://localhost:5173
SESSION_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
TOMTOM_API_KEY=your_tomtom_api_key
```

### 3. Installation & Running
From the root directory, run the following commands to install dependencies and start both frontend and backend concurrently:
```bash
# Install dependencies for both frontend and backend
npm run build

# Start the application concurrently
npm run dev
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api/health`
- **API Documentation**: `http://localhost:5000/api/docs`

