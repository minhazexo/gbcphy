# Authentication (Supabase)

Auth is real (Supabase) but gated on environment variables.

## Setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local`.
3. Set `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` from your project's API settings.
4. Restart the dev server.

## Gating behavior

`src/data/supabase.js` only creates a Supabase client when both env vars are present:

- **Configured**: sign-in, sign-up, session persistence, profile updates work.
- **Not configured**: `supabase` is `null`; sign-in is unavailable, but the rest of the app still runs.

## Module responsibilities

| File | Role |
|---|---|
| `data/supabase.js` | Creates `createClient`; exports `isSupabaseConfigured` |
| `data/session.js` | `signIn`, `signUp`, `signOut`, `getInitialSession`, `subscribeToSession`, `updateProfileAndSave` |
| `context/AuthContext.js` | React adapter: `login`, `register`, `logout`, `updateUserProfile`, `useAuth`, `useUser` |

## Pages

- `/login` — email/password sign-in → `/profile`
- `/register` — sign-up (may require email confirmation)
- `/profile` — view/update profile, logout (requires auth)
- `/admin` — content dashboard

## Error handling

All Supabase calls are wrapped in try/catch. Errors are logged via `console.error` and shown to the user.
