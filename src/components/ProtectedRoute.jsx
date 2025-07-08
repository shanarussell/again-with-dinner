import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BottomTabNavigation from './ui/BottomTabNavigation';

const ProtectedRoute = ({ 
  children, 
  redirectTo = "/user-login",
  showBottomNav = true,
  className = "pt-16 md:pt-0"
}) => {
  const { user, loading, error } = useAuth();

  // Handle auth context errors
  if (error) {
    console.error('Auth context error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center p-8 max-w-md">
          <div className="flex justify-center items-center mb-4">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
              <circle cx="12" cy="12" r="10"/>
              <path d="m15 9-6 6"/>
              <path d="m9 9 6 6"/>
            </svg>
          </div>
          <h2 className="text-xl font-medium text-neutral-800 mb-2">Authentication Error</h2>
          <p className="text-neutral-600 mb-4">There was a problem loading your authentication status.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors duration-200"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500 mx-auto mb-4"
            role="status"
            aria-label="Loading authentication status"
          />
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <>
      {showBottomNav && <BottomTabNavigation />}
      <div className={className}>
        {children}
      </div>
    </>
  );
};

export default ProtectedRoute;