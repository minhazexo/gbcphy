# Department of Physics — Government Bangla College

[![CI](https://github.com/minhazexo/gbcphy/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/minhazexo/gbcphy/actions/workflows/ci.yml)
[![Live website](https://img.shields.io/badge/Live-Website-2563eb)](https://gbcphy.vercel.app/)
[![Bun](https://img.shields.io/badge/runtime-Bun-f9f1e1?logo=bun&logoColor=000)](https://bun.sh/)
[![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

A responsive academic portal and department management application for the **Department of Physics, Government Bangla College, Dhaka**. It brings department information, academic resources, faculty details, student access, and administrative tools together in one web application.

**Live:** https://gbcphy.vercel.app/  
**Source:** https://github.com/minhazexo/gbcphy

## Highlights

- Department information, faculty directory, academic resources, and class routine.
- Student registration, sign-in, email verification, password recovery, and profile pages.
- Role-aware protected pages and administration interfaces.
- Student and faculty management, registration approvals, content management, and activity logs.
- Scientific learning tools and interactive experiences.
- Supabase integration for authentication, database access, and file storage.
- Responsive interface with reusable components and separate public, authentication, and admin layouts.

> Feature availability that depends on Supabase requires valid project configuration and the matching database migrations. The application can still start in demo mode when Supabase is not configured.

## Technology

| Area | Technology |
|---|---|
| Runtime / package manager | Bun 1.4.3 |
| UI | React 19, TypeScript |
| Routing | React Router 7 |
| Build | Vite 8 |
| Styling | SCSS |
| Backend services | Supabase Auth, PostgreSQL, Storage |
| UI utilities | Framer Motion, React Icons |
| Quality checks | ESLint, TypeScript, Bun test, Prettier |
| Hosting | Vercel |

## Project structure

The source uses a feature-oriented structure. Keep new functionality close to its feature and share reusable logic through components, hooks, and services.

```text
.
├── .github/workflows/       # CI checks
├── public/                  # Static assets, images, PDFs, manifest
├── src/
│   ├── app/                 # App entry and route composition
│   ├── components/          # Shared and admin UI components
│   ├── config/              # App and environment configuration
│   ├── context/             # Auth, RBAC, and theme providers
│   ├── data/                # Department data and content adapters
│   ├── features/             # Feature-specific pages and modules
│   ├── hooks/                # Shared React hooks
│   ├── layouts/              # Main, auth, and admin layouts
│   ├── services/             # Supabase and content services
│   ├── styles/               # Global and design-system styles
│   └── utils/                # Shared helpers and validators
├── supabase/migrations/     # Ordered database migrations
├── AGENTS.md                # Guidance for coding agents
├── ARCHITECTURE.md          # Architecture notes
├── package.json
├── bun.lock
├── vite.config.js
└── vercel.json
```

## Requirements

- [Bun](https://bun.sh/) **1.4.3** (version is pinned in `.bun-version`)
- Node.js **20.19 or newer** when required by local tooling
- A Supabase project for authentication, database, and storage features

## Getting started

```bash
git clone https://github.com/minhazexo/gbcphy.git
cd gbcphy

bun install
cp .env.example .env.local
```

Add the environment values described below, then start the development server:

```bash
bun run dev
```

Vite starts at **http://localhost:3000**.

### Environment variables

Create `.env.local` from `.env.example`.

| Variable | Required | Purpose |
|---|---:|---|
| `VITE_SUPABASE_URL` | For Supabase features | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | For Supabase features | Supabase publishable/anon key |
| `VITE_GEMINI_API_KEY` | Optional | AI assistant integration, if enabled |
| `VITE_SITE_URL` | Optional | Public website URL |

Legacy `REACT_APP_*` aliases are supported for the Supabase URL/key and site URL to keep older configuration working. Restart the dev server after changing environment values.

**Important:** Vite variables are embedded in browser assets at build time. Never put a Supabase service-role key, database password, or any other server secret in a `VITE_*` variable. A browser-exposed AI provider key is also visible to visitors; use a server-side proxy if it must remain confidential.

## Available commands

| Command | Description |
|---|---|
| `bun install --frozen-lockfile` | Reproducible dependency installation |
| `bun run dev` | Start Vite development server |
| `bun run build` | Create the production build in `build/` |
| `bun run start` | Preview the production build on port 3000 |
| `bun run preview` | Alias for production preview |
| `bun run lint` | Run ESLint |
| `bun run typecheck` | Run TypeScript checks |
| `bun run test` | Run the Bun test suite |
| `bun run format` | Format source files with Prettier |

Before submitting changes, run:

```bash
bun run lint
bun run typecheck
bun run test
bun run build
```

The GitHub Actions workflow runs the same four verification steps for pushes and pull requests targeting `master` or `main`.

## Supabase setup

1. Create a Supabase project.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`.
3. Review and apply the SQL files in `supabase/migrations/` in numeric order (currently `001` through `010`).
4. Configure the Supabase Auth Site URL and allowed redirect URLs for localhost and `https://gbcphy.vercel.app`.
5. Verify table policies and Storage bucket policies in the Supabase dashboard before enabling real user accounts.

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for the setup checklist. Always review migrations and RLS policies against the actual Supabase project before applying changes to production.

## Deployment (Vercel)

The repository includes `vercel.json` with the Vite build settings and SPA fallback.

1. Import this repository into Vercel.
2. Set the project environment variables for the Production and Preview environments.
3. Use the committed configuration:
   - Install: `bun install --frozen-lockfile`
   - Build: `bun run build`
   - Output directory: `build`
4. Deploy and verify the public pages, a nested route refresh, and any Supabase-dependent flows.

For Supabase authentication, add `https://gbcphy.vercel.app` to the project's Site URL / Redirect URLs. A successful static build does not by itself verify external Supabase credentials, database policies, or email delivery.

## Quality and security

- Keep `bun.lock` committed and regenerate it with Bun after dependency changes.
- Do not commit `.env.local`, service-role keys, database credentials, or personal access tokens.
- Keep authorization enforced by Supabase Row Level Security; frontend route guards are not a substitute for database policies.
- Never authorize users from `auth.users.raw_user_meta_data` / JWT `user_metadata`; users can edit it. Use database-backed roles through the private RLS helper in migration 010.
- Migration 010 blocks self-assigned profile and `user_roles` privileges while preserving administrator role assignment for other users.
- Review the public-read policy on `public.students` before exposing production data. It currently permits anonymous access to every student row and all granted columns, including identifiers. Use a safe, column-limited public view instead if a public directory is required.
- Add tests for new user flows and regression fixes.
- Avoid changing existing academic resource URLs or public routes without checking their consumers.

See [CONTRIBUTING.md](./CONTRIBUTING.md) and [SECURITY.md](./SECURITY.md).

## License

This project is licensed under the [ISC License](./LICENSE).


## Cloudflare R2 Storage Manager

The Admin Panel includes a protected `/admin/storage` interface backed by the separate `gbcphy-r2-worker/` Cloudflare Worker project. `super_admin`, `department_admin`, and legacy `admin` accounts receive full control of every object in the existing `gbc-physics-pdfs` bucket: browse, preview, download, upload, replace, rename, move, delete, search, and folder creation. Faculty and students cannot call the Worker management API.

Apply and verify Supabase migration `010_prevent_profile_role_escalation.sql` before enabling the Worker. It replaces user-editable metadata-based admin RLS checks with database-backed role checks, prevents self-escalation through both `profiles` and `user_roles`, and keeps the `department_admin` role valid. Keep `STORAGE_ROLE_SOURCE_VERIFIED=false` until the migration is live and the role lookup has been verified. See [gbcphy-r2-worker/README.md](./gbcphy-r2-worker/README.md) for setup, API details, security gates, and rollback. The Worker is source-only and is **not deployed** by this repository change.
