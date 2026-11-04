# Environment Configuration

All environment variables must be prefixed with `REACT_APP_` (Create React App requirement). They are embedded at build time.

## Setup

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

Never commit `.env.local` — it is gitignored and contains secrets.

## Required variables

| Variable | Description | Example |
|---|---|---|
| `REACT_APP_SUPABASE_URL` | Supabase project URL | `https://jphvkrnwcjfdbxkufjgq.supabase.co` |
| `REACT_APP_SUPABASE_ANON_KEY` | Supabase anon key (public, client-safe) | `eyJhbGci...` |
| `REACT_APP_GEMINI_API_KEY` | Gemini API key for AI chat | `AIza...` |

## Optional variables

| Variable | Description | Example |
|---|---|---|
| `REACT_APP_SITE_URL` | Public site URL | `https://your-site.netlify.app` |
| `REACT_APP_GA_TRACKING_ID` | Google Analytics ID | `UA-XXXXXXXXX-X` |
| `REACT_APP_SENTRY_DSN` | Sentry error tracking DSN | `https://...@sentry.io/...` |
| `PORT` | Dev/production server port | `3000` |

## Validation

`src/data/supabase.js` only creates a Supabase client when both `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` are set. If missing, the app still runs but sign-in is unavailable.

## Deployment

Set these in your hosting dashboard (Netlify/Vercel) under Environment Variables — do not add them to the repository.

- Netlify: Site settings → Environment variables
- Vercel: Project settings → Environment variables

## .env.example

A commit-safe template lives at `.env.example` with placeholder values only.
