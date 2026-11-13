import { supabase } from "../../data/supabase.ts";
import type {
  StorageApiErrorBody,
  StorageItem,
  StorageListResponse,
  StorageSearchResponse,
} from "./r2.types.ts";

const API_BASE = String(import.meta.env.VITE_R2_API_URL ?? "").replace(/\/+$/, "");

export class StorageApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code = "STORAGE_API_ERROR",
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = "StorageApiError";
  }
}

async function getAccessToken(): Promise<string> {
  if (!supabase) {
    throw new StorageApiError("Supabase is not configured in this environment.", 503, "SUPABASE_NOT_CONFIGURED");
  }
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new StorageApiError(error.message, 401, "SESSION_ERROR");
  const token = data.session?.access_token;
  if (!token) throw new StorageApiError("Sign in again to access storage.", 401, "SESSION_REQUIRED");
  return token;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API_BASE) {
    throw new StorageApiError("The R2 Worker URL is not configured. Set VITE_R2_API_URL after the Worker is deployed.", 503, "API_URL_MISSING");
  }
  const token = await getAccessToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_BASE}/api/v1${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    let payload: Partial<StorageApiErrorBody> = {};
    try {
      payload = await response.json() as StorageApiErrorBody;
    } catch {
      // Keep a safe generic message when the API returns non-JSON content.
    }
    throw new StorageApiError(
      payload.error?.message ?? `Storage request failed with status ${response.status}.`,
      response.status,
      payload.error?.code,
      payload.requestId,
    );
  }
  return response.json() as Promise<T>;
}

async function blobRequest(path: string): Promise<{ blob: Blob; fileName: string }> {
  if (!API_BASE) {
    throw new StorageApiError("The R2 Worker URL is not configured.", 503, "API_URL_MISSING");
  }
  const token = await getAccessToken();
  const response = await fetch(`${API_BASE}/api/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) {
    let payload: Partial<StorageApiErrorBody> = {};
    try { payload = await response.json() as StorageApiErrorBody; } catch { /* ignore */ }
    throw new StorageApiError(
      payload.error?.message ?? `File request failed with status ${response.status}.`,
      response.status,
      payload.error?.code,
      payload.requestId,
    );
  }
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const utf8Name = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  const quotedName = disposition.match(/filename="([^"]+)"/i)?.[1];
  let fileName = "download";
  try {
    fileName = utf8Name ? decodeURIComponent(utf8Name) : quotedName ?? fileName;
  } catch {
    fileName = quotedName ?? fileName;
  }
  return { blob: await response.blob(), fileName };
}

const encoded = (value: string) => encodeURIComponent(value);

export const r2StorageService = {
  listFiles(prefix = "", cursor?: string | null, limit = 50) {
    const params = new URLSearchParams({ prefix, limit: String(limit) });
    if (cursor) params.set("cursor", cursor);
    return request<StorageListResponse>(`/files?${params.toString()}`);
  },

  getMetadata(key: string) {
    return request<{ ok: true; item: StorageItem }>(`/files/metadata?key=${encoded(key)}`);
  },

  searchFiles(query: string, prefix = "", cursor?: string | null) {
    const params = new URLSearchParams({ q: query, prefix });
    if (cursor) params.set("cursor", cursor);
    return request<StorageSearchResponse>(`/search?${params.toString()}`);
  },

  async uploadFile(file: File, key: string, options: { overwrite?: boolean; etag?: string } = {}) {
    const params = new URLSearchParams({ key });
    if (options.overwrite) params.set("overwrite", "true");
    const headers = new Headers({ "Content-Type": file.type || "application/octet-stream" });
    if (options.etag) headers.set("X-If-Match", options.etag);
    return request<{ ok: true; item: StorageItem }>(`/files?${params.toString()}`, {
      method: "PUT",
      headers,
      body: file,
    });
  },

  async downloadFile(key: string) {
    return blobRequest(`/files/download?key=${encoded(key)}`);
  },

  async previewFile(key: string) {
    return blobRequest(`/files/preview?key=${encoded(key)}`);
  },

  deleteFile(key: string) {
    return request<{ ok: true; deletedKey: string }>(`/files?key=${encoded(key)}`, { method: "DELETE" });
  },

  renameFile(sourceKey: string, destinationKey: string) {
    return request<{ ok: true; sourceKey: string; destinationKey: string; item: StorageItem }>("/files/rename", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceKey, destinationKey }),
    });
  },

  moveFile(sourceKey: string, destinationKey: string) {
    return request<{ ok: true; sourceKey: string; destinationKey: string; item: StorageItem }>("/files/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceKey, destinationKey }),
    });
  },

  createFolder(prefix: string) {
    return request<{ ok: true; prefix: string }>("/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prefix }),
    });
  },
};

export default r2StorageService;
