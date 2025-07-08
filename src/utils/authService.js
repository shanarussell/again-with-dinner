import { supabase } from './supabase';
import logger from './logger';

const authService = {
  // Clear invalid session data
  async clearInvalidSession() {
    try {
      // Clear any stored session data
      await supabase.auth.signOut({ scope: 'local' });
      
      // Clear local storage items that might contain invalid tokens
      if (typeof localStorage !== 'undefined') {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('supabase.auth.token')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }
      
      return { success: true };
    } catch (error) {
      logger.error('Error clearing invalid session:', error);
      return { success: false, error: error.message };
    }
  },

  // Handle refresh token errors
  async handleRefreshTokenError(error) {
    if (error?.message?.includes('Invalid Refresh Token') || 
        error?.message?.includes('Refresh Token Not Found') ||
        error?.message?.includes('refresh_token_not_found')) {
      
      // Clear the invalid session
      await this.clearInvalidSession();
      
      return {
        success: false,
        error: 'Your session has expired. Please sign in again.',
        requiresReauth: true
      };
    }
    return null;
  },

  // Get current session
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        // Handle refresh token errors specifically
        const refreshTokenError = await this.handleRefreshTokenError(error);
        if (refreshTokenError) {
          return refreshTokenError;
        }
        
        // Handle other specific Supabase auth errors
        if (error.message.includes('Invalid API key') || error.message.includes('Invalid JWT')) {
          return { 
            success: false, 
            error: 'Authentication configuration error. Please check your Supabase API key and project settings.' 
          };
        }
        return { success: false, error: error.message };
      }
      
      return { success: true, data };
    } catch (error) {
      // Handle refresh token errors in catch block as well
      const refreshTokenError = await this.handleRefreshTokenError(error);
      if (refreshTokenError) {
        return refreshTokenError;
      }
      
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('AuthRetryableFetchError')) {
        return { 
          success: false, 
          error: 'Cannot connect to authentication service. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.' 
        };
      }
      return { success: false, error: 'Failed to get session' };
    }
  },

  // Sign in with email and password
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // Handle refresh token errors
        const refreshTokenError = await this.handleRefreshTokenError(error);
        if (refreshTokenError) {
          return refreshTokenError;
        }
        
        // Handle other specific authentication errors
        if (error.message.includes('Invalid API key') || error.message.includes('Invalid JWT')) {
          return { 
            success: false, 
            error: 'Authentication configuration error. Please check your Supabase API key and project settings.' 
          };
        }
        if (error.message.includes('Invalid login credentials')) {
          return { 
            success: false, 
            error: 'Invalid email or password. Please check your credentials and try again.' 
          };
        }
        return { success: false, error: error.message };
      }
      return { success: true, data };
    } catch (error) {
      // Handle refresh token errors in catch block
      const refreshTokenError = await this.handleRefreshTokenError(error);
      if (refreshTokenError) {
        return refreshTokenError;
      }
      
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('AuthRetryableFetchError')) {
        return { 
          success: false, 
          error: 'Cannot connect to authentication service. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.' 
        };
      }
      return { success: false, error: 'Something went wrong during login' };
    }
  },

  // Sign up with email and password
  async signUp(email, password, userData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });
      
      if (error) {
        // Handle refresh token errors
        const refreshTokenError = await this.handleRefreshTokenError(error);
        if (refreshTokenError) {
          return refreshTokenError;
        }
        
        // Handle other specific authentication errors
        if (error.message.includes('Invalid API key') || error.message.includes('Invalid JWT')) {
          return { 
            success: false, 
            error: 'Authentication configuration error. Please check your Supabase API key and project settings.' 
          };
        }
        if (error.message.includes('User already registered')) {
          return { 
            success: false, 
            error: 'An account with this email already exists. Please try signing in instead.' 
          };
        }
        return { success: false, error: error.message };
      }
      return { success: true, data };
    } catch (error) {
      // Handle refresh token errors in catch block
      const refreshTokenError = await this.handleRefreshTokenError(error);
      if (refreshTokenError) {
        return refreshTokenError;
      }
      
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('AuthRetryableFetchError')) {
        return { 
          success: false, 
          error: 'Cannot connect to authentication service. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.' 
        };
      }
      return { success: false, error: 'Something went wrong during signup' };
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        // Handle refresh token errors - but for signOut, we still want to clear local state
        const refreshTokenError = await this.handleRefreshTokenError(error);
        if (refreshTokenError) {
          // For signOut, we consider it successful if we cleared the local session
          return { success: true };
        }
        
        if (error.message.includes('Invalid API key') || error.message.includes('Invalid JWT')) {
          return { 
            success: false, 
            error: 'Authentication configuration error. Please check your Supabase API key and project settings.' 
          };
        }
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error) {
      // Handle refresh token errors in catch block
      const refreshTokenError = await this.handleRefreshTokenError(error);
      if (refreshTokenError) {
        // For signOut, we consider it successful if we cleared the local session
        return { success: true };
      }
      
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('AuthRetryableFetchError')) {
        return { 
          success: false, 
          error: 'Cannot connect to authentication service. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.' 
        };
      }
      return { success: false, error: 'Something went wrong during logout' };
    }
  },

  // Reset password
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        // Handle refresh token errors
        const refreshTokenError = await this.handleRefreshTokenError(error);
        if (refreshTokenError) {
          return refreshTokenError;
        }
        
        if (error.message.includes('Invalid API key') || error.message.includes('Invalid JWT')) {
          return { 
            success: false, 
            error: 'Authentication configuration error. Please check your Supabase API key and project settings.' 
          };
        }
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error) {
      // Handle refresh token errors in catch block
      const refreshTokenError = await this.handleRefreshTokenError(error);
      if (refreshTokenError) {
        return refreshTokenError;
      }
      
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('AuthRetryableFetchError')) {
        return { 
          success: false, 
          error: 'Cannot connect to authentication service. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.' 
        };
      }
      return { success: false, error: 'Something went wrong sending reset email' };
    }
  },

  // Get user profile
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        // Handle refresh token errors
        const refreshTokenError = await this.handleRefreshTokenError(error);
        if (refreshTokenError) {
          return refreshTokenError;
        }
        
        if (error.message.includes('Invalid API key') || error.message.includes('Invalid JWT')) {
          return { 
            success: false, 
            error: 'Authentication configuration error. Please check your Supabase API key and project settings.' 
          };
        }
        return { success: false, error: error.message };
      }
      return { success: true, data };
    } catch (error) {
      // Handle refresh token errors in catch block
      const refreshTokenError = await this.handleRefreshTokenError(error);
      if (refreshTokenError) {
        return refreshTokenError;
      }
      
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to load user profile' };
    }
  },

  // Update user profile
  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        // Handle refresh token errors
        const refreshTokenError = await this.handleRefreshTokenError(error);
        if (refreshTokenError) {
          return refreshTokenError;
        }
        
        if (error.message.includes('Invalid API key') || error.message.includes('Invalid JWT')) {
          return { 
            success: false, 
            error: 'Authentication configuration error. Please check your Supabase API key and project settings.' 
          };
        }
        return { success: false, error: error.message };
      }
      return { success: true, data };
    } catch (error) {
      // Handle refresh token errors in catch block
      const refreshTokenError = await this.handleRefreshTokenError(error);
      if (refreshTokenError) {
        return refreshTokenError;
      }
      
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to update profile' };
    }
  },

  // Test connection to Supabase
  async testConnection() {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        // Handle refresh token errors
        const refreshTokenError = await this.handleRefreshTokenError(error);
        if (refreshTokenError) {
          return refreshTokenError;
        }
        
        if (error.message.includes('Invalid API key') || error.message.includes('Invalid JWT')) {
          return { 
            success: false, 
            error: 'Invalid API key. Please check your VITE_SUPABASE_ANON_KEY in .env file.' 
          };
        }
        return { success: false, error: error.message };
      }
      return { success: true, message: 'Successfully connected to Supabase' };
    } catch (error) {
      // Handle refresh token errors in catch block
      const refreshTokenError = await this.handleRefreshTokenError(error);
      if (refreshTokenError) {
        return refreshTokenError;
      }
      
      if (error?.message?.includes('Failed to fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to Supabase. Please check your VITE_SUPABASE_URL and ensure your project is active.' 
        };
      }
      return { success: false, error: 'Connection test failed' };
    }
  },

  // Listen for auth state changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

export default authService;