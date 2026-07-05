# OutreachIQ — UI/UX Design Brief

## 1. Design Philosophy

OutreachIQ follows a **premium dark-theme SaaS aesthetic** inspired by modern developer tools and productivity platforms. The design prioritizes:

- **Dark-first design** — reduces eye strain during extended job searching sessions
- **Glassmorphism** — frosted glass cards for visual depth without clutter
- **Gradient accents** — blue → purple → pink gradients for energy and premium feel
- **Micro-animations** — subtle hover effects and transitions for polish
- **Content clarity** — high contrast text, clear hierarchy, and generous whitespace

---

## 2. Design System Tokens

### 2.1 Color Palette

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#0a0f1e` | Page background |
| `--bg-secondary` | `#111827` | Card backgrounds |
| `--bg-tertiary` | `#1a1f35` | Elevated surfaces |
| `--accent-blue` | `#3b82f6` | Primary actions, links |
| `--accent-purple` | `#8b5cf6` | Secondary actions, highlights |
| `--accent-pink` | `#ec4899` | Accent details |
| `--accent-cyan` | `#06b6d4` | Info indicators |
| `--text-primary` | `#f1f5f9` | Body text |
| `--text-secondary` | `#94a3b8` | Muted labels |
| `--text-tertiary` | `#64748b` | Subtle text |

### 2.2 Status Colors

| Status | Color | Hex |
|---|---|---|
| Draft Created | Blue | `#3b82f6` |
| Sent | Purple | `#8b5cf6` |
| Interview | Green | `#10b981` |
| Rejected | Red | `#ef4444` |
| No Response | Gray | `#6b7280` |

### 2.3 Typography

| Element | Family | Weight | Size |
|---|---|---|---|
| Body text | Inter | 400 | 1rem (16px) |
| Labels | Inter | 500 | 0.875rem |
| Headings | Inter | 700 | 2rem – 3.5rem |
| Monospace | JetBrains Mono | 400 | 0.875rem |

### 2.4 Spacing Scale

```
xs: 4px | sm: 8px | md: 16px | lg: 24px | xl: 32px | 2xl: 48px | 3xl: 64px
```

### 2.5 Radius Scale

```
sm: 6px | md: 8px | lg: 12px | xl: 16px | full: 9999px
```

---

## 3. Component Library

### 3.1 Cards (`.card`)
- Glassmorphic background: `rgba(255, 255, 255, 0.05)` with 12px blur
- 1px border: `rgba(255, 255, 255, 0.1)`
- 12px border-radius
- Hover: increased background opacity + border brightness + slight lift (`translateY(-2px)`)

### 3.2 Buttons

| Variant | Style | Usage |
|---|---|---|
| `.btn-primary` | Gradient fill (blue → purple) | Primary actions (Generate, Save) |
| `.btn-secondary` | Glass background with border | Secondary actions (Cancel, Clear) |
| `.btn-danger` | Red with glass background | Destructive actions (Delete) |
| `.btn-outline` | Transparent with border | Tertiary actions |

All buttons: 12px border-radius, 0.3s transition, gradient glow on hover.

### 3.3 Forms
- Dark input fields with glass background
- Blue/purple focus ring (box-shadow glow)
- Floating labels or top-aligned labels
- Consistent height: 44px (touch-friendly)

### 3.4 Status Badges
- Pill-shaped (border-radius: full)
- Color-coded backgrounds (10% opacity) + matching text
- Small font (0.75rem), uppercase

### 3.5 Toast Notifications
- Fixed bottom-right position
- Color-coded left border (success=green, error=red, info=blue, warning=orange)
- Auto-dismiss after 4 seconds with fade animation
- Glass background with backdrop blur
- `role="alert"` for screen reader announcement

### 3.6 Navbar
- Fixed top, 64px height
- Glass background with blur
- Gradient brand text
- User avatar + name on right
- Mobile hamburger menu at ≤768px

---

## 4. Page Layouts

