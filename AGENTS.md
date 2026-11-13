# AGENTS.md

Working agreement for contributors and coding agents in this repository.

## Project

- Product: Department of Physics academic portal for Government Bangla College.
- Runtime/package manager: Bun 1.4.3, pinned in `.bun-version`.
- Frontend: React 19, TypeScript, React Router, Vite, SCSS.
- Backend services: Supabase Auth, PostgreSQL, and Storage.
- Production host: Vercel; build output: `build/`.

## Source map

```text
src/
  app/          Application root and route composition
  components/   Shared UI and admin-specific components
  config/       App constants and environment parsing
  context/      Authentication, RBAC, and theme providers
  data/         Department data and data adapters
  features/     Feature-specific pages and modules
  hooks/        Shared React hooks
  layouts/      Main, auth, and admin page shells
  services/     Supabase and content service boundaries
  styles/       Global styles and admin design tokens
  utils/        Pure helpers and validators
```

## Commands

```bash
bun install --frozen-lockfile
bun run dev
bun run lint
bun run typecheck
bun run test
bun run build
bun run start
```

## Rules

1. Preserve existing public routes, academic resource paths, and user-facing workflows unless the task explicitly changes them.
2. Use TypeScript for new application code. Put feature-specific code in `src/features/<feature>/`; shared UI belongs in `src/components/`.
3. Keep page shells in `src/layouts/`. Do not duplicate the main header, footer, authentication shell, or admin sidebar.
4. Keep backend access in `src/services/` or established data adapters; avoid scattering direct Supabase calls through components.
5. Treat client-side route guards as UX only. Enforce data access with Supabase RLS policies.
6. Never add service-role keys, database passwords, or private tokens to source, browser environment variables, commits, or logs.
7. Update `.env.example` when introducing a new public build-time setting. Keep actual values in local ignored files or deployment settings.
8. Keep `bun.lock` synchronized after dependency changes; do not add npm/yarn/pnpm lockfiles.
9. Add regression tests for behavior changes. Keep lint, typecheck, tests, and production build passing.
10. Review Vercel rewrites and static asset paths when changing routing or build configuration.

## Pull request checklist

- [ ] Existing routes and academic resource links remain valid.
- [ ] No secrets or local Supabase state are committed.
- [ ] `bun run lint` passes.
- [ ] `bun run typecheck` passes.
- [ ] `bun run test` passes.
- [ ] `bun run build` passes.
- [ ] Any required Supabase migration and deployment configuration is documented.
