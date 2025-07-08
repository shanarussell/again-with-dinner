import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import logger from '../../utils/logger';

const ContextualActionHeader = ({ 
  title, 
  showBackButton = true, 
  actions = [], 
  onBack,
  subtitle,
  onEdit,
  onShare,
  onSave,
  onMoreActions,
  className = ''
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleBackClick = async () => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    try {
      if (onBack) {
        await onBack();
      } else {
        navigate(-1);
      }
    } catch (error) {
      logger.error('Navigation failed:', error);
      // Fallback to home page if navigation fails
      navigate('/');
    } finally {
      setIsNavigating(false);
    }
  };

  const getDefaultActions = () => {
    const path = location.pathname;
    
    if (path === '/recipe-detail-view') {
      return [
        {
          label: 'Edit',
          icon: 'Edit',
          variant: 'ghost',
          onClick: onEdit || (() => navigate('/recipe-creation-edit'))
        },
        {
          label: 'Share',
          icon: 'Share',
          variant: 'ghost',
          onClick: onShare || (() => {
            // Default share behavior - could be enhanced
            if (navigator.share) {
              navigator.share({
                title: title || 'Recipe',
                url: window.location.href
              });
            }
          })
        },
        {
          label: 'More',
          icon: 'MoreVertical',
          variant: 'ghost',
          onClick: onMoreActions || (() => {
            // Default more actions behavior
            logger.debug('More actions menu - implement as needed');
          })
        }
      ];
    }
    
    if (path === '/recipe-creation-edit') {
      return [
        {
          label: 'Save',
          icon: 'Check',
          variant: 'primary',
          onClick: onSave || (() => {
            // Default save behavior
            logger.debug('Save recipe - implement as needed');
          })
        }
      ];
    }
    
    return [];
  };

  const displayActions = actions.length > 0 ? actions : getDefaultActions();

  return (
    <header className={`bg-white border-b border-gray-200 sticky top-0 z-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Left Section */}
          <div className="flex items-center space-x-3">
            {showBackButton && (
              <button
                onClick={handleBackClick}
                disabled={isNavigating}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 -ml-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                aria-label={isNavigating ? "Navigating..." : "Go back"}
                title="Go back"
              >
                <Icon 
                  name={isNavigating ? "Loader2" : "ArrowLeft"} 
                  size={20} 
                  color="currentColor"
                  className={isNavigating ? "animate-spin" : ""}
                />
              </button>
            )}
            
            <div className="min-w-0 flex-1">
              <h1 className="text-lg md:text-xl font-semibold text-gray-900 truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-600 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-2">
            {/* Mobile - Show only primary actions */}
            <div className="flex md:hidden space-x-1">
              {displayActions.slice(0, 2).map((action, index) => (
                <Button
                  key={`mobile-${index}`}
                  variant={action.variant || 'ghost'}
                  size="sm"
                  onClick={action.onClick}
                  iconName={action.icon}
                  className="px-2"
                  aria-label={action.label}
                  title={action.label}
                />
              ))}
              {displayActions.length > 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="MoreVertical"
                  className="px-2"
                  onClick={onMoreActions || (() => {
                    // Show remaining actions in a dropdown or modal
                    logger.debug('Show more actions - implement dropdown/modal');
                  })}
                  aria-label="More actions"
                  title="More actions"
                />
              )}
            </div>

            {/* Desktop - Show all actions */}
            <div className="hidden md:flex space-x-2">
              {displayActions.map((action, index) => (
                <Button
                  key={`desktop-${index}`}
                  variant={action.variant || 'ghost'}
                  size="sm"
                  onClick={action.onClick}
                  iconName={action.icon}
                  iconPosition="left"
                  title={action.label}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ContextualActionHeader;