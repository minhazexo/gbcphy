import "@testing-library/jest-dom";

// Browser APIs used by the Hero/home components that jsdom does not provide.
const matchMedia = () => ({
  matches: false,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false
});
globalThis.matchMedia = matchMedia;
globalThis.IntersectionObserver = class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
