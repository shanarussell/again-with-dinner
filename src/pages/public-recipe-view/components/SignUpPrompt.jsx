import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SignUpPrompt = ({ 
  variant = 'banner', 
  message, 
  subMessage, 
  features = [], 
  className = '' 
}) => {
  const navigate = useNavigate();

  const handleSignUp = () => {
    navigate('/user-registration');
  };

  const handleLogin = () => {
    navigate('/user-login');
  };

  // Banner variant - simple horizontal prompt
  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white no-print ${className}`}>
        <div className="text-center">
          <p className="text-lg font-semibold mb-4">{message}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleSignUp}
              variant="secondary"
              size="lg"
              className="bg-white text-orange-600 hover:bg-gray-50"
            >
              Sign Up Free
            </Button>
            <button
              onClick={handleLogin}
              className="text-white underline hover:no-underline text-sm"
            >
              Already have an account? Sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Card variant - feature-rich prompt
  if (variant === 'card') {
    return (
      <div className={`bg-white rounded-xl shadow-sm border-2 border-orange-200 p-6 no-print ${className}`}>
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mx-auto mb-4">
            <Icon name="ChefHat" size={32} color="#EA580C" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{message}</h3>
          
          {features.length > 0 && (
            <div className="text-left max-w-md mx-auto mb-6">
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center mt-0.5">
                      <Icon name="Check" size={14} color="white" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleSignUp}
              variant="primary"
              size="lg"
              className="bg-orange-500 hover:bg-orange-600"
            >
              Get Started Free
            </Button>
            <button
              onClick={handleLogin}
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              Already have an account? Sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Sidebar variant - compact for desktop
  if (variant === 'sidebar') {
    return (
      <div className={`bg-orange-50 rounded-xl p-6 border border-orange-200 no-print ${className}`}>
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-500 rounded-lg mx-auto mb-4">
            <Icon name="Heart" size={24} color="white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-3">{message}</h3>
          
          {features.length > 0 && (
            <div className="text-left mb-6">
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="flex-shrink-0 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center mt-1">
                      <Icon name="Check" size={12} color="white" />
                    </div>
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <Button
            onClick={handleSignUp}
            variant="primary"
            size="md"
            className="w-full bg-orange-500 hover:bg-orange-600 mb-3"
          >
            Join Free
          </Button>
          <button
            onClick={handleLogin}
            className="text-gray-600 hover:text-gray-800 text-xs"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  // Final variant - prominent end-of-content prompt
  if (variant === 'final') {
    return (
      <div className={`bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 rounded-xl p-8 text-white text-center no-print ${className}`}>
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mx-auto mb-6">
            <Icon name="ChefHat" size={40} color="white" />
          </div>
          <h3 className="text-2xl font-bold mb-3">{message}</h3>
          {subMessage && (
            <p className="text-orange-100 mb-6 text-lg">{subMessage}</p>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleSignUp}
              variant="secondary"
              size="lg"
              className="bg-white text-orange-600 hover:bg-gray-50 font-semibold"
            >
              Start Cooking Better Today
            </Button>
            <button
              onClick={handleLogin}
              className="text-white border border-white/30 px-6 py-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              Sign In
            </button>
          </div>
          
          <p className="text-orange-100 text-sm mt-4">
            Join thousands of home cooks • Free forever • No credit card required
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default SignUpPrompt;