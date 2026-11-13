export interface Env {
  GBC_PHYSICS_BUCKET: R2Bucket;
  SUPABASE_URL: string;
  SUPABASE_PUBLISHABLE_KEY: string;
  SUPABASE_SECRET_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  PUBLIC_R2_BASE_URL?: string;
  ALLOWED_ORIGINS: string;
  MAX_UPLOAD_BYTES?: string;
  STORAGE_ROLE_SOURCE_VERIFIED?: string;
}

export interface AuthenticatedAdmin {
  userId: string;
  role: "super_admin" | "department_admin" | "admin";
}

export interface ListedObject {
  key: string;
  name: string;
  size: number;
  contentType: string;
  lastModified: string;
  etag: string;
  publicUrl?: string;
}

export interface ApiErrorBody {
  ok: false;
  error: {
    code: string;
    message: string;
  };
  requestId: string;
}
