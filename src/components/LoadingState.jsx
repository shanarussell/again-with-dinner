import React, { useState, useEffect } from 'react';

const LoadingState = ({ message = "Loading...", timeout = 10000, onTimeout }) => {
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeoutMessage(true);
      if (onTimeout) {
        onTimeout();
      }
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout, onTimeout]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-text-primary text-lg font-medium">{message}</p>
        {showTimeoutMessage && (
          <div className="mt-4 p-4 bg-warning-50 border border-warning-200 rounded-lg">
            <p className="text-warning-700 text-sm">
              This is taking longer than expected. 
              <button 
                onClick={() => window.location.reload()} 
                className="ml-2 text-warning-800 underline hover:no-underline"
              >
                Refresh the page
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingState; 