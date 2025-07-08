import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';
import sharingService from '../../utils/sharingService';

const ShareButton = ({ 
  items = [], 
  title = 'Shopping List', 
  variant = 'primary', 
  size = 'md',
  showOptions = false,
  categorized = false,
  className = '',
  disabled = false,
  onShareComplete = null,
  onShareError = null
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [toast, setToast] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowShareOptions(false);
      }
    };

    if (showShareOptions) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          setShowShareOptions(false);
        }
      });
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShareOptions]);

  // Show toast notification
  const showToast = (message, type = 'success') => {
    const toastElement = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    
    toastElement.className = `
      fixed bottom-4 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-50
      transform transition-all duration-300 ease-in-out
      flex items-center space-x-2
    `;
    
    toastElement.innerHTML = `
      <span>${message}</span>
      <button onClick="this.parentElement.remove()" class="ml-2 hover:opacity-75">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    `;
    
    document.body.appendChild(toastElement);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      if (toastElement.parentElement) {
        toastElement.remove();
      }
    }, 4000);
  };

  const handleShare = async (method = 'auto') => {
    if (disabled || items.length === 0) {
      showToast('No items to share', 'error');
      return;
    }

    setIsSharing(true);
    
    try {
      let result;
      const formattedContent = sharingService.formatShoppingList(items, title);
      
      switch (method) {
        case 'email':
          result = sharingService.shareViaEmail(title, formattedContent);
          break;
        case 'sms':
          result = sharingService.shareViaSMS(formattedContent);
          break;
        case 'whatsapp':
          result = sharingService.shareViaWhatsApp(formattedContent);
          break;
        case 'twitter':
          result = sharingService.shareViaTwitter(formattedContent);
          break;
        case 'facebook':
          result = sharingService.shareViaFacebook(formattedContent);
          break;
        case 'clipboard':
          result = await sharingService.copyToClipboard(formattedContent);
          break;
        default:
          result = await sharingService.shareShoppingList(items, title, { categorized });
      }

      if (result?.success) {
        onShareComplete?.(result);
        
        // Show success message
        const successMessage = result.message || 
          (result.method === 'clipboard' ? 'Copied to clipboard!' : 'Shared successfully!');
        showToast(successMessage, 'success');
      } else {
        throw new Error(result?.error || 'Share failed');
      }
    } catch (error) {
      console.error('Share failed:', error);
      
      const errorMessage = error.message || 'Share failed. Please try again.';
      showToast(errorMessage, 'error');
      onShareError?.(error);
    } finally {
      setIsSharing(false);
      setShowShareOptions(false);
    }
  };

  const getButtonClasses = () => {
    const baseClasses = [
      'inline-flex items-center justify-center font-medium',
      'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    ];
    
    const variantClasses = {
      primary: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 focus:ring-gray-500',
      ghost: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm rounded-md',
      md: 'px-4 py-2 text-sm rounded-lg',
      lg: 'px-6 py-3 text-base rounded-lg'
    };

    return [
      ...baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className
    ].join(' ');
  };

  const getIconSize = () => {
    return size === 'sm' ? 14 : size === 'lg' ? 20 : 16;
  };

  const shareOptions = [
    { method: 'email', label: 'Email', icon: 'Mail' },
    { method: 'sms', label: 'SMS', icon: 'MessageCircle' },
    { method: 'whatsapp', label: 'WhatsApp', icon: 'MessageCircle' },
    { method: 'clipboard', label: 'Copy to Clipboard', icon: 'Copy' }
  ];

  if (showOptions) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowShareOptions(!showShareOptions)}
          className={getButtonClasses()}
          disabled={disabled || isSharing}
          aria-label="Share options"
          aria-expanded={showShareOptions}
          aria-haspopup="true"
        >
          {isSharing ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
          ) : (
            <Icon name="Share" size={getIconSize()} className="mr-2" />
          )}
          Share
          <Icon 
            name={showShareOptions ? "ChevronUp" : "ChevronDown"} 
            size={12} 
            className="ml-1" 
          />
        </button>

        {showShareOptions && (
          <div 
            className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
            role="menu"
            aria-orientation="vertical"
          >
            <div className="py-1">
              {shareOptions.map((option) => (
                <button
                  key={option.method}
                  onClick={() => handleShare(option.method)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  role="menuitem"
                  disabled={isSharing}
                >
                  <Icon name={option.icon} size={16} className="mr-3" />
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => handleShare()}
      className={getButtonClasses()}
      disabled={disabled || isSharing}
      aria-label={`Share ${title}`}
    >
      {isSharing ? (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
      ) : (
        <Icon name="Share" size={getIconSize()} className="mr-2" />
      )}
      Share
    </button>
  );
};

export default ShareButton;