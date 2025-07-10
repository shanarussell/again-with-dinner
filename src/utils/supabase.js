import { createClient } from '@supabase/supabase-js';
import logger from './logger';

// Environment variable validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enhanced validation function with fallbacks
const validateEnvironmentVariables = () => {
  const errors = [];

  if (!supabaseUrl) {
    errors.push('VITE_SUPABASE_URL is missing');
  } else {
    try {
      new URL(supabaseUrl);
    } catch (error) {
      errors.push('VITE_SUPABASE_URL has invalid format');
    }
  }

  if (!supabaseAnonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is missing');
  } else if (supabaseAnonKey.length < 100 || !supabaseAnonKey.includes('.')) {
    errors.push('VITE_SUPABASE_ANON_KEY has invalid format');
  }

  if (errors.length > 0) {
    const errorMessage = `Supabase Configuration Error:\n${errors.join('\n')}\n\nPlease check your .env file and ensure all required variables are properly set.`;
    console.warn(errorMessage);
    // Don't throw error in production to prevent module loading issues
    if (import.meta.env.DEV) {
      throw new Error(errorMessage);
    }
  }
};

// Only validate in development
if (import.meta.env.DEV) {
  validateEnvironmentVariables();
}

// Create Supabase client with fallback handling
let supabase;

try {
  supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'recipevault-auth-token',
      storage: {
        getItem: (key) => {
          try {
            return localStorage.getItem(key);
          } catch (error) {
            console.warn('Error reading from localStorage:', error);
            return null;
          }
        },
        setItem: (key, value) => {
          try {
            localStorage.setItem(key, value);
          } catch (error) {
            console.warn('Error writing to localStorage:', error);
          }
        },
        removeItem: (key) => {
          try {
            localStorage.removeItem(key);
          } catch (error) {
            console.warn('Error removing from localStorage:', error);
          }
        }
      }
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'X-Client-Info': 'recipevault-web',
        'X-Client-Version': '1.0.0'
      }
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  });
} catch (error) {
  console.error('Failed to create Supabase client:', error);
  // Create a mock client for development
  supabase = {
    auth: {
      onAuthStateChange: () => {},
      signOut: () => Promise.resolve(),
      getSession: () => Promise.resolve({ data: { session: null }, error: null })
    },
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null })
    })
  };
}

// Enhanced error handling for auth state changes
const handleAuthStateChange = (event, session) => {
  switch (event) {
    case 'TOKEN_REFRESH_FAILED': 
      console.warn('Supabase token refresh failed, clearing corrupted session data');
      clearCorruptedSessionData();
      break;
    
    case 'SIGNED_OUT': 
      logger.info('User signed out, clearing session data');
      clearSessionData();
      break;
    
    case 'SIGNED_IN': 
      logger.info('User signed in successfully');
      break;
    
    case 'TOKEN_REFRESHED': 
      logger.info('Token refreshed successfully');
      break;
    
    default:
      logger.debug('Auth state change:', event);
  }
};

// Clear corrupted session data
const clearCorruptedSessionData = () => {
  try {
    if (typeof localStorage !== 'undefined') {
      const keysToRemove = [];
      
      // Find all Supabase-related keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith('supabase.auth.token') ||
          key.startsWith('recipevault-auth-token') ||
          key.includes('supabase')
        )) {
          keysToRemove.push(key);
        }
      }
      
      // Remove corrupted data
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
          logger.debug('Removed corrupted session data:', key);
        } catch (error) {
          logger.warn('Error removing session data:', key, error);
        }
      });
    }
  } catch (error) {
    console.error('Error clearing corrupted session data:', error);
  }
};

// Clear all session data
const clearSessionData = () => {
  try {
    if (typeof localStorage !== 'undefined') {
      const keysToRemove = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('recipevault-auth-token')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  } catch (error) {
    console.warn('Error clearing session data:', error);
  }
};

// Set up auth state change listener
if (supabase.auth && supabase.auth.onAuthStateChange) {
  supabase.auth.onAuthStateChange(handleAuthStateChange);
}

// Export utility functions for external use
export const clearAuthData = clearSessionData;
export const clearCorruptedAuthData = clearCorruptedSessionData;

export { supabase };
export default supabase;