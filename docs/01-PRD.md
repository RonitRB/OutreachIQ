# OutreachIQ — Product Requirements Document (PRD)

## 1. Product Overview

**OutreachIQ** is a full-stack SaaS web application that streamlines the job application process. It combines AI-powered email generation, live job search, Gmail integration, and application tracking into a single, cohesive platform.

**Vision:** Empower job seekers to discover roles, craft personalized application emails, and manage their outreach pipeline — all without leaving the app.

**What it is NOT:** A spam bot, a scraper, or a bulk sender. Every action requires explicit user intent. Nothing sends without the user reviewing and authorizing it in their own Gmail inbox.

---

## 2. Target Users

| Persona | Description |
|---|---|
| **Active Job Seekers** | Professionals actively searching for jobs who want to stand out with personalized outreach |
| **Career Changers** | People transitioning industries who need help framing their experience for new roles |
| **Recent Graduates** | New professionals who lack outreach experience and want AI assistance with application emails |

---

## 3. Core Features

### 3.1 Google OAuth Authentication
- Secure sign-in via Google OAuth 2.0
- Access to `gmail.compose` scope for draft creation (read/send permissions NOT requested)
- Session management with 24-hour cookie expiry
- Persistent sessions via MongoDB store

### 3.2 AI Resume Parsing
- Upload a PDF resume (max 5MB)
- AI-powered extraction of name, skills, projects, and summary using Groq LLM (Llama 3.3 70B)
- Parsed data stored in user profile for email personalization
- Re-upload support to update profile at any time

### 3.3 Smart Job Search
- Search live job listings by keyword and optional location
- Primary source: Adzuna API (India market)
- Fallback source: Remotive API (remote jobs)
- Server-side caching (6 hours) scoped by keyword + location
- Results display with title, company, location, and description

### 3.4 AI Email Generation
- Generate personalized application emails using Groq LLM
- 3 email templates: Cold Outreach, Referral-based, Response to Job Post
- 3 tone options: Formal, Conversational, Assertive
- AI uses job details + resume data for context-aware personalization
- Editable subject and body before sending

### 3.5 Gmail Draft Creation
- Create drafts directly in user's Gmail inbox via Gmail API
- Uses OAuth refresh tokens for seamless re-authentication
- Opens draft in new tab after creation
- Refresh tokens encrypted at rest with AES-256-GCM

### 3.6 Application Tracker
- Automatic tracking when a draft is created
- Status lifecycle: Draft Created → Sent → Interview → Rejected / No Response
- View all applications with status, date, template used, and tone
- Direct link to Gmail draft for each application
- Delete support for removing records

---

## 4. Non-Functional Requirements

| Requirement | Target |
|---|---|
| **Availability** | 99.5% uptime via Render + MongoDB Atlas |
| **Security** | Helmet headers, CORS whitelist, rate limiting, encrypted tokens |
| **Performance** | <2s API response for cached jobs, <8s for AI generation |
| **Scalability** | Stateless API (session in MongoDB), horizontal scaling ready |
| **Accessibility** | ARIA roles, keyboard navigation, screen reader support |
| **Browser Support** | Chrome 90+, Firefox 90+, Safari 15+, Edge 90+ |

---

## 5. Success Metrics

| Metric | Description |
|---|---|
| **Activation Rate** | % of users who upload resume within first session |
| **Engagement** | Average emails generated per user per week |
| **Conversion** | % of drafts moved to "Sent" status |
| **Retention** | Weekly active user return rate |

---

## 6. Constraints

- **Gmail scope limited to `gmail.compose`** — app cannot read, send, or delete emails
- **AI quota** — Groq API has rate limits; resume parsing and email gen are rate-limited to 20 requests per 15 minutes
- **Job data freshness** — cached for 6 hours; not real-time
- **Single OAuth provider** — Google only (no email/password auth)
- **No file storage** — resumes are parsed in-memory; PDFs are not persisted

---

## 7. Future Roadmap

| Priority | Feature |
|---|---|
| P1 | Email templates customization by user |
| P1 | Follow-up email generation (re-engage after no response) |
| P2 | Multi-provider job search (LinkedIn, Indeed) |
| P2 | Analytics dashboard (response rates, best-performing templates) |
| P3 | Team/organization accounts |
| P3 | Chrome extension for on-page email generation |
