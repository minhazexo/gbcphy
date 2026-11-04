# ARCHITECTURE.md

# Department of Physics — Codebase Architecture

This document describes the professional, feature-based architecture of the
Department of Physics (Govt. Bangla College) website. It is intended for
developers and AI coding agents who need to understand where everything belongs.

---

## 1. Project Identity

- **Name**: `dept-of-physics`
- **Runtime / package manager**: Bun 1.4.3 (lockfile: `bun.lock`)
- **Build tool**: Vite 7 (`vite.config.js`)
- **Entry**: `src/index.js` → `src/app/App.js` → `public/index.html`
- **Build output**: `build/` (static)
- **Production serve**: `bun run start` (vite preview on port 3000)
- **React**: 19 with automatic JSX runtime
- **Router**: React Router v7 (BrowserRouter)
- **Auth**: Supabase Auth (gated — degrades gracefully when env vars missing)
- **Styling**: SCSS (via sass), colocated with components
- **Testing**: Bun test (Jest-compatible, jsdom shim)

---

## 2. Top-Level Folder Structure

```
src/
├── app/                # Application wiring (routes, providers, App root)
│   ├── App.js          # Root component: BrowserRouter + Routes
│   ├── routes/
│   │   ├── AppRoutes.js      # All route definitions (auth, protected, public)
│   │   ├── PublicRoutes.js   # Public pages (MainLayout)
│   │   ├── ProtectedRoutes.js# Admin pages (AdminLayout + ProtectedRoute)
│   │   └── AuthRoutes.js     # Auth pages (AuthLayout)
│   └── providers/          # (reserved for future provider composition)
│
├── assets/             # (reserved for images, icons, fonts)
│
├── components/         # Reusable, layout-independent UI components
│   ├── common/         # App-wide primitives (Button, Modal, Toast, …)
│   │   ├── Button/
│   │   ├── Modal/
│   │   ├── Toast/
│   │   ├── Loader/
│   │   ├── EmptyState/
│   │   ├── Avatar/
│   │   ├── Badge/
│   │   ├── Card/
│   │   ├── DataTable/
│   │   └── Separator.js
│   └── admin/          # Admin-specific UI (DataTable, Button, Input, …)
│       ├── data-table/
│       └── ui/
│
├── layouts/            # Page shell layouts
│   ├── MainLayout/     # Public website: Header + Footer + content
│   │   ├── MainLayout.js
│   │   ├── Header.js
│   │   ├── Navbar.js
│   │   └── Footer.js
│   ├── AuthLayout/     # Auth pages: centered card, no nav
│   │   └── AuthLayout.js
│   └── AdminLayout/    # Admin dashboard: Sidebar + TopNavbar + content
│       ├── AdminLayout.js
│       ├── AdminSidebar.js
│       ├── TopNavbar.js
│       └── AdminLayout.scss
│
├── features/           # Feature-based modules (pages + components + services)
│   ├── authentication/ # Login, Register, ForgotPassword, ResetPassword, EmailVerification
│   ├── home/           # Home page
│   ├── about/          # About page (developer portfolio)
│   ├── faculty/        # TeacherDirectory, FacultyManagement
│   ├── students/       # StudentManagement
│   ├── academic/       # Academic, ClassRoutine, Notes, NoteCard
│   ├── announcements/  # (reserved)
│   ├── profile/        # Profile, EditProfile
│   ├── settings/       # Settings
│   ├── scientific/     # Scientific tools
│   └── admin/          # AdminDashboard, AdminHome, ContentManagement, ActivityLogs, RegistrationApprovals
│
├── hooks/              # Shared React hooks
│   ├── useAuth.js
│   ├── useTheme.js
│   └── usePermissions.js
│
├── services/           # Business logic & external integrations
│   ├── supabase/
│   │   ├── client.js         # Supabase client singleton
│   │   ├── auth.service.js   # signIn, signUp, signOut, resetPassword, …
│   │   └── storage.service.js# uploadProfileImage, …
│   └── api/
│       └── content.service.js# notes, syllabus, notices, downloads, favorites
│
├── context/            # React context providers
│   ├── AuthContext.js    # Supabase auth state (login/register/logout/profile)
│   ├── ThemeContext.js   # dark/light theme (localStorage + matchMedia)
│   └── RBACContext.js    # role-based access control
│
├── config/             # Centralized configuration
│   ├── environment.js    # env var parsing (VITE_* / REACT_APP_*)
│   └── app.config.js     # app constants, routes, roles, years
│
├── styles/             # Global & shared SCSS
│   ├── globals.scss
│   ├── variables.scss
│   ├── mixins.scss
│   ├── utilities.scss
│   └── *.scss (page/component-specific)
│
├── utils/              # Pure helper functions
│   ├── validators.js     # form validation rules
│   ├── formatters.js     # date, currency, display formatting
│   └── helpers.js        # debounce, clone, localStorage, id generation
│
├── data/               # Canonical data & local storage
│   ├── supabase.js       # (legacy) Supabase client
│   ├── session.js        # (legacy) Supabase session helpers
│   ├── db.js             # (legacy) Supabase data access
│   ├── contentStore.js   # localStorage-backed notes/syllabus/notices
│   ├── department.js     # canonical department/college/university facts
│   └── teachers.js       # FACULTY roster
│
├── index.js            # React 18 createRoot entry
├── App.test.js         # Bun test (jsdom-mounted App render)
└── testSetupDom.js     # jsdom DOM shim for Bun tests
```

