import React, { useEffect, useState } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingState from "./components/LoadingState";
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
  const [isAppReady, setIsAppReady] = useState(false);

  // Set up global error handlers and app initialization
  React.useEffect(() => {
    // Set up global error handler
    window.__COMPONENT_ERROR__ = handleGlobalError;
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    // Simulate app initialization (you can add actual initialization logic here)
    const initializeApp = async () => {
      try {
        // Add any app initialization logic here (e.g., loading user preferences, etc.)
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to ensure everything is loaded
        setIsAppReady(true);
      } catch (error) {
        logger.error('App initialization failed:', error);
        setIsAppReady(true); // Still set to true to show the app
      }
    };

    initializeApp();
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      delete window.__COMPONENT_ERROR__;
    };
  }, []);

  if (!isAppReady) {
    return (
      <LoadingState 
        message="Loading Again With Dinner..." 
        timeout={8000}
        onTimeout={() => setIsAppReady(true)}
      />
    );
  }

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