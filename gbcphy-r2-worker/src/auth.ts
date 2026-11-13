import {
  createRemoteJWKSet,
  decodeProtectedHeader,
  jwtVerify,
} from "jose";
import { ApiError } from "./errors.ts";
import type { AuthenticatedAdmin, Env } from "./types.ts";

const ADMIN_ROLES = new Set(["super_admin", "department_admin"]);
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type VerifiedIdentity = { id: string };

async function verifyLegacyHs256(
  token: string,
  env: Env,
): Promise<VerifiedIdentity> {
  // Supabase recommends validating legacy symmetric JWTs through Auth's
  // /user endpoint rather than attempting to expose the JWT signing secret.
  const response = await fetch(`${env.SUPABASE_URL.replace(/\/+$/, "")}/auth/v1/user`, {
    headers: {
      apikey: env.SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (response.status === 401 || response.status === 403) {
    throw new ApiError(401, "UNAUTHENTICATED", "The access token is invalid or expired.");
  }
  if (!response.ok) {
    throw new ApiError(503, "AUTH_PROVIDER_UNAVAILABLE", "Supabase authentication could not be verified.");
  }

  const user = (await response.json()) as { id?: string };
  if (!user.id || !UUID_PATTERN.test(user.id)) {
    throw new ApiError(401, "UNAUTHENTICATED", "The access token did not identify a valid user.");
  }
  return { id: user.id };
}

async function verifyAsymmetricJwt(
  token: string,
  env: Env,
): Promise<VerifiedIdentity> {
  const issuer = `${env.SUPABASE_URL.replace(/\/+$/, "")}/auth/v1`;
  const jwks = createRemoteJWKSet(
    new URL(`${issuer}/.well-known/jwks.json`),
    { timeoutDuration: 5_000, cooldownDuration: 10_000, cacheMaxAge: 600_000 },
  );

  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer,
      audience: "authenticated",
      algorithms: ["ES256", "RS256", "EdDSA"],
    });
    if (typeof payload.sub !== "string" || !UUID_PATTERN.test(payload.sub)) {
      throw new ApiError(401, "UNAUTHENTICATED", "The access token did not identify a valid user.");
    }
    return { id: payload.sub };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, "UNAUTHENTICATED", "The access token is invalid or expired.");
  }
}

async function getCurrentProfileRole(userId: string, env: Env): Promise<string> {
  const serverKey = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serverKey) {
    throw new ApiError(503, "SERVER_CONFIGURATION", "Storage authorization is not configured on the Worker.");
  }

  const endpoint = new URL("/rest/v1/profiles", env.SUPABASE_URL);
  endpoint.searchParams.set("select", "role");
  endpoint.searchParams.set("id", `eq.${userId}`);
  endpoint.searchParams.set("limit", "1");

  const response = await fetch(endpoint, {
    headers: {
      apikey: serverKey,
      Authorization: `Bearer ${serverKey}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ApiError(503, "ROLE_LOOKUP_FAILED", "The current storage role could not be verified.");
  }

  const rows = (await response.json()) as Array<{ role?: string }>;
  if (!Array.isArray(rows) || rows.length !== 1 || typeof rows[0]?.role !== "string") {
    throw new ApiError(403, "FORBIDDEN", "No valid application role is assigned to this account.");
  }
  return rows[0].role;
}

export async function requireStorageAdmin(
  request: Request,
  env: Env,
): Promise<AuthenticatedAdmin> {
  const authorization = request.headers.get("Authorization") ?? "";
  const match = authorization.match(/^Bearer\s+([^\s]+)$/i);
  if (!match) {
    throw new ApiError(401, "UNAUTHENTICATED", "A Supabase access token is required.");
  }
  if (!env.SUPABASE_URL || !env.SUPABASE_PUBLISHABLE_KEY) {
    throw new ApiError(503, "SERVER_CONFIGURATION", "Supabase authentication is not configured on the Worker.");
  }

  let identity: VerifiedIdentity;
  let header: ReturnType<typeof decodeProtectedHeader>;
  try {
    header = decodeProtectedHeader(match[1]);
  } catch {
    throw new ApiError(401, "UNAUTHENTICATED", "The access token is malformed.");
  }

  if (header.alg === "HS256") {
    identity = await verifyLegacyHs256(match[1], env);
  } else if (["ES256", "RS256", "EdDSA"].includes(header.alg ?? "")) {
    identity = await verifyAsymmetricJwt(match[1], env);
  } else {
    throw new ApiError(401, "UNAUTHENTICATED", "The access token uses an unsupported signing algorithm.");
  }

  const role = await getCurrentProfileRole(identity.id, env);

  // Repository migrations permit users to update their own profiles row.
  // Until the live project proves that role escalation is prevented (or a
  // separate trusted role source is established), the Worker fails closed.
  if (env.STORAGE_ROLE_SOURCE_VERIFIED !== "true") {
    throw new ApiError(
      503,
      "ROLE_SOURCE_NOT_VERIFIED",
      "Storage access is disabled until the production role source and role-change policies have been audited.",
    );
  }

  if (!ADMIN_ROLES.has(role)) {
    throw new ApiError(403, "FORBIDDEN", "You do not have permission to manage storage.");
  }

  return { userId: identity.id, role: role as AuthenticatedAdmin["role"] };
}
