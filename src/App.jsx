import React from "react";
import { AuthProvider } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Routes from "./Routes";
import "./styles/index.css";

function App() {
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