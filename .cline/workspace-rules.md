# Workspace Rules - Physics + AI Project

## Project Overview
This is a full-stack application using:
- Frontend: React (Vite or CRA)
- Backend: Node.js + Express
- Database: MongoDB (Mongoose)
- AI: Google Gemini API
- Real-time: Socket.io
- Graphics: Three.js

---

## Frontend Rules
- Use functional React components only
- Use hooks properly (useEffect, useState)
- Avoid unnecessary re-renders
- Keep components modular and reusable
- Use React Router for navigation
- Optimize heavy UI (Three.js, animations)

---

## Backend Rules
- Use Express for API structure
- Keep controllers separate from routes
- Use async/await for all DB operations
- Validate all incoming requests
- Handle errors properly with try/catch
- Use middleware for authentication

---

## Database Rules
- Use MongoDB with Mongoose schemas
- Define clear schema structure
- Avoid duplicate fields
- Index important fields for performance

---

## Gemini AI Rules
- Use Gemini API ONLY in backend (never frontend)
- Use:
  - gemini-2.5-flash → fast responses
  - gemini-2.5-pro → complex reasoning
- Always sanitize user input before sending to AI
- Cache repeated AI responses when possible

---

## Security Rules
- JWT authentication for protected routes
- Hash passwords using bcryptjs
- Enable CORS properly
- Validate all inputs (express-validator)
- Protect against injection attacks

---

## Performance Rules
- Avoid unnecessary API calls
- Optimize React rendering
- Lazy load heavy components
- Minimize bundle size
- Use caching where possible

---

## Three.js / Graphics Rules
- Dispose of geometries and materials properly
- Avoid memory leaks in animation loops
- Use requestAnimationFrame correctly
- Optimize textures and shaders
- Keep render loops efficient

---

## Project Structure Rules
- /client → React frontend
- /server → Express backend
- /models → MongoDB schemas
- /routes → API routes
- /controllers → business logic
- /utils → helper functions
- /services → external integrations (Gemini API, etc.)

---

## AI Agent Rules
- Always ask before deleting or restructuring files
- Explain changes before applying them
- Prefer minimal safe edits
- Maintain backward compatibility