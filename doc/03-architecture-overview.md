# Architecture Overview

Single-page React app (Create React App) with client-side routing.

## Stack

- Runtime / package manager: Bun 1.4.3
- Frontend: React 19, React Router v7
- Styling: SCSS
- Build: `react-scripts` (CRA), output to `build/`
- Auth: Supabase (`@supabase/supabase-js`)
- AI: Google Generative AI (Gemini 1.5 Flash), lazy-loaded
- Animation: Framer Motion
- Icons: React Icons, Font Awesome
- 3D: three.js
- Test: Bun test + @testing-library/react + jsdom
- Lint: ESLint 9 flat config
- Format: Prettier
- Type check: TypeScript (`tsc --noEmit`)

## Directory layout

```
src/
  index.js            # React 18 createRoot entry
  App.js              # Routes + ThemeProvider + AuthProvider
  api.js              # Mock API stub (local-only)
  testSetupDom.js     # jsdom shim for Bun tests
  context/
    ThemeContext.js   # dark/light theme
    AuthContext.js    # Supabase auth adapter
  data/
    supabase.js       # createClient (gated on env vars)
    session.js        # signIn/signUp/signOut/getInitialSession
    contentStore.js   # localStorage notes/syllabus/notices
    department.js     # canonical department facts
    teachers.js       # FACULTY roster
  components/
    Layout/           # Header, Footer, Layout
    Home/             # Hero, Body
    AI/               # AIChat (Gemini)
    Scientific/       # ParticleBackground
  pages/
    Home, About, Academic, Teachers, ClassRoutine, NotFound
    Login, Register, Profile, EditProfile, ProfileImageUpload
    Admin/            # content dashboard
    Academic/Notes/   # Notes, NoteCard
  styles/             # per-page SCSS
  utils/              # gemini.js (lazy), folderStructure.js
public/               # static assets, index.html, _redirects, PDFs
```

## Data flow

- **Auth**: Pages call `useAuth()` → `AuthContext` → `data/session.js` → Supabase. Gated: if env vars missing, auth is unavailable but the app runs.
- **Content**: Admin edits persist in `localStorage` via `data/contentStore.js`. Public pages read from the same store.
- **API**: `src/api.js` is a local-only mock stub. No backend required for core features.

## Routing

`BrowserRouter` with `Routes`. Admin/auth routes (`/admin`, `/login`, `/register`, `/profile`) sit outside `Layout`; public routes are nested under `Layout`.
