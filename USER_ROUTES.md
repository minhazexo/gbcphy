# Department Management System - User Routes

## Overview

`dept-of-physics` is a React educational portal for the Department of Physics, Government Bangla College. It is a single-page application (Create React App) with client-side routing, Bun as the runtime/package manager, and Supabase-backed authentication.

The app serves public department information (home, about, teachers, academic notes/syllabus, class routine), authenticated user areas (profile, edit profile), and an admin console for content and user management.

### How to start

Requires **Bun 1.4.3** (see `.bun-version`). Install dependencies from the committed lockfile:

```bash
bun install
```

Start the Create React App dev server (HMR):

```bash
bun run dev
```

The dev server runs on `http://localhost:3000` by default (`PORT=` and `BROWSER=none` are supported).

Production build and serve:

```bash
bun run build      # output to build/
bun run start      # serve -s build -l 3000
```

Other available scripts: `bun run test`, `bun run lint`, `bun run typecheck`, `bun run format`.

## Authentication

Auth is real (Supabase) but gated: `src/data/supabase.js` only creates a client when both `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` are set; otherwise sign-in is unavailable and the app still runs using local-only stubs.

### Admin credentials

There are **no hardcoded admin credentials** in the codebase. Admin accounts are created through the normal registration flow (`/register`) and then assigned a role in Supabase:

- `super_admin` — full access (all admin pages, user management, role assignment)
- `department_admin` — all admin pages except cross-tenant administrative actions
- `faculty` — can manage content and view dashboard
- `student` — read notes/syllabus/notices, update own profile

Role hierarchy: `super_admin > department_admin > faculty > student`.

Admin pages are protected by `RBACContext` (`hasRole`/`hasPermission`) and the `RoleGuard` component in `src/components/ProtectedRoute/ProtectedRoute.js`. Unauthenticated users are redirected to `/login`; unauthorized users to `/unauthorized`.

Add placeholder env vars to `.env.example` (never commit `.env.local` or secrets).

## Public Pages (No Login Required)

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Landing page with hero section, notices, and quick links |
| `/about` | About | Department and college information |
| `/teachers` | Teachers | Official faculty roster |
| `/scientific` | Scientific | Scientific simulation and visualization links |
| `/academic` | Academic | Notes and syllabus library by year |
| `/class-routine` | ClassRoutine | Class schedule / routine |
| `/login` | Login | Sign in with email/password or student ID |
| `/register` | Register | New account sign-up |
| `/forgot-password` | ForgotPassword | Request a password reset email |
| `/reset-password` | ResetPassword | Set a new password after reset |
| `/email-verification` | EmailVerification | Verify email address after registration |
| `*` | NotFound | 404 page for unknown routes |

## Authenticated Pages (Login Required)

| Route | Page | Description |
|-------|------|-------------|
| `/profile` | Profile | View the signed-in user's own profile |
| `/edit-profile` | EditProfile | Edit own profile and avatar |
| `/unauthorized` | Unauthorized | Access-denied (403) page shown when a user lacks the required role/permission |

## Admin Pages (Super Admin / Department Admin Only)

| Route | Page | Description |
|-------|------|-------------|
| `/admin` | Admin | Content management console: notes, syllabus, notices, faculty roster |
| `/admin/dashboard` | AdminDashboard | Admin statistics and recent student registrations |
| `/admin/students` | StudentManagement | Manage student users |
| `/admin/faculty` | FacultyManagement | Manage faculty users |
| `/admin/approvals` | RegistrationApproval | Approve or reject pending registrations |
| `/admin/content` | ContentManagement | Manage site content |
| `/admin/activity-logs` | ActivityLogs | View activity logs |

Access to admin pages requires the `super_admin` or `department_admin` role (enforced via `RoleGuard`/`RBACContext`).

## Error Pages

| Route | Page | Description |
|-------|------|-------------|
| `/unauthorized` | Unauthorized | 403 Forbidden — user is authenticated but lacks the required role/permission |
| `*` | NotFound | 404 Not Found — route does not exist |

## Quick Navigation Summary

1. `/` — Home (public landing page)
2. `/academic` — Notes and syllabus library
3. `/teachers` — Faculty roster
4. `/class-routine` — Class schedule
5. `/login` — Sign in
6. `/register` — Create an account
7. `/profile` — View/edit your profile (login required)
8. `/admin/dashboard` — Admin dashboard (super admin / department admin only)
9. `/admin/students` — Manage students (admin only)
10. `/admin/approvals` — Review registrations (admin only)
11. `/unauthorized` — 403 access denied
12. `*` — 404 not found

