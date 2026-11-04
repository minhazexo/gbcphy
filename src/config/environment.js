// Environment configuration for the Department of Physics portal.
// Supports both Vite (VITE_*) and legacy CRA (REACT_APP_*) prefixes.

const getEnv = (key, fallback) => {
  return import.meta.env[key] || import.meta.env[key.replace("VITE_", "REACT_APP_")] || fallback;
};

export const ENV = {
  supabaseUrl: getEnv("VITE_SUPABASE_URL", ""),
  supabaseAnonKey: getEnv("VITE_SUPABASE_ANON_KEY", ""),
  geminiApiKey: getEnv("VITE_GEMINI_API_KEY", ""),
  siteUrl: getEnv("VITE_SITE_URL", window.location.origin),
};

export const isSupabaseConfigured = () => Boolean(ENV.supabaseUrl && ENV.supabaseAnonKey);

export default ENV;
