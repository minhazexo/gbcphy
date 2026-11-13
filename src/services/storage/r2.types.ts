export interface StorageItem {
  key: string;
  name: string;
  size: number;
  contentType: string;
  lastModified: string;
  etag: string;
  publicUrl?: string;
}

export interface StorageListResponse {
  ok: true;
  items: StorageItem[];
  prefixes: string[];
  truncated: boolean;
  cursor: string | null;
  prefix: string;
}

export interface StorageSearchResponse {
  ok: true;
  items: StorageItem[];
  prefix: string;
  truncated: boolean;
  cursor: string | null;
}

export interface StorageApiErrorBody {
  ok: false;
  error: {
    code: string;
    message: string;
  };
  requestId: string;
}
