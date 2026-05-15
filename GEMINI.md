# Project Instructions: Dept of Physics (DOP) Repo

This document outlines the architecture, conventions, and workflows for the Dept of Physics repository.

## Architecture & Tech Stack

- **Frontend**: React 19 with [Create React App](https://github.com/facebook/create-react-app) (CRA).
- **Routing**: React Router v7 (`react-router-dom`).
- **Styling**: Sass (`.scss`) for modular and global styling.
- **Animations**: Framer Motion for interactive UI elements.
- **AI Integration**: Google Generative AI (`@google/generative-ai`) for chat features.
- **State Management**: React Context API (e.g., `ThemeContext`, `AuthContext`).
- **Backend/API**: Currently uses mocked responses in `src/api.js` for local-only operation.

## Conventions

### File Naming & Structure
- **Components**: PascalCase (e.g., `ChessBoard.jsx`). Located in `src/components/`.
- **Pages**: PascalCase (e.g., `Home.js`). Located in `src/pages/`.
- **Utilities/API**: camelCase (e.g., `api.js`, `gemini.js`).
- **Styles**: camelCase (e.g., `home.scss`). Most global/page styles are in `src/styles/`.

### Imports
- **Explicit Extensions**: Always include the `.js` or `.jsx` extension in imports (e.g., `import App from "./App.js";`). This is required for consistency and potential ESM compatibility.

### Styling
- Prefer Sass (`.scss`) for styles.
- Organize styles in `src/styles/` or keep them alongside components if they are component-specific.

## Workflows

### Development
- Run `npm start` for a local development server.
- The project uses `react-scripts`.

### Testing
- Run `npm test` to launch the test runner.
- Existing tests are in `src/App.test.js` and `tests/unit/`.

### Deployment
- **Platform**: Netlify.
- **Commands**:
  - `npm run deploy`: Build and deploy to production.
  - `deploy.bat`: Windows batch script for automated deployment.
- **Build**: `npm run build` generates the production bundle in the `build/` folder.

## AI & Scientific Tools
- The project includes scientific features like a Fractal Explorer and AI Chat.
- AI Chat uses the Gemini API. Ensure `.env` is configured with necessary keys for production/local use.
