# GBC Physics R2 API Worker

A separate Cloudflare Worker API for the existing `gbc-physics-pdfs` R2 bucket. It is called by the React/Vite application with the signed-in user's Supabase access token.

> **Deployment status:** source code only. This Worker has not been deployed, and no Cloudflare dashboard or production bucket changes were made.

## Administrator permissions

The Worker grants full bucket management to all recognized administrator roles:
- `super_admin`
- `department_admin`
- Legacy `admin` role

These administrators can browse, search, preview, download, upload, replace, rename, move, and delete objects at any key in the bucket, as well as create folders. Faculty and student accounts are denied by the Worker even if they attempt to call the API directly.

Renaming, moving, replacing, or deleting an existing academic object can break published links. The UI warns before destructive actions, but the administrator is responsible for checking and updating affected links/catalog entries.

## Supabase authorization status

The connected production Supabase project is `jphvkrnwcjfdbxkufjgq` in `ap-northeast-1`.

Migration `supabase/migrations/010_prevent_profile_role_escalation.sql` has been applied to that project and verified on **14 November 2026**. The verification confirmed:

- A normal student receives `false` from `private.has_admin_access()`.
- A student attempting to change their own `profiles.role` to `admin` is rejected with SQLSTATE `42501`.
- The student's stored role remained `student` after the rejected attempt.
- The existing super-admin receives `true` from `private.has_admin_access()`.
- The super-admin can change another user's profile role; the verification change was performed inside a transaction and rolled back.
- No remaining public-table RLS policy references editable JWT `user_metadata`.
- The `profiles` and `user_roles` role-guard triggers exist.
- The shared `set_updated_at()` trigger function no longer runs as `SECURITY DEFINER`.

For this verified production project, `STORAGE_ROLE_SOURCE_VERIFIED=true` is set in `wrangler.jsonc`. For a new project, staging project, or after changing the role source, keep the flag `false` until the migration and equivalent authorization tests pass.

## Security gates and secrets

1. The Worker verifies the user's access token using Supabase Auth/JWKS.
2. It fetches the current `profiles.role` server-side. It never trusts a role supplied by the browser or editable JWT metadata.
3. A server-only Supabase API key is required for the current profile-role lookup. Prefer an `sb_secret_...` key as the Worker-only `SUPABASE_SECRET_KEY`; the legacy `service_role` key is accepted as a fallback.
4. The elevated key is sent in the `apikey` header only. Never put it in `wrangler.jsonc`, source control, browser code, or a `VITE_*` variable.
5. Add the secret from an authenticated Cloudflare/Wrangler terminal:
   ```bash
   bunx wrangler secret put SUPABASE_SECRET_KEY
   ```
6. Uploads stream request bodies to R2 and require a known `Content-Length`. The default maximum is 50 MiB per file. The current browser upload queue is sequential and does not display byte-level upload progress. Multipart upload is not implemented.
7. The in-memory write limiter is per Worker isolate and best-effort, not a global rate limit. Configure Cloudflare rate limiting/WAF before production use.

## API

All endpoints except health require:
- `Authorization: Bearer <Supabase user access token>`
- A current `profiles.role` of `super_admin`, `department_admin`, or legacy `admin`
- `STORAGE_ROLE_SOURCE_VERIFIED=true`

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/health` | Public health status |
| GET | `/api/v1/files?prefix=&cursor=&limit=50` | Paginated bucket listing |
| GET | `/api/v1/files/metadata?key=<key>` | Object metadata via R2 `head()` |
| GET | `/api/v1/files/preview?key=<key>` | Authenticated inline PDF/image stream |
| GET | `/api/v1/files/download?key=<key>` | Authenticated attachment stream |
| GET | `/api/v1/search?q=<query>&prefix=` | Bounded key search (up to 10,000 objects scanned) |
| PUT | `/api/v1/files?key=<key>` | Upload a new object at any key |
| PUT | `/api/v1/files?key=<key>&overwrite=true` | Conditionally replace any existing object |
| POST | `/api/v1/folders` | Create a folder marker |
| POST | `/api/v1/files/rename` | Copy, verify, then remove source |
| POST | `/api/v1/files/move` | Copy, verify, then remove source |
| DELETE | `/api/v1/files?key=<key>` | Delete any object |

Upload headers: `Content-Type` must match the file extension, and the request must carry a known `Content-Length`. For replacement, also provide `X-If-Match: <current-etag>`. New uploads do not overwrite by default. Supported formats include PDF, common raster images, Word/PowerPoint/Excel, text, CSV, RTF, and ZIP. The browser sends the `File` as the request body; no unbounded Worker-side buffering is used.

Rename/move JSON body:
```json
{
  "sourceKey": "Questions/3rd year/Old filename.pdf",
  "destinationKey": "Questions/3rd year/New filename.pdf",
  "overwrite": false
}
```

When overwriting a destination, send `"overwrite": true` and `"expectedDestinationEtag": "<current-etag>"`.

R2 operations use the bucket binding; the Worker does not expose S3 access keys. Errors use a consistent JSON envelope and request ID. Tokens and file contents are never logged.

## Configuration and local development

1. Install Bun and a supported Node.js runtime.
2. From this directory run `bun install`.
3. Copy `.dev.vars.example` to `.dev.vars` and fill in values only from the correct Supabase project. Keep `.dev.vars` untracked.
4. `wrangler.jsonc` is already configured with the connected production Supabase URL, its publishable API key, the existing R2 bucket name, exact allowed origins, 50 MiB upload cap, and verified role-source gate.
5. Add the Worker-only secret using `bunx wrangler secret put SUPABASE_SECRET_KEY`. Prefer the new `sb_secret_...` key; use a legacy `service_role` key only if required. Never commit or expose it.
6. Confirm the exact allowed origin. The initial list matches the production URL and documented local Vite port 3000. Add preview/custom domains only after confirming them.
7. Optionally set `PUBLIC_R2_BASE_URL` only after confirming the bucket's current public visibility and whether every object may be linked publicly. The existing public base is `https://pub-f03874d54e81451fa22595f6280655a5.r2.dev`; URL copying remains disabled by default until configured.
8. Run:
   ```bash
   bun run typecheck
   bun run test
   bunx wrangler dev
   ```

## Staging and production checklist

- Confirm Cloudflare account access to the existing `gbc-physics-pdfs` bucket. Never create a replacement bucket.
- Add the Worker-only Supabase secret and verify Cloudflare has the existing bucket binding.
- Confirm the correct Cloudflare account and deploy the Worker only after configuration and secret are present.
- Add Cloudflare rate limiting/WAF rules and configure only exact production/preview origins.
- After deployment, use the actual Wrangler URL to set `VITE_R2_API_URL` in Vercel and redeploy the frontend.
- Verify access as a student, faculty member, department admin, super admin, and legacy admin. Students/faculty must be denied; all admin roles should have full bucket control.
- Use disposable test objects first. Verify browse, upload, replace, rename, move, download, preview, and delete at a disposable test key before touching academic files.
- Verify large-file upload behavior and the configured size cap. Multipart upload is a separate enhancement.

## Remaining production work

The Supabase database-side role security is live and verified. Deployment is still pending because this environment does not currently have Cloudflare or Vercel account actions. The following steps require the owner’s authenticated Cloudflare/Vercel access:

- Upload `SUPABASE_SECRET_KEY` as a Cloudflare Worker secret.
- Verify the R2 bucket binding in the intended Cloudflare account and deploy the Worker.
- Set `VITE_R2_API_URL` to the actual deployed Worker URL in Vercel, then redeploy the frontend.

Do not paste a secret API key into GitHub, chat, or source files.

## Rollback

Disable the Worker API or remove the Storage Manager navigation/route. Keep the existing public R2 domain and objects untouched. Do not delete Worker secrets or R2 objects as part of an application rollback unless separately approved.