---

## 3. Where to Find What

| What to modify                  | Location                                                        |
|---------------------------------|-----------------------------------------------------------------|
| **Header** (public website)     | `src/layouts/MainLayout/Header.js` + `Header.scss`             |
| **Navbar** (public website)     | `src/layouts/MainLayout/Navbar.js`                             |
| **Footer** (public website)     | `src/layouts/MainLayout/Footer.js` + `Footer.scss`             |
| **Homepage**                    | `src/features/home/pages/Home.js`                              |
| **About page**                  | `src/features/about/pages/About.js`                            |
| **Teachers / Faculty directory**| `src/features/faculty/pages/TeacherDirectory.js`               |
| **Academic page**               | `src/features/academic/pages/Academic.js`                      |
| **Class Routine**               | `src/features/academic/pages/ClassRoutine.js`                  |
| **Scientific tools**            | `src/features/scientific/pages/Scientific.js`                  |
| **Login**                       | `src/features/authentication/pages/Login.js`                   |
| **Register**                    | `src/features/authentication/pages/Register.js`                |
| **Forgot Password**             | `src/features/authentication/pages/ForgotPassword.js`          |
| **Reset Password**              | `src/features/authentication/pages/ResetPassword.js`           |
| **Email Verification**          | `src/features/authentication/pages/EmailVerification.js`       |
| **Profile**                     | `src/features/profile/pages/Profile.js`                        |
| **Edit Profile**                | `src/features/profile/pages/EditProfile.js`                    |
| **Settings**                    | `src/features/settings/pages/Settings.js`                      |
| **Admin Dashboard**             | `src/features/admin/pages/AdminDashboard.js`                   |
| **Student Management**          | `src/features/students/pages/StudentManagement.js`             |
| **Faculty Management**          | `src/features/faculty/pages/FacultyManagement.js`              |
| **Registration Approvals**      | `src/features/admin/pages/RegistrationApprovals.js`            |
| **Content Management**          | `src/features/admin/pages/ContentManagement.js`                |
| **Activity Logs**               | `src/features/admin/pages/ActivityLogs.js`                     |
| **Admin Home**                  | `src/features/admin/pages/AdminHome.js`                        |
| **Supabase client**             | `src/services/supabase/client.js`                              |
| **Auth service**                | `src/services/supabase/auth.service.js`                        |
| **Storage service**             | `src/services/supabase/storage.service.js`                     |
| **Content service**             | `src/services/api/content.service.js`                          |
| **RBAC / permissions**          | `src/context/RBACContext.js`                                   |
| **Auth context**                | `src/context/AuthContext.js`                                   |
| **Theme context**               | `src/context/ThemeContext.js`                                  |
| **Routing**                     | `src/app/routes/AppRoutes.js`                                  |
| **Global styles**               | `src/styles/` (variables, mixins, utilities, page scss)        |
| **Common UI components**        | `src/components/common/`                                       |

---

## 4. Routing

Routes are defined in `src/app/routes/AppRoutes.js` and split into three groups:

1. **AuthRoutes** — `/login`, `/register`, `/forgot-password`, `/reset-password`, `/email-verification`, `/unauthorized`. Wrapped in `AuthLayout`.
2. **ProtectedRoutes** — `/admin/dashboard`, `/admin/students`, `/admin/faculty`, `/admin/approvals`, `/admin/content`, `/admin/activity-logs`, `/admin/settings`. Wrapped in `AdminLayout` + `ProtectedRoute` (role/permission guards).
3. **PublicRoutes** — `/`, `/about`, `/teachers`, `/academic`, `/class-routine`, `/scientific`, `*` (404). Wrapped in `MainLayout`.

`ProtectedRoute` (`src/components/ProtectedRoute/ProtectedRoute.js`) checks:
- Authentication (redirect to `/login` if not signed in)
- Role hierarchy (`requiredRole`, e.g. `department_admin`, `super_admin`)
- Permissions (`requiredPermission`, checked via `RBACContext.hasPermission`)

---

## 5. Component Communication

