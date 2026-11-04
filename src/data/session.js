// One owner for the signed-in identity, backed by Supabase Auth.
// Pages talk to AuthContext; this module is the only place that talks
// to Supabase, so swapping the provider means changing this seam.

import { supabase } from "./supabase.js";
import { lookupStudentEmail } from "./db.js";

const requireClient = () => {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY."
    );
  }
  return supabase;
};

// Supabase user -> the shape the pages already render.
export const profileFromUser = (user) => {
  if (!user) return null;
  const meta = user.user_metadata || {};
  return {
    id: user.id,
    username: meta.username || (user.email ? user.email.split("@")[0] : "Member"),
    email: user.email || "",
    roll: meta.roll || "",
    session: meta.session || "",
    profile_image: meta.profile_image || null
  };
};

// Resolve the stored session once at startup.
export const getInitialSession = async () => {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
};

// Same-tab and cross-tab auth changes arrive here.
export const subscribeToSession = (callback) => {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
};

export const signIn = async (email, password) => {
  const client = requireClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return profileFromUser(data.user);
};

// Login using a student ID instead of an email. Looks up the email from the
// students/profiles table, then signs in with that email and the password.
export const signInWithStudentId = async (studentId, password) => {
  const email = await lookupStudentEmail(studentId);
  return signIn(email, password);
};

export const signUp = async (username, email, password) => {
  const client = requireClient();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { username: username.trim() } }
  });
  if (error) throw new Error(error.message);
  return {
    profile: profileFromUser(data.user),
    // Email confirmation settings decide whether a session comes back.
    needsConfirmation: !data.session
  };
};

export const signOut = async () => {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
};

export const resetPassword = async (email) => {
  const client = requireClient();
  const { error } = await client.auth.resetPasswordForEmail(email);
  if (error) throw new Error(error.message);
};

export const updatePassword = async (newPassword) => {
  const client = requireClient();
  const { data, error } = await client.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
  return profileFromUser(data.user);
};

export const resendConfirmation = async (email) => {
  const client = requireClient();
  const { error } = await client.auth.resend({ email, type: "signup" });
  if (error) throw new Error(error.message);
};

export const updateProfileAndSave = async (userData) => {
  const client = requireClient();
  const { data, error } = await client.auth.updateUser({ data: userData });
  if (error) throw new Error(error.message);
  return profileFromUser(data.user);
};
