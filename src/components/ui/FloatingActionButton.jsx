import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const FloatingActionButton = ({ 
  onClick, 
  icon = 'Plus', 
  label = 'Add Recipe',
  className = '',
  showOnPaths = ['/recipe-dashboard'],
  position = 'bottom-right',
  size = 'md',
  variant = 'primary',
  disabled = false,
  loading = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isPressed, setIsPressed] = useState(false);

  // Check if button should be shown
  const shouldShow = showOnPaths.some(path => location.pathname === path);

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-20 md:bottom-6 right-6',
    'bottom-left': 'bottom-20 md:bottom-6 left-6',
    'top-right': 'top-20 md:top-6 right-6',
    'top-left': 'top-20 md:top-6 left-6',
    'center-right': 'top-1/2 right-6 -translate-y-1/2',
    'center-left': 'top-1/2 left-6 -translate-y-1/2'
  };

  // Size classes
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  // Variant classes
  const variantClasses = {
    primary: 'bg-green-600 hover:bg-green-700 focus:bg-green-700',
    secondary: 'bg-gray-600 hover:bg-gray-700 focus:bg-gray-700',
    accent: 'bg-orange-500 hover:bg-orange-600 focus:bg-orange-600',
    danger: 'bg-red-500 hover:bg-red-600 focus:bg-red-600'
  };

  // Icon sizes
  const iconSizes = {
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32
  };

  const handleClick = async () => {
    if (disabled || loading) return;

    try {
      if (onClick) {
        await onClick();
      } else {
        navigate('/recipe-creation-edit');
      }
    } catch (error) {
      console.error('FloatingActionButton click error:', error);
    }
  };

  const handleMouseDown = () => {
    if (!disabled && !loading) {
      setIsPressed(true);
    }
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  if (!shouldShow) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onKeyDown={handleKeyDown}
      disabled={disabled || loading}
      className={`
        fixed ${positionClasses[position]} ${sizeClasses[size]}
        ${variantClasses[variant]}
        text-white rounded-full shadow-lg hover:shadow-xl
        transition-all duration-200 flex items-center justify-center
        z-50 transform hover:scale-105 active:scale-95
        focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${isPressed ? 'scale-95' : ''}
        ${className}
      `.trim()}
      aria-label={loading ? `${label} (loading)` : label}
      title={label}
      role="button"
      tabIndex={disabled ? -1 : 0}
    >
      {loading ? (
        <div className="animate-spin">
          <Icon 
            name="Loader2" 
            size={iconSizes[size]} 
            color="white" 
            strokeWidth={2.5}
          />
        </div>
      ) : (
        <Icon 
          name={icon} 
          size={iconSizes[size]} 
          color="white" 
          strokeWidth={2.5}
        />
      )}
    </button>
  );
};

export default FloatingActionButton;