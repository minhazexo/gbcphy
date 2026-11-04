import { JSDOM } from "jsdom";

// Establish a minimal browser DOM so @testing-library/react can render
// React components under Bun's test runner (which has no `document` by default).
const dom = new JSDOM("<!doctype html><html><body><div id=\"root\"></div></body></html>", {
  url: "http://localhost/"
});

const windowObj = dom.window;

globalThis.window = windowObj;
globalThis.document = windowObj.document;
globalThis.navigator = windowObj.navigator;
globalThis.HTMLElement = windowObj.HTMLElement;
globalThis.HTMLInputElement = windowObj.HTMLInputElement;
globalThis.Event = windowObj.Event;
globalThis.MouseEvent = windowObj.MouseEvent;
globalThis.localStorage = windowObj.localStorage;
globalThis.sessionStorage = windowObj.sessionStorage;

const noop = () => {};
const matchMedia = () => ({
  matches: false,
  addEventListener: noop,
  removeEventListener: noop,
  addListener: noop,
  removeListener: noop,
  dispatchEvent: () => false
});
globalThis.matchMedia = matchMedia;
windowObj.matchMedia = matchMedia;

globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);

globalThis.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};
windowObj.IntersectionObserver = globalThis.IntersectionObserver;

// jsdom does not implement canvas.getContext without the `canvas` native module.
// Stub it so components that render a <canvas> (e.g. Header) mount in tests.
windowObj.HTMLCanvasElement.prototype.getContext = () => ({
  fillRect: noop,
  clearRect: noop,
  getImageData: () => ({ data: new Uint8ClampedArray(0) }),
  putImageData: noop,
  drawImage: noop,
  createLinearGradient: () => ({ addColorStop: noop }),
  beginPath: noop,
  arc: noop,
  lineTo: noop,
  stroke: noop,
  fill: noop,
  save: noop,
  restore: noop,
  translate: noop,
  rotate: noop,
  scale: noop,
  measureText: () => ({ width: 0 }),
  font: ""
});
