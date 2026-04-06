# EcoSense - Precision Metrics for Sustainability

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Python 3.13+](https://img.shields.io/badge/python-3.13+-blue.svg)](https://www.python.org/downloads/)
[![Node.js 20+](https://img.shields.io/badge/node-20+-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://www.docker.com/)

A professional-grade full-stack platform for monitoring environmental impact, logging waste, and contributing to a verified circular economy. Built with React, Flask, MongoDB, and Socket.IO.

---

## Features

### Core Functionality
- **Waste Logging** - Track recyclable waste by type, quantity, and date with automatic point calculation
- **Real-Time Dashboard** - Live community impact metrics with WebSocket-powered updates
- **Leaderboards** - Global and team-based rankings to drive engagement
- **Recycling Centers** - Find nearby certified recycling terminals with map integration
- **Team Management** - Invite-code-based onboarding with role-based access control

### Authentication & Security
- **JWT Authentication** - Secure token-based auth with bcrypt password hashing
- **Email Verification** - 6-digit code verification during registration
- **Password Reset** - Secure forgot-password flow with email-based reset codes
- **Protected Routes** - Client and server-side route guards

### Analytics & Insights
- **Environmental Impact** - Track CO2 saved, trees saved, and other sustainability metrics
- **Activity Feed** - Real-time anonymized platform activity
- **Forecasting** - Predictive analytics for future environmental impact
- **Team Analytics** - Collaborative impact measurement and reporting

### UI/UX
- **Dark/Light Mode** - Theme-aware design with smooth transitions
- **Responsive Design** - Mobile-first, works on all screen sizes
- **Glass-Morphism UI** - Modern design with backdrop blur effects
- **Real-Time Notifications** - Dropdown notification system

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Tailwind CSS, Vite |
| **Backend** | Python 3.13, Flask, Flask-SocketIO, Eventlet |
| **Database** | MongoDB Atlas |
| **Real-Time** | Socket.IO (WebSocket) |
| **Authentication** | JWT (PyJWT), bcrypt |
| **Email** | SMTP |
| **Containerization** | Docker, Docker Compose |
| **Web Server** | Nginx (production frontend), Gunicorn (production backend) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      EcoSense Platform                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │   Frontend       │         │     Backend       │          │
│  │   (React + TS)   │◄───────►│   (Flask + IO)    │          │
│  │   Nginx :80      │  HTTP   │   Gunicorn :5000  │          │
│  └──────────────────┘         └────────┬─────────┘          │
│                                        │                     │
│                              ┌─────────▼─────────┐          │
│                              │   MongoDB Atlas    │          │
│                              │   (Cloud Database) │          │
│                              └───────────────────┘          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Prerequisites
- Python 3.13+
- Node.js 20+
- MongoDB Atlas account (free tier works)
- SMTP email account (Gmail with app password recommended)

### 1. Clone the Repository
```bash
git clone https://github.com/Pritii-9/ecosense.git
cd ecosense
```

### 2. Backend Setup

Create `backend/.env` from the example:
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your configuration:
```env
APP_NAME=EcoSense
MONGO_URI=mongodb+srv://your-user:your-password@cluster0.mongodb.net/ecosense
MONGO_DB_NAME=ecosense
JWT_SECRET_KEY=your-super-secret-key-here
JWT_EXPIRES_IN_HOURS=24
AUTH_CODE_EXPIRY_MINUTES=10
CORS_ORIGINS=http://localhost:5173,http://localhost:8080
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_USE_TLS=true
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=EcoSense
```

### 3. Frontend Setup

Create `frontend/.env` from the example:
```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000
```

### 4. Run Locally

**Backend:**
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
python run.py
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Docker Deployment

### Build and Run
```bash
docker compose up --build
```

### Access Points
- **Frontend:** [http://localhost:8080](http://localhost:8080)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

### Stop Services
```bash
docker compose down
```

### Rebuild Without Cache
```bash
docker compose build --no-cache
```

---

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register/request-code` | Request email verification code |
| `POST` | `/auth/register` | Complete registration |
| `POST` | `/auth/login` | Authenticate user |
| `POST` | `/auth/forgot-password/request-code` | Request password reset code |
| `POST` | `/auth/forgot-password/reset` | Reset password with code |
| `POST` | `/auth/logout` | Invalidate token |

### Waste Management Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/waste` | Get user's waste logs |
| `POST` | `/waste` | Create new waste log |
| `GET` | `/points` | Get user's total points |

### Analytics & Impact Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/impact` | Community environmental impact stats |
| `GET` | `/impact/activity-feed` | Recent anonymized activity feed |
| `GET` | `/leaderboard` | Top 10 users by points |
| `GET` | `/analytics/forecast` | Impact forecasting data |

### Team Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/team/invite` | Generate team invite code |
| `POST` | `/team/invite/accept` | Accept invite and join team |
| `GET` | `/team/members` | Get team members |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | API health status |

---

## WebSocket Events (Socket.IO)

| Event | Direction | Description |
|-------|-----------|-------------|
| `connect` | Server | Client connected |
| `join_impact_room` | Client | Join real-time impact updates |
| `impact_update` | Server | Broadcast updated impact stats |
| `new_activity` | Server | Broadcast new waste log activity |
| `leaderboard_updated` | Server | Notify leaderboard changed |

---

## Database Schema

### `users` Collection
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string (unique)",
  "username": "string (unique, optional)",
  "password_hash": "string (bcrypt)",
  "email_verified": "boolean",
  "total_points": "number",
  "team_id": "ObjectId (optional)",
  "created_at": "datetime"
}
```

### `waste_logs` Collection
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "type": "string (Plastic|Paper|Glass|Metal|Organic|E-Waste)",
  "quantity": "number (kg)",
  "points": "number",
  "date": "datetime",
  "created_at": "datetime"
}
```

### `auth_codes` Collection
```json
{
  "_id": "ObjectId",
  "email": "string",
  "purpose": "string (register|reset_password)",
  "code_hash": "string (SHA-256)",
  "created_at": "datetime",
  "expires_at": "datetime",
  "attempt_count": "number",
  "metadata": "object"
}
```

---

## Project Structure

```
ecosense/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Flask app factory
│   │   ├── config.py            # Configuration management
│   │   ├── extensions.py        # Flask extensions
│   │   ├── socket_events.py     # Socket.IO event handlers
│   │   ├── models/              # Data models
│   │   ├── routes/              # API route handlers
│   │   └── utils/               # Utility functions
│   ├── requirements.txt         # Python dependencies
│   ├── run.py                   # Application entry point
│   └── Dockerfile               # Backend container
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/               # Page components
│   │   ├── context/             # React context providers
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/                 # API client, validation
│   │   └── types.ts             # TypeScript types
│   ├── package.json             # Node dependencies
│   ├── vite.config.ts           # Vite configuration
│   └── Dockerfile               # Frontend container
├── docker-compose.yml           # Multi-container orchestration
└── README.md                    # This file
```

---

## Development

### Frontend Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

### Backend Commands
```bash
python run.py              # Start development server
python -m compileall .     # Check syntax
```

---

## Environment Variables Reference

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `MONGO_DB_NAME` | Database name | `ecosense` |
| `JWT_SECRET_KEY` | JWT signing secret | `random-long-string` |
| `JWT_EXPIRES_IN_HOURS` | Token expiry | `24` |
| `AUTH_CODE_EXPIRY_MINUTES` | Verification code expiry | `10` |
| `CORS_ORIGINS` | Allowed origins | `http://localhost:5173` |
| `SMTP_HOST` | Email server host | `smtp.gmail.com` |
| `SMTP_PORT` | Email server port | `587` |
| `SMTP_USERNAME` | Email username | `user@gmail.com` |
| `SMTP_PASSWORD` | Email password/app password | `app-password` |
| `SMTP_USE_TLS` | Use TLS encryption | `true` |
| `SMTP_FROM_EMAIL` | Sender email | `noreply@ecosense.com` |
| `SMTP_FROM_NAME` | Sender name | `EcoSense` |

### Frontend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:5000` |

---

## Security Considerations

- **JWT tokens** are used for authentication with configurable expiry
- **Passwords** are hashed using bcrypt with salt rounds
- **Verification codes** are SHA-256 hashed before storage
- **CORS** is configured to allow only specific origins
- **Rate limiting** on authentication endpoints
- **Input validation** on both client and server side
- **Non-root users** in Docker containers

---

## Troubleshooting

### MongoDB Connection Issues
- Verify your MongoDB Atlas IP whitelist includes your current IP
- Check that `MONGO_URI` is correctly formatted
- See `backend/MONGO_TROUBLESHOOTING.md` for detailed guidance

### Email Not Sending
- For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833), not your regular password
- Ensure `SMTP_USE_TLS=true` for port 587
- Check spam folder for verification emails

### Docker Build Fails
- Clear Docker cache: `docker system prune -a`
- Rebuild without cache: `docker compose build --no-cache`
- Ensure `.env` files exist in both backend and frontend directories

---

## License

This project is licensed under the MIT License.

---

## Acknowledgments

- OpenStreetMap for recycling center location data
- Lucide React for beautiful icon library
- The open-source community for the tools that made this possible