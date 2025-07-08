import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PublicHeader = () => {
  const navigate = useNavigate();

  const handleSignUp = () => {
    navigate('/user-registration');
  };

  const handleLogin = () => {
    navigate('/user-login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40 no-print">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-orange-500 rounded-lg">
              <Icon name="ChefHat" size={20} color="white" />
            </div>
            <span className="text-xl font-bold text-gray-900">RecipeVault</span>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleLogin}
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
            >
              Sign In
            </button>
            <Button
              onClick={handleSignUp}
              variant="primary"
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Sign Up Free
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;