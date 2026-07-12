# OutreachIQ — Backend Schema Reference

## 1. Database Overview

**Database:** MongoDB Atlas  
**Database name:** `outreachiq`  
**ODM:** Mongoose v8.x  
**Collections:** 4 data collections + 1 session collection

---

## 2. Collections & Schemas

### 2.1 `userprofiles` — User Profile

Stores authenticated user data and parsed resume information.

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `_id` | ObjectId | Auto | — | MongoDB document ID |
| `googleId` | String | ✅ | — | Google OAuth unique identifier |
| `email` | String | ✅ | — | User email from Google profile |
| `name` | String | ✅ | — | Display name from Google profile |
| `avatar` | String | — | `""` | Google profile photo URL |
| `skills` | [String] | — | `[]` | Parsed from resume (e.g., "React", "Node.js") |
| `projects` | [String] | — | `[]` | Parsed from resume with context |
| `summary` | String | — | `""` | AI-generated professional summary |
| `rawText` | String | — | `""` | Raw text extracted from PDF |
| `googleRefreshToken` | String | — | — | AES-256-GCM encrypted refresh token |
| `updatedAt` | Date | — | `now` | Last update timestamp |

**Indexes:**
- `googleId`: unique

**Source file:** `backend/src/models/UserProfile.js`

---

### 2.2 `jobs` — Cached Job Listings

Temporary cache for job search results. Documents auto-expire after 6 hours via MongoDB TTL index.

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `_id` | ObjectId | Auto | — | MongoDB document ID |
| `externalId` | String | ✅ | — | Unique job ID from source API |
| `source` | String (enum) | — | — | `"adzuna"` or `"remotive"` |
| `title` | String | — | — | Job title |
| `company` | String | — | — | Company name |
| `location` | String | — | — | Job location |
| `description` | String | — | — | Job description text |
| `applyUrl` | String | — | — | Direct application URL |
| `keyword` | String | — | — | Normalized search keyword (lowercase) |
| `searchLocation` | String | — | `""` | Normalized search location (lowercase) |
| `cachedAt` | Date | — | `now` | Cache timestamp (TTL: 21600s = 6 hours) |

**Indexes:**
- `externalId`: unique
- `cachedAt`: TTL expiry (21600 seconds)

**Source file:** `backend/src/models/Job.js`

---

### 2.3 `appliedjobs` — Application Tracker

Stores user's tracked job applications with status lifecycle.

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `_id` | ObjectId | Auto | — | MongoDB document ID |
| `userId` | ObjectId | ✅ | — | Reference to UserProfile._id |
| `jobId` | String | — | — | External job ID from source API |
| `title` | String | ✅ | — | Job title (sanitized) |
| `company` | String | — | `""` | Company name (sanitized) |
| `location` | String | — | `""` | Job location (sanitized) |
| `applyUrl` | String | — | `""` | Direct application URL |
| `status` | String (enum) | — | `"draft_created"` | Current status |
| `draftUrl` | String | — | `""` | Gmail draft URL |
| `emailSubject` | String | — | `""` | Generated email subject |
| `templateUsed` | String | — | `""` | Template name used |
| `toneUsed` | String | — | `""` | Tone used (formal/conversational/assertive) |
| `appliedAt` | Date | — | `now` | Application creation date |
| `updatedAt` | Date | — | — | Last status update |

**Status enum values:**
```
draft_created → sent → interview → rejected
                                 → no_response
```

**Indexes:**
- `userId`: for per-user queries

**Source file:** `backend/src/models/AppliedJob.js`

---

### 2.4 `emailtemplates` — Email Templates

Pre-seeded email templates for AI generation. Seeded on server startup.

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `_id` | ObjectId | Auto | — | MongoDB document ID |
| `templateId` | String | ✅ | — | Unique template identifier |
| `name` | String | ✅ | — | Display name |
| `description` | String | — | `""` | Brief description |
| `systemHint` | String | — | `""` | Hidden LLM system prompt hint |

**Seed data (3 templates):**

| templateId | Name | Description |
|---|---|---|
| `cold_outreach` | Cold Outreach | Direct cold email to a company |
| `referral_based` | Referral Based | Mention a mutual connection or referral |
| `job_post_response` | Response to Job Post | Response to a specific job posting |

**Source file:** `backend/src/models/EmailTemplate.js`  
**Seed file:** `backend/src/seeds/templates.js`

---

### 2.5 `sessions` — Express Sessions

Managed by `connect-mongo`. Stores serialized session data.

| Field | Type | Description |
|---|---|---|
| `_id` | String | Session ID |
| `session` | Object | Serialized session data (passport user) |
| `expires` | Date | Session expiry (24 hours from creation) |

**Note:** This collection is managed entirely by the `connect-mongo` library. No Mongoose model exists for it.

---

## 3. Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│  UserProfile    │       │  EmailTemplate  │
│─────────────────│       │─────────────────│
│ _id (PK)        │       │ _id (PK)        │
│ googleId (UQ)   │       │ templateId (UQ) │
│ email           │       │ name            │
│ name            │       │ description     │
│ skills[]        │       │ systemHint      │
│ projects[]      │       └─────────────────┘
│ summary         │
│ googleRefreshTkn│       ┌─────────────────┐
│                 │       │  Job (Cache)    │
│                 │       │─────────────────│
└────────┬────────┘       │ _id (PK)        │
         │                │ externalId (UQ) │
         │ userId         │ source          │
         │                │ title, company  │
┌────────▼────────┐       │ keyword         │
│  AppliedJob     │       │ searchLocation  │
│─────────────────│       │ cachedAt (TTL)  │
│ _id (PK)        │       └─────────────────┘
│ userId (FK→UP)  │
│ jobId           │
│ title, company  │
│ status (enum)   │
│ draftUrl        │
│ appliedAt       │
└─────────────────┘
```

---

## 4. Data Flow Summary

| Action | Write Target | Read Source |
|---|---|---|
| Google OAuth login | `userprofiles` | Google API |
| Resume upload | `userprofiles` | PDF file → Groq LLM |
| Job search | `jobs` (cache) | Adzuna/Remotive API |
| Email generation | — | `userprofiles` + `jobs` + `emailtemplates` → Groq LLM |
| Gmail draft | — | Google Gmail API |
| Track application | `appliedjobs` | Client form data |
| Update status | `appliedjobs` | Client dropdown |

---

## 5. Security Considerations

| Data | Protection |
|---|---|
| `googleRefreshToken` | AES-256-GCM encryption at rest |
| `googleId` | Not exposed in API responses |
| User input fields | HTML tag stripping before storage |
| Object IDs in URLs | Format validation before database query |
| Session data | `httpOnly` + `secure` + `sameSite` cookies |
| Job cache | Auto-expired via TTL index (no stale data accumulation) |
