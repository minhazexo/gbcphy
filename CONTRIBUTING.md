# Contributing

Thanks for helping improve the Department of Physics portal.

## Development setup

1. Install Bun 1.4.3 (see `.bun-version`).
2. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/minhazexo/gbcphy.git
   cd gbcphy
   bun install --frozen-lockfile
   ```

3. Copy `.env.example` to `.env.local` and add local values when working on Supabase-dependent features.
4. Start the app with `bun run dev`.

## Before opening a pull request

Run all checks:

```bash
bun run lint
bun run typecheck
bun run test
bun run build
```

Keep changes focused. Include a short explanation of the user-facing behavior, mention any environment or migration changes, and add screenshots for substantial UI changes.

## Project conventions

- Use TypeScript for new React components and utilities.
- Follow the existing feature-based source layout.
- Preserve current routes and academic resource links.
- Keep backend access behind existing services/data adapters.
- Never commit credentials, local environment files, or generated output.
- Update documentation and tests when behavior or setup changes.
