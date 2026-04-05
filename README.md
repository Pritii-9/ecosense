# EcoSense - Waste Management & Recycling Tracker

EcoSense is a beginner-friendly full-stack web application for tracking recyclable waste, earning points, and finding recycling centers.

## Features

- JWT authentication with bcrypt password hashing
- Email verification during registration using 6-digit codes
- Forgot-password flow using email reset codes
- Waste logging by type, quantity, and date
- Automatic point calculation
- Personal dashboard with recent logs and breakdown
- Top-10 leaderboard
- Nearby recycling centers with OpenStreetMap links and embed
- **Real-time community impact dashboard** with live WebSocket updates
- **Live activity feed** showing anonymized recycling activity across the platform
- **Environmental impact tracking** (CO2 saved, trees saved equivalent)

## Tech Stack

- Backend: Flask + PyMongo
- Frontend: React + TypeScript + Tailwind CSS
- Database: MongoDB Atlas
- Email: SMTP
- Containers: Docker + Docker Compose

## Auth API

- `POST /auth/register/request-code`
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/forgot-password/request-code`
- `POST /auth/forgot-password/reset`
- `POST /auth/logout`

## Waste API

- `GET /waste`
- `POST /waste`
- `GET /points`
- `GET /leaderboard`
- `GET /recycling-centers`
- `GET /health`

## Impact API (Real-Time)

- `GET /impact` - Community environmental impact statistics (requires auth)
- `GET /impact/activity-feed` - Recent anonymized activity feed (requires auth)

## WebSocket Events (Socket.IO)

- `connect` - Client connects to real-time server
- `join_impact_room` - Join the impact room for live updates
- `request_impact_update` - Request current impact statistics
- `request_activity_feed` - Request recent activity feed
- `new_activity` - Server broadcasts new waste log activity
- `impact_update` - Server broadcasts updated impact stats
- `leaderboard_updated` - Server notifies leaderboard has changed

## MongoDB Schema

### `users`

```json
{
  "_id": "ObjectId",
  "name": "Priya",
  "email": "priya@example.com",
  "password_hash": "bcrypt-hash",
  "email_verified": true,
  "total_points": 42,
  "created_at": "2026-04-04T08:00:00Z"
}
```

### `waste_logs`

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "type": "Plastic",
  "quantity": 3,
  "points": 15,
  "date": "2026-04-04T00:00:00Z",
  "created_at": "2026-04-04T08:10:00Z"
}
```

### `auth_codes`

```json
{
  "_id": "ObjectId",
  "email": "priya@example.com",
  "purpose": "register",
  "code_hash": "sha256-hash",
  "created_at": "2026-04-04T08:01:00Z",
  "expires_at": "2026-04-04T08:11:00Z",
  "attempt_count": 0,
  "metadata": {
    "name": "Priya"
  }
}
```

## Environment Files

Create this backend file:

- `backend/.env`

Start from:

- [backend/.env.example](/d:/ecosense/backend/.env.example)

Important backend variables:

- `MONGO_URI`
- `MONGO_DB_NAME`
- `JWT_SECRET_KEY`
- `AUTH_CODE_EXPIRY_MINUTES`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USERNAME`
- `SMTP_PASSWORD`
- `SMTP_USE_TLS`
- `SMTP_FROM_EMAIL`
- `SMTP_FROM_NAME`

Example:

```env
APP_NAME=EcoSense
MONGO_URI=mongodb+srv://your-user:your-password@cluster0.mongodb.net/?retryWrites=true&w=majority&appName=EcoSense
MONGO_DB_NAME=ecosense
JWT_SECRET_KEY=replace-with-a-long-random-secret
JWT_EXPIRES_IN_HOURS=24
AUTH_CODE_EXPIRY_MINUTES=10
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:8080
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_USE_TLS=true
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=EcoSense
```

Create this frontend file:

- `frontend/.env`

Start from:

- [frontend/.env.example](/d:/ecosense/frontend/.env.example)

Frontend example:

```env
VITE_API_BASE_URL=http://localhost:5000
```

## Local Run

### Backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

## Docker

```powershell
docker compose up --build
```

Frontend:

- `http://localhost:8080`

Backend:

- `http://localhost:5000`

## Validation

- `npm run lint`
- `npm run build`
- `python -m compileall backend`
