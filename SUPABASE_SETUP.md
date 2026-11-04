# Supabase Setup Guide

Setup guide for wiring Supabase Auth, database, and storage into the
**Department of Physics (dept-of-physics)** React portal.

> Runtime/package manager: Bun 1.4.3 (primary). CRA (`react-scripts`) still shells
> out to Node for dev/build. All env vars must be `REACT_APP_*` prefixed.

---

## 1. Supabase Project Setup

Follow these steps to provision a new Supabase project and connect it to the app.

### 1.1 Create the project

1. Sign in to [https://app.supabase.com](https://app.supabase.com).
2. Click **New project**.
3. Choose an organization, enter a project name (e.g. `gbc-physics-portal`), and
   pick a database password. Store the password in your password manager — it is
   the `postgres` superuser password and is **not** used by the frontend.
4. Select a region closest to your users.
5. Wait for provisioning to finish (usually under a minute).

### 1.2 Get the API credentials

1. Open the project → **Settings → API**.
2. Copy:
   - **Project URL** → `https://<project-ref>.supabase.co`
   - **Project API keys → anon public** → `eyJ...` (the `anon` key, not `service_role`)
3. Add both to `.env.local` (see section 2).

### 1.3 Enable and configure Auth

1. Open **Authentication → Settings**.
2. Under **Site URL**, add your production URL (e.g. `https://gbc-physics.netlify.app`)
   and any local dev URLs you test redirects against (e.g. `http://localhost:3000`).
3. Under **Redirect URLs**, add the same URLs plus auth-callback paths:
   - `http://localhost:3000/*`
   - `https://gbc-physics.netlify.app/*`
   - `https://gbc-physics.netlify.app/auth/callback` (if you add a callback route)
4. Under **Email settings**, configure email confirmation and templates (see section 5).
5. Save changes.

### 1.4 Enable Storage

1. Open **Storage → Buckets**.
2. Confirm the buckets exist (created by migration `006_storage_buckets.sql`):
   - `profile-images`
   - `faculty-images`
   - `department-assets`
   - `notice-attachments`
3. All four buckets are private (non-public) by default in this project.

### 1.5 Run the migrations

Apply all 6 SQL migration files in order through the Supabase SQL Editor
(**SQL Editor → New query**), or via the Supabase CLI:

```bash
# Option A: Supabase CLI (recommended for repeatable deploys)
# Install: https://supabase.com/docs/guides/cli
supabase login
supabase link --project-ref <project-ref>
supabase db push
```

Or paste each file manually into the SQL Editor and run them:

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_content_tables.sql
supabase/migrations/003_activity_logs.sql
supabase/migrations/004_rls_policies.sql
supabase/migrations/005_indexes_constraints.sql
supabase/migrations/006_storage_buckets.sql
```

Verify the tables and buckets appear in the **Table Editor** and **Storage** UI.

---

## 2. Environment Variables

Create React App only exposes variables prefixed with `REACT_APP_`. Copy
`.env.example` to `.env.local` and fill in real values. Never commit `.env.local`.

```bash
cp .env.example .env.local
```

### Required variables

| Variable | Required | Description | Example |
|---|---|---|---|
| `REACT_APP_SUPABASE_URL` | Yes | Supabase project URL | `https://abcdefgh.supabase.co` |
| `REACT_APP_SUPABASE_ANON_KEY` | Yes | Supabase anon (public) key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `REACT_APP_GEMINI_API_KEY` | No* | Google Gemini API key for the AI chat | `AIzaSy...` |
| `REACT_APP_SITE_URL` | No | Public site URL for redirect templates | `https://gbc-physics.netlify.app` |

\* The app runs without Supabase (auth unavailable) and without Gemini (AI chat
unavailable), but both are required for full functionality.

### `.env.example` template

```
# Environment Variables Template
# Copy this file to .env.local and fill in your values.
# DO NOT commit .env.local or any real secrets to version control.

# ====================
# Frontend (CRA requires REACT_APP_* prefix)
# ====================

# Supabase (public anon key + project URL - safe to expose in client code)
# Obtain from: Supabase Dashboard → Project Settings → API
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key

# Gemini API key (used by the AI chat, lazy-loaded)
REACT_APP_GEMINI_API_KEY=your-gemini-api-key

# Site URL
REACT_APP_SITE_URL=https://your-site.netlify.app

# Google Analytics (optional)
REACT_APP_GA_TRACKING_ID=UA-XXXXXXXXX-X

# Sentry DSN for error tracking (optional)
REACT_APP_SENTRY_DSN=https://xxxxxxxxxxxxx.ingest.sentry.io/xxxxxxx

# ====================
# Build / runtime
# ====================
# PORT=3000

# ====================
# Netlify / deployment (set in the hosting dashboard, not here)
# ====================
# NODE_VERSION=18
# BUN_VERSION=1.4.3
```

### How variables are consumed

`src/data/supabase.js` reads `REACT_APP_SUPABASE_URL` and
`REACT_APP_SUPABASE_ANON_KEY` at module load time and builds the Supabase client:

```js
const url = process.env.REACT_APP_SUPABASE_URL;
const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
export const isSupabaseConfigured = Boolean(url && anonKey);
export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    })
  : null;
```

Restart `bun run dev` after changing `.env.local` — CRA embeds env vars at
build/start time.

---

## 3. Database Migrations

Six migration files live in `supabase/migrations/`. Run them in order 001→006.
Each is idempotent where practical (buckets use `ON CONFLICT DO NOTHING`).

### 001_initial_schema.sql — Core schema

Creates the foundational tables and enables Row Level Security on all of them:

| Table | Purpose |
|---|---|
| `departments` | Department/college reference data (name, code, description) |
| `profiles` | Extends `auth.users`; full_name, email, role, avatar_url, phone |
| `students` | Student records (student_id, registration_number, batch, status) |
| `faculty` | Faculty records (employee_id, designation, department, is_active) |
| `user_roles` | RBAC role assignments (user_id, role) |

Also creates the `set_updated_at()` trigger function used by every table's
`updated_at` trigger. Run order: 1 of 6.

### 002_content_tables.sql — Content tables

Creates editorial tables used by the admin dashboard:

| Table | Purpose |
|---|---|
| `announcements` | Timed, publishable announcements (title, content, publish window) |
| `notices` | Department notices (title, excerpt, content, tag, status, date) |
| `events` | Calendar events (title, description, event_date, location, is_published) |

Run order: 2 of 6. Depends on 001 (profiles, auth.users).

### 003_activity_logs.sql — Audit trail

Creates `activity_logs` (actor_id, action, target_type, target_id, metadata,
created_at) for auditing admin and user actions. Inserts are open to any
authenticated user; reads are admin-only. Run order: 3 of 6.

### 004_rls_policies.sql — Row Level Security policies

Defines all RLS policies (see section 7 for the full summary). Admin is detected
via `public.user_roles` where `role = 'admin'`. Run order: 4 of 6.

### 005_indexes_constraints.sql — Indexes and constraints

Adds CHECK constraints and supporting B-tree indexes:

- `students.status` ∈ {pending, approved, rejected, suspended}
- `profiles.role` ∈ {student, faculty, admin}
- `notices.status` ∈ {draft, published, archived}
- `user_roles.role` ∈ {admin, student, faculty}

Plus indexes on foreign keys, status columns, email, batch, publish windows,
dates, and target lookups for activity logs. Run order: 5 of 6.

### 006_storage_buckets.sql — Storage buckets

Creates four private storage buckets and their object-level RLS policies
(see section 4):

| Bucket | Public? | Purpose |
|---|---|---|
| `profile-images` | No | User profile pictures |
| `faculty-images` | No | Faculty photos |
| `department-assets` | No | Department documents/assets |
| `notice-attachments` | No | Notice file attachments |

Run order: 6 of 6. Depends on 001 (profiles).

---

## 4. Storage Configuration

All buckets are **private** by default. Files are served through signed URLs or
via the Supabase client's download endpoints; RLS policies gate access.

### Buckets

| Bucket ID | Public | Owner write? | Public read? | Admin write? |
|---|---|---|---|---|
| `profile-images` | false | Yes (owner only) | No (authenticated read) | Yes |
| `faculty-images` | false | Yes (owner only) | No (authenticated read) | Yes |
| `department-assets` | false | No | No (authenticated read) | Yes |
| `notice-attachments` | false | No | No (authenticated read) | Yes |

### Policies (from 006_storage_buckets.sql)

**profile-images / faculty-images** (per-user buckets):
- `SELECT` → `authenticated` users, any object in the bucket
- `INSERT` → `authenticated` users (no owner check on insert; set `owner` on upload)
- `UPDATE` → owner only (`owner = auth.uid()`)
- `DELETE` → owner only (`owner = auth.uid()`)

**department-assets / notice-attachments** (admin-managed buckets):
- `SELECT` → `authenticated` users
- `ALL` (INSERT/UPDATE/DELETE) → authenticated users whose `profiles.role = 'admin'`

### File size limits

Supabase Free plan defaults:

| Setting | Free plan limit |
|---|---|
| Max file size per upload | 50 MB |
| Total storage | 1 GB |
| Monthly bandwidth | 5 GB |

4th-year notes in this project are 33–41 MB each, so they fit under the 50 MB
per-file limit on Free. If you expect larger uploads, upgrade the plan or raise
the limit in **Storage → Settings → File size limit**.

### Allowed MIME types

The migrations do not enforce MIME types at the database level. Enforce allowed
types in the frontend uploader before calling `supabase.storage.from(...).upload()`:

Recommended allow-list for this portal:

| Category | MIME types | Extensions |
|---|---|---|
| Images | `image/jpeg`, `image/png`, `image/webp`, `image/gif` | .jpg, .jpeg, .png, .webp, .gif |
| Documents | `application/pdf` | .pdf |
| Archives | `application/zip` | .zip |

Example client-side check:

```js
const ALLOWED = new Set([
  'image/jpeg','image/png','image/webp','image/gif','application/pdf','application/zip'
]);
if (!ALLOWED.has(file.type)) throw new Error('Unsupported file type');
if (file.size > 50 * 1024 * 1024) throw new Error('File exceeds 50 MB');
```

Upload with an explicit `owner` metadata so owner-based policies work:

```js
const { error } = await supabase.storage
  .from('profile-images')
  .upload(`public/${userId}/${fileName}`, file, {
    cacheControl: '3600',
    upsert: false,
    metadata: { owner: userId }
  });
```

---

## 5. Authentication Configuration

Auth is handled by Supabase Auth (GoTrue) via `@supabase/supabase-js` v2.
The app uses email/password sign-in and sign-up; there is no OAuth provider
configured by default.

### Email confirmation

1. Open **Authentication → Settings**.
2. Under **Email settings → Email confirmations**, enable **Enable email confirmations**
   (recommended for production).
3. With confirmation enabled, `signUp` returns `data.session === null` and the
   client handles `needsConfirmation` (see `src/data/session.js:71`).
4. Users must click the confirmation link in the email before they can sign in.
   Use **Resend confirmation** on the login page if the email is lost.

### Email templates

Customize in **Authentication → Email Templates**. Relevant templates:

| Template | Purpose |
|---|---|
| Confirmation | Sent on sign-up when email confirmation is on |
| Invite | Sent when inviting users (not used by this app) |
| Recovery | Sent on password reset (`resetPasswordForEmail`) |
| Magic Link | Not used (email/password only) |
| Email Change | Sent when changing email address |

Edit the subject line and body (Handlebars-supported) to match your institution's
branding. Insert the confirmation URL variable (`{{ .ConfirmationURL }}`) as
provided by Supabase.

### Redirect URLs

Add all origins your app runs on to **Authentication → Settings → Redirect URLs**:

- Development: `http://localhost:3000`
- Production: `https://your-site.netlify.app` (or your Vercel/custom domain)
- Include wildcard paths if your router uses hash/history fragments:
  `http://localhost:3000/*`, `https://your-site.netlify.app/*`

If you add a dedicated callback route (e.g. `/auth/callback`), register it
explicitly as well.

### Auth settings to verify

| Setting | Recommended value |
|---|---|
| Enable email confirmations | On (production) / Off (dev convenience) |
| Allow multiple users with same email | Off |
| Enable manual email change | Off |
| Password leak protection | On |
| Minimum password length | 8 (default) |

---

## 6. RLS Policies — Summary per table

Every table has `ROW LEVEL SECURITY` enabled. Policies are defined in
`supabase/migrations/004_rls_policies.sql`. Admin status is resolved by checking
`public.user_roles` where `role = 'admin'`.

### profiles
| Policy | Command | Roles | Condition |
|---|---|---|---|
| Users can view their own profile | SELECT | authenticated | `auth.uid() = id` |
| Admins can view all profiles | SELECT | authenticated | admin role exists |
| Users can insert their own profile | INSERT | authenticated | `auth.uid() = id` |
| Users can update their own profile | UPDATE | authenticated | `auth.uid() = id` |
| Admins can manage all profiles | ALL | authenticated | admin role exists |

### students
| Policy | Command | Roles | Condition |
|---|---|---|---|
| Students can view their own record | SELECT | authenticated | `auth.uid() = id` |
| Admins can view all students | SELECT | authenticated | admin role exists |
| Admins can manage all students | ALL | authenticated | admin role exists |

### faculty
| Policy | Command | Roles | Condition |
|---|---|---|---|
| Faculty can view their own record | SELECT | authenticated | `auth.uid() = id` |
| Admins can view all faculty | SELECT | authenticated | admin role exists |
| Admins can manage all faculty | ALL | authenticated | admin role exists |

### announcements
| Policy | Command | Roles | Condition |
|---|---|---|---|
| Public can read published announcements | SELECT | anon, authenticated | published & within publish window |
| Authors can read their own announcements | SELECT | authenticated | `auth.uid() = author_id` |
| Authenticated users can create announcements | INSERT | authenticated | `auth.uid() = author_id` |
| Authors can update their own announcements | UPDATE | authenticated | `auth.uid() = author_id` |
| Admins can manage all announcements | ALL | authenticated | admin role exists |

### notices
| Policy | Command | Roles | Condition |
|---|---|---|---|
| Public can read published notices | SELECT | anon, authenticated | `status = 'published'` |
| Authors can read their own notices | SELECT | authenticated | `auth.uid() = author_id` |
| Authenticated users can create notices | INSERT | authenticated | `auth.uid() = author_id` |
| Authors can update their own notices | UPDATE | authenticated | `auth.uid() = author_id` |
| Admins can manage all notices | ALL | authenticated | admin role exists |

### events
| Policy | Command | Roles | Condition |
|---|---|---|---|
| Public can read published events | SELECT | anon, authenticated | `is_published = TRUE` |
| Admins can manage all events | ALL | authenticated | admin role exists |

### activity_logs
| Policy | Command | Roles | Condition |
|---|---|---|---|
| Admins can read all activity logs | SELECT | authenticated | admin role exists |
| System can insert activity logs | INSERT | authenticated | `TRUE` (any authenticated user) |

### user_roles
| Policy | Command | Roles | Condition |
|---|---|---|---|
| Authenticated users can read user_roles | SELECT | authenticated | `TRUE` |
| Admins can manage all user_roles | ALL | authenticated | `profiles.role = 'admin'` |

> Note: the `user_roles` admin policy checks `public.profiles.role = 'admin'`
> rather than `user_roles` itself, so the profile row must exist and be marked
> admin before role management works.

### storage.objects
See section 4 for bucket-specific policies.

---

## 7. Admin Account Initialization

There is no built-in "create admin" endpoint. The first admin must be created
manually after migrations are applied.

### Step 1 — Create the user account

1. Open **Authentication → Users**.
2. Click **Add user** → **Invite user by email** (or sign up through the app and
   confirm the email).
3. Copy the new user's `id` (UUID) from the user list.

### Step 2 — Create the profile row

Run this in the SQL Editor, replacing `<user-id>` and values:

```sql
INSERT INTO public.profiles (id, full_name, email, role)
VALUES (
  '<user-id>'::uuid,
  'Admin User',
  'admin@gbc-college.edu',
  'admin'
) ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

> The `profiles` table's `id` references `auth.users(id)` ON DELETE CASCADE,
> so the auth user must exist first.

### Step 3 — Assign the admin role

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('<user-id>'::uuid, 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

### Step 4 — Verify

1. Sign out and sign back in with the admin credentials.
2. Confirm `isAuthenticated` is true and the admin dashboard routes are
   accessible (the app checks RBAC via `RBACContext`, which reads `user_roles`).

### Alternative: create via SQL only (if you don't want email confirmation)

If email confirmation is off and you want to skip the invite flow, insert into
`auth.users` directly is not supported through the public API — use the Supabase
Dashboard **Add user** or the Supabase CLI `supabase auth` commands instead,
then perform steps 2–3 above.

---

## 8. Security Notes

### Never expose the `service_role` key

Only the `anon` key belongs in frontend code (`REACT_APP_SUPABASE_ANON_KEY`).
The `service_role` key bypasses RLS and must never be committed or embedded in
the client bundle. Use it only in trusted server-side environments (Edge
Functions, private backend).

### RLS is your primary access control

All tables and `storage.objects` have RLS enabled. Do not disable RLS on any
table, and do not add permissive policies (`USING (TRUE)`) for write operations
without review. Anonymous (`anon`) access is limited to reading published
content (announcements, notices, events) only.

### Environment variables

- `.env.local` is gitignored — never commit real keys.
- `.env.example` contains placeholders only and is safe to commit.
- `REACT_APP_*` variables are baked into the bundle at build time by CRA. They
  are visible to anyone who inspects the built JS; this is expected for the
  Supabase anon key but means you must never put secrets there.
- Rotate the anon key if it is ever accidentally committed.

### Storage

- All four buckets are private. Do not flip `public = true` unless you intend
  the files to be publicly readable without authentication.
- The 50 MB per-file Free-plan limit applies; validate file size and MIME type
  client-side before upload (see section 4).
- Owner-based policies rely on the `owner` column being set correctly at upload
  time.

### Passwords and auth

- Enable email confirmation in production so accounts cannot be used until
  verified.
- Configure redirect URLs to include every origin the app runs on; missing URLs
  cause OAuth/email-redirect errors.
- Supabase handles password hashing (bcrypt) and breach monitoring; the app
  never sees raw passwords.

### Audit trail

- `activity_logs` inserts are open to all authenticated users. Do not rely on it
  for tamper-proof auditing; it is a best-effort log. Consider a database
  trigger or server-side function for critical operations.

### Deployment

- Set `REACT_APP_*` variables in your host dashboard (Netlify: Site settings →
  Environment variables; Vercel: Project settings → Environment variables).
- Redeploy after changing env vars — CRA does not pick them up at runtime.

---

### Quick reference

| Item | Location / Value |
|---|---|
| Migrations | `supabase/migrations/001...006.sql` |
| Supabase client | `src/data/supabase.js:1` |
| Auth session module | `src/data/session.js` |
| Auth context | `src/context/AuthContext.js` |
| Env template | `.env.example` |
| Buckets | `profile-images`, `faculty-images`, `department-assets`, `notice-attachments` |
| Admin detection | `public.user_roles.role = 'admin'` |

