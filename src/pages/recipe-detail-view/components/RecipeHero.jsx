import React, { useState } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const RecipeHero = ({ recipe, onSpecificShare }) => {
  const [showShareOptions, setShowShareOptions] = useState(false);

  const handleShareClick = (method) => {
    onSpecificShare?.(method);
    setShowShareOptions(false);
  };

  return (
    <div className="relative">
      <div className="aspect-[4/3] md:aspect-[16/9] overflow-hidden rounded-lg">
        <Image
          src={recipe?.image}
          alt={recipe?.title}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Overlay with metadata */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-lg">
        <div className="flex flex-wrap gap-4 text-white">
          <div className="flex items-center space-x-1">
            <Icon name="Users" size={16} color="white" />
            <span className="text-sm font-medium">{recipe?.servings} servings</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="Clock" size={16} color="white" />
            <span className="text-sm font-medium">{recipe?.prepTime} prep</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="Timer" size={16} color="white" />
            <span className="text-sm font-medium">{recipe?.cookTime} cook</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="BarChart3" size={16} color="white" />
            <span className="text-sm font-medium">{recipe?.difficulty}</span>
          </div>
        </div>
      </div>
      
      {/* Share Options */}
      {showShareOptions && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 z-10">
          <div className="flex flex-col space-y-2 min-w-[140px]">
            <button
              onClick={() => handleShareClick('facebook')}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              <Icon name="Facebook" size={16} />
              <span>Facebook</span>
            </button>
            <button
              onClick={() => handleShareClick('twitter')}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              <Icon name="Twitter" size={16} />
              <span>Twitter</span>
            </button>
            <button
              onClick={() => handleShareClick('whatsapp')}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              <Icon name="MessageCircle" size={16} />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={() => handleShareClick('email')}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              <Icon name="Mail" size={16} />
              <span>Email</span>
            </button>
            <div className="border-t border-gray-200 my-1"></div>
            <button
              onClick={() => handleShareClick('clipboard')}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              <Icon name="Copy" size={16} />
              <span>Copy Link</span>
            </button>
          </div>
        </div>
      )}
      
      {/* Share Button */}
      <button
        onClick={() => setShowShareOptions(!showShareOptions)}
        className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-md"
        title="Share Recipe"
      >
        <Icon name="Share" size={20} color="#374151" />
      </button>
    </div>
  );
};

export default RecipeHero;