import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import WelcomeSection from "./components/WelcomeSection";
import LoginForm from "./components/LoginForm";
import RegistrationPrompt from "./components/RegistrationPrompt";

const UserLogin = () => {
  const navigate = useNavigate();
  const { user, loading, signIn, authError, clearError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);

  useEffect(() => {
    if (!loading && user) {
      navigate('/recipe-dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (authError) {
      setLoginError(authError);
    }
  }, [authError]);

  const handleLogin = async (email, password) => {
    setIsLoading(true);
    setLoginError(null);
    clearError();

    try {
      const result = await signIn(email, password);
      if (result?.success) {
        // Navigation will be handled by useEffect when user state updates
      } else {
        setLoginError(result?.error || "Login failed. Please try again.");
      }
    } catch (error) {
      setLoginError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <WelcomeSection />
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            {loginError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {loginError}
              </div>
            )}
            <LoginForm onLogin={handleLogin} isLoading={isLoading} />
            <RegistrationPrompt />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;