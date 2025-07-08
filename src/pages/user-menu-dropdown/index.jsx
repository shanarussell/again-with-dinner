import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import UserMenuDropdown from './components/UserMenuDropdown';
import Icon from '../../components/AppIcon';

const UserMenuDropdownPage = () => {
  const navigate = useNavigate();
  const { user, userProfile, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/user-login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleMenuItemClick = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with user menu trigger */}
      <header className="bg-green-600 border-b border-green-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-800 rounded-lg flex items-center justify-center">
                <Icon name="ChefHat" size={22} color="white" />
              </div>
              <h1 className="text-2xl font-bold text-white">
                RecipeVault
              </h1>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleMenuToggle}
                className="p-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                aria-label="User menu"
              >
                <Icon name="User" size={20} color="white" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* User Menu Dropdown */}
      <UserMenuDropdown 
        userProfile={userProfile}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onMenuItemClick={handleMenuItemClick}
        onSignOut={handleSignOut}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            User Menu Dropdown Demo
          </h2>
          <p className="text-gray-600 mb-8">
            Click the user icon in the top-right corner to see the updated menu dropdown.
          </p>
          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Menu Features
            </h3>
            <ul className="text-left space-y-2 text-gray-700">
              <li className="flex items-center space-x-2">
                <Icon name="Check" size={16} color="#10B981" />
                <span>No screen dimming effect</span>
              </li>
              <li className="flex items-center space-x-2">
                <Icon name="Check" size={16} color="#10B981" />
                <span>Settings option removed</span>
              </li>
              <li className="flex items-center space-x-2">
                <Icon name="Check" size={16} color="#10B981" />
                <span>Help & Support option removed</span>
              </li>
              <li className="flex items-center space-x-2">
                <Icon name="Check" size={16} color="#10B981" />
                <span>Favorites replaced with Shopping List</span>
              </li>
              <li className="flex items-center space-x-2">
                <Icon name="Check" size={16} color="#10B981" />
                <span>Clean overlay positioning</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserMenuDropdownPage;