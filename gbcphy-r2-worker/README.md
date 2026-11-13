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

## Security gates

1. **Apply migration 010 first.** The earlier own-profile UPDATE policy did not restrict changed columns, so a client could potentially try to change `profiles.role`. Migration `supabase/migrations/010_prevent_profile_role_escalation.sql` adds a trigger that rejects role changes from user sessions. Trusted service-role operations and privileged SQL sessions remain able to assign roles.
2. `STORAGE_ROLE_SOURCE_VERIFIED=false` is intentionally the default. After applying migration 010 to the correct live Supabase project, confirm a normal signed-in user cannot change their own role, and that admin role reads return the correct current row. Only then set the Worker variable to `true`. Do not bypass this gate.
3. The Worker verifies the user's token, then fetches the current `profiles.role` from Supabase server-side. It does not trust a role supplied by the browser or editable JWT metadata.
4. Prefer a Supabase `sb_secret_...` key as the Worker-only `SUPABASE_SECRET_KEY`; the legacy `service_role` key is accepted as a fallback. The key is sent in the `apikey` header only (secret API keys are not JWT bearer tokens). Never place it in Vite variables or source control.
5. Uploads stream request bodies to R2 and require a known `Content-Length`. The default maximum is 50 MiB per file. The current browser upload queue is sequential and does not display byte-level upload progress. Multipart upload is not implemented.
6. The in-memory write limiter is per Worker isolate and best-effort, not a global rate limit. Configure Cloudflare rate limiting/WAF before production use.

## API

All endpoints except health require:
- `Authorization: Bearer <Supabase user access token>`
- A current `profiles.role` of `super_admin`, `department_admin`, or legacy `admin`
- `STORAGE_ROLE_SOURCE_VERIFIED=true` after migration 010 is applied and verified

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
4. In `wrangler.jsonc`, verify the existing bucket name and exact Supabase project URL and publishable key. Do not guess the project reference.
5. Keep `STORAGE_ROLE_SOURCE_VERIFIED=false` until migration 010 is applied and verified against the live project.
6. Add a Worker-only Supabase secret:
   ```bash
   bunx wrangler secret put SUPABASE_SECRET_KEY
   ```
   Use the `sb_secret_...` value supplied by Supabase (or a legacy `service_role` key if required). The Worker sends it in the `apikey` header only. Never use a browser-exposed `VITE_*` variable for it.
7. Confirm the exact allowed origin. The initial list matches the production URL and documented local Vite port 3000. Add preview/custom domains only after confirming them.
8. Optionally set `PUBLIC_R2_BASE_URL` only after confirming the bucket's current public visibility and whether every object may be linked publicly. The existing public base is `https://pub-f03874d54e81451fa22595f6280655a5.r2.dev`; URL copying remains disabled by default until configured.
9. Run:
   ```bash
   bun run typecheck
   bun run test
   bunx wrangler dev
   ```

## Staging and production checklist

- Confirm Cloudflare account access to the existing `gbc-physics-pdfs` bucket. Never create a replacement bucket.
- Apply migration 010 to the intended Supabase project after a backup; then verify ordinary users cannot change `profiles.role`.
- Configure the Worker-only secret, exact CORS origins, upload cap, and optionally the public base URL.
- Set `STORAGE_ROLE_SOURCE_VERIFIED=true` only after the migration and role-source tests pass.
- Use a staging Worker and test objects first. Verify browse, upload, replace, rename, move, download, preview, and delete at both a legacy academic key and a disposable test key.
- Add Cloudflare rate limiting/WAF rules and configure only exact production/preview origins.
- Deploy only with explicit authorization. The deployment URL must come from Wrangler/Cloudflare after deployment; do not invent it.
- Set `VITE_R2_API_URL` in Vercel only after an authorized Worker deployment, then redeploy the frontend.
- Verify access as a student, faculty member, department admin, super admin, and legacy admin. Students/faculty must be denied; all admin roles should have full bucket control.
- Verify large-file upload behavior and the configured size cap. Multipart upload is a separate enhancement.

## Rollback

Disable the Worker API or remove the Storage Manager navigation/route. Keep the existing public R2 domain and objects untouched. Do not delete Worker secrets or R2 objects as part of an application rollback unless separately approved.
