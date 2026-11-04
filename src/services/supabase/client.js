// Supabase client singleton.
// Created from environment variables; returns null when Supabase is not
// configured so the app still runs in demo mode.

import { createClient } from "@supabase/supabase-js";
import { ENV } from "../../config/environment.js";

const url = ENV.supabaseUrl;
const anonKey = ENV.supabaseAnonKey;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export default supabase;
