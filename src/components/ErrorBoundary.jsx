import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, isLoading: true };
    this.loadingTimeout = null;
  }

  componentDidMount() {
    // Set a timeout to detect infinite loading
    this.loadingTimeout = setTimeout(() => {
      if (this.state.isLoading) {
        console.warn("App took too long to load, showing error state");
        this.setState({ 
          hasError: true, 
          error: new Error("App took too long to load. Please refresh the page."),
          isLoading: false 
        });
      }
    }, 10000); // 10 seconds timeout
  }

  componentWillUnmount() {
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error, isLoading: false };
  }

  componentDidCatch(error, errorInfo) {
    error.__ErrorBoundary = true;
    
    // Log error for debugging
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    
    // Call custom error handler if provided
    if (window.__COMPONENT_ERROR__) {
      window.__COMPONENT_ERROR__(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, isLoading: true });
    // Reset the loading timeout
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
    this.loadingTimeout = setTimeout(() => {
      if (this.state.isLoading) {
        this.setState({ 
          hasError: true, 
          error: new Error("App took too long to load. Please refresh the page."),
          isLoading: false 
        });
      }
    }, 10000);
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="text-center p-8 max-w-md">
            <div className="flex justify-center items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="42px" height="42px" viewBox="0 0 32 33" fill="none">
                <path d="M16 28.5C22.6274 28.5 28 23.1274 28 16.5C28 9.87258 22.6274 4.5 16 4.5C9.37258 4.5 4 9.87258 4 16.5C4 23.1274 9.37258 28.5 16 28.5Z" stroke="#343330" strokeWidth="2" strokeMiterlimit="10" />
                <path d="M11.5 15.5C12.3284 15.5 13 14.8284 13 14C13 13.1716 12.3284 12.5 11.5 12.5C10.6716 12.5 10 13.1716 10 14C10 14.8284 10.6716 15.5 11.5 15.5Z" fill="#343330" />
                <path d="M20.5 15.5C21.3284 15.5 22 14.8284 22 14C22 13.1716 21.3284 12.5 20.5 12.5C19.6716 12.5 19 14.8284 19 14C19 14.8284 19.6716 15.5 20.5 15.5Z" fill="#343330" />
                <path d="M21 22.5C19.9625 20.7062 18.2213 19.5 16 19.5C13.7787 19.5 12.0375 20.7062 11 22.5" stroke="#343330" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex flex-col gap-1 text-center">
              <h1 className="text-2xl font-medium text-neutral-800">Something went wrong</h1>
              <p className="text-neutral-600 text-base w-8/12 mx-auto">
                {this.state.error?.message || "We encountered an unexpected error while processing your request."}
              </p>
            </div>
            <div className="flex justify-center items-center gap-3 mt-6">
              <button
                onClick={this.handleRetry}
                className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded flex items-center gap-2 transition-colors duration-200 shadow-sm"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                  <path d="M21 3v5h-5"/>
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                  <path d="M3 21v-5h5"/>
                </svg>
                Try Again
              </button>
              <button
                onClick={this.handleRefresh}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded flex items-center gap-2 transition-colors duration-200 shadow-sm"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                  <path d="M21 3v5h-5"/>
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                  <path d="M3 21v-5h5"/>
                </svg>
                Refresh Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded flex items-center gap-2 transition-colors duration-200 shadow-sm"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m12 19-7-7 7-7"/>
                  <path d="M19 12H5"/>
                </svg>
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;