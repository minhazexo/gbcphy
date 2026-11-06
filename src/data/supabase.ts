// Supabase client for the account layer.
//
// There is exactly one client in the app. It is created in
// services/supabase/client.ts from the Vite env vars (VITE_SUPABASE_URL /
// VITE_SUPABASE_ANON_KEY, with REACT_APP_* aliases). Creating a second client
// here would mean two GoTrue instances sharing one localStorage session, which
// races on token refresh, so this module only re-exports the shared one.

export {
  supabase,
  isSupabaseConfigured,
  default
} from "../services/supabase/client.ts";
