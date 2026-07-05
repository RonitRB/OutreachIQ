# OutreachIQ — Implementation Plan

## 1. Project Status Summary

### Completed Phases ✅

| Phase | Description | Status |
|---|---|---|
| **Foundation** | Project scaffolding, Express + React setup, MongoDB connection | ✅ Complete |
| **Authentication** | Google OAuth 2.0, Passport.js, session management | ✅ Complete |
| **Resume Module** | PDF upload, pdf-parse, Groq LLM parsing, profile storage | ✅ Complete |
| **Job Search** | Adzuna API + Remotive fallback, caching layer | ✅ Complete |
| **Email Generation** | 3 templates, 3 tones, Groq LLM generation | ✅ Complete |
| **Gmail Integration** | OAuth2 token refresh, Gmail API draft creation | ✅ Complete |
| **Application Tracker** | CRUD operations, status lifecycle, ownership checks | ✅ Complete |
| **UI Design System** | Dark theme, glassmorphism, gradients, animations | ✅ Complete |
| **CI/CD Pipeline** | GitHub Actions for backend + frontend build verification | ✅ Complete |
| **Security Hardening** | Rate limiting, token encryption, input sanitization, credential cleanup | ✅ Complete |
| **Accessibility** | ARIA roles, keyboard navigation, screen reader support | ✅ Complete |
| **Error Handling** | Unhandled rejection/exception handlers, graceful shutdown | ✅ Complete |
| **Documentation** | PRD, TRD, App Flow, UI/UX Brief, Backend Schema | ✅ Complete |

---

## 2. Current Sprint — Production Polish

### 2.1 Remaining Tasks (Prioritized)

| Priority | Task | Category | Complexity | Impact |
|---|---|---|---|---|
| P0 | Add `helmet` CSP for frontend (currently blocks inline scripts in prod) | Security | Medium | High |
| P1 | Add structured error logging (operation context, timestamps) | Observability | Low | Medium |
| P1 | Create loading skeletons for all data-fetching pages | UX | Medium | Medium |
| P1 | Add empty state illustrations for tracker and job results | UX | Low | Medium |
| P2 | Add retry logic for Adzuna API timeout | Reliability | Low | Medium |
| P2 | Add email preview modal before Gmail draft creation | UX | Medium | Medium |
| P2 | Add pagination/infinite scroll for tracker table | Performance | Medium | Low |
| P3 | Add dark/light theme toggle | UX | Medium | Low |
| P3 | Add PWA manifest for mobile installability | Platform | Low | Low |

---

## 3. Architecture Decisions

### 3.1 Why Groq (not OpenAI/Anthropic)?
- **Speed:** Groq's LPU delivers 500+ tokens/second, making email generation feel instant
- **Cost:** Free tier with generous limits for MVP
- **Model quality:** Llama 3.3 70B is competitive with GPT-4o for structured extraction tasks
- **JSON mode:** Native `response_format: { type: "json_object" }` support

### 3.2 Why Adzuna (not LinkedIn/Indeed)?
- **Free API access** with generous limits
- **Structured JSON responses** with consistent schema
- **India market coverage** (primary target market)
- **No CAPTCHA or scraping restrictions**
- **Remotive fallback** covers remote job market

### 3.3 Why sessions (not JWT)?
- **Server-side control:** Can invalidate sessions immediately on logout
- **Sensitive data stays server-side:** No token in localStorage (XSS-safe)
- **MongoDB store:** Session persistence across server restarts
- **Cookie-based:** Automatic credential sending with `credentials: include`

### 3.4 Why no global state manager?
- **5 pages with independent data:** Each page fetches its own data
- **No shared mutable state:** User object is read-only in most components
- **React Router v6:** Page-level data loading is natural
- **Complexity budget:** Avoided Redux/Zustand to keep the codebase lean

---

## 4. File Structure

```
OutreachIQ/
├── .github/
│   └── workflows/
│       └── ci.yml                   # GitHub Actions CI pipeline
├── docs/
│   ├── 01-PRD.md                    # Product Requirements
│   ├── 02-TRD.md                    # Technical Requirements
│   ├── 03-APP-FLOW.md               # Application Flow
│   ├── 04-UI-UX-BRIEF.md            # UI/UX Design Brief
│   ├── 05-BACKEND-SCHEMA.md         # Database Schema
│   └── 06-IMPLEMENTATION-PLAN.md    # This file
├── backend/
│   ├── server.js                    # Entry point, DB connect, graceful shutdown
│   ├── package.json
│   ├── render.yaml                  # Render deployment config
│   ├── .env.example                 # Environment variable template
│   └── src/
│       ├── app.js                   # Express app, middleware, routes
│       ├── config/
│       │   ├── db.js                # MongoDB connection
│       │   ├── env.js               # Environment validation
│       │   └── passport.js          # Google OAuth strategy
│       ├── controllers/
│       │   ├── authController.js    # Login, logout, getMe
│       │   ├── emailController.js   # Templates, email generation
│       │   ├── gmailController.js   # Gmail draft creation
│       │   ├── jobsController.js    # Job search with caching
│       │   ├── resumeController.js  # Resume upload and parsing
│       │   └── trackerController.js # Application CRUD with validation
│       ├── middleware/
│       │   ├── auth.js              # Authentication guard
│       │   └── upload.js            # Multer PDF upload config
│       ├── models/
│       │   ├── AppliedJob.js        # Application tracker schema
│       │   ├── EmailTemplate.js     # Email template schema
│       │   ├── Job.js               # Cached job schema (TTL)
│       │   └── UserProfile.js       # User profile schema
│       ├── routes/
│       │   ├── auth.js              # /auth routes
│       │   ├── email.js             # /email routes
│       │   ├── gmail.js             # /gmail routes
│       │   ├── jobs.js              # /jobs routes
│       │   ├── resume.js            # /resume routes
│       │   └── tracker.js           # /tracker routes
│       ├── seeds/
│       │   └── templates.js         # Email template seeder
│       └── services/
│           ├── adzunaService.js     # Adzuna + Remotive API client
│           ├── cryptoService.js     # AES-256-GCM encrypt/decrypt
│           ├── gmailService.js      # Gmail API draft creation
│           ├── googleAuthService.js # OAuth token management
│           └── groqService.js       # Groq LLM integration
├── frontend/
│   ├── index.html                   # HTML entry (Inter font, meta tags)
│   ├── package.json
│   ├── vite.config.js               # Vite config with API proxy
│   ├── vercel.json                  # Vercel SPA routing config
│   ├── .env.example                 # Frontend env template
│   └── src/
│       ├── main.jsx                 # React entry point
│       ├── App.jsx                  # Router, auth state, layout
│       ├── index.css                # Full design system (1685 lines)
│       ├── api/
│       │   └── axios.js             # Axios instance with interceptors
│       ├── components/
│       │   ├── EmailComposer.jsx    # Email subject + body editor
│       │   ├── JobCard.jsx          # Job listing card
│       │   ├── Navbar.jsx           # Navigation with auth state
│       │   ├── TemplateSelector.jsx # Email template radio group
│       │   ├── Toast.jsx            # Toast notification system
│       │   └── ToneSelector.jsx     # Tone toggle buttons
│       └── pages/
│           ├── Home.jsx             # Landing page (unauthenticated)
│           ├── Jobs.jsx             # Job search page
│           ├── Compose.jsx          # Email composition page
│           ├── Resume.jsx           # Resume upload page
│           └── Tracker.jsx          # Application tracker page
├── .gitignore
├── LICENSE                          # MIT License
└── README.md                        # Setup, usage, deployment guide
```

---

## 5. Deployment Checklist

### 5.1 Pre-Deployment

- [ ] All environment variables set in Render dashboard
- [ ] `TOKEN_ENCRYPTION_KEY` generated and stored securely
- [ ] MongoDB Atlas cluster created with IP whitelist (0.0.0.0/0 for Render)
- [ ] Google Cloud Console: OAuth consent screen approved, redirect URI added
- [ ] Google Cloud Console: `gmail.compose` scope verified

### 5.2 Render (Backend)

- [ ] Web service created with build command: `npm install`
- [ ] Start command: `node server.js`
- [ ] Environment: Node.js 20
- [ ] Health check path: `/health`
- [ ] Auto-deploy from `main` branch

### 5.3 Vercel (Frontend)

- [ ] Project connected to GitHub repository
- [ ] Root directory: `frontend`
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Environment variable: `VITE_API_BASE_URL` = Render service URL

### 5.4 Post-Deployment

- [ ] Verify `/health` endpoint returns `{ status: "ok", db: "connected" }`
- [ ] Test Google OAuth flow end-to-end
- [ ] Test resume upload + parse
- [ ] Test job search (cache miss + cache hit)
- [ ] Test email generation + Gmail draft creation
- [ ] Verify tracker auto-saves application
- [ ] Check Render logs for unhandled errors

---

## 6. Git History

| Commit | Description |
|---|---|
| `b66bd83` | Initial commit: full-stack application (credential file removed) |
| `1ecce71` | Add status validation, location-scoped job cache, rate limiting |
| `8af96b2` | Use Groq response_format json_object, remove fragile retry logic |
| `befeee1` | Encrypt Google refresh tokens at rest with AES-256-GCM |
| `723b1f4` | Add input sanitization, ObjectId validation, remove googleId exposure |
| `0a5dd95` | Correct frontend .env.example, clean up misplaced secrets |
| `7152c51` | Add unhandledRejection/uncaughtException handlers, graceful shutdown |
| `cbf969e` | Add ARIA roles, keyboard navigation, screen reader support |
| *next* | Add project documentation (docs/) |

---

## 7. Testing Strategy

### 7.1 Current Coverage

| Test Type | Coverage | Method |
|---|---|---|
| Build verification | ✅ CI | `npm ci` + `npm run build` (frontend) |
| Module validation | ✅ CI | `node -e "require('./src/config/env')"` |
| App load test | ✅ CI | `node -e "require('./src/app')"` |

### 7.2 Planned Testing (P1)

| Test Type | Tool | Coverage Target |
|---|---|---|
| Unit tests | Jest | Services layer (groqService, cryptoService, adzunaService) |
| API integration tests | Supertest | All 17 endpoints |
| Component tests | React Testing Library | Interactive components |
| E2E tests | Playwright | Full OAuth + compose flow |
