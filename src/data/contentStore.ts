// Lightweight local content store.
// The site has no backend yet, so admin edits live in localStorage and the
// public pages read from here. Swapping this module for real API calls later
// only requires keeping the same function signatures.

const NOTES_KEY = "gbc-content-notes";
const SYLLABUS_KEY = "gbc-content-syllabus";
const QUESTIONS_KEY = "gbc-content-questions";
const NOTICES_KEY = "gbc-content-notices";
const CONTENT_EVENT = "gbc-content-changed";

export const YEARS = [
  "First Year",
  "Second Year",
  "Third Year",
  "Fourth Year"
];

// Cloudflare R2 public domain
const R2_BASE =
  "https://pub-f03874d54e81451fa22595f6280655a5.r2.dev";

// URL-encode paths for R2
const r2 = (path: string): string =>
  `${R2_BASE}/${encodeURI(path)}`;

export interface NoteItem {
  title: string;
  url: string;
  type: string;
  size?: string;
}

export interface NoticeItem {
  date: string;
  tag: string;
  title: string;
  excerpt: string;
  link: string;
  status: string;
}

// ==========================================
// NOTES
// ==========================================

export const DEFAULT_NOTES: Record<string, NoteItem[]> = {
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

// ==========================================
// SYLLABUS
// ==========================================

export const DEFAULT_SYLLABUS: Record<string, NoteItem[]> = {
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

// ==========================================
// QUESTION BANK
// ==========================================

export const DEFAULT_QUESTIONS: Record<string, NoteItem[]> = {
  "First Year": [
    { title: "Analytic and Vector Geometry", url: r2("Questions/1st year/Analytic and Vector Geometry.pdf"), type: "pdf" },
    { title: "Calculus I", url: r2("Questions/1st year/Calculus I.pdf"), type: "pdf" },
    { title: "Electricity and Magnetism", url: r2("Questions/1st year/Electricity and Magnetism.pdf"), type: "pdf" },
    { title: "Fundamental Chemistry", url: r2("Questions/1st year/Fundamental Chemistry.pdf"), type: "pdf" },
    { title: "Introduction to Computers and Programming", url: r2("Questions/1st year/Introduction to Computers and Programming.pdf"), type: "pdf" },
    { title: "Mechanics and Properties of Matter", url: r2("Questions/1st year/Mechanics and Properties of Matter.pdf"), type: "pdf" },
    { title: "Thermal Physics", url: r2("Questions/1st year/Thermal Physics.pdf"), type: "pdf" }
  ],

  "Second Year": [
    { title: "Atomic Physics", url: r2("Questions/2nd year/Atomic.pdf"), type: "pdf" },
    { title: "Electronics I", url: r2("Questions/2nd year/Electronics1.pdf"), type: "pdf" },
    { title: "Mathematical Physics", url: r2("Questions/2nd year/Mathematical Physics .pdf"), type: "pdf" },
    { title: "Optics", url: r2("Questions/2nd year/Optics.pdf"), type: "pdf" },
    { title: "Waves", url: r2("Questions/2nd year/Wave.pdf"), type: "pdf" }
  ],

  "Third Year": [
    { title: "Classical Electrodynamics", url: r2("Questions/3rd year/Classical Electrodynamics.pdf"), type: "pdf", size: "3.35 MB" },
    { title: "Classical Mechanics & Relativity", url: r2("Questions/3rd year/Classical Mechanics & Relativity.pdf"), type: "pdf", size: "4.52 MB" },
    { title: "Computational Physics", url: r2("Questions/3rd year/Computational Physics.pdf"), type: "pdf", size: "3.08 MB" },
    { title: "Introduction to Astrophysics", url: r2("Questions/3rd year/Introduction to Astrophysics.pdf"), type: "pdf", size: "3.51 MB" },
    { title: "Nuclear Physics", url: r2("Questions/3rd year/Nuclear Physics.pdf"), type: "pdf", size: "2.26 MB" },
    { title: "Photonics & Lasers", url: r2("Questions/3rd year/Photonics & Lasers.pdf"), type: "pdf", size: "4.14 MB" },
    { title: "Quantum Mechanics I", url: r2("Questions/3rd year/Quantum Mechanics I.pdf"), type: "pdf", size: "4.06 MB" },
    { title: "Solid State Physics I", url: r2("Questions/3rd year/Solid State Physics I.pdf"), type: "pdf", size: "3.45 MB" }
  ],

  "Fourth Year": [
    { title: "Electronics II", url: r2("Questions/4th year/Electronics II.pdf"), type: "pdf" },
    { title: "Introduction to Materials Science and Nanotechnology", url: r2("Questions/4th year/Introduction to Materials Science and Nanotechnology.pdf"), type: "pdf" },
    { title: "Methods of Experimental Physics", url: r2("Questions/4th year/Methods of Experimental Physics.pdf"), type: "pdf" },
    { title: "Nuclear and Particle Physics", url: r2("Questions/4th year/Nuclear and Particle Physics.pdf"), type: "pdf" },
    { title: "Quantum Mechanics II", url: r2("Questions/4th year/Quantum Mechanics-II.pdf"), type: "pdf" },
    { title: "Solid State Physics II (1)", url: r2("Questions/4th year/Solid State Physics II (1).pdf"), type: "pdf" },
    { title: "Solid State Physics II", url: r2("Questions/4th year/Solid State Physics II.pdf"), type: "pdf" },
    { title: "Statistical Mechanics", url: r2("Questions/4th year/Statistical Mechanics.pdf"), type: "pdf" }
  ]
};

// ==========================================
// NOTICES
// ==========================================

export const DEFAULT_NOTICES: NoticeItem[] = [
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

// ==========================================
// CONTENT STORAGE UTILITIES
// ==========================================

const clone = <T>(value: T): T =>
  JSON.parse(JSON.stringify(value));

const emitChange = (): void => {
  window.dispatchEvent(new Event(CONTENT_EVENT));
};

const read = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);

    if (!raw) return clone(fallback);

    const parsed = JSON.parse(raw);

    return parsed && typeof parsed === "object"
      ? parsed
      : clone(fallback);

  } catch (error) {
    console.warn(`Could not read ${key}, using defaults.`, error);
    return clone(fallback);
  }
};

