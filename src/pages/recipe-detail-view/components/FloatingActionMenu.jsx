import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import DatePickerModal from './DatePickerModal';

const FloatingActionMenu = ({ recipe, onAddToMealPlan, onPrint, onShare }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    setShowShareOptions(false);
  };

  const handleAction = (action) => {
    if (action === 'addToMealPlan') {
      setShowDatePicker(true);
    } else if (action === 'showShareOptions') {
      setShowShareOptions(true);
    } else {
      action();
    }
    setIsOpen(false);
  };

  const handleDateSelect = (selectedDate) => {
    onAddToMealPlan(selectedDate);
    setShowDatePicker(false);
  };

  const handleShareMethod = (method) => {
    onShare(method);
    setShowShareOptions(false);
  };

  const actions = [
    {
      label: 'Add to Meal Plan',
      icon: 'Calendar',
      onClick: 'addToMealPlan',
      color: 'bg-primary hover:bg-primary-600'
    },
    {
      label: 'Print Recipe',
      icon: 'Printer',
      onClick: onPrint,
      color: 'bg-secondary hover:bg-secondary-600'
    },
    {
      label: 'Share Recipe',
      icon: 'Share',
      onClick: 'showShareOptions',
      color: 'bg-accent hover:bg-accent-600'
    }
  ];

  return (
    <>
      <div className="fixed bottom-20 md:bottom-6 right-6 z-150">
        {/* Share options dropdown */}
        {showShareOptions && (
          <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-lg p-2 mb-4 min-w-[140px] animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex flex-col space-y-1">
              <button
                onClick={() => handleShareMethod('facebook')}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                <Icon name="Facebook" size={16} />
                <span>Facebook</span>
              </button>
              <button
                onClick={() => handleShareMethod('twitter')}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                <Icon name="Twitter" size={16} />
                <span>Twitter</span>
              </button>
              <button
                onClick={() => handleShareMethod('whatsapp')}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                <Icon name="MessageCircle" size={16} />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={() => handleShareMethod('email')}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                <Icon name="Mail" size={16} />
                <span>Email</span>
              </button>
              <div className="border-t border-gray-200 my-1"></div>
              <button
                onClick={() => handleShareMethod('clipboard')}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                <Icon name="Copy" size={16} />
                <span>Copy Link</span>
              </button>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 space-y-2 animate-in slide-in-from-bottom-2 duration-200">
            {actions.map((action, index) => (
              <div
                key={action.label}
                className="flex items-center space-x-3"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="bg-surface-800 text-white px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg">
                  {action.label}
                </span>
                <button
                  onClick={() => handleAction(action.onClick)}
                  className={`w-12 h-12 ${action.color} text-white rounded-full shadow-floating hover:shadow-lg transition-all duration-200 flex items-center justify-center transform hover:scale-105 active:scale-95`}
                  aria-label={action.label}
                >
                  <Icon 
                    name={action.icon} 
                    size={20} 
                    color="white" 
                    strokeWidth={2}
                  />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Main FAB */}
        <button
          onClick={toggleMenu}
          className={`w-14 h-14 bg-accent hover:bg-accent-600 text-white rounded-full shadow-floating hover:shadow-lg transition-all duration-200 flex items-center justify-center transform hover:scale-105 active:scale-95 ${
            isOpen ? 'rotate-45' : ''
          }`}
          aria-label={isOpen ? 'Close menu' : 'Open actions menu'}
        >
          <Icon 
            name="Plus" 
            size={24} 
            color="white" 
            strokeWidth={2.5}
          />
        </button>
      </div>

      {showDatePicker && (
        <DatePickerModal
          isOpen={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          onDateSelect={handleDateSelect}
          recipe={recipe}
        />
      )}
    </>
  );
};

export default FloatingActionMenu;