// General helper utilities.

// Debounce a function call.
export const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// Deep clone a JSON-serializable value.
export const clone = (value) => JSON.parse(JSON.stringify(value));

// Safe localStorage read with fallback.
export const readLocalStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed !== null ? parsed : fallback;
  } catch {
    return fallback;
  }
};

// Safe localStorage write.
export const writeLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

// Generate a short unique id.
export const generateId = (prefix = "id") => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

// Check if a value is empty (null, undefined, empty string, or empty array/object).
export const isEmpty = (value) => {
  if (value == null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
};

export default {
  debounce,
  clone,
  readLocalStorage,
  writeLocalStorage,
  generateId,
  isEmpty,
};
