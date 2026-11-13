import { ApiError } from "./errors.ts";

const MIME_BY_EXTENSION: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  txt: "text/plain",
  csv: "text/csv",
  rtf: "application/rtf",
  zip: "application/zip",
};

export function validateObjectKey(value: string, allowPrefix = false): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new ApiError(400, "INVALID_KEY", "An object key is required.");
  }
  if (value.length > 1024 || /[\\\u0000-\u001f\u007f]/.test(value)) {
    throw new ApiError(400, "INVALID_KEY", "The object key contains invalid characters.");
  }
  if (/%(?:2e|2f|5c)/i.test(value) || /^https?:\/\//i.test(value)) {
    throw new ApiError(400, "INVALID_KEY", "Encoded traversal paths and URLs are not valid object keys.");
  }

  const key = allowPrefix && value.endsWith("/") ? value.slice(0, -1) : value;
  if (!key || key.startsWith("/") || key.endsWith("/")) {
    throw new ApiError(400, "INVALID_KEY", "The object key must be a relative key.");
  }
  const segments = key.split("/");
  if (segments.some((segment) => !segment || segment === "." || segment === "..")) {
    throw new ApiError(400, "INVALID_KEY", "The object key contains an invalid path segment.");
  }
  return key;
}

export function validatePrefix(value: string): string {
  if (!value) return "";
  const normalized = validateObjectKey(value, true);
  return normalized ? normalized + "/" : "";
}

export function getAllowedMime(fileName: string, contentType: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  const expected = MIME_BY_EXTENSION[extension];
  if (!expected || expected !== contentType.split(";")[0].trim().toLowerCase()) {
    throw new ApiError(415, "UNSUPPORTED_FILE_TYPE", "The file extension and MIME type must match an allowed PDF, image, Office document, text, CSV, RTF, or ZIP format.");
  }
  return expected;
}

export function publicObjectUrl(baseUrl: string | undefined, key: string): string | undefined {
  if (!baseUrl) return undefined;
  const base = baseUrl.replace(/\/+$/, "");
  return `${base}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

export function safeDownloadName(name: string): string {
  return name.replace(/[\r\n"\\]/g, "_").replace(/[\u0000-\u001f\u007f]/g, "");
}

export function getPageLimit(value: string | null): number {
  const parsed = Number(value ?? 50);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new ApiError(400, "INVALID_LIMIT", "The page limit must be a positive integer.");
  }
  return Math.min(parsed, 100);
}
