# Scissor — URL Shortener

> **Short links. Big impact.**  
> A full-stack URL shortening platform with real-time analytics, custom slugs, QR code generation, link expiration, and authenticated user dashboards.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-scissors--green.vercel.app-e8ff47?style=for-the-badge&logo=vercel&logoColor=black)](https://scissors-green.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-adisa--ade%2Fscissors-181717?style=for-the-badge&logo=github)](https://github.com/adisa-ade/scissors)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Convex](https://img.shields.io/badge/Convex-Database-e8ff47?style=for-the-badge)](https://convex.dev)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6c47ff?style=for-the-badge)](https://clerk.com)

---

##  Screenshots

| Home | Analytics |
|------|-----------|
| ![Home](https://scissors-green.vercel.app/og-home.png) | ![Analytics](https://scissors-green.vercel.app/og-analytics.png) |

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [API Routes](#api-routes)
- [Authentication](#authentication)
- [Testing](#testing)
- [Deployment](#deployment)
- [Known Limitations](#known-limitations)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**Scissor** is a production-ready URL shortener built as a capstone project. It converts long, unwieldy URLs into short, shareable links — with full analytics tracking, custom branding via slugs, QR code generation, and link expiry management. Built with the modern Next.js App Router, powered by Convex for real-time data, and secured with Clerk authentication.

---

## Features

### URL Shortening
- Paste any long URL and get a short link generated in under one second
- 6-character nanoid slug generated automatically with uniqueness enforcement
- HTTP 302 redirects (preferred for analytics accuracy — avoids browser caching)
- URL validation: rejects malformed URLs and blocks known phishing/spam domains
- Redirect handled via a Next.js Route Handler at `app/[slug]/route.ts`

### Custom Slugs
- Set a memorable custom slug (e.g. `/my-brand`, `/portfolio`)
- Real-time availability check as you type with 350ms debounce
- Reserved slugs enforced server-side: `api`, `admin`, `dashboard`, `login`, `signup`, `analytics`, `settings`, `expired`, `health`
- Slug constraints: 3–50 characters, alphanumeric and hyphens only

### QR Code Generation
- Instant QR code generation for any shortened URL
- Customizable foreground color, background color, and error correction level (L/M/Q/H)
- Download as PNG or SVG — no server round-trip, fully client-side
- QR codes encode the short URL, not the original long URL

### Click Analytics
- Every click is tracked: timestamp, HTTP referrer, device type (mobile/tablet/desktop), browser, and country (from Vercel's `x-vercel-ip-country` header)
- All click events stored as Convex documents
- Dashboard shows:
  - Total clicks, last 7 days, previous 7 days with percentage change
  - Clicks over time (line chart)
  - Top referrers (bar chart with progress bars)
  - Device breakdown (doughnut chart)
  - Weekly click activity comparison (bar chart)
- Real-time updates via Convex reactive queries — no page refresh needed

### Link Expiration
- Optional expiry date set at creation: 1 day, 7 days, 30 days, 90 days, or no expiry
- Expired links return a branded 410 Gone page at `/expired`
- Expiry enforced at redirect time and proactively via Convex scheduled functions (runs every 30 minutes)

### Authentication & Rate Limiting
- Full authentication via Clerk (email, GitHub, Google)
- Dashboard and Analytics pages are protected — unauthenticated users redirected to `/sign-in` via Next.js middleware
- Server-side rate limiting: 50 links per user per day enforced in Convex mutation
- Links are scoped to authenticated users — each user only sees their own links

### Link Dashboard
- Table of all user's links: short URL, original URL, click count, creation date, expiry status
- One-click copy, delete, QR code generation, and analytics per link
- Search links by slug or original URL
- Filter by status: All, Active, Expired
- Filter by date range (from/to date pickers)
- Bulk select and delete with confirmation dialog

### Responsive Design
- Fully responsive across mobile, tablet, and desktop
- Mobile hamburger menu with smooth dropdown
- Stacked layouts on small screens, side-by-side on larger screens

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Inline styles + CSS custom properties |
| **Database** | Convex (real-time, reactive) |
| **Authentication** | Clerk |
| **Charts** | Chart.js + react-chartjs-2 |
| **QR Codes** | qrcode (npm) |
| **Fonts** | Syne + JetBrains Mono (Google Fonts) |
| **Deployment** | Vercel |
| **Testing** | Vitest + React Testing Library + Playwright |

---

## Project Structure

```
scissor/
├── app/
│   ├── [slug]/
│   │   └── route.ts          # Redirect handler — records clicks, returns 302
│   ├── analytics/
│   │   └── page.tsx          # Analytics page (protected)
│   ├── dashboard/
│   │   └── page.tsx          # Dashboard page (protected)
│   ├── expired/
│   │   └── page.tsx          # Branded 410 expired link page
│   ├── sign-in/
│   │   └── [[...sign-in]]/
│   │       └── page.tsx      # Clerk sign-in page
│   ├── sign-up/
│   │   └── [[...sign-up]]/
│   │       └── page.tsx      # Clerk sign-up page
│   ├── globals.css           # CSS variables, animations, base styles
│   ├── layout.tsx            # Root layout with Providers
│   └── page.tsx              # Home page
├── components/
│   ├── AnalyticsPage.tsx     # Analytics UI with charts
│   ├── DashboardPage.tsx     # Links table with search/filter
│   ├── HomePage.tsx          # Hero, shorten form, stats strip
│   ├── Navbar.tsx            # Responsive navbar with hamburger menu
│   ├── Providers.tsx         # ClerkProvider + ConvexProviderWithClerk
│   └── QRModal.tsx           # QR code generator modal
├── convex/
│   ├── _generated/           # Auto-generated Convex types
│   ├── auth.config.ts        # Clerk JWT configuration for Convex
│   ├── crons.ts              # Scheduled function: expire links every 30min
│   ├── links.ts              # All Convex queries and mutations
│   └── schema.ts             # Database schema
├── lib/
│   └── store.ts              # Utility functions: slug validation, etc.
├── tests/
│   ├── unit/
│   │   └── slug.test.ts      # Unit tests: slug generation, URL validation, expiry
│   ├── components/
│   │   ├── ShortenForm.test.tsx
│   │   ├── QRCodeDisplay.test.tsx
│   │   └── AnalyticsDashboard.test.tsx
│   └── e2e/
│       └── app.spec.ts       # Playwright E2E tests
├── middleware.ts              # Clerk middleware — protects /dashboard and /analytics
├── playwright.config.ts
├── vitest.config.ts
└── vitest.setup.ts
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A [Convex](https://convex.dev) account
- A [Clerk](https://clerk.com) account

### 1. Clone the repository

```bash
git clone https://github.com/adisa-ade/scissors.git
cd scissors
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Convex

```bash
npx convex dev
```

This will prompt you to log in and create a project. It automatically adds `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` to your `.env.local`.

### 4. Set up Clerk

1. Go to [clerk.com](https://clerk.com) and create a new application
2. Enable GitHub and Google social login (optional)
3. Go to **JWT Templates → New Template → Convex**
4. Copy the issuer URL and add it to `convex/auth.config.ts`:

```ts
export default {
  providers: [
    {
      domain: "https://your-issuer-url.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};
```

5. Copy your Clerk API keys to `.env.local`

### 5. Configure environment variables

Create `.env.local` in the project root:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
CONVEX_DEPLOYMENT=your-deployment-name

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Run the development servers

Open two terminal windows:

```bash
# Terminal 1 — Convex
npx convex dev

# Terminal 2 — Next.js
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | Clerk publishable key |
| `CLERK_SECRET_KEY` | ✅ | Clerk secret key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | ✅ | Sign-in page path |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | ✅ | Sign-up page path |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | ✅ | Redirect after sign-in |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | ✅ | Redirect after sign-up |
| `NEXT_PUBLIC_CONVEX_URL` | ✅ | Convex deployment URL |
| `CONVEX_DEPLOYMENT` | ✅ | Convex deployment name |
| `NEXT_PUBLIC_APP_URL` | ✅ | Your app's public URL (used in short links and QR codes) |

---

## Database Schema

### `links` table

| Field | Type | Description |
|-------|------|-------------|
| `slug` | string | Unique short slug |
| `originalUrl` | string | The original long URL |
| `clicks` | number | Total click count |
| `isExpired` | boolean | Whether the link is expired |
| `expiresAt` | number \| null | Expiry timestamp (ms) or null |
| `createdAt` | number | Creation timestamp (ms) |
| `userId` | string | Clerk user ID |

**Indexes:** `by_slug` (for redirect lookups), `by_user` (for dashboard queries)

### `clicks` table

| Field | Type | Description |
|-------|------|-------------|
| `linkId` | Id<"links"> | Reference to the parent link |
| `slug` | string | The slug that was clicked |
| `timestamp` | number | Click timestamp (ms) |
| `referrer` | string | HTTP referrer or "Direct" |
| `country` | string | Country code from Vercel headers |
| `device` | string | mobile / tablet / desktop |
| `browser` | string | Chrome / Safari / Firefox / Edge / Other |

**Indexes:** `by_link` (for analytics queries)

---

## API Routes

### `GET /[slug]`

Handles short link redirects.

- Looks up the slug in Convex
- Returns **302** redirect to the original URL
- Returns **410** redirect to `/expired` if the link is expired
- Returns **redirect to `/`** if slug not found
- Records a click event with device, browser, country, and referrer data

---

## Authentication

Authentication is handled by **Clerk** with **Next.js middleware** protecting server routes.

### How it works

1. `proxy.ts` intercepts all requests to `/dashboard` and `/analytics`
2. Unauthenticated users are automatically redirected to `/sign-in`
3. `ClerkProvider` wraps the app via `components/Providers.tsx`
4. `ConvexProviderWithClerk` passes the Clerk JWT to Convex for server-side identity verification
5. All Convex mutations verify `ctx.auth.getUserIdentity()` before performing any operation

### Protected routes

| Route | Protection |
|-------|------------|
| `/dashboard` | Clerk middleware |
| `/analytics` | Clerk middleware |
| `/` (shorten form) | Client-side — form hidden when not signed in |

---

## Testing

### Setup

```bash
# Install test dependencies
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D @playwright/test
npx playwright install
```

### Run tests

```bash
# Unit + component tests
npm run test

# E2E tests (requires dev server running)
npm run test:e2e
```

### Test coverage

| Type | Count | What's covered |
|------|-------|----------------|
| **Unit** | 4+ | Slug generation, collision detection, URL validation, expiry date calculation |
| **Component** | 3+ | ShortenForm, QRCodeDisplay, AnalyticsDashboard |
| **E2E** | 5+ | Home page loads, auth redirects, expired page, unknown slug redirect, sign-in page |

### Tools

- **Vitest** — unit and component tests
- **React Testing Library** — component rendering and interaction
- **Playwright** — end-to-end browser tests

---

## Deployment

### Deploy to Vercel

#### 1. Push to GitHub

```bash
git add .
git commit -m "feat: initial production build"
git push origin main
```

#### 2. Deploy Convex to production

```bash
npx convex deploy
```

#### 3. Connect repo to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. Add all environment variables (see [Environment Variables](#environment-variables))
4. Set `NEXT_PUBLIC_APP_URL` to your Vercel domain e.g. `https://scissors-green.vercel.app`
5. Click **Deploy**

#### 4. Configure Clerk for production

1. In Clerk dashboard, switch to **Production** instance
2. Set application domain to your Vercel domain
3. Update `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` in Vercel with production keys
4. Update `convex/auth.config.ts` with the production Clerk issuer URL
5. Run `npx convex deploy` again
6. Trigger a redeploy on Vercel

### Convex Scheduled Functions

The `convex/crons.ts` file runs `expireLinks` every 30 minutes automatically — no additional configuration needed after `npx convex deploy`.

---

## Known Limitations

- **No custom domain** — short links use the Vercel domain (`scissors-green.vercel.app/slug`) rather than a custom short domain like `scsr.io`
- **Clerk development mode** — the "Development mode" banner appears on the Clerk sign-in UI because `.vercel.app` domains cannot be used for Clerk production instances (requires a custom domain)
- **No geographic map** — country data is collected but not yet visualized on a map
- **No logo overlay on QR codes** — QR customization supports color and error correction but not logo embedding
- **No link editing** — links cannot be edited after creation, only deleted

---

## Roadmap

- [ ] Custom short domain (e.g. `scsr.io`)
- [ ] Geographic map visualization for click analytics
- [ ] Logo overlay option for QR codes
- [ ] Link editing after creation
- [ ] Link sharing via social media buttons
- [ ] CSV export of analytics data
- [ ] Team/organization support
- [ ] API access for programmatic link creation
- [ ] Browser extension for one-click shortening

---

## Contributing

Contributions are welcome! Please follow these steps:

```bash
# 1. Fork the repository
# 2. Create a feature branch
git checkout -b feat/your-feature-name

# 3. Make your changes and commit
git commit -m "feat: add your feature"

# 4. Push to your fork
git push origin feat/your-feature-name

# 5. Open a Pull Request
```

Please make sure all tests pass before submitting a PR:

```bash
npm run test
npm run build
```

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Author

**Adisa Ade**  
GitHub: [@adisa-ade](https://github.com/adisa-ade)  
Live: [scissors-green.vercel.app](https://scissors-green.vercel.app)

---

<div align="center">
  <p>Built with ✂ and ☕</p>
  <p>
    <a href="https://scissors-green.vercel.app">Live Demo</a> •
    <a href="https://github.com/adisa-ade/scissors">GitHub</a>
  </p>
</div>