- **Context**: `AuthContext`, `ThemeContext`, `RBACContext` provide global state. Components consume via `useAuth()`, `useTheme()`, `useRBAC()`.
- **Hooks**: `src/hooks/` exports thin wrappers (`useAuthHook`, `useThemeHook`, `usePermissions`) for components that don't want to import context directly.
- **Services**: `src/services/` contains all Supabase and business logic. UI components call services/hooks, never Supabase directly.
- **Data flow**: Page → Hook → Service → Supabase/localStorage → Service → Hook → Page.

---

## 6. How to Add a New Page

1. Create the page component in the appropriate `src/features/<feature>/pages/` folder.
2. Create any page-specific styles in `src/styles/<page>.scss` or colocated with the page.
3. Add the route in `src/app/routes/AppRoutes.js` (or the appropriate `*Routes.js` file).
4. If the page needs data, create a service in `src/services/` or use an existing one.
5. If the page needs auth/RBAC, wrap it with `ProtectedRoute` and specify `requiredRole` or `requiredPermission`.

---

## 7. How to Add a New Component

1. Create the component in `src/components/common/<Component>/` with:
   - `<Component>.js` (default export + named export)
   - `<Component>.scss`
   - `index.js` (re-exports)
2. Import and use it in any page or layout.

---

## 8. How to Add a New Feature

1. Create `src/features/<feature>/` with subfolders: `pages/`, `components/`, `services/`, `hooks/`, `styles/`.
2. Add pages under `pages/`.
3. Add the route in `src/app/routes/AppRoutes.js`.
4. Add shared services under `services/` if they cross feature boundaries.

---

## 9. How to Modify Layouts

- **MainLayout** (`src/layouts/MainLayout/`): Edit `Header.js`, `Navbar.js`, `Footer.js`, or `MainLayout.js`/`MainLayout.scss`.
- **AuthLayout** (`src/layouts/AuthLayout/`): Edit `AuthLayout.js`/`AuthLayout.scss`. Used by all auth pages.
- **AdminLayout** (`src/layouts/AdminLayout/`): Edit `AdminLayout.js`, `AdminSidebar.js`, `TopNavbar.js`, or `AdminLayout.scss`. Used by all admin routes.

---

## 10. Supabase & Business Logic

- `src/services/supabase/client.js` — singleton client, created only when env vars are set.
- `src/services/supabase/auth.service.js` — all auth operations (signIn, signUp, signOut, resetPassword, etc.).
- `src/services/supabase/storage.service.js` — file uploads (profile images).
- `src/services/api/content.service.js` — localStorage-backed notes/syllabus/notices/downloads/favorites.
- UI components must call services/hooks, never `supabase` directly.

---

## 11. Environment Configuration

- `src/config/environment.js` — parses `VITE_*` and legacy `REACT_APP_*` vars.
- `src/config/app.config.js` — app constants, route names, role hierarchy, years.
- Env vars must be set in `.env.local` (local) or Vercel project settings (production).
- Required: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- Optional: `VITE_GEMINI_API_KEY`, `VITE_SITE_URL`.

---

## 12. Bun Environment

- Lockfile: `bun.lock` (committed, do not hand-edit)
- `.bun-version`: `1.4.3`
- `bunfig.toml`: install/run/test configuration
- Scripts:
  - `bun install` — install dependencies
  - `bun run dev` — Vite dev server (port 3000)
  - `bun run build` — production build to `build/`
  - `bun run start` / `bun run preview` — serve production build
  - `bun run test` — Bun test runner
  - `bun run lint` — ESLint 9 flat config
  - `bun run typecheck` — `tsc --noEmit`
  - `bun run format` — Prettier

---

## 13. Testing

- Runner: Bun test (`bun test`)
- DOM shim: `src/testSetupDom.js` (jsdom)
- Tests placed next to source as `*.test.js` / `*.test.jsx`
- Wrap state updates in `act(...)` when testing interactive components

---

## 14. Safety Rules

1. Never delete files without checking their usage.
2. Never remove existing features.
3. Never break existing routes.
4. Never break Supabase authentication.
5. Never change database schemas unnecessarily.
6. Never break Admin Dashboard functionality.
7. Never break responsive layouts.
8. Never break existing image or asset paths.
9. Update all imports after moving files.
10. Preserve environment configurations.
11. Avoid unnecessary dependency installations.
12. Do not leave duplicate implementations.

---

## 15. Verified Commands

- `bun install` — installs from `bun.lock`
- `bun run lint` — 0 errors (legacy warnings only)
- `bun run typecheck` — exit 0
- `bun run test` — 1 pass
- `bun run build` — `build/` compiled successfully
- `bun run start` — production preview on port 3000
- `bun run dev` — Vite dev server with HMR
