# GBC Physics R2 API Worker

A separate Cloudflare Worker API for the existing `gbc-physics-pdfs` R2 bucket. It is designed to be called by the existing React/Vite application using the user's current Supabase session.

> **Deployment status:** source code only. This Worker has not been deployed, and no Cloudflare dashboard or production bucket changes were made.

## Security gates

1. **Role-source audit is mandatory.** The Worker validates the Supabase access token and fetches the current `profiles.role` row server-side with a Worker-only Supabase secret. The repository's migration `004_rls_policies.sql` contains an own-profile UPDATE policy scoped by row identity, not by individual columns. That policy may allow a user to change their own `role`; migration `009` does not clearly remove that policy. Therefore `STORAGE_ROLE_SOURCE_VERIFIED` is `false` by default and every management endpoint fails closed until the live production schema/RLS and role assignment path have been audited and the role cannot be self-escalated. **Do not set it to true just to make the UI work.** Fixing production RLS/column privileges requires a separate approved database change.
2. Only `super_admin` and `department_admin` are accepted after the role-source gate passes. The role is never trusted from browser input or user-editable JWT metadata.
3. Prefer a current Supabase `sb_secret_...` key as `SUPABASE_SECRET_KEY`; the legacy `service_role` key is accepted as a fallback. These are Worker secrets, never Vite variables or committed files.
4. Destructive operations and replacement are restricted to `Admin Uploads/`. The existing academic catalog is stored in browser `localStorage`, so a Worker cannot reliably discover all references across users' browsers. Existing academic, question, note, syllabus, book, and notice objects are protected until shared persistent references are implemented and audited.
5. Uploads stream the request body to R2 and require a known `Content-Length`. The default maximum is 50 MiB. Upload progress is indeterminate in the current browser implementation. Multipart upload is not implemented.
6. The in-memory write limiter is per Worker isolate and is best-effort, not a global rate limit. Configure Cloudflare rate limiting/WAF before enabling production writes.

## API

All endpoints except health require:
- `Authorization: Bearer <Supabase access token>`
- A current role of `super_admin` or `department_admin`
- `STORAGE_ROLE_SOURCE_VERIFIED=true` after the live role-source audit

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/health` | Public health status |
| GET | `/api/v1/files?prefix=&cursor=&limit=50` | Paginated prefix listing |
| GET | `/api/v1/files/metadata?key=<key>` | Object metadata via R2 `head()` |
| GET | `/api/v1/files/preview?key=<key>` | Authenticated inline PDF/image stream |
| GET | `/api/v1/files/download?key=<key>` | Authenticated attachment stream |
| GET | `/api/v1/search?q=<query>&prefix=` | Bounded key search (up to 10,000 objects scanned) |
| PUT | `/api/v1/files?key=<key>` | Stream a new file to R2 |
| PUT | `/api/v1/files?key=<key>&overwrite=true` | Conditional replacement, Admin Uploads only |
| POST | `/api/v1/folders` | Create a folder marker |
| POST | `/api/v1/files/rename` | Copy, verify, then remove source |
| POST | `/api/v1/files/move` | Copy, verify, then remove source |
| DELETE | `/api/v1/files?key=<key>` | Delete an Admin Uploads object |

Upload headers: `Content-Type` must match the file extension, and the request must carry a known `Content-Length`. For replacement, also provide `X-If-Match: <current-etag>`. New uploads are conditional and do not overwrite by default. The browser sends the `File` as the request body; no unbounded Worker-side buffering is used.

Rename/move JSON body:
```json
{
  "sourceKey": "Admin Uploads/old-name.pdf",
  "destinationKey": "Admin Uploads/new-name.pdf",
  "overwrite": false
}
```

When overwriting a destination, send `"overwrite": true` and `"expectedDestinationEtag": "<current-etag>"`.

R2 operations use the bucket binding; the Worker does not expose S3 access keys. Errors use a consistent JSON envelope and request ID. Tokens and file contents are never logged.

## Configuration and local development

1. Install Bun and a supported Node.js runtime.
2. From this directory run `bun install`.
3. Copy `.dev.vars.example` to `.dev.vars` and fill in values only from the correct Supabase project. Keep `.dev.vars` untracked.
4. In `wrangler.jsonc`, verify the existing bucket name and set the exact Supabase project URL and publishable key. Do not guess the project reference.
5. Keep `STORAGE_ROLE_SOURCE_VERIFIED=false` until the live role-source audit is complete.
6. Add a Worker-only secret:
   ```bash
   bunx wrangler secret put SUPABASE_SECRET_KEY
   ```
   Use the secret key value supplied by Supabase. Never use a browser-exposed `VITE_*` variable for it.
7. Confirm the actual allowed origin. The initial list matches the existing production URL and documented local Vite port 3000. Add preview/custom domains only after confirming them.
8. Optionally set `PUBLIC_R2_BASE_URL` only after the complete bucket visibility/inventory audit proves that objects managed through this endpoint may be linked publicly. The current existing public base is `https://pub-f03874d54e81451fa22595f6280655a5.r2.dev`; the source configuration deliberately does not enable public URL generation by default.
9. Run:
   ```bash
   bun run typecheck
   bun run test
   bunx wrangler dev
   ```

## Staging and production checklist

- Confirm Cloudflare account access to the existing `gbc-physics-pdfs` bucket and inventory all keys. Never create a replacement bucket.
- Compare the inventory with the application's existing R2 references before enabling replacement/delete/move operations.
- Verify the production Supabase URL, signing-key mode, `profiles.role` semantics, role mutation policies, and RLS. In particular, prove users cannot update their own role. The Worker intentionally returns 503 until this is confirmed and the gate is deliberately changed.
- Use a staging Worker and a dedicated test prefix first. Do not test destructive operations against production academic keys.
- Add Cloudflare rate limiting/WAF rules and configure only exact production/preview origins.
- Deploy only after explicit authorization. The deployment URL must come from Wrangler/Cloudflare after deployment; do not invent it.
- Set `VITE_R2_API_URL` in Vercel only after an authorized Worker deployment, then redeploy the frontend.
- Verify access as a student, faculty member, department admin, and super admin. Direct Worker requests must enforce the same server-side role checks.
- Verify large-file upload behavior and the configured size cap before raising it. Multipart upload is a separate enhancement.

## Rollback

Remove/disable the Storage Manager navigation/route or point the frontend API setting to an unavailable placeholder. Keep the existing public R2 domain, object keys, academic pages, and localStorage content untouched. Do not delete Worker secrets or R2 objects as part of an application rollback unless separately approved.
