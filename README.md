# Department of Physics - Government Bangla College

A Bun-powered React educational website and department management system for the Department of Physics at Government Bangla College. The portal serves students, faculty, and visitors with department programs, facilities, academic notes/syllabus, class routines, faculty roster, interactive scientific tools, games (chess, snake, flappy bird), an AI chat assistant, and full role-based authentication and administration via Supabase.

The management system adds real Supabase Auth, Role-Based Access Control (RBAC), user profiles with avatar uploads, an admin dashboard, student/registration management, faculty management, content management (announcements, notices, events), activity logging, and Supabase Storage-backed file assets — all protected by Row Level Security (RLS) policies.

## Architecture

The codebase follows a **professional feature-based architecture** for maintainability and scalability. See `ARCHITECTURE.md` for the complete folder structure and `AGENTS.md` for AI coding agent instructions.

```
src/
  app/              # Application wiring (App.js, routes, providers)
  components/       # Reusable UI components (common + admin)
  layouts/          # Page shell layouts (MainLayout, AuthLayout, AdminLayout)
  features/         # Feature-based modules (auth, home, faculty, students, academic, admin, …)
  hooks/            # Shared React hooks (useAuth, useTheme, usePermissions)
  services/         # Business logic (Supabase auth, storage, content API)
  context/          # React context (AuthContext, ThemeContext, RBACContext)
  config/           # Centralized configuration (environment, app.config)
  styles/           # Global & shared SCSS
  utils/            # Pure helpers (validators, formatters, helpers)
  data/             # Canonical data & local storage (legacy Supabase modules)
  index.js          # React entry point
```

### Key Locations

| What to modify           | Location                                    |
|--------------------------|---------------------------------------------|
| Header (public)          | `src/layouts/MainLayout/Header.js`          |
| Navbar (public)          | `src/layouts/MainLayout/Navbar.js`          |
| Footer (public)          | `src/layouts/MainLayout/Footer.js`          |
| Homepage                 | `src/features/home/pages/Home.js`           |
| About page               | `src/features/about/pages/About.js`         |
| Teachers / Faculty       | `src/features/faculty/pages/TeacherDirectory.js` |
| Academic page            | `src/features/academic/pages/Academic.js`   |
| Class Routine            | `src/features/academic/pages/ClassRoutine.js` |
| Scientific tools         | `src/features/scientific/pages/Scientific.js` |
| Login                    | `src/features/authentication/pages/Login.js` |
| Register                 | `src/features/authentication/pages/Register.js` |
| Profile                  | `src/features/profile/pages/Profile.js`     |
| Edit Profile             | `src/features/profile/pages/EditProfile.js` |
| Settings                 | `src/features/settings/pages/Settings.js`   |
| Admin Dashboard          | `src/features/admin/pages/AdminDashboard.js` |
| Student Management       | `src/features/students/pages/StudentManagement.js` |
| Faculty Management       | `src/features/faculty/pages/FacultyManagement.js` |
| Registration Approvals   | `src/features/admin/pages/RegistrationApprovals.js` |
| Content Management       | `src/features/admin/pages/ContentManagement.js` |
| Activity Logs            | `src/features/admin/pages/ActivityLogs.js`   |
| Supabase client          | `src/services/supabase/client.js`           |
| Auth service             | `src/services/supabase/auth.service.js`     |
| Storage service          | `src/services/supabase/storage.service.js`  |
| Content service          | `src/services/api/content.service.js`       |
| Routing                  | `src/app/routes/AppRoutes.js`               |
| RBAC / permissions       | `src/context/RBACContext.js`                |
| Theme                    | `src/context/ThemeContext.js`               |

## Technology Stack

- **Runtime & package manager**: Bun 1.4.3
- **Frontend**: React 19, React Router v7
- **Styling**: SCSS (via sass)
- **Build tool**: Vite 7 (`@vitejs/plugin-react`), static output in `build/`
- **Authentication**: Supabase Auth (Supabase JS client)
- **Database**: Supabase (PostgreSQL) — 6 managed migrations (schema, content, activity logs, RLS policies, indexes/constraints, storage buckets)
- **Storage**: Supabase Storage (profile images, faculty images, department assets, notice attachments)
- **AI**: Google Generative AI (Gemini 1.5 Flash), lazy-loaded
- **Animations**: Framer Motion
- **Icons**: React Icons, Font Awesome
- **3D**: three.js
- **HTTP client**: axios
- **Testing**: Bun test + @testing-library/react + @testing-library/jest-dom + jsdom
- **Linting**: ESLint 9 (flat config) + Prettier
- **Type checking**: TypeScript (tsc --noEmit)
- **Deployment**: Vercel (primary, `vercel.json` included) or any static host

## Features

- **Department portal**: home, about, teachers, academic, class routine, scientific tools, games
- **Authentication**: email/password sign-in, sign-up with email confirmation, forgot/reset password, resend confirmation, student-ID-based login
- **Role-Based Access Control (RBAC)**: role hierarchy super_admin > department_admin > faculty > student with granular permissions
- **User profiles**: profile view/edit, avatar upload via Supabase Storage, role-based data access
- **Admin dashboard**: overview stats, recent registrations, quick actions
- **Student management**: view all student records, filter/search, registration status lifecycle
- **Registration approval**: approve/reject pending student registrations
- **Faculty management**: view and manage faculty records
- **Content management**: announcements, notices, events — create, edit, publish/unpublish, archive
- **Activity logs**: audit trail of admin actions
- **Unauthorized access page**: RBAC denial handling
- **AI chat assistant**: Gemini 1.5 Flash, lazy-loaded

## Prerequisites

- [Bun](https://bun.sh) >= 1.4.0 (installs bun.lock and runs all scripts)
- Node.js >= 20.19 (Vite 7 requirement; Bun still runs all scripts)
- A [Supabase](https://supabase.com) project (for auth, database, and storage)

Install Bun:

curl -fsSL https://bun.sh/install | bash

powershell -c "iwr https://bun.sh/install.ps1 -useb | iex"

bun --version

## Installation

git clone <repository-url>
cd dept-of-physics

bun install

cp .env.example .env.local

## Environment Setup

Create .env.local from .env.example. Required variables:

| Variable | Purpose | Required |
|---|---|---|
| VITE_SUPABASE_URL | Supabase project URL (public) | Yes |
| VITE_SUPABASE_ANON_KEY | Supabase anon key (public, client-side) | Yes |
| VITE_GEMINI_API_KEY | Gemini API key for the AI chat | No |
| VITE_SITE_URL | Public site URL | No |
| VITE_GA_TRACKING_ID | Google Analytics tracking ID | No |
| VITE_SENTRY_DSN | Sentry DSN for error tracking | No |

The legacy `REACT_APP_*` names still work (both prefixes are enabled in `vite.config.js`), but new deployments should use `VITE_*`. Vite inlines these values at build time, so they must be set wherever the build runs — `.env.local` locally, project environment variables on Vercel — and changing them requires a redeploy.

## Database Setup

The project includes 6 Supabase migrations under supabase/migrations/. Run them in order against your Supabase project (via the Supabase SQL Editor or the Supabase CLI):

1. 001_initial_schema.sql — departments, profiles, students, faculty, user_roles tables + RLS enabled
2. 002_content_tables.sql — announcements, notices, events tables
3. 003_activity_logs.sql — activity_logs audit table
4. 004_rls_policies.sql — Row Level Security policies for all tables
5. 005_indexes_constraints.sql — indexes and CHECK constraints
6. 006_storage_buckets.sql — Storage buckets (profile-images, faculty-images, department-assets, notice-attachments) + storage policies

After running migrations, seed at least one admin user:
- Create a user via Supabase Auth (sign-up) or the Supabase Dashboard
- Insert a row into public.user_roles with role = 'admin' for that user's user_id
- Insert a matching row into public.profiles with role = 'admin'

## Development Commands

| Command | Description |
|---|---|
| bun install | Install dependencies (Bun) |
| bun run dev | Start the Vite dev server with HMR on port 3000 |
| bun run build | Production build to build/ |
| bun run start | Preview the production build (vite preview) |
| bun run preview | Same as start |
| bun run test | Run Bun test suite |
| bun run lint | Run ESLint over src/ |
| bun run typecheck | Run tsc --noEmit |
| bun run format | Format source with Prettier |

Hot Module Replacement is provided by Vite (`bun run dev`).

## Build Instructions

bun run build

Output: build/ (static, ready for Vercel/Netlify/any static host)

The build is configured in `vite.config.js`: hashed assets under `assets/`, `build.sourcemap` disabled, and the `.js`-contains-JSX handling needed by this codebase. Source maps are not required for a static deployment.

## Testing Instructions

bun test

Tests run under Bun's Jest-compatible test runner with a jsdom DOM shim (src/testSetupDom.js) so React components mount correctly.

## Production Deployment

The app is a static site: `bun run build` emits `build/` containing `index.html`, hashed files under `assets/`, and everything copied from `public/`. `vercel.json` at the repo root is the complete Vercel configuration.

### Vercel (primary)

1. Import the GitHub repo at <https://vercel.com/new>. The committed `vercel.json` supplies the settings, so no dashboard build overrides are needed:

   | Setting | Value |
   |---|---|
   | Framework preset | Vite |
   | Install command | `bun install --frozen-lockfile` |
   | Build command | `bun run build` |
   | Output directory | `build` |

2. Add environment variables under **Project → Settings → Environment Variables** for Production, Preview, and Development:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GEMINI_API_KEY` (optional — AI chat is hidden/disabled without it)
   - `VITE_SITE_URL` (optional, e.g. `https://<project>.vercel.app`)

3. Deploy. Client-side routing works on refresh because `rewrites` maps every non-file path to `/index.html`; hashed assets are served with immutable caching while `index.html` is always revalidated, so new deploys appear immediately.

4. Add the production domain to Supabase **Authentication → URL Configuration** (Site URL plus Redirect URLs, e.g. `https://<project>.vercel.app/*`). Without this, email confirmation and password-reset links redirect to the wrong host. See `SUPABASE_SETUP.md` §1.3.

5. Optional: attach a custom domain in Vercel, then update `VITE_SITE_URL` and the canonical/OG URLs in `index.html`.

### Netlify (legacy)

Build command: `bun run build` — Publish directory: `build`. Set the same `VITE_*` variables in **Site settings → Environment variables**. `public/_redirects` provides the SPA fallback; Vercel ignores that file and uses the rewrite rule instead.

### Docker / any static host

A Dockerfile is not included by default; the static `build/` can be served by any HTTP server (nginx, Caddy, `vite preview`).

Example one-off production serve:
bun run build
bun run start   # vite preview on port 3000

## Security

- **Row Level Security (RLS)**: enabled on all database tables (departments, profiles, students, faculty, user_roles, announcements, notices, events, activity_logs). Users can read/update only their own records; admins (via user_roles.role = 'admin') can manage all records. Published content is readable by anonymous and authenticated users.
- **Storage policies**: four private buckets (profile-images, faculty-images, department-assets, notice-attachments). Authenticated users can read profile/faculty images and department assets; users can manage their own uploads; admins manage all department assets and notice attachments.
- **Auth**: Supabase Auth handles sessions, email confirmations, password resets, and token refresh. The app degrades gracefully when Supabase env vars are missing (auth unavailable, core features still run).
- **RBAC**: frontend role/permission checks in RBACContext.js gate admin routes; server-side RLS enforces the same boundaries at the database level.
- **Secrets**: never commit .env.local or real API keys; all client-facing values are public anon keys only.

## Troubleshooting

bun install fails / lockfile mismatch
rm -rf node_modules bun.lock
bun install

Build fails with JSX syntax errors from the dependency scan
`.js` files contain JSX. `vite.config.js` sets the JSX loader for both the normal transform and `optimizeDeps` (the scanner uses its own esbuild options). Keep both blocks in sync.

Tests fail with document is not defined
Tests load src/testSetupDom.js (jsdom shim) before @testing-library/react. Ensure jsdom is installed (bun install).

Sass deprecation warnings
The SCSS still uses `@import` and mixed declarations. Both are silenced in `vite.config.js` (`silenceDeprecations`) because Dart Sass 3.0 removes them; migrate to `@use` before that major bump.

Environment variables not showing
Vite inlines `VITE_*` (and legacy `REACT_APP_*`) at build time. Restart the dev server after editing `.env.local`; on Vercel, changing a variable requires a redeploy.

Supabase not configured
If `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (or the `REACT_APP_*` aliases) are missing, sign-in and database features are unavailable but the app still runs. Admin dashboard and registration approval require Supabase.

## License

ISC - educational purposes.