### 4.1 Home (Landing Page)
```
┌──────────────────────────────────────────────┐
│  Navbar (logo + "Get Started" button)        │
├──────────────────────────────────────────────┤
│                                              │
│           ✦ Hero Section ✦                   │
│     Gradient headline + subtitle             │
│     "Continue with Google" CTA button        │
│     Floating feature cards below             │
│                                              │
├──────────────────────────────────────────────┤
│  Feature Grid (3 columns)                    │
│  📄 Smart Resume  │  🔍 Job Search  │ ✉️ AI │
│  Parsing          │  Discovery      │ Emails │
├──────────────────────────────────────────────┤
│  How it Works (4 steps timeline)             │
│  Upload → Search → Generate → Track          │
├──────────────────────────────────────────────┤
│  Footer (copyright + links)                  │
└──────────────────────────────────────────────┘
```

### 4.2 Jobs Search
```
┌──────────────────────────────────────────────┐
│  Navbar (authenticated)                      │
├──────────────────────────────────────────────┤
│  Search Bar: [keyword] [location] [Search]   │
├──────────────────────────────────────────────┤
│  Results Grid (responsive 1-3 columns)       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │ Job Card │ │ Job Card │ │ Job Card │    │
│  │ title    │ │ title    │ │ title    │    │
│  │ company  │ │ company  │ │ company  │    │
│  │ location │ │ location │ │ location │    │
│  │ [Email]  │ │ [Email]  │ │ [Email]  │    │
│  └──────────┘ └──────────┘ └──────────┘    │
└──────────────────────────────────────────────┘
```

### 4.3 Compose Email
```
┌──────────────────────────────────────────────┐
│  Navbar                                      │
├──────────────────┬───────────────────────────┤
│  Left Panel      │  Right Panel              │
│  Job Details     │  Template Selector (3)    │
│  - Title         │  Tone Selector (3)        │
│  - Company       │  [✨ Generate Email]      │
│  - Description   │                           │
│                  │  Subject: [editable]       │
│                  │  Body: [editable textarea] │
│                  │                           │
│                  │  [Create Gmail Draft]      │
└──────────────────┴───────────────────────────┘
```

### 4.4 Tracker
```
┌──────────────────────────────────────────────┐
│  Navbar                                      │
├──────────────────────────────────────────────┤
│  Stats Bar: Total │ Drafted │ Sent │ ...     │
├──────────────────────────────────────────────┤
│  Application Table                           │
│  Title │ Company │ Template │ Status │ Date  │
│  ────────────────────────────────────────    │
│  React Dev │ Google │ Cold │ [Sent ▾] │ 7/4  │
│  ...                                         │
└──────────────────────────────────────────────┘
```

---

## 5. Responsive Breakpoints

| Breakpoint | Width | Behavior |
|---|---|---|
| Mobile | ≤768px | Stack columns, hamburger nav, full-width cards |
| Tablet | 769–1024px | 2-column grid, condensed spacing |
| Desktop | ≥1025px | 3-column grid, max-width: 1200px |

---

## 6. Accessibility Requirements

| Feature | Implementation |
|---|---|
| Keyboard navigation | All interactive elements focusable (tabIndex, Enter/Space) |
| Screen readers | ARIA roles (radiogroup, radio, alert, button), aria-checked, aria-pressed |
| Focus indicators | Custom `:focus-visible` outline with accent color glow |
| Color contrast | All text meets WCAG AA (≥4.5:1 for normal text) |
| Motion preference | Respect `prefers-reduced-motion` for animations |
| Touch targets | Minimum 44px interactive element height |

---

## 7. Animation Guidelines

| Element | Effect | Duration | Easing |
|---|---|---|---|
| Cards | Hover lift (translateY -2px) + glow | 0.3s | ease |
| Buttons | Scale (1.02) + gradient shift | 0.15s | ease |
| Toasts | Slide-in from right | 0.3s | ease-out |
| Page transitions | Fade-in | 0.3s | ease |
| Loading spinner | Gradient rotating conic | 1s | linear |
| Pulse effects | Scale oscillation | 2s | ease-in-out |
