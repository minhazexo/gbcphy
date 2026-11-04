# Development Workflow

## Commands

| Command | What it does |
|---|---|
| `bun install` | Install dependencies from `bun.lock` |
| `bun run dev` | Start CRA webpack dev server (HMR) at `http://localhost:3000` |
| `bun run build` | Production build to `build/` |
| `bun run start` | Serve production build (`serve -s build -l 3000`) |
| `bun run preview` | Alias for `start` |
| `bun run test` | Bun test runner (Jest-compatible) |
| `bun run lint` | ESLint 9 flat config over `src/` |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run format` | Prettier over `src/**` |

### Dev server with custom port

```bash
PORT=3001 BROWSER=none bun run dev
```

### Hot Module Replacement

HMR is provided by Create React App's webpack dev server. Edits to source files refresh the browser automatically.

### Testing

Tests run under Bun with a jsdom DOM shim (`src/testSetupDom.js`).

```bash
bun test
```

Write new tests next to source as `*.test.js` or `*.test.jsx`. Wrap interactive state updates in `act(...)`.

### Lint & format

```bash
# Lint (0 errors required; warnings tolerated)
bun run lint

# Format
bun run format

# Type check
bun run typecheck
```

### ESLint warnings

Legacy CRA code produces `no-unused-vars` and `react/prop-types` warnings on `import React` and destructured props. These are warnings, not errors. New code should omit `import React` (React 19 automatic runtime) and avoid them where practical.
