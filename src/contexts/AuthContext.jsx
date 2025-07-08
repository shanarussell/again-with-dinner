import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import authService from "../utils/authService";
import logger from "../utils/logger";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Memoized error handler
  const handleAuthError = useCallback((error, context = '') => {
    const errorMessage = error || "Authentication error occurred";
    logger.error(`Auth error in ${context}:`, errorMessage);
    setAuthError(errorMessage);
  }, []);

  // Memoized profile fetcher
  const fetchUserProfile = useCallback(async (userId) => {
    if (!userId) return null;

    try {
      const profileResult = await authService.getUserProfile(userId);

      if (profileResult?.requiresReauth) {
        setUser(null);
        setUserProfile(null);
        handleAuthError(profileResult.error, 'profile fetch');
        return null;
      }

      if (profileResult?.success) {
        return profileResult.data;
      } else {
        handleAuthError(profileResult?.error || "Failed to load user profile", 'profile fetch');
        return null;
      }
    } catch (error) {
      handleAuthError("Failed to load user profile", 'profile fetch');
      return null;
    }
  }, [handleAuthError]);

  // Initialize auth state
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);
        setAuthError(null);

        const sessionResult = await authService.getSession();

        if (!isMounted) return;

        if (sessionResult?.requiresReauth) {
          setUser(null);
          setUserProfile(null);
          handleAuthError(sessionResult.error, 'session initialization');
          setLoading(false);
          return;
        }

        if (sessionResult?.success && sessionResult?.data?.session?.user) {
          const authUser = sessionResult.data.session.user;
          setUser(authUser);

          // Fetch user profile
          const profile = await fetchUserProfile(authUser.id);
          if (isMounted && profile) {
            setUserProfile(profile);
          }
        }
      } catch (error) {
        if (isMounted) {
          handleAuthError("Failed to initialize authentication", 'initialization');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      setAuthError(null);

      try {
        switch (event) {
          case "SIGNED_IN":
            if (session?.user) {
              setUser(session.user);
              const profile = await fetchUserProfile(session.user.id);
              if (isMounted && profile) {
                setUserProfile(profile);
              }
            }
            break;

          case "SIGNED_OUT":
            setUser(null);
            setUserProfile(null);
            break;

          case "TOKEN_REFRESHED":
            if (session?.user) {
              setUser(session.user);
            }
            break;

          case "TOKEN_REFRESH_FAILED": logger.info("Token refresh failed, clearing session");
            setUser(null);
            setUserProfile(null);
            handleAuthError("Your session has expired. Please sign in again.", 'token refresh');
            await authService.clearInvalidSession();
            break;

          default:
            logger.debug("Unhandled auth event:", event);
        }
      } catch (error) {
        if (isMounted) {
          handleAuthError("Error handling auth state change", 'auth state change');
        }
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe?.();
    };
  }, [fetchUserProfile, handleAuthError]);

  // Sign in function
  const signIn = useCallback(async (email, password) => {
    try {
      setAuthError(null);
      const result = await authService.signIn(email, password);

      if (result?.requiresReauth) {
        handleAuthError(result.error, 'sign in');
        return { success: false, error: result.error };
      }

      if (!result?.success) {
        const errorMsg = result?.error || "Login failed";
        handleAuthError(errorMsg, 'sign in');
        return { success: false, error: errorMsg };
      }

      return { success: true, data: result.data };
    } catch (error) {
      const errorMsg = "Something went wrong during login. Please try again.";
      handleAuthError(errorMsg, 'sign in');
      return { success: false, error: errorMsg };
    }
  }, [handleAuthError]);

  // Sign up function
  const signUp = useCallback(async (email, password, userData = {}) => {
    try {
      setAuthError(null);
      const result = await authService.signUp(email, password, userData);

      if (result?.requiresReauth) {
        handleAuthError(result.error, 'sign up');
        return { success: false, error: result.error };
      }

      if (!result?.success) {
        const errorMsg = result?.error || "Signup failed";
        handleAuthError(errorMsg, 'sign up');
        return { success: false, error: errorMsg };
      }

      return { success: true, data: result.data };
    } catch (error) {
      const errorMsg = "Something went wrong during signup. Please try again.";
      handleAuthError(errorMsg, 'sign up');
      return { success: false, error: errorMsg };
    }
  }, [handleAuthError]);

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      setAuthError(null);
      const result = await authService.signOut();

      if (result?.requiresReauth) {
        // For signOut, we consider it successful since we want to clear state anyway
        setUser(null);
        setUserProfile(null);
        return { success: true };
      }

      if (!result?.success) {
        const errorMsg = result?.error || "Logout failed";
        handleAuthError(errorMsg, 'sign out');
        return { success: false, error: errorMsg };
      }

      return { success: true };
    } catch (error) {
      const errorMsg = "Something went wrong during logout. Please try again.";
      handleAuthError(errorMsg, 'sign out');
      return { success: false, error: errorMsg };
    }
  }, [handleAuthError]);

  // Update profile function
  const updateProfile = useCallback(async (updates) => {
    try {
      setAuthError(null);

      if (!user?.id) {
        const errorMsg = "User not authenticated";
        handleAuthError(errorMsg, 'profile update');
        return { success: false, error: errorMsg };
      }

      const result = await authService.updateUserProfile(user.id, updates);

      if (result?.requiresReauth) {
        setUser(null);
        setUserProfile(null);
        handleAuthError(result.error, 'profile update');
        return { success: false, error: result.error };
      }

      if (!result?.success) {
        const errorMsg = result?.error || "Profile update failed";
        handleAuthError(errorMsg, 'profile update');
        return { success: false, error: errorMsg };
      }

      setUserProfile(result.data);
      return { success: true, data: result.data };
    } catch (error) {
      const errorMsg = "Something went wrong updating profile. Please try again.";
      handleAuthError(errorMsg, 'profile update');
      return { success: false, error: errorMsg };
    }
  }, [user?.id, handleAuthError]);

  // Reset password function
  const resetPassword = useCallback(async (email) => {
    try {
      setAuthError(null);
      const result = await authService.resetPassword(email);

      if (result?.requiresReauth) {
        handleAuthError(result.error, 'password reset');
        return { success: false, error: result.error };
      }

      if (!result?.success) {
        const errorMsg = result?.error || "Password reset failed";
        handleAuthError(errorMsg, 'password reset');
        return { success: false, error: errorMsg };
      }

      return { success: true };
    } catch (error) {
      const errorMsg = "Something went wrong sending reset email. Please try again.";
      handleAuthError(errorMsg, 'password reset');
      return { success: false, error: errorMsg };
    }
  }, [handleAuthError]);

  // Clear error function
  const clearError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Memoized context value
  const value = useMemo(() => ({
    user,
    userProfile,
    loading,
    authError,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    clearError,
  }), [
    user,
    userProfile,
    loading,
    authError,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    clearError,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;