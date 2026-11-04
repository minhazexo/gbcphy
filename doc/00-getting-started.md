# Getting Started

Welcome to the Department of Physics portal — a Bun-powered React educational website for Government Bangla College.

## Prerequisites

- [Bun](https://bun.sh) >= 1.4.0 (primary runtime & package manager)
- Node.js >= 18 (Create React App shells out to Node for the build/dev server)

### Install Bun

**macOS / Linux**
```bash
curl -fsSL https://bun.sh/install | bash
```

**Windows (PowerShell)**
```powershell
powershell -c "iwr https://bun.sh/install.ps1 -useb | iex"
```

**Verify**
```bash
bun --version
# 1.4.3
```

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd dept-of-physics

# Install dependencies (generates bun.lock)
bun install

# Copy the environment template
cp .env.example .env.local

# Fill in required values in .env.local (never commit real secrets)
```

## Verify everything works

```bash
# Type check
bun run typecheck

# Lint
bun run lint

# Tests
bun test

# Production build
bun run build

# Start production server
bun run start   # http://localhost:3000
```

## Quick reference

| Command | Purpose |
|---|---|
| `bun install` | Install dependencies |
| `bun run dev` | Start dev server with hot reload |
| `bun run build` | Production build to `build/` |
| `bun run start` | Serve production build locally |
| `bun run test` | Run test suite |
| `bun run lint` | Run ESLint |
| `bun run typecheck` | Run TypeScript check |
| `bun run format` | Format code with Prettier |

## Project structure

```
doc/                # This documentation
src/                # React source code
  App.js            # Routes + providers
  api.js            # Mock API stub
  context/          # Theme + Auth context
  data/             # Supabase, session, content store, department, teachers
  components/       # Layout, Home, AI, Scientific
  pages/            # Pages (Home, About, Academic, Teachers, ...)
  styles/           # SCSS files
  utils/            # gemini.js, folderStructure.js
public/             # Static assets + index.html
build/              # Production output (gitignored)
bun.lock            # Bun lockfile (committed)
bunfig.toml         # Bun configuration
.env.example        # Environment template (commit-safe)
.eslintrc / eslint.config.js  # ESLint config
.prettierrc         # Prettier config
tsconfig.json       # TypeScript config
```

## Support

See `AGENTS.md` for AI coding agent guidance and `README.md` for the user-facing overview.
