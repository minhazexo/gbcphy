import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getInitialSession,
  profileFromUser,
  signIn,
  signInWithStudentId,
  signOut,
  signUp,
  subscribeToSession,
  updateProfileAndSave,
  resetPassword as resetPasswordForEmail,
  updatePassword as updateUserPassword,
  resendConfirmation as resendConfirmationEmail
} from "../data/session.ts";
import { RBACProvider } from "./RBACContext.tsx";
export { useRBAC } from "./RBACContext.tsx";

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  roll: string;
  session: string;
  profile_image: string | null;
  full_name?: string;
  role?: string;
  avatar_url?: string | null;
  phone?: string;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  authReady: boolean;
  userProfile: UserProfile | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithStudentId: (studentId: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<{ needsConfirmation: boolean; message: string }>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  uploadProfilePicture: () => Promise<null>;
  updateUserProfile: (userData: Record<string, unknown>) => Promise<UserProfile>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Adapter over the Supabase-backed session module; pages keep the same
// interface they had with the mock, but auth is now real and async.
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let active = true;

    getInitialSession()
      .then((session) => {
        if (!active) return;
        setUserProfile(profileFromUser(session && session.user));
        setAuthReady(true);
      })
      .catch((error: any) => {
        console.error("Could not restore the session:", error.message);
        if (active) setAuthReady(true);
      });

    const unsubscribe = subscribeToSession((session) => {
      setUserProfile(profileFromUser(session && session.user));
      setAuthReady(true);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    await signIn(email, password);
    return true;
  };

  const loginWithStudentId = async (studentId: string, password: string): Promise<boolean> => {
    await signInWithStudentId(studentId, password);
    return true;
  };

  const register = async (username: string, email: string, password: string) => {
    const { needsConfirmation } = await signUp(username, email, password);
    return {
      needsConfirmation,
      message: needsConfirmation
        ? "Account created. Check your email to confirm it, then sign in."
        : "Account created successfully."
    };
  };

  const resetPassword = async (email: string): Promise<void> => {
    await resetPasswordForEmail(email);
  };

  const updatePassword = async (newPassword: string): Promise<void> => {
    await updateUserPassword(newPassword);
  };

  const resendConfirmation = async (email: string): Promise<void> => {
    await resendConfirmationEmail(email);
  };

  const logout = async (): Promise<void> => {
    await signOut();
    setUserProfile(null);
  };

  const uploadProfilePicture = async (): Promise<null> => null;

  const updateUserProfile = async (userData: Record<string, unknown>): Promise<UserProfile> => {
    const profile = await updateProfileAndSave(userData);
    setUserProfile(profile);
    return profile;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(userProfile),
        authReady,
        userProfile,
        login,
        loginWithStudentId,
        register,
        resetPassword,
        updatePassword,
        resendConfirmation,
        logout,
        uploadProfilePicture,
        updateUserProfile
      }}
    >
      <RBACProvider>
        {children}
      </RBACProvider>
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
export default AuthContext;

// Helper to get just the user property
export const useUser = (): UserProfile | null => useContext(AuthContext)!.userProfile;
