// Authentication hook. Thin wrapper around AuthContext so components don't
// import context directly.

import { useAuth } from "../context/AuthContext.js";

export const useAuthHook = () => {
  const auth = useAuth();
  return {
    isAuthenticated: auth.isAuthenticated,
    authReady: auth.authReady,
    userProfile: auth.userProfile,
    login: auth.login,
    loginWithStudentId: auth.loginWithStudentId,
    register: auth.register,
    resetPassword: auth.resetPassword,
    updatePassword: auth.updatePassword,
    resendConfirmation: auth.resendConfirmation,
    logout: auth.logout,
    uploadProfilePicture: auth.uploadProfilePicture,
    updateUserProfile: auth.updateUserProfile,
  };
};

export default useAuthHook;
