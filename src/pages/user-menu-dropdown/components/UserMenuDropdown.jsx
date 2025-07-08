import React, { useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';

const UserMenuDropdown = ({ userProfile, isOpen, onClose, onMenuItemClick, onSignOut }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef?.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleShoppingListClick = () => {
    onMenuItemClick('/shopping-list');
  };

  const handleSignOutClick = () => {
    onSignOut();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-16 right-4 z-50">
      <div 
        ref={menuRef}
        className="bg-white rounded-lg shadow-xl w-80 max-w-sm border border-gray-200 transform transition-all duration-200 ease-out sm:w-72"
      >
        {/* User Profile Section */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <Icon name="User" size={24} color="white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{userProfile?.full_name || 'User'}</h3>
              <p className="text-sm text-gray-600">{userProfile?.email}</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          <button
            onClick={handleShoppingListClick}
            className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors duration-200"
          >
            <Icon name="ShoppingCart" size={20} color="#6B7280" />
            <span>Shopping List</span>
          </button>
        </div>

        {/* Sign Out */}
        <div className="border-t border-gray-200 py-2">
          <button
            onClick={handleSignOutClick}
            className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors duration-200"
          >
            <Icon name="LogOut" size={20} color="#DC2626" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserMenuDropdown;