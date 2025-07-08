import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Input from './Input';

const UnifiedHeader = ({ 
  searchQuery, 
  onSearchChange, 
  onMenuToggle, 
  userProfile, 
  showSearch = true,
  showNavigation = true,
  appName = 'RecipeVault',
  onSettingsClick,
  className = ''
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // Memoized navigation tabs
  const navigationTabs = useMemo(() => [
    {
      label: 'Recipes',
      path: '/recipe-dashboard',
      icon: 'BookOpen',
      activeIcon: 'BookOpen',
      description: 'View and manage your recipes'
    },
    {
      label: 'Shopping List',
      path: '/shopping-list',
      icon: 'ShoppingCart',
      activeIcon: 'ShoppingCart',
      description: 'Manage your shopping list'
    },
    {
      label: 'Meal Plan',
      path: '/weekly-meal-planner',
      icon: 'Calendar',
      activeIcon: 'Calendar',
      description: 'Plan your weekly meals'
    },
    {
      label: 'Add Recipe',
      path: '/recipe-creation-edit',
      icon: 'Plus',
      activeIcon: 'Plus',
      description: 'Create a new recipe'
    }
  ], []);

  // Memoized search toggle handler
  const handleSearchToggle = useCallback(() => {
    if (!showSearch) return;
    
    try {
      setIsSearchExpanded(!isSearchExpanded);
      if (isSearchExpanded && searchQuery && onSearchChange) {
        onSearchChange('');
      }
      setSearchError(null);
    } catch (error) {
      console.error('Error toggling search:', error);
      setSearchError('Failed to toggle search');
    }
  }, [showSearch, isSearchExpanded, searchQuery, onSearchChange]);

  // Memoized search change handler
  const handleSearchChange = useCallback((e) => {
    try {
      if (onSearchChange) {
        onSearchChange(e.target.value);
      }
      setSearchError(null);
    } catch (error) {
      console.error('Error changing search:', error);
      setSearchError('Failed to update search');
    }
  }, [onSearchChange]);

  // Memoized tab click handler
  const handleTabClick = useCallback((path) => {
    try {
      navigate(path);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }, [navigate]);

  // Memoized active tab checker
  const isActiveTab = useCallback((path) => {
    if (path === '/recipe-dashboard') {
      return location.pathname === '/recipe-dashboard' || 
             location.pathname === '/recipe-detail-view' || 
             location.pathname === '/' ||
             location.pathname === '/favorites';
    }
    return location.pathname === path;
  }, [location.pathname]);

  // Memoized settings click handler
  const handleSettingsClick = useCallback(() => {
    try {
      if (onSettingsClick) {
        onSettingsClick();
      } else {
        navigate('/user-profile');
      }
    } catch (error) {
      console.error('Settings navigation error:', error);
    }
  }, [onSettingsClick, navigate]);

  return (
    <header className={`bg-green-600 border-b border-green-700 sticky top-0 z-50 mb-6 ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className={`flex items-center space-x-3 transition-all duration-200 ${
            isSearchExpanded ? 'md:flex hidden' : 'flex'
          }`}>
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
              aria-label={`Go to ${appName} home`}
            >
              <div className="w-10 h-10 bg-green-800 rounded-lg flex items-center justify-center">
                <Icon name="ChefHat" size={22} color="white" />
              </div>
              <h1 className="text-2xl font-bold text-white">
                {appName}
              </h1>
            </button>
          </div>

          {/* Desktop Navigation */}
          {showNavigation && (
            <nav className={`hidden md:flex items-center space-x-1 ${
              isSearchExpanded ? 'md:hidden' : 'md:flex'
            }`} role="navigation" aria-label="Main navigation">
              {navigationTabs.map((tab) => {
                const isActive = isActiveTab(tab.path);
                return (
                  <button
                    key={tab.path}
                    onClick={() => handleTabClick(tab.path)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'text-white bg-green-700 font-semibold' :'text-green-100 hover:text-white hover:bg-green-700'
                    }`}
                    aria-label={tab.description}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon
                      name={isActive ? tab.activeIcon : tab.icon}
                      size={20}
                      color={isActive ? 'white' : '#dcfce7'}
                      strokeWidth={isActive ? 2.5 : 2}
                      className={tab.path === '/shopping-list' && isActive ? 'fill-current' : ''}
                    />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Search Section */}
          {showSearch && (
            <div className={`flex items-center transition-all duration-200 ${
              isSearchExpanded ? 'flex-1 mx-4' : 'flex-none'
            }`}>
              {isSearchExpanded ? (
                <div className="flex items-center w-full">
                  <div className="flex-1 relative">
                    <Input
                      type="search"
                      placeholder="Search your recipes..."
                      value={searchQuery || ''}
                      onChange={handleSearchChange}
                      error={searchError}
                      className="pl-10 pr-4 py-2 border border-green-500 bg-white rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-300"
                      autoFocus
                      aria-label="Search recipes"
                    />
                    <Icon
                      name="Search"
                      size={18}
                      color="#6B7280"
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                    />
                  </div>
                  <button
                    onClick={handleSearchToggle}
                    className="ml-2 p-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                    aria-label="Close search"
                  >
                    <Icon name="X" size={20} color="white" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSearchToggle}
                  className="p-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                  aria-label="Search recipes"
                >
                  <Icon name="Search" size={20} color="white" />
                </button>
              )}
            </div>
          )}

          {/* User Actions */}
          <div className={`flex items-center space-x-2 ${
            isSearchExpanded ? 'md:flex hidden' : 'flex'
          }`}>
            <button 
              onClick={handleSettingsClick}
              className="p-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
              aria-label="Settings"
            >
              <Icon name="Settings" size={20} color="white" />
            </button>
            <button 
              onClick={onMenuToggle}
              className="p-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
              aria-label="User menu"
            >
              <Icon name="User" size={20} color="white" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showNavigation && (
          <nav className="md:hidden border-t border-green-700 py-2" role="navigation" aria-label="Mobile navigation">
            <div className="flex justify-around">
              {navigationTabs.map((tab) => {
                const isActive = isActiveTab(tab.path);
                return (
                  <button
                    key={tab.path}
                    onClick={() => handleTabClick(tab.path)}
                    className={`flex flex-col items-center py-2 px-1 min-w-0 flex-1 transition-colors duration-200 ${
                      isActive
                        ? 'text-white' :'text-green-100 hover:text-white'
                    }`}
                    aria-label={tab.description}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div className="mb-1">
                      <Icon
                        name={isActive ? tab.activeIcon : tab.icon}
                        size={20}
                        color={isActive ? 'white' : '#dcfce7'}
                        strokeWidth={isActive ? 2.5 : 2}
                        className={tab.path === '/shopping-list' && isActive ? 'fill-current' : ''}
                      />
                    </div>
                    <span className={`text-xs font-medium ${isActive ? 'font-semibold' : 'font-normal'}`}>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default UnifiedHeader;