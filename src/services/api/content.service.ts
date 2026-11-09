// Content service wrapping the localStorage-backed content store.
// This is the single place where notes, syllabus, notices, downloads and
// favorites are read/written. Swap this for real API calls later without
// touching UI components.

import {
  getNotes,
  getSyllabus,
  getQuestions,
  getNotices,
  loadSiteContent,
  saveNotes,
  saveSyllabus,
  saveQuestions,
  saveNotices,
  resetSiteContent,
  subscribeToContent,
  getDownloads,
  recordDownload,
  getFavorites,
  saveFavorites,
  YEARS,
  DEFAULT_NOTES,
  DEFAULT_SYLLABUS,
  DEFAULT_QUESTIONS,
  DEFAULT_NOTICES,
} from "../../data/contentStore.ts";

export const contentService = {
  getNotes,
  getSyllabus,
  getQuestions,
  getNotices,
  loadSiteContent,
  saveNotes,
  saveSyllabus,
  saveQuestions,
  saveNotices,
  resetSiteContent,
  subscribeToContent,
  getDownloads,
  recordDownload,
  getFavorites,
  saveFavorites,
  YEARS,
  DEFAULT_NOTES,
  DEFAULT_SYLLABUS,
  DEFAULT_QUESTIONS,
  DEFAULT_NOTICES,
};

export default contentService;
