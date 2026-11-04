// Lightweight local content store.
// The site has no backend yet, so admin edits live in localStorage and the
// public pages read from here. Swapping this module for real API calls later
// only requires keeping the same function signatures.

const NOTES_KEY = "gbc-content-notes";
const SYLLABUS_KEY = "gbc-content-syllabus";
const NOTICES_KEY = "gbc-content-notices";
const CONTENT_EVENT = "gbc-content-changed";

export const YEARS = ["First Year", "Second Year", "Third Year", "Fourth Year"];

// R2 bucket public domain — upload your PDFs here with matching filenames.
// Using the auto-generated r2.dev public development URL.
// For production, connect a custom domain to this bucket.
const R2_BASE = "https://pub-f03874d54e81451fa22595f6280655a5.r2.dev/gbc-physics-pdfs";

// URL-encode a path segment for R2 (spaces → %20, etc.)
const r2 = (path) => `${R2_BASE}/${encodeURI(path)}`;

export const DEFAULT_NOTES = {
  "First Year": [
    { title: "Analytical and Vector Geometry", url: r2("1st Year Notes/Analytical and Vector Geometry.pdf"), type: "pdf" },
    { title: "Calculus-1", url: r2("1st Year Notes/Calculus-1.pdf"), type: "pdf" },
    { title: "Electricity", url: r2("1st Year Notes/Electricity.pdf"), type: "pdf" },
    { title: "Mechanics and Properties of Matter", url: r2("1st Year Notes/Mechanics and Properties of Matter.pdf"), type: "pdf" },
    { title: "NM Stat", url: r2("1st Year Notes/NM Stat.pdf"), type: "pdf" },
    { title: "Thermal Physics", url: r2("1st Year Notes/Thermal Physics.pdf"), type: "pdf" }
  ],
  "Second Year": [
    { title: "PHA 201 (OPTICS)", url: r2("2nd Year Notes/EMON { PHA 201 (OPTICS) }_compressed.pdf"), type: "pdf" },
    { title: "PHA 202 (ELECTRONICS 1)", url: r2("2nd Year Notes/EMON { PHA 202 (ELECTRONICS 1) }_compressed.pdf"), type: "pdf" },
    { title: "PHA 203 (MP)", url: r2("2nd Year Notes/EMON { PHA 203 (MP) }_compressed.pdf"), type: "pdf" },
    { title: "PHA 204 (AMP)", url: r2("2nd Year Notes/EMON { PHA 204 (AMP) }_compressed.pdf"), type: "pdf" },
    { title: "PHA 205 (WOAM)", url: r2("2nd Year Notes/EMON {PHA 205 (WOAM) }_compressed.pdf"), type: "pdf" }
  ],
  "Third Year": [
    { title: "Astrophysics", url: r2("3rd Year Notes/Astrophysics.PHA-308.pdf"), type: "pdf" },
    { title: "Classical Mechanics", url: r2("3rd Year Notes/Classical Mechanics.PHA-301.pdf"), type: "pdf" },
    { title: "Electrodynamics", url: r2("3rd Year Notes/Electrodynamics.PHA-305.pdf"), type: "pdf" },
    { title: "Lasers and Photonics", url: r2("3rd Year Notes/Lasers and Photonics..pdf"), type: "pdf" },
    { title: "Nuclear Physics", url: r2("3rd Year Notes/Nuclear Physics.PHA-304.pdf"), type: "pdf" },
    { title: "Quantum Mechanics", url: r2("3rd Year Notes/Quantum Machanics.PHA-302.pdf"), type: "pdf" },
    { title: "Solid State Physics", url: r2("3rd Year Notes/Solid State Physics.PH-303.pdf"), type: "pdf" },
    { title: "Astrophysics Roy(20-21)", url: r2("3rd Year Notes/Roy Notes/Astrophysics (ROY).pdf"), type: "pdf" },
    { title: "Classical Mechanics and Relativity Roy(20-21)", url: r2("3rd Year Notes/Roy Notes/Classical mechanics and relativity (ROY).pdf"), type: "pdf" },
    { title: "Electrodynamics Roy(20-21)", url: r2("3rd Year Notes/Roy Notes/Electrodynamics (ROY).pdf"), type: "pdf" },
    { title: "Lasers and Photonics Roy(20-21)", url: r2("3rd Year Notes/Roy Notes/Lasers(ROY).pdf"), type: "pdf" },
    { title: "Nuclear Physics Roy(20-21)", url: r2("3rd Year Notes/Roy Notes/Nuclear (ROY).pdf"), type: "pdf" },
    { title: "Quantum Mechanics Roy(20-21)", url: r2("3rd Year Notes/Roy Notes/Quantum (ROY).pdf"), type: "pdf" },
    { title: "Solid State Physics Roy(20-21)", url: r2("3rd Year Notes/Roy Notes/Solid(ROY).pdf"), type: "pdf" }
  ],
  "Fourth Year": [
    { title: "Experimental Physics (ROY)", url: r2("4th Year Notes/Experimental 4 th yr (ROY).pdf"), type: "pdf", size: "33 MB" },
    { title: "Nuclear Physics II (ROY)", url: r2("4th Year Notes/Nuclear 4 th yr (ROY).pdf"), type: "pdf", size: "32 MB" },
    { title: "Quantum Mechanics II (ROY)", url: r2("4th Year Notes/Quantum -2 4th yr (ROY).pdf"), type: "pdf", size: "40 MB" },
    { title: "Solid State Physics II (ROY)", url: r2("4th Year Notes/SSP-2  4th yr (ROY).pdf"), type: "pdf", size: "41 MB" },
    { title: "Statistical Physics (ROY)", url: r2("4th Year Notes/Statistical 4th yr (ROY).pdf"), type: "pdf", size: "41 MB" }
  ]
};

