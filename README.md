# Department of Physics - Government Bangla College

A Bun-powered React educational website and department management system for the Department of Physics at Government Bangla College. The portal serves students, faculty, and visitors with department programs, facilities, academic notes/syllabus, class routines, faculty roster, interactive scientific tools, games (chess, snake, flappy bird), an AI chat assistant, and full role-based authentication and administration via Supabase.

The management system adds real Supabase Auth, Role-Based Access Control (RBAC), user profiles with avatar uploads, an admin dashboard, student/registration management, faculty management, content management (announcements, notices, events), activity logging, and Supabase Storage-backed file assets — all protected by Row Level Security (RLS) policies.

## Technology Stack

- **Runtime & package manager**: Bun 1.4.3
- **Frontend**: React 19, React Router v7
- **Styling**: SCSS (via sass), CSS Modules
- **Build tool**: Create React App (react-scripts), served by `serve` in production
- **Authentication**: Supabase Auth (Supabase JS client)
- **Database**: Supabase (PostgreSQL) — 6 managed migrations (schema, content, activity logs, RLS policies, indexes/constraints, storage buckets)
- **Storage**: Supabase Storage (profile images, faculty images, department assets, notice attachments)
- **AI**: Google Generative AI (Gemini 1.5 Flash), lazy-loaded
- **Animations**: Framer Motion
- **Icons**: React Icons, Font Awesome
- **3D**: three.js
- **HTTP client**: axios
- **Creative coding**: p5
- **Testing**: Bun test + @testing-library/react + @testing-library/jest-dom + jsdom
- **Linting**: ESLint 9 (flat config) + Prettier
- **Type checking**: TypeScript (tsc --noEmit)
- **Deployment**: Netlify / Vercel (static build/ output)

## Features

- **Department portal**: home, about, teachers, academic, class routine, scientific tools, games
- **Authentication**: email/password sign-in, sign-up with email confirmation, forgot/reset password, resend confirmation, student-ID-based login
- **Role-Based Access Control (RBAC)**: role hierarchy super_admin > department_admin > faculty > student with granular permissions (manage students, approve registrations, manage faculty, manage content, view dashboard, edit own profile)
- **User profiles**: profile view/edit, avatar upload via Supabase Storage, role-based data access
- **Admin dashboard**: overview stats (students by status, faculty, admins), recent registrations, quick actions
- **Student management**: view all student records, filter/search, registration status lifecycle (pending/approved/rejected/suspended)
- **Registration approval**: approve/reject pending student registrations with notes/reasons
- **Faculty management**: view and manage faculty records
- **Content management**: announcements, notices, events — create, edit, publish/unpublish, archive
- **Activity logs**: audit trail of admin actions (actor, action, target, metadata)
- **Unauthorized access page**: RBAC denial handling
- **AI chat assistant**: Gemini 1.5 Flash, lazy-loaded
- **Interactive tools & games**: particle background, chess, snake, flappy bird

## Prerequisites

- [Bun](https://bun.sh) >= 1.4.0 (installs bun.lock and runs all scripts)
- Node.js >= 18 (react-scripts still shells out to Node for the CRA build/dev server)
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
| REACT_APP_SUPABASE_URL | Supabase project URL (public) | Yes |
| REACT_APP_SUPABASE_ANON_KEY | Supabase anon key (public, client-side) | Yes |
| REACT_APP_GEMINI_API_KEY | Gemini API key for the AI chat | No |
| REACT_APP_SITE_URL | Public site URL | No |
| REACT_APP_GA_TRACKING_ID | Google Analytics tracking ID | No |
| REACT_APP_SENTRY_DSN | Sentry DSN for error tracking | No |
| PORT | Dev/production server port | No |
| NODE_VERSION | Node version for deployment | No |
| BUN_VERSION | Bun version for deployment | No |

All REACT_APP_* variables are embedded at build time by Create React App. Secrets never leave the build step.

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
| bun run dev | Start CRA dev server with hot reload |
| bun run build | Production build to build/ |
| bun run start | Serve production build/ locally (serve -s build) |
| bun run preview | Same as start (preview production build) |
| bun run test | Run Bun test suite |
| bun run lint | Run ESLint over src/ |
| bun run typecheck | Run tsc --noEmit |
| bun run format | Format source with Prettier |
| bun run eject | Eject from Create React App (irreversible) |

Hot Module Replacement is provided by Create React App's webpack dev server (bun run dev).

## Build Instructions

bun run build

Output: build/ (static, ready for Netlify/Vercel/any static host)

The build disables source maps (GENERATE_SOURCEMAP=false) because the legacy resolve-url-loader in the CRA toolchain is incompatible with newer source-map versions. Source maps are not required for a static deployment.

## Testing Instructions

bun test

Tests run under Bun's Jest-compatible test runner with a jsdom DOM shim (src/testSetupDom.js) so React components mount correctly.

## Production Deployment

The app is a static site (build/). Deploy to any static host:

### Netlify (existing)
Build command: bun run build
Publish directory: build
Set REACT_APP_* environment variables in Netlify Dashboard → Site settings → Environment variables.
_redirects handles client-side routing (/* /index.html 200).

### Vercel (vercel.json already configured)
vercel.json uses bun install / bun run build / bun run dev with build as output directory and SPA rewrite rules plus security headers.

### Docker (optional)
A Dockerfile is not included by default; the static build/ can be served by any HTTP server (e.g. serve, nginx, Caddy).

Example one-off production serve:
bun run build
bun run start   # serve -s build -l 3000

Graceful shutdown: serve handles SIGINT/SIGTERM and exits cleanly.

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

Build fails with resolve-url-loader: aSourceMapConsumer.originalPositionFor is not a function
Already pinned: source-map@^0.6.1 is a devDependency. Reinstall if needed:
bun install
bun run build

Tests fail with document is not defined
Tests load src/testSetupDom.js (jsdom shim) before @testing-library/react. Ensure jsdom is installed (bun install).

bun run dev / bun run build CRA warnings
The babel-preset-react-app private-property warning and caniuse-lite outdated notices are benign CRA toolchain warnings (Create React App is unmaintained). They do not fail the build.

Environment variables not showing
Create React App only reads variables prefixed with REACT_APP_. Restart the dev server after changing .env.local.

Supabase not configured
If REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY are missing, sign-in and database features are unavailable but the app still runs. Admin dashboard and registration approval require Supabase.

## License

ISC - educational purposes.
