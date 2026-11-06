// Environment configuration for the Department of Physics portal.
// Supports both Vite (VITE_*) and legacy CRA (REACT_APP_*) prefixes.

const getEnv = (key: string, fallback: string): string => {
  return (
    import.meta.env[key] ||
    import.meta.env[key.replace("VITE_", "REACT_APP_")] ||
    fallback
  );
};

export const ENV = {
  supabaseUrl: getEnv("VITE_SUPABASE_URL", ""),
  supabaseAnonKey: getEnv("VITE_SUPABASE_ANON_KEY", ""),
  siteUrl: getEnv("VITE_SITE_URL", window.location.origin),
};

export const isSupabaseConfigured = (): boolean =>
  Boolean(ENV.supabaseUrl && ENV.supabaseAnonKey);

export default ENV;
