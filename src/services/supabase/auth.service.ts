// Authentication service backed by Supabase Auth.
// All Supabase auth calls live here; UI components should not call Supabase directly.

import { supabase, isSupabaseConfigured } from "./client.ts";

// Map a Supabase user object to the profile shape used throughout the app.
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  roll: string;
  session: string;
  profile_image: string | null;
  full_name: string;
  role: string;
  avatar_url: string | null;
  phone: string;
}

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
    full_name: meta.full_name || "",
    role: meta.role || "student",
    avatar_url: meta.profile_image || null,
    phone: meta.phone || "",
  };
};

// Resolve the stored session once at startup.
export const getInitialSession = async (): Promise<any | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
};

// Listen for auth state changes across tabs.
export const subscribeToSession = (callback: (session: any) => void): (() => void) => {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
};

export const signIn = async (email: string, password: string): Promise<UserProfile> => {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured.");
  }
  const { data, error } = await supabase!.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return profileFromUser(data.user) as UserProfile;
};

// Sign in using a student ID instead of email. Looks up the email from the
// students/profiles table, then signs in with that email and password.
export const signInWithStudentId = async (studentId: string, password: string): Promise<UserProfile> => {
  const { lookupStudentEmail } = await import("../../data/db.ts");
  const email = await lookupStudentEmail(studentId);
  return signIn(email, password);
};

export const signUp = async (username: string, email: string, password: string): Promise<{
  profile: UserProfile | null;
  needsConfirmation: boolean;
}> => {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured.");
  }
  const { data, error } = await supabase!.auth.signUp({
    email,
    password,
    options: { data: { username: username.trim() } },
  });
  if (error) throw new Error(error.message);
  return {
    profile: profileFromUser(data.user),
    needsConfirmation: !data.session,
  };
};

export const signOut = async (): Promise<void> => {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
};

export const resetPassword = async (email: string): Promise<void> => {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured.");
  }
  const { error } = await supabase!.auth.resetPasswordForEmail(email);
  if (error) throw new Error(error.message);
};

export const updatePassword = async (newPassword: string): Promise<UserProfile> => {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured.");
  }
  const { data, error } = await supabase!.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
  return profileFromUser(data.user) as UserProfile;
};

export const resendConfirmation = async (email: string): Promise<void> => {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured.");
  }
  const { error } = await supabase!.auth.resend({ email, type: "signup" });
  if (error) throw new Error(error.message);
};

export const updateUserMetadata = async (userData: Record<string, unknown>): Promise<UserProfile> => {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured.");
  }
  const { data, error } = await supabase!.auth.updateUser({ data: userData });
  if (error) throw new Error(error.message);
  return profileFromUser(data.user) as UserProfile;
};

export const getCurrentUser = async (): Promise<any | null> => {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
};

export const verifyOtp = async (tokenHash: string, type: string): Promise<any> => {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured.");
  }
  const { data, error } = await supabase!.auth.verifyOtp({ token_hash: tokenHash, type });
  if (error) throw new Error(error.message);
  return data;
};

export default {
  signIn,
  signInWithStudentId,
  signUp,
  signOut,
  resetPassword,
  updatePassword,
  resendConfirmation,
  updateUserMetadata,
  getInitialSession,
  subscribeToSession,
  getCurrentUser,
  verifyOtp,
  profileFromUser,
  isSupabaseConfigured,
};
