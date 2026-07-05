# OutreachIQ — Technical Requirements Document (TRD)

## 1. System Architecture

```
┌─────────────────┐     ┌─────────────────────────┐     ┌─────────────────┐
│                 │     │                         │     │                 │
│   React SPA     │────▶│   Express API Server    │────▶│  MongoDB Atlas  │
│   (Vite)        │     │   (Node.js)             │     │                 │
│   Port 5173     │     │   Port 5000             │     │                 │
└─────────────────┘     └──────┬──────┬───────────┘     └─────────────────┘
                               │      │
                    ┌──────────┘      └──────────┐
                    ▼                            ▼
          ┌─────────────────┐          ┌─────────────────┐
          │  External APIs  │          │  Google APIs     │
          │  - Adzuna       │          │  - OAuth 2.0     │
          │  - Remotive     │          │  - Gmail API     │
          │  - Groq LLM     │          │                  │
          └─────────────────┘          └─────────────────┘
```

**Architecture style:** Monolithic REST API with SPA frontend.  
**Communication:** JSON over HTTPS with cookie-based sessions (SameSite=None in production).

---

## 2. Technology Stack

### 2.1 Backend

| Component | Technology | Version | Purpose |
|---|---|---|---|
| Runtime | Node.js | ≥18 | Server runtime |
| Framework | Express.js | ^4.21 | REST API framework |
| Database | MongoDB Atlas | — | Data persistence |
| ODM | Mongoose | ^8.8 | Schema modeling and queries |
| Auth | Passport.js + Google OAuth 2.0 | ^0.7 | Authentication |
| Sessions | express-session + connect-mongo | ^1.18 / ^5.1 | Server-side sessions in MongoDB |
| Security | Helmet | ^8.0 | HTTP security headers |
| Rate Limiting | express-rate-limit | ^7.5 | Abuse prevention |
| File Upload | Multer | ^1.4.5 | Multipart form handling |
| PDF Parsing | pdf-parse | ^1.1 | Resume text extraction |
| AI/LLM | Groq SDK (Llama 3.3 70B) | ^0.8 | Resume parsing + email generation |
| Email | googleapis (Gmail API) | ^144 | Gmail draft creation |
| HTTP Client | Axios | ^1.7 | External API calls |
| Encryption | Node.js crypto (AES-256-GCM) | built-in | Refresh token encryption |

### 2.2 Frontend

| Component | Technology | Version | Purpose |
|---|---|---|---|
| Library | React | ^18.3 | UI framework |
| Build Tool | Vite | ^5.4 | Dev server and bundler |
| Routing | React Router DOM | ^6.28 | Client-side routing |
| HTTP Client | Axios | ^1.7 | API communication |
| Styling | Vanilla CSS | — | Custom design system |
| Typography | Inter (Google Fonts) | — | UI font |

### 2.3 Infrastructure

| Component | Technology | Purpose |
|---|---|---|
| Backend Hosting | Render | Web service (auto-deploy from GitHub) |
| Frontend Hosting | Vercel | Static SPA hosting |
| Database | MongoDB Atlas | Managed cloud database (free tier) |
| CI/CD | GitHub Actions | Build verification on push/PR |
| Version Control | Git + GitHub | Source code management |

---

## 3. API Design

All API endpoints follow REST conventions. Responses use consistent JSON format:

**Success:** `{ ...data }` or `{ source: "cache", jobs: [...] }`  
**Error:** `{ error: true, message: "Human-readable error" }`

### 3.1 Rate Limiting Tiers

| Tier | Routes | Limit | Window |
|---|---|---|---|
| Auth | `/auth/*` | 30 requests | 15 minutes |
| AI | `/resume/*`, `/email/*` | 20 requests | 15 minutes |
| API | `/jobs/*`, `/tracker/*` | 60 requests | 15 minutes |
| Gmail | `/gmail/*` | 15 requests | 15 minutes |

### 3.2 Authentication Flow

1. Frontend redirects to `GET /auth/google`
2. Passport initiates OAuth with scopes: `profile`, `email`, `gmail.compose`
3. Google redirects to `GET /auth/google/callback`
4. Passport creates/updates user in MongoDB, encrypts refresh token
5. Session cookie set, user redirected to `/jobs`

### 3.3 Endpoint Summary

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | No | API status |
| `GET` | `/health` | No | Health check with DB ping |
| `GET` | `/auth/google` | No | Initiate OAuth |
| `GET` | `/auth/google/callback` | No | OAuth callback |
| `GET` | `/auth/me` | Yes | Current user profile |
| `GET` | `/auth/logout` | No | Destroy session |
| `POST` | `/resume/parse` | Yes | Upload + parse PDF resume |
| `GET` | `/resume/profile` | Yes | Get parsed profile |
| `GET` | `/jobs?keyword=&location=` | Yes | Search jobs (cached 6h) |
| `GET` | `/jobs/:externalId` | Yes | Get single job |
| `GET` | `/email/templates` | Yes | List email templates |
| `POST` | `/email/generate` | Yes | Generate email with AI |
| `POST` | `/gmail/draft` | Yes | Create Gmail draft |
| `POST` | `/tracker/save` | Yes | Save application record |
| `GET` | `/tracker` | Yes | List user's applications |
| `PATCH` | `/tracker/:id` | Yes | Update application status |
| `DELETE` | `/tracker/:id` | Yes | Delete application record |

---

## 4. Security Requirements

| Requirement | Implementation |
|---|---|
| HTTPS enforcement | `trust proxy` + Render TLS termination |
| HTTP headers | Helmet (CSP, HSTS, X-Frame, etc.) |
| CORS | Whitelist `FRONTEND_URL` only |
| Session security | `httpOnly`, `secure`, `sameSite=none` cookies |
| Token encryption | AES-256-GCM for Google refresh tokens at rest |
| Rate limiting | Per-route tiered rate limiters |
| Input sanitization | HTML tag stripping on tracker inputs |
| ObjectId validation | Mongoose ObjectId format check before DB queries |
| File validation | PDF-only MIME check + 5MB size limit |
| No credential exposure | `.gitignore` patterns, env-only secrets |

---

## 5. Environment Variables

### Backend (11 required)

```
NODE_ENV, PORT, MONGODB_URI, SESSION_SECRET,
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL,
GROQ_API_KEY, ADZUNA_APP_ID, ADZUNA_APP_KEY,
FRONTEND_URL, TOKEN_ENCRYPTION_KEY
```

### Frontend (1 required)

```
VITE_API_BASE_URL
```

---

## 6. Deployment Targets

| Service | Platform | Build Command | Start Command |
|---|---|---|---|
| Backend API | Render | `npm install` | `npm start` |
| Frontend SPA | Vercel | `npm run build` | — (static) |
| Database | MongoDB Atlas | — | — |

Health check endpoint: `GET /health` → `{ status: "ok", db: "connected" }`

---

## 7. Performance Targets

| Metric | Target |
|---|---|
| Frontend bundle (gzip) | <80KB JS, <6KB CSS |
| Cold start (API) | <5s |
| Job search (cached) | <200ms |
| Job search (API fetch) | <3s |
| Resume parse (AI) | <8s |
| Email generation (AI) | <6s |
| Gmail draft creation | <2s |
