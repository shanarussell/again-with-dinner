import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const AuthHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isLoginPage = location.pathname === '/user-login';
  const isRegistrationPage = location.pathname === '/user-registration';

  const handleBackClick = () => {
    if (isRegistrationPage) {
      navigate('/user-login');
    } else if (isLoginPage) {
      navigate(-1);
    }
  };

  const showBackButton = isRegistrationPage || isLoginPage;

  return (
    <header className="bg-background border-b border-border">
      <div className="max-w-md mx-auto px-4 py-4 relative">
        {showBackButton && (
          <button
            onClick={handleBackClick}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-surface-100 transition-colors duration-200"
            aria-label="Go back"
          >
            <Icon name="ArrowLeft" size={20} color="var(--color-text-secondary)" />
          </button>
        )}
        
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="ChefHat" size={20} color="white" />
            </div>
            <h1 className="text-xl font-heading font-bold text-primary">
              RecipeVault
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AuthHeader;