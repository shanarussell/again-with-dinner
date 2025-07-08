import React, { useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Routes from "./Routes";
import logger from "./utils/logger";
import "./styles/index.css";

// Global error handler for unhandled errors
const handleGlobalError = (error, errorInfo) => {
  logger.error('Global error caught:', error, errorInfo);
  
  // In production, you might want to send this to an error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(error, { extra: errorInfo });
    logger.info('Error would be sent to monitoring service in production');
  }
};

// Handle unhandled promise rejections
const handleUnhandledRejection = (event) => {
  logger.error('Unhandled promise rejection:', event.reason);
  
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(event.reason);
    logger.info('Promise rejection would be sent to monitoring service in production');
  }
};

function App() {
  // Set up global error handlers
  React.useEffect(() => {
    // Set up global error handler
    window.__COMPONENT_ERROR__ = handleGlobalError;
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      delete window.__COMPONENT_ERROR__;
    };
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="app min-h-screen bg-gray-50">
          <Routes />
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;