import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FloatingSignUpPrompt = ({ onClose, recipe }) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  const handleSignUp = () => {
    navigate('/user-registration');
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <Icon name="X" size={16} color="white" />
          </button>
          
          <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mx-auto mb-4">
            <Icon name="Bookmark" size={32} color="white" />
          </div>
          
          <h2 className="text-xl font-bold text-center mb-2">
            Save this recipe and discover thousands more!
          </h2>
          <p className="text-orange-100 text-center text-sm">
            Join RecipeVault and never lose a great recipe again
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-50 rounded-lg mx-auto mb-2">
                <Icon name="BookOpen" size={20} color="#EA580C" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">Save Recipes</h3>
              <p className="text-xs text-gray-600">Organize your favorites</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-50 rounded-lg mx-auto mb-2">
                <Icon name="Calendar" size={20} color="#EA580C" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">Meal Planning</h3>
              <p className="text-xs text-gray-600">Plan your week ahead</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-50 rounded-lg mx-auto mb-2">
                <Icon name="ShoppingCart" size={20} color="#EA580C" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">Smart Lists</h3>
              <p className="text-xs text-gray-600">Auto-generate shopping</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-50 rounded-lg mx-auto mb-2">
                <Icon name="Users" size={20} color="#EA580C" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">Community</h3>
              <p className="text-xs text-gray-600">Share with friends</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleSignUp}
              variant="primary"
              size="lg"
              className="w-full bg-orange-500 hover:bg-orange-600 font-semibold"
            >
              Save "{recipe?.title?.slice(0, 20)}..."
            </Button>
            
            <p className="text-center text-xs text-gray-500">
              No credit card required
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingSignUpPrompt;