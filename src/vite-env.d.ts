// ImportMeta environment variable declarations for Vite + CRA-style env vars.

interface ImportMetaEnv {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  VITE_GEMINI_API_KEY?: string;
  VITE_SITE_URL?: string;
  REACT_APP_SUPABASE_URL?: string;
  REACT_APP_SUPABASE_ANON_KEY?: string;
  REACT_APP_GEMINI_API_KEY?: string;
  [key: string]: string | undefined;
}

interface ImportMeta {
  env: ImportMetaEnv;
}
