// One owner for the signed-in identity, backed by Supabase Auth.
// Pages talk to AuthContext; this module is the only place that talks
// to Supabase, so swapping the provider means changing this seam.

import { supabase } from "./supabase.ts";
import { lookupStudentEmail } from "./db.ts";

const requireClient = () => {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY."
    );
  }
  return supabase;
};

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  roll: string;
  session: string;
  profile_image: string | null;
}

// Supabase user -> the shape the pages already render.
export const profileFromUser = (user: any): UserProfile | null => {
  if (!user) return null;
  const meta = user.user_metadata || {};
  return {
    id: user.id,
    username: meta.username || (user.email ? user.email.split("@")[0] : "Member"),
    email: user.email || "",
    roll: meta.roll || "",
    session: meta.session || "",
    profile_image: meta.profile_image || null,
  };
};

// Resolve the stored session once at startup.
export const getInitialSession = async (): Promise<any | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
};

// Same-tab and cross-tab auth changes arrive here.
export const subscribeToSession = (callback: (session: any) => void): (() => void) => {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
};

export const signIn = async (email: string, password: string): Promise<UserProfile> => {
  const client = requireClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return profileFromUser(data.user) as UserProfile;
};

// Login using a student ID instead of an email. Looks up the email from the
// students/profiles table, then signs in with that email and the password.
export const signInWithStudentId = async (studentId: string, password: string): Promise<UserProfile> => {
  const email = await lookupStudentEmail(studentId);
  return signIn(email, password);
};

export const signUp = async (username: string, email: string, password: string): Promise<{
  profile: UserProfile | null;
  needsConfirmation: boolean;
}> => {
  const client = requireClient();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { username: username.trim() } },
  });
  if (error) throw new Error(error.message);
  return {
    profile: profileFromUser(data.user),
    // Email confirmation settings decide whether a session comes back.
    needsConfirmation: !data.session,
  };
};

export const signOut = async (): Promise<void> => {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
};

export const resetPassword = async (email: string): Promise<void> => {
  const client = requireClient();
  const { error } = await client.auth.resetPasswordForEmail(email);
  if (error) throw new Error(error.message);
};

export const updatePassword = async (newPassword: string): Promise<UserProfile> => {
  const client = requireClient();
  const { data, error } = await client.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
  return profileFromUser(data.user) as UserProfile;
};

export const resendConfirmation = async (email: string): Promise<void> => {
  const client = requireClient();
  const { error } = await client.auth.resend({ email, type: "signup" });
  if (error) throw new Error(error.message);
};

export const updateProfileAndSave = async (userData: Record<string, unknown>): Promise<UserProfile> => {
  const client = requireClient();
  const { data, error } = await client.auth.updateUser({ data: userData });
  if (error) throw new Error(error.message);
  return profileFromUser(data.user) as UserProfile;
};
