import { requireStorageAdmin } from "./auth.ts";
import { ApiError, jsonResponse } from "./errors.ts";
import type { AuthenticatedAdmin, Env, ListedObject } from "./types.ts";
import {
  getAllowedMime,
  getPageLimit,
  publicObjectUrl,
  requireManagedUploadKey,
  safeDownloadName,
  validateObjectKey,
  validatePrefix,
} from "./utils.ts";

const WRITE_LIMIT = 30;
const WRITE_WINDOW_MS = 60_000;
const writeEvents = new Map<string, number[]>();

function allowedOrigins(env: Env): Set<string> {
  return new Set((env.ALLOWED_ORIGINS ?? "").split(",").map((item) => item.trim()).filter(Boolean));
}

function corsHeaders(request: Request, env: Env): Headers {
  const headers = new Headers();
  const origin = request.headers.get("Origin");
  if (origin && allowedOrigins(env).has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
    headers.set("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type, X-If-Match");
    headers.set("Access-Control-Expose-Headers", "Content-Disposition, ETag, X-Request-ID");
    headers.set("Access-Control-Max-Age", "600");
  }
  return headers;
}

function checkCors(request: Request, env: Env): Response | null {
  const origin = request.headers.get("Origin");
  if (origin && !allowedOrigins(env).has(origin)) {
    return jsonResponse({
      ok: false,
      error: { code: "CORS_ORIGIN_DENIED", message: "This origin is not allowed." },
      requestId: crypto.randomUUID(),
    }, 403);
  }
  if (request.method === "OPTIONS") {
    if (!origin) {
      return new Response(null, { status: 204 });
    }
    return new Response(null, { status: 204, headers: corsHeaders(request, env) });
  }
  return null;
}

function enforceWriteRateLimit(userId: string): void {
  const now = Date.now();
  const recent = (writeEvents.get(userId) ?? []).filter((timestamp) => now - timestamp < WRITE_WINDOW_MS);
  if (recent.length >= WRITE_LIMIT) {
    throw new ApiError(429, "RATE_LIMITED", "Too many storage changes. Please retry in a minute.");
  }
  recent.push(now);
  writeEvents.set(userId, recent);
}

function objectToItem(object: R2Object, env: Env): ListedObject {
  const name = object.key.split("/").pop() ?? object.key;
  return {
    key: object.key,
    name,
    size: object.size,
    contentType: object.httpMetadata?.contentType ?? "application/octet-stream",
    lastModified: object.uploaded.toISOString(),
    etag: object.etag,
    ...(publicObjectUrl(env.PUBLIC_R2_BASE_URL, object.key)
      ? { publicUrl: publicObjectUrl(env.PUBLIC_R2_BASE_URL, object.key) }
      : {}),
  };
}

async function requireJson(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get("Content-Type")?.toLowerCase().includes("application/json")) {
    throw new ApiError(415, "JSON_REQUIRED", "Send a JSON request body.");
  }
  try {
    const value: unknown = await request.json();
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new ApiError(400, "INVALID_JSON", "The JSON request body must be an object.");
    }
    return value as Record<string, unknown>;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, "INVALID_JSON", "The JSON request body is malformed.");
  }
}

async function listFiles(url: URL, env: Env): Promise<Response> {
  const prefix = validatePrefix(url.searchParams.get("prefix") ?? "");
  const cursor = url.searchParams.get("cursor") || undefined;
  const limit = getPageLimit(url.searchParams.get("limit"));
  const page = await env.GBC_PHYSICS_BUCKET.list({
    prefix,
    delimiter: "/",
    cursor,
    limit,
  });

  const items = page.objects
    .filter((object) => !object.key.endsWith("/.folder"))
    .map((object) => objectToItem(object, env));

  return jsonResponse({
    ok: true,
    items,
    prefixes: page.delimitedPrefixes,
    truncated: page.truncated,
    cursor: page.truncated ? page.cursor : null,
    prefix,
  });
}

async function getMetadata(url: URL, env: Env): Promise<Response> {
  const key = validateObjectKey(url.searchParams.get("key") ?? "");
  const object = await env.GBC_PHYSICS_BUCKET.head(key);
  if (!object) throw new ApiError(404, "NOT_FOUND", "The requested object was not found.");
  return jsonResponse({ ok: true, item: objectToItem(object, env) });
}

async function streamObject(url: URL, env: Env, download: boolean): Promise<Response> {
  const key = validateObjectKey(url.searchParams.get("key") ?? "");
  const object = await env.GBC_PHYSICS_BUCKET.get(key);
  if (!object) throw new ApiError(404, "NOT_FOUND", "The requested object was not found.");

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("ETag", object.httpEtag);
  headers.set("Cache-Control", "private, no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  const fileName = safeDownloadName(key.split("/").pop() || "download");
  headers.set(
    "Content-Disposition",
    `${download ? "attachment" : "inline"}; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
  );
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/octet-stream");
  return new Response(object.body, { status: 200, headers });
}

async function uploadFile(request: Request, url: URL, env: Env): Promise<Response> {
  const key = validateObjectKey(url.searchParams.get("key") ?? "");
  const contentType = request.headers.get("Content-Type") ?? "";
  const mimeType = getAllowedMime(key, contentType);
  const contentLength = Number(request.headers.get("Content-Length"));
  const configuredMaxBytes = Number(env.MAX_UPLOAD_BYTES ?? 52_428_800);
  const maxBytes = Number.isSafeInteger(configuredMaxBytes) && configuredMaxBytes > 0
    ? configuredMaxBytes
    : 52_428_800;

  if (!request.body || !Number.isSafeInteger(contentLength) || contentLength < 1) {
    throw new ApiError(400, "CONTENT_LENGTH_REQUIRED", "A non-empty upload with a known Content-Length is required.");
  }
  if (contentLength > maxBytes) {
    throw new ApiError(413, "FILE_TOO_LARGE", `The file exceeds the ${maxBytes}-byte upload limit.`);
  }

  const existing = await env.GBC_PHYSICS_BUCKET.head(key);
  const overwrite = url.searchParams.get("overwrite") === "true";
  let condition: R2Conditional;
  if (existing) {
    if (!overwrite) throw new ApiError(409, "ALREADY_EXISTS", "The destination already exists. Confirm overwrite explicitly.");
    requireManagedUploadKey(key);
    const expectedEtag = request.headers.get("X-If-Match");
    if (!expectedEtag || expectedEtag !== existing.etag) {
      throw new ApiError(409, "ETAG_MISMATCH", "The object changed. Refresh its details before replacing it.");
    }
    condition = { etagMatches: expectedEtag };
  } else {
    condition = { etagDoesNotMatch: "*" };
  }

  const saved = await env.GBC_PHYSICS_BUCKET.put(key, request.body, {
    onlyIf: condition,
    httpMetadata: { contentType: mimeType },
  });
  if (!saved) throw new ApiError(409, "WRITE_CONFLICT", "The object changed during upload. Refresh and retry.");

  return jsonResponse({ ok: true, item: objectToItem(saved, env) }, 201);
}

async function deleteFile(url: URL, env: Env): Promise<Response> {
  const key = validateObjectKey(url.searchParams.get("key") ?? "");
  requireManagedUploadKey(key);
  const existing = await env.GBC_PHYSICS_BUCKET.head(key);
  if (!existing) throw new ApiError(404, "NOT_FOUND", "The requested object was not found.");
  await env.GBC_PHYSICS_BUCKET.delete(key);
  return jsonResponse({ ok: true, deletedKey: key });
}

async function moveOrRename(request: Request, env: Env): Promise<Response> {
  const body = await requireJson(request);
  const sourceKey = validateObjectKey(String(body.sourceKey ?? ""));
  const destinationKey = validateObjectKey(String(body.destinationKey ?? ""));
  requireManagedUploadKey(sourceKey);
  requireManagedUploadKey(destinationKey);
  if (sourceKey === destinationKey) {
    throw new ApiError(400, "SAME_KEY", "Source and destination must be different.");
  }

  const source = await env.GBC_PHYSICS_BUCKET.get(sourceKey);
  if (!source) throw new ApiError(404, "NOT_FOUND", "The source object was not found.");

  const existingDestination = await env.GBC_PHYSICS_BUCKET.head(destinationKey);
  const overwrite = body.overwrite === true;
  let condition: R2Conditional;
  if (existingDestination) {
    if (!overwrite) throw new ApiError(409, "DESTINATION_EXISTS", "The destination already exists.");
    const expected = String(body.expectedDestinationEtag ?? "");
    if (!expected || expected !== existingDestination.etag) {
      throw new ApiError(409, "ETAG_MISMATCH", "The destination changed. Refresh and retry.");
    }
    condition = { etagMatches: expected };
  } else {
    condition = { etagDoesNotMatch: "*" };
  }

  const sourceStream = source.body.pipeThrough(new FixedLengthStream(source.size));
  const copied = await env.GBC_PHYSICS_BUCKET.put(destinationKey, sourceStream, {
    onlyIf: condition,
    httpMetadata: source.httpMetadata,
    customMetadata: source.customMetadata,
  });
  if (!copied || copied.size !== source.size) {
    throw new ApiError(409, "COPY_VERIFY_FAILED", "The destination could not be verified. The source was preserved.");
  }

  const latestSource = await env.GBC_PHYSICS_BUCKET.head(sourceKey);
  if (!latestSource || latestSource.etag !== source.etag) {
    throw new ApiError(409, "SOURCE_CHANGED", "The source changed during the operation. Both objects were preserved.");
  }

  await env.GBC_PHYSICS_BUCKET.delete(sourceKey);
  return jsonResponse({
    ok: true,
    sourceKey,
    destinationKey,
    item: objectToItem(copied, env),
  });
}

async function createFolder(request: Request, env: Env): Promise<Response> {
  const body = await requireJson(request);
  const rawPrefix = String(body.prefix ?? "");
  const prefix = validatePrefix(rawPrefix);
  if (!prefix) throw new ApiError(400, "INVALID_PREFIX", "A folder name is required.");
  const key = `${prefix}.folder`;
  const existing = await env.GBC_PHYSICS_BUCKET.head(key);
  if (existing) throw new ApiError(409, "ALREADY_EXISTS", "That folder marker already exists.");
  const created = await env.GBC_PHYSICS_BUCKET.put(key, new Uint8Array(), {
    onlyIf: { etagDoesNotMatch: "*" },
    httpMetadata: { contentType: "application/x-directory" },
  });
  if (!created) throw new ApiError(409, "WRITE_CONFLICT", "The folder already exists.");
  return jsonResponse({ ok: true, prefix }, 201);
}

async function searchFiles(url: URL, env: Env): Promise<Response> {
  const query = (url.searchParams.get("q") ?? "").trim().toLocaleLowerCase();
  if (!query || query.length > 120) {
    throw new ApiError(400, "INVALID_QUERY", "Enter a search term between 1 and 120 characters.");
  }
  const prefix = validatePrefix(url.searchParams.get("prefix") ?? "");
  let cursor = url.searchParams.get("cursor") || undefined;
  const matches: ListedObject[] = [];
  let pagesRead = 0;
  let truncated = false;
  let nextCursor: string | null = null;

  while (pagesRead < 10 && matches.length < 100) {
    const page = await env.GBC_PHYSICS_BUCKET.list({ prefix, cursor, limit: 1000 });
    for (const object of page.objects) {
      if (!object.key.endsWith("/.folder") && object.key.toLocaleLowerCase().includes(query)) {
        matches.push(objectToItem(object, env));
        if (matches.length >= 100) break;
      }
    }
    pagesRead += 1;
    truncated = page.truncated;
    nextCursor = page.truncated ? page.cursor : null;
    if (!page.truncated || matches.length >= 100) break;
    cursor = page.cursor;
  }

  return jsonResponse({ ok: true, items: matches, prefix, truncated, cursor: nextCursor });
}

async function routeRequest(
  request: Request,
  env: Env,
  requestId: string,
): Promise<{ response: Response; admin?: AuthenticatedAdmin; operation: string; key?: string }> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const method = request.method.toUpperCase();

  if (path === "/api/v1/health" && method === "GET") {
    return {
      response: jsonResponse({ ok: true, service: "gbcphy-r2-api", requestId }),
      operation: "health",
    };
  }

  if (!path.startsWith("/api/v1/")) {
    throw new ApiError(404, "NOT_FOUND", "The requested endpoint does not exist.");
  }

  const admin = await requireStorageAdmin(request, env);

  if (path === "/api/v1/files" && method === "GET") {
    return { response: await listFiles(url, env), admin, operation: "list" };
  }
  if (path === "/api/v1/files" && method === "PUT") {
    enforceWriteRateLimit(admin.userId);
    return { response: await uploadFile(request, url, env), admin, operation: "upload", key: url.searchParams.get("key") ?? undefined };
  }
  if (path === "/api/v1/files" && method === "DELETE") {
    enforceWriteRateLimit(admin.userId);
    return { response: await deleteFile(url, env), admin, operation: "delete", key: url.searchParams.get("key") ?? undefined };
  }
  if (path === "/api/v1/files/metadata" && method === "GET") {
    return { response: await getMetadata(url, env), admin, operation: "metadata", key: url.searchParams.get("key") ?? undefined };
  }
  if (path === "/api/v1/files/download" && method === "GET") {
    return { response: await streamObject(url, env, true), admin, operation: "download", key: url.searchParams.get("key") ?? undefined };
  }
  if (path === "/api/v1/files/preview" && method === "GET") {
    return { response: await streamObject(url, env, false), admin, operation: "preview", key: url.searchParams.get("key") ?? undefined };
  }
  if (path === "/api/v1/files/rename" && method === "POST") {
    enforceWriteRateLimit(admin.userId);
    return { response: await moveOrRename(request, env), admin, operation: "rename" };
  }
  if (path === "/api/v1/files/move" && method === "POST") {
    enforceWriteRateLimit(admin.userId);
    return { response: await moveOrRename(request, env), admin, operation: "move" };
  }
  if (path === "/api/v1/folders" && method === "POST") {
    enforceWriteRateLimit(admin.userId);
    return { response: await createFolder(request, env), admin, operation: "create-folder" };
  }
  if (path === "/api/v1/search" && method === "GET") {
    return { response: await searchFiles(url, env), admin, operation: "search" };
  }

  throw new ApiError(404, "NOT_FOUND", "The requested endpoint does not exist.");
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const requestId = crypto.randomUUID();
    const corsError = checkCors(request, env);
    if (corsError) return corsError;

    const cors = corsHeaders(request, env);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    let operation = "request";
    let userId: string | undefined;
    let safeKey: string | undefined;

    try {
      const result = await routeRequest(request, env, requestId);
      operation = result.operation;
      userId = result.admin?.userId;
      safeKey = result.key;
      const headers = new Headers(result.response.headers);
      cors.forEach((value, key) => headers.set(key, value));
      headers.set("X-Request-ID", requestId);
      const response = new Response(result.response.body, {
        status: result.response.status,
        statusText: result.response.statusText,
        headers,
      });
      console.log(JSON.stringify({ requestId, operation, userId, key: safeKey, status: response.status }));
      return response;
    } catch (error) {
      const apiError = error instanceof ApiError
        ? error
        : new ApiError(500, "INTERNAL_ERROR", "An unexpected storage error occurred.");
      const response = jsonResponse({
        ok: false,
        error: { code: apiError.code, message: apiError.message },
        requestId,
      }, apiError.status, cors);
      response.headers.set("X-Request-ID", requestId);
      console.error(JSON.stringify({ requestId, operation, userId, key: safeKey, status: apiError.status, code: apiError.code }));
      return response;
    }
  },
};
