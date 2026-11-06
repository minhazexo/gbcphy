// Supabase client singleton.
// Created from environment variables; returns null when Supabase is not
// configured so the app still runs in demo mode.

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { ENV } from "../../config/environment.ts";

const url = ENV.supabaseUrl;
const anonKey = ENV.supabaseAnonKey;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export default supabase;
