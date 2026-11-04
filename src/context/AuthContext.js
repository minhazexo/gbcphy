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
} from "../data/session.js";
import { RBACProvider } from "./RBACContext.js";
export { useRBAC } from "./RBACContext.js";

const AuthContext = createContext();

// Adapter over the Supabase-backed session module; pages keep the same
// interface they had with the mock, but auth is now real and async.
export const AuthProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let active = true;

    getInitialSession()
      .then((session) => {
        if (!active) return;
        setUserProfile(profileFromUser(session && session.user));
        setAuthReady(true);
      })
      .catch((error) => {
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

  const login = async (email, password) => {
    await signIn(email, password);
    return true;
  };

  const loginWithStudentId = async (studentId, password) => {
    await signInWithStudentId(studentId, password);
    return true;
  };

  const register = async (username, email, password) => {
    const { needsConfirmation } = await signUp(username, email, password);
    return {
      needsConfirmation,
      message: needsConfirmation
        ? "Account created. Check your email to confirm it, then sign in."
        : "Account created successfully."
    };
  };

  const resetPassword = async (email) => {
    await resetPasswordForEmail(email);
  };

  const updatePassword = async (newPassword) => {
    await updateUserPassword(newPassword);
  };

  const resendConfirmation = async (email) => {
    await resendConfirmationEmail(email);
  };

  const logout = async () => {
    await signOut();
    setUserProfile(null);
  };

  const uploadProfilePicture = async () => null;

  const updateUserProfile = async (userData) => {
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

export const useAuth = () => useContext(AuthContext);
export default AuthContext;

// Helper to get just the user property
export const useUser = () => useContext(AuthContext).userProfile;
