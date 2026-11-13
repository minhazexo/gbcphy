import { ApiError } from "./errors.ts";

const MIME_BY_EXTENSION: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
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
    throw new ApiError(415, "UNSUPPORTED_FILE_TYPE", "Only matching PDF and JPEG, PNG, WebP, or GIF files are supported.");
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

export function isManagedUploadKey(key: string): boolean {
  // Destructive changes are limited to this dedicated namespace until a
  // persistent reference index exists for the localStorage-backed catalog.
  return key.startsWith("Admin Uploads/") && key.length > "Admin Uploads/".length;
}

export function requireManagedUploadKey(key: string): void {
  if (!isManagedUploadKey(key)) {
    throw new ApiError(
      409,
      "REFERENCE_CHECK_REQUIRED",
      "This object is outside Admin Uploads/. Rename, move, replace, and delete are disabled until its academic-content references can be verified.",
    );
  }
}

export function getPageLimit(value: string | null): number {
  const parsed = Number(value ?? 50);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new ApiError(400, "INVALID_LIMIT", "The page limit must be a positive integer.");
  }
  return Math.min(parsed, 100);
}