const write = (key: string, value: unknown): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    emitChange();
    return true;

  } catch (error) {
    console.error(`Could not save ${key}.`, error);
    return false;
  }
};

// ==========================================
// GET CONTENT
// ==========================================

export const getNotes = (): Record<string, NoteItem[]> =>
  read(NOTES_KEY, DEFAULT_NOTES);

export const getSyllabus = (): Record<string, NoteItem[]> =>
  read(SYLLABUS_KEY, DEFAULT_SYLLABUS);

export const getQuestions = (): Record<string, NoteItem[]> =>
  read(QUESTIONS_KEY, DEFAULT_QUESTIONS);

export const getNotices = (): NoticeItem[] =>
  read(NOTICES_KEY, DEFAULT_NOTICES);

// Load all website content
export const loadSiteContent = () => ({
  notes: getNotes(),
  syllabus: getSyllabus(),
  questions: getQuestions(),
  notices: getNotices()
});

// ==========================================
// SAVE CONTENT
// ==========================================

export const saveNotes = (
  notes: Record<string, NoteItem[]>
): boolean => write(NOTES_KEY, notes);

export const saveSyllabus = (
  syllabus: Record<string, NoteItem[]>
): boolean => write(SYLLABUS_KEY, syllabus);

export const saveQuestions = (
  questions: Record<string, NoteItem[]>
): boolean => write(QUESTIONS_KEY, questions);

export const saveNotices = (
  notices: NoticeItem[]
): boolean => write(NOTICES_KEY, notices);

// ==========================================
// RESET CONTENT
// ==========================================

export const resetSiteContent = (): void => {
  localStorage.removeItem(NOTES_KEY);
  localStorage.removeItem(SYLLABUS_KEY);
  localStorage.removeItem(QUESTIONS_KEY);
  localStorage.removeItem(NOTICES_KEY);

  emitChange();
};

// ==========================================
// DOWNLOAD STATISTICS & FAVORITES
// ==========================================

const DOWNLOADS_KEY = "downloadStats";
const FAVORITES_KEY = "favorites";

export const getDownloads = (): Record<string, number> =>
  read(DOWNLOADS_KEY, {});

export const recordDownload = (
  title: string
): Record<string, number> => {
  const stats = getDownloads();

  stats[title] = (stats[title] || 0) + 1;

  write(DOWNLOADS_KEY, stats);

  return stats;
};

export const getFavorites = (): string[] => {
  const value = read(FAVORITES_KEY, []);

  return Array.isArray(value) ? value : [];
};

export const saveFavorites = (
  favorites: string[]
): boolean => write(FAVORITES_KEY, favorites);

// ==========================================
// CONTENT CHANGE SUBSCRIPTION
// ==========================================

export const subscribeToContent = (
  callback: () => void
): (() => void) => {

  const handler = () => callback();

  window.addEventListener(CONTENT_EVENT, handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener(CONTENT_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
};
