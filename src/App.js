// Backward-compatible re-export of the new App entry.
// The application root now lives in src/app/App.js; this file is kept
// so that src/App.test.js and any existing imports continue to work.

export { default } from "./app/App.js";
