import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import RegistrationForm from './components/RegistrationForm';
import TrustSignals from './components/TrustSignals';
import LoginRedirect from './components/LoginRedirect';

const UserRegistration = () => {
  const navigate = useNavigate();
  const { user, loading, signUp, authError, clearError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (authError) {
      setRegistrationError(authError);
    }
  }, [authError]);

  const handleRegistration = async (formData) => {
    setIsLoading(true);
    setRegistrationError(null);
    setRegistrationSuccess(false);
    clearError();

    try {
      const { email, password, fullName } = formData;
      const result = await signUp(email, password, { 
        full_name: fullName 
      });
      
      if (result?.success) {
        setRegistrationSuccess(true);
        // Note: In development mode, user might be auto-confirmed
        // In production, they'll need to verify their email
        if (result?.data?.user?.email_confirmed_at) {
          navigate("/");
        }
      } else {
        setRegistrationError(result?.error || "Registration failed. Please try again.");
      }
    } catch (error) {
      setRegistrationError("Something went wrong. Please try again.");
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
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Join Recipe Vault
            </h1>
            <p className="text-gray-600">
              Create your account and start building your recipe collection
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            {registrationError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {registrationError}
              </div>
            )}
            
            {registrationSuccess && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                Registration successful! Please check your email to verify your account.
              </div>
            )}
            
            <RegistrationForm 
              onRegister={handleRegistration} 
              isLoading={isLoading}
              disabled={registrationSuccess}
            />
            
            <LoginRedirect />
          </div>
          
          <TrustSignals />
        </div>
      </div>
    </div>
  );
};

export default UserRegistration;