export const DEFAULT_SYLLABUS = {
  "First Year": [
    { title: "1st & 2nd Year Syllabus", url: r2("Syllabus/1st and 2nd Year.pdf"), type: "pdf", size: "1.2 MB" }
  ],
  "Second Year": [
    { title: "1st & 2nd Year Syllabus", url: r2("Syllabus/1st and 2nd Year.pdf"), type: "pdf", size: "1.2 MB" }
  ],
  "Third Year": [
    { title: "3rd Year Syllabus", url: r2("Syllabus/3rd Year.pdf"), type: "pdf", size: "0.9 MB" }
  ],
  "Fourth Year": [
    { title: "4th Year Syllabus", url: r2("Syllabus/4th Year.pdf"), type: "pdf", size: "1.1 MB" }
  ]
};

export const DEFAULT_NOTICES = [
  {
    date: "Oct 02, 2026",
    tag: "Examination",
    title: "M.Sc. Final Examination Routine",
    excerpt: "The final examination routine for M.Sc. students has been published. Visit the class routine page for the full schedule.",
    link: "/class-routine",
    status: "Upcoming"
  },
  {
    date: "Sep 15, 2026",
    tag: "Admission",
    title: "B.Sc. (Honours) 1st Year Orientation",
    excerpt: "Newly admitted physics students are invited to the departmental orientation program at the Science Building gallery.",
    link: "/academic",
    status: "Recent"
  },
  {
    date: "Aug 20, 2026",
    tag: "Seminar",
    title: "Seminar: Quantum Computing Basics",
    excerpt: "An introductory seminar on quantum computing for honours students, hosted by the department seminar committee.",
    link: "/about",
    status: "Past"
  }
];

const clone = (value) => JSON.parse(JSON.stringify(value));

const emitChange = () => {
  window.dispatchEvent(new Event(CONTENT_EVENT));
};

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return clone(fallback);
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : clone(fallback);
  } catch (error) {
    console.warn(`Could not read ${key}, using defaults.`, error);
    return clone(fallback);
  }
};

const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    emitChange();
    return true;
  } catch (error) {
    console.error(`Could not save ${key}.`, error);
    return false;
  }
};

export const getNotes = () => read(NOTES_KEY, DEFAULT_NOTES);
export const getSyllabus = () => read(SYLLABUS_KEY, DEFAULT_SYLLABUS);
export const getNotices = () => read(NOTICES_KEY, DEFAULT_NOTICES);

export const loadSiteContent = () => ({
  notes: getNotes(),
  syllabus: getSyllabus(),
  notices: getNotices()
});

export const saveNotes = (notes) => write(NOTES_KEY, notes);
export const saveSyllabus = (syllabus) => write(SYLLABUS_KEY, syllabus);
export const saveNotices = (notices) => write(NOTICES_KEY, notices);

export const resetSiteContent = () => {
  localStorage.removeItem(NOTES_KEY);
  localStorage.removeItem(SYLLABUS_KEY);
  localStorage.removeItem(NOTICES_KEY);
  emitChange();
};

// Downloads and favorites belong to the same library as notes and syllabus,
// so they live behind this module rather than inside the pages that use them.
const DOWNLOADS_KEY = "downloadStats";
const FAVORITES_KEY = "favorites";

export const getDownloads = () => read(DOWNLOADS_KEY, {});

export const recordDownload = (title) => {
  const stats = getDownloads();
  stats[title] = (stats[title] || 0) + 1;
  write(DOWNLOADS_KEY, stats);
  return stats;
};

export const getFavorites = () => {
  const value = read(FAVORITES_KEY, []);
  return Array.isArray(value) ? value : [];
};

export const saveFavorites = (favorites) => write(FAVORITES_KEY, favorites);

// Keeps every mounted consumer in sync (same tab via a custom event,
// other tabs via the native storage event).
export const subscribeToContent = (callback) => {
  const handler = () => callback();
  window.addEventListener(CONTENT_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CONTENT_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
};
