# Supabase setup

This application uses Supabase for authentication, PostgreSQL data access, and optional file storage. The public website can render without Supabase configuration, but authenticated and database-backed features require a correctly configured project.

## 1. Create a project and configure local environment

Create a Supabase project, then copy its Project URL and publishable/anon key from the project API settings.

Create `.env.local` from the safe template:

```bash
cp .env.example .env.local
```

Set:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
VITE_SITE_URL=http://localhost:3000
```

Use only the publishable/anon key in browser code. **Never** use a service-role key, secret API key, database password, or personal access token in a `VITE_*` variable; Vite embeds these values into public assets.

## 2. Apply database migrations

Review the SQL files in `supabase/migrations/` and apply them in numeric order, from `001` through the latest migration (currently `010`).

Before applying migrations to a live project:
- Take a database backup.
- Confirm the project reference is the intended production project.
- Review each migration's effects, especially changes to RLS policies and role checks.
- Do not skip migrations or apply them out of order.

Migration `010_prevent_profile_role_escalation.sql` is a security migration. It:
- Creates a non-exposed `private.has_admin_access()` helper that reads the authenticated user's roles from `public.profiles` and `public.user_roles`.
- Replaces admin RLS policies that used user-editable JWT `user_metadata`. Never use `raw_user_meta_data` for authorization.
- Blocks users from assigning or changing their own roles through either `profiles` or `user_roles`.
- Allows database-backed administrators to assign roles to other users.
- Adds `department_admin` to the allowed role constraints.
- Changes the shared `set_updated_at()` trigger function to invoker privileges with a fixed search path.

After applying migration 010, verify that a normal student cannot promote themselves, that an existing super admin can still manage other users, and that a `department_admin` role can be stored. Do not enable the R2 Worker role-verification gate until these checks pass.

### Important student-data privacy note

The current database contains a `Public read students` policy on `public.students`. It permits anonymous reads of every student row and every column exposed through the Data API, including student identifiers and registration numbers. Migration 010 deliberately does not remove this existing policy because doing so may affect current public directory features. Review whether this data is intentionally public. If not, remove the broad policy and expose only safe, explicitly selected columns through a public view or separate directory endpoint.

## 3. Configure authentication URLs

In Supabase Dashboard → Authentication → URL Configuration:

- Set the Site URL to `https://gbcphy.vercel.app` for production.
- Add `https://gbcphy.vercel.app/**` (or the redirect pattern supported by your Supabase project) to allowed redirect URLs.
- Add `http://localhost:3000/**` for local development.
- Add only the preview deployment URLs you actually intend to use.

Check email confirmation and password recovery templates to ensure they return users to the correct host.

## 4. Configure Vercel

In Vercel → Project → Settings → Environment Variables, configure:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SITE_URL=https://gbcphy.vercel.app`

Set values for the environments in which the feature is needed, then redeploy. Vite reads these values at build time, so changing a variable requires a new build/deployment.

## 5. Verify access controls

- Confirm RLS is enabled on every table containing user or administrative data.
- Review policies against the intended role model before creating real users.
- Test as an anonymous visitor, a normal student, faculty, department admin, and super admin.
- Confirm that a user cannot read or modify another user's private records by calling Supabase directly.
- Check Storage bucket visibility and object policies; do not assume a hidden frontend control makes a file private.
- Enable Supabase Auth's leaked-password protection in the dashboard when available.
- Re-run Supabase Security and Performance Advisors after schema changes.

A frontend route guard is not a security boundary. Database and Storage RLS policies must independently enforce authorization.

## 6. Optional AI integration

If the AI assistant is enabled, configure `VITE_GEMINI_API_KEY` only with the understanding that browser-delivered values are public. For a confidential provider key, move requests behind a server-side API route or trusted backend.

## Troubleshooting

- **Auth unavailable:** verify the Vite environment variables and redeploy/restart the dev server.
- **Redirect errors:** check the Supabase Site URL, allowed redirect URLs, and email templates.
- **Permission errors:** inspect the relevant RLS policy and the authenticated user's role records.
- **Storage errors:** verify bucket names, visibility, and object-level policies.
