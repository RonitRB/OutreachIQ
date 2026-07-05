# OutreachIQ — Application Flow

## 1. High-Level User Journey

```
┌────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌──────────┐
│  Home  │───▶│  Resume   │───▶│   Jobs    │───▶│  Compose  │───▶│ Tracker  │
│  Login │    │  Upload   │    │  Search   │    │  Email    │    │  Monitor │
└────────┘    └───────────┘    └───────────┘    └───────────┘    └──────────┘
     │                              │                 │               │
     │         Google OAuth         │    Select Job    │  Create Draft │
     └──────────────────────────────┘─────────────────┘───────────────┘
```

---

## 2. Detailed Flows

### 2.1 Authentication Flow

```
User clicks "Continue with Google"
    │
    ▼
Browser redirects to → GET /auth/google
    │
    ▼
Passport redirects to → Google OAuth consent screen
  (Scopes: profile, email, gmail.compose)
    │
    ▼
User grants permission → Google redirects to GET /auth/google/callback
    │
    ▼
Passport callback:
  ├── Find user by googleId in MongoDB
  │     ├── EXISTS → Update name, email, avatar, encrypt & save refresh token
  │     └── NOT FOUND → Create new UserProfile, encrypt & save refresh token
  │
  ▼
Set session cookie (httpOnly, secure in production)
    │
    ▼
Redirect to → FRONTEND_URL/jobs
```

### 2.2 Resume Upload Flow

```
User navigates to /resume
    │
    ├── GET /resume/profile → Check if profile exists
    │     ├── EXISTS → Show parsed profile (name, skills, projects, summary)
    │     └── NOT FOUND → Show upload zone
    │
    ▼
User drags/drops or clicks to browse → Selects PDF file
    │
    ▼
Client validates: file.type === 'application/pdf'
    │
    ▼
POST /resume/parse (multipart/form-data)
    │
    ▼
Backend:
  ├── Multer: Validate PDF MIME, enforce 5MB limit, buffer in memory
  ├── pdf-parse: Extract raw text from PDF buffer
  ├── Groq LLM: Parse raw text → { name, skills, projects, summary }
  │     └── response_format: json_object ensures valid JSON
  └── MongoDB: Upsert UserProfile with parsed data + rawText
    │
    ▼
Return updated profile → Client shows parsed profile card
```

### 2.3 Job Search Flow

```
User enters keyword (required) + location (optional) → Clicks "Search"
    │
    ▼
GET /jobs?keyword=react&location=bangalore
    │
    ▼
Backend:
  ├── Normalize: keyword.toLowerCase(), location.toLowerCase()
  ├── Check cache: MongoDB.find({ keyword, searchLocation, cachedAt > 6h ago })
  │     ├── CACHE HIT → Return { source: "cache", jobs: [...] }
  │     └── CACHE MISS ↓
  │
  ├── Try Adzuna API first:
  │     ├── SUCCESS → Map results to normalized format, cache via bulkWrite
  │     └── FAIL → Fallback to Remotive API
  │
  └── Return { source: "api", jobs: [...] }
    │
    ▼
Client renders job cards in grid layout
  Each card shows: title, company, location, description (120 chars)
  Actions: "Write Email" → navigate to /compose?jobId=X
           "Apply ↗" → open applyUrl in new tab
```

### 2.4 Email Composition Flow

```
User clicks "Write Email" on a job card
    │
    ▼
Navigate to /compose?jobId=<externalId>
    │
    ├── GET /jobs/<externalId> → Load job details
    └── GET /email/templates → Load 3 templates
    │
    ▼
User selects:
  ├── Template: Cold Outreach | Referral-based | Response to Job Post
  └── Tone: Formal | Conversational | Assertive
    │
    ▼
User clicks "✨ Generate Email"
    │
    ▼
POST /email/generate { jobId, templateId, tone }
    │
    ▼
Backend:
  ├── Fetch job from MongoDB (by externalId)
  ├── Fetch user profile (by googleId)
  ├── Fetch template (by templateId)
  ├── Build prompt with: job details + user skills/projects + tone guide + template hint
  └── Groq LLM → { subject, body } (response_format: json_object)
    │
    ▼
Client shows editable subject + body fields
  ├── User can edit both fields manually
  ├── "Regenerate" → calls POST /email/generate again
  └── "Create Gmail Draft" → proceeds to draft creation
```

### 2.5 Gmail Draft Creation Flow

```
User clicks "Create Gmail Draft"
    │
    ▼
POST /gmail/draft { subject, body }
    │
    ▼
Backend:
  ├── googleAuthService.getAccessToken(user):
  │     ├── Decrypt user.googleRefreshToken (AES-256-GCM)
  │     ├── Create OAuth2 client with refresh token
  │     └── Request new access token from Google
  │
  ├── gmailService.createDraft(accessToken, { subject, body, to }):
  │     ├── Build RFC 2822 email (To, Subject, Content-Type, body)
  │     ├── Base64url encode
  │     └── Gmail API: users.drafts.create → draftId
  │
  └── Return { draftId, draftUrl }
    │
    ▼
POST /tracker/save (auto-save application record)
  { jobId, title, company, location, applyUrl, draftUrl, emailSubject,
    templateUsed, toneUsed, status: "draft_created" }
    │
    ▼
Open draftUrl in new tab → Navigate to /tracker
```

### 2.6 Application Tracking Flow

```
User navigates to /tracker
    │
    ▼
GET /tracker → Fetch all applications (sorted by appliedAt DESC)
    │
    ▼
Display:
  ├── Stats bar: Total | Drafted | Sent | Interview | No Response
  ├── Table with columns: Title, Company, Template, Tone, Status, Date, Actions
  │     ├── Status dropdown → PATCH /tracker/:id { status }
  │     ├── "View Draft" → Open draftUrl in new tab
  │     └── "Delete" → Confirm → DELETE /tracker/:id
  └── Empty state: "No applications tracked yet" with link to /jobs
```

### 2.7 Logout Flow

```
User clicks "Logout" in navbar
    │
    ▼
Browser navigates to → GET /auth/logout
    │
    ▼
Backend:
  ├── req.logout() → Clear passport session
  └── req.session.destroy() → Remove from MongoDB sessions collection
    │
    ▼
Redirect to → FRONTEND_URL (home page)
```

---

## 3. Error Handling

| Scenario | Behavior |
|---|---|
| OAuth fails | Redirect to home page |
| Session expired | 401 → Axios interceptor redirects to home |
| Resume parse fails | Toast: "Failed to parse resume" |
| Job search fails | Toast: "Failed to fetch jobs" |
| Email generation fails | Toast: "Failed to generate email" |
| Gmail token expired | Toast: "Gmail session expired, please reconnect" |
| Rate limit exceeded | 429 → Toast with retry-after message |
| File too large | 400 → Toast: "File too large. Maximum size is 5MB" |
| Invalid file type | 400 → Toast: "Only PDF files are allowed" |
| Invalid ObjectId | 400 → "Invalid application ID" |
| Invalid status value | 400 → "Invalid status. Must be one of: ..." |

---

## 4. State Management

The app uses **React local state** (useState/useEffect) without a global store. State flow:

| Component | State Owner | Data |
|---|---|---|
| User authentication | `App.jsx` | `user` object from `/auth/me` |
| Resume profile | `Resume.jsx` | Profile from `/resume/profile` |
| Job listings | `Jobs.jsx` | Search results from `/jobs` |
| Email composition | `Compose.jsx` | Job, templates, subject, body |
| Applications | `Tracker.jsx` | Application list from `/tracker` |
| Notifications | `ToastProvider` | Toast queue with auto-dismiss |
