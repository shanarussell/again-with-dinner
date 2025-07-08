import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import logger from "./utils/logger";
import "./styles/tailwind.css";
import "./styles/index.css";

// Global error handler for React rendering errors
const handleRenderError = (error) => {
  logger.error('React rendering error:', error);
  
  // In production, you might want to send this to an error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(error);
    logger.info('Rendering error would be sent to monitoring service in production');
  }
};

// Initialize the app
const initializeApp = () => {
  const container = document.getElementById("root");
  
  if (!container) {
    throw new Error("Root element not found. Make sure there's a div with id 'root' in your HTML.");
  }

  const root = createRoot(container);

  // Render the app with error boundary
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  return root;
};

// Start the app with error handling
try {
  initializeApp();
} catch (error) {
  handleRenderError(error);
  
  // Fallback: try to show a basic error message
  const container = document.getElementById("root");
  if (container) {
    container.innerHTML = `
      <div style="
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        font-family: system-ui, -apple-system, sans-serif;
        text-align: center;
        padding: 2rem;
      ">
        <div>
          <h1 style="color: #dc2626; margin-bottom: 1rem;">Something went wrong</h1>
          <p style="color: #6b7280; margin-bottom: 1rem;">
            We're having trouble loading the app. Please refresh the page or try again later.
          </p>
          <button 
            onclick="window.location.reload()"
            style="
              background: #16a34a;
              color: white;
              border: none;
              padding: 0.5rem 1rem;
              border-radius: 0.375rem;
              cursor: pointer;
              font-size: 0.875rem;
            "
          >
            Refresh Page
          </button>
        </div>
      </div>
    `;
  }
}
