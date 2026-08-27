<div align="center">

# OutreachIQ

### AI-powered job discovery and personalized outreach, end to end.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Tests](https://img.shields.io/badge/Tests-12_passing-10b981?style=flat-square&logo=jest&logoColor=white)]()
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

</div>

---

## What is OutreachIQ?

OutreachIQ is a full-stack web application that streamlines the job application process. Upload your resume once, discover live job listings, generate personalized application emails using AI, create Gmail drafts via OAuth, and track every application through a lifecycle dashboard.

**What it is NOT:** A spam bot, a scraper, or a bulk sender. Every action requires explicit user intent. Nothing sends without the user authorizing it in their own Gmail inbox.

---

## Features

- 🔐 **Google OAuth Login** — Secure authentication with Google account
- 📄 **AI Resume Parsing** — Upload a PDF resume and extract skills, projects, and summary using Groq LLM
- 🔍 **Smart Job Search** — Search live jobs from Adzuna API with automatic Remotive fallback and retry logic
- ✉️ **AI Email Generation** — Generate personalized application emails with 3 templates × 3 tones
- 👁️ **Email Preview Modal** — Review your email subject and body in a confirmation modal before creating a draft
- 📧 **Gmail Draft Creation** — Create drafts directly in your Gmail inbox via OAuth
- 📊 **Application Tracker** — Track all applications with status management (Draft → Sent → Interview → Rejected / No Response)
- 📱 **Fully Responsive** — Mobile-first design with card-based table layouts on small screens
- 🎨 **Premium Dark UI** — Beautiful glassmorphism design with smooth animations
- 📋 **Structured Logging** — Winston-based JSON logging in production for observability
- 🔄 **Resilient APIs** — Exponential backoff retry for external API calls

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Backend** | Node.js + Express | REST API server |
| **Frontend** | React 18 + Vite | Single-page application |
| **Database** | MongoDB Atlas | Data persistence (Mongoose ODM) |
| **LLM** | Groq API (Llama 3.3 70B) | Resume parsing + email generation |
| **Jobs API** | Adzuna + Remotive | Live job listings with automatic fallback |
| **Email** | Gmail API + OAuth 2.0 | Draft creation |
| **Auth** | Passport.js (Google OAuth) | Authentication |
| **File Upload** | Multer + pdf-parse | PDF resume processing |
| **Logging** | Winston | Structured JSON logging (production) |
| **Security** | Helmet + AES-256-GCM | HTTP hardening + token encryption |
| **Testing** | Jest | Unit tests (12 passing) |

---

## Local Setup

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB Atlas account (free tier works)
- Google Cloud Console project with OAuth 2.0 credentials
- Groq API key
- Adzuna API credentials

### 1. Clone the repository

```bash
git clone https://github.com/RonitRB/OutreachIQ.git
cd OutreachIQ
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your actual credentials (see Environment Variables below)
```

### 3. Frontend setup

```bash
cd frontend
npm install
# The .env file is pre-configured for local development
```

### 4. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Gmail API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Set application type to **Web application**
6. Add authorized redirect URI: `http://localhost:5000/auth/google/callback`
7. Copy Client ID and Client Secret to your `.env`
8. Configure the **OAuth consent screen**:
   - Add scopes: `email`, `profile`, `https://www.googleapis.com/auth/gmail.compose`
   - Add test users (your Gmail address) if in testing mode

### 5. Run the application

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

- Backend runs on: `http://localhost:5000`
- Frontend runs on: `http://localhost:5173`

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `NODE_ENV` | Runtime environment | `development` or `production` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/outreachiq` |
| `SESSION_SECRET` | Express session secret (32+ chars) | `a1b2c3d4e5f6...` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `123456789.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `GOCSPX-...` |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL | `http://localhost:5000/auth/google/callback` |
| `GROQ_API_KEY` | Groq API key | `gsk_...` |
| `ADZUNA_APP_ID` | Adzuna app ID | `abc12345` |
| `ADZUNA_APP_KEY` | Adzuna API key | `xyz67890...` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `TOKEN_ENCRYPTION_KEY` | AES-256 key for encrypting refresh tokens (64 hex chars). Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` | `a1b2c3...64chars` |

### Frontend (`frontend/.env`)

Copy from `frontend/.env.example`:

| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:5000` |

---

## API Documentation

### Health
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check with MongoDB ping (for Render) |

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/auth/google` | Initiate Google OAuth login |
| `GET` | `/auth/google/callback` | OAuth callback handler |
| `GET` | `/auth/me` | Get current user profile |
| `GET` | `/auth/logout` | Logout and destroy session |

### Resume
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/resume/parse` | Upload PDF resume (multipart) |
| `GET` | `/resume/profile` | Get parsed resume profile |

### Jobs
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/jobs?keyword=&location=` | Search jobs (cached 6h) |
| `GET` | `/jobs/:externalId` | Get single job details |

### Email
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/email/templates` | List email templates |
| `POST` | `/email/generate` | Generate email with AI |

### Gmail
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/gmail/draft` | Create Gmail draft |

### Tracker
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/tracker/save` | Save application record |
| `GET` | `/tracker` | List all applications |
| `PATCH` | `/tracker/:id` | Update application status |
| `DELETE` | `/tracker/:id` | Delete application record |

---

## Deployment

