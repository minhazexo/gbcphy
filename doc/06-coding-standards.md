# Coding Standards

Follow the conventions in `AGENTS.md` plus the guidelines below.

## File naming

- Components/pages: PascalCase (`Home.js`, `AIChat.jsx`)
- Utilities/context/data: camelCase (`api.js`, `session.js`, `gemini.js`)
- Styles: SCSS per page/component (`home.scss`, `Hero.scss`)

## React

- React 19 automatic runtime — do **not** import `React` in JSX files.
- Named exports for utilities/context; default exports for page/layout components.
- Prefer function components with hooks.

## Imports

- Use `.js` extension on local imports (`./App.js`).
- Relative SCSS imports (`../../styles/x.scss`).

## Environment variables

- Must be `REACT_APP_*` prefixed (CRA requirement).
- Never log secrets.
- Add new variables to `.env.example` (placeholders only).

## Error handling

- `console.error` + user-facing message.
- Supabase calls wrapped in try/catch.

## Lint

- 0 errors required.
- Warnings tolerated for legacy CRA code; new code should be warning-free.
- `react-hooks/rules-of-hooks`: error; `exhaustive-deps`: warn.

## Format

- Prettier: 2-space indent, single quotes, semicolons, trailing comma `es5`, print width 100.
- Run `bun run format` before committing.

## TypeScript

- `tsconfig.json`: `noEmit`, `allowJs`, `checkJs: false`, JSX `react-jsx`.
- Run `bun run typecheck` before committing.

## Testing

- Bun test runner; jsdom shim in `src/testSetupDom.js`.
- Tests next to source as `*.test.js`/`*.test.jsx`.
- Import `@testing-library/jest-dom` for DOM matchers.
- Wrap state updates in `act(...)`.

## Git

- Never commit `.env.local`, `Supabase Pass.txt`, `node_modules/`, `build/`, `bun.lockb`, `graphify-out/`.
- Regenerate `bun.lock` only via `bun install` after `package.json` changes.