Production target: **Render** (backend) + **Vercel** (frontend) + **MongoDB Atlas**.

> **Security:** Never commit OAuth credential JSON files (e.g. `client_secret*.json`). Store `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` only in Render environment variables. Delete any local credential JSON from the repo root if present.

### Backend → Render

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repository
3. Set:
   - **Root directory:** `backend`
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Health check path:** `/health`
4. Add environment variables (see checklist below)
5. Alternatively, use [`backend/render.yaml`](backend/render.yaml) for Blueprint deploy

**Render environment variables (required):**

| Variable | Production value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `5000` (Render sets this automatically) |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `SESSION_SECRET` | Random 32+ character string |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `GOOGLE_CALLBACK_URL` | `https://<your-render-service>.onrender.com/auth/google/callback` |
| `GROQ_API_KEY` | Your Groq API key |
| `ADZUNA_APP_ID` | Your Adzuna app ID |
| `ADZUNA_APP_KEY` | Your Adzuna API key |
| `FRONTEND_URL` | `https://<your-vercel-app>.vercel.app` |
| `TOKEN_ENCRYPTION_KEY` | Random 64-char hex string (generate with Node.js crypto) |

### Frontend → Vercel

1. Create a new project on [Vercel](https://vercel.com)
2. Connect your GitHub repository
3. Set:
   - **Root directory:** `frontend`
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
4. Add environment variable:
   - `VITE_API_BASE_URL` = `https://<your-render-service>.onrender.com`
5. [`frontend/vercel.json`](frontend/vercel.json) handles SPA routing for direct URL access

### Google Cloud Console (production)

1. Go to **APIs & Services → Credentials → OAuth 2.0 Client**
2. Add **Authorized redirect URIs:**
   - `https://<your-render-service>.onrender.com/auth/google/callback`
3. Add **Authorized JavaScript origins:**
   - `https://<your-vercel-app>.vercel.app`
4. Configure **OAuth consent screen:**
   - Add scopes: `email`, `profile`, `https://www.googleapis.com/auth/gmail.compose`
   - Add test users while in testing mode, or publish for production use

### MongoDB Atlas

1. Create a free cluster and database user
2. Under **Network Access**, allow `0.0.0.0/0` (or Render static IPs on paid plans)
3. Copy the connection string into Render's `MONGODB_URI`

### Post-deployment smoke test

- [ ] `GET https://<render-url>/health` returns `{ "status": "ok", "db": "connected" }`
- [ ] Visit Vercel URL → click **Continue with Google** → lands on `/jobs`
- [ ] Upload resume on `/resume`
- [ ] Search jobs on `/jobs`
- [ ] Compose email → create Gmail draft → appears in `/tracker`
- [ ] Logout redirects to home and clears session
- [ ] Refresh `/jobs` or `/tracker` directly (SPA routing works)

### Post-deployment checklist

- [ ] `NODE_ENV=production` set on Render
- [ ] `GOOGLE_CALLBACK_URL` points to Render `/auth/google/callback`
- [ ] `FRONTEND_URL` points to Vercel URL (exact match, no trailing slash)
- [ ] `VITE_API_BASE_URL` points to Render URL on Vercel
- [ ] Production redirect URI added in Google Cloud Console
- [ ] MongoDB Atlas allows Render connections
- [ ] No `client_secret*.json` files committed to the repository

### CI

GitHub Actions (`.github/workflows/ci.yml`) runs on push/PR to `main`:
- Backend: dependency install + module load verification + unit tests
- Frontend: production build

### Testing

```bash
cd backend
npm test
```

Runs **12 unit tests** covering:
- `cryptoService` — AES-256-GCM encrypt/decrypt round-trip, legacy token handling, missing key errors
- `adzunaService` — Job data mapping, Remotive fallback, description truncation, error handling

---

## Important Notes

> ⚠️ **Use a dedicated demo Gmail account** for development and testing — never your personal Gmail. The app requests `gmail.compose` scope which allows creating drafts in the connected account.

> 📋 **Gmail API Quotas**: The Gmail API has usage limits. For personal use this is not an issue, but be aware if scaling.

> 🔒 **Security**: All API keys are server-side only. The frontend never touches external APIs directly. Gmail scope is limited to `gmail.compose` — the app cannot read or send emails, only create drafts.

---

## Documentation

Detailed documentation is available in the [`docs/`](docs/) directory:

| Document | Description |
|---|---|
| [`01-PRD.md`](docs/01-PRD.md) | Product Requirements — features, personas, constraints, roadmap |
| [`02-TRD.md`](docs/02-TRD.md) | Technical Requirements — architecture, stack, API design, security |
| [`03-APP-FLOW.md`](docs/03-APP-FLOW.md) | Application Flow — all 7 user journeys with detailed diagrams |
| [`04-UI-UX-BRIEF.md`](docs/04-UI-UX-BRIEF.md) | UI/UX Brief — design tokens, components, layouts, accessibility |
| [`05-BACKEND-SCHEMA.md`](docs/05-BACKEND-SCHEMA.md) | Backend Schema — all MongoDB collections, indexes, relationships |
| [`06-IMPLEMENTATION-PLAN.md`](docs/06-IMPLEMENTATION-PLAN.md) | Implementation Plan — status, architecture decisions, deployment checklist |

---

## License

MIT License — see [LICENSE](LICENSE) for details.
