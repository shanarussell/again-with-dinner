import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const RecipeHero = ({ recipe, servings, onServingsChange, onPrint, onShare }) => {
  const handleServingsChange = (change) => {
    const newServings = Math.max(1, Math.min(20, servings + change));
    onServingsChange?.(newServings);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Recipe Image */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <Image
          src={recipe?.image}
          alt={recipe?.title || 'Recipe'}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay Actions */}
        <div className="absolute top-4 right-4 flex space-x-2 no-print">
          <button
            onClick={onPrint}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
            title="Print Recipe"
          >
            <Icon name="Printer" size={20} color="#374151" />
          </button>
          <button
            onClick={onShare}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
            title="Share Recipe"
          >
            <Icon name="Share" size={20} color="#374151" />
          </button>
        </div>

        {/* Recipe Stats Badge */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2">
          <div className="flex items-center space-x-4 text-sm">
            {recipe?.totalTime > 0 && (
              <div className="flex items-center space-x-1">
                <Icon name="Clock" size={16} color="#6B7280" />
                <span className="text-gray-700 font-medium">{recipe.totalTime}m</span>
              </div>
            )}
            {recipe?.difficulty && (
              <div className="flex items-center space-x-1">
                <Icon name="TrendingUp" size={16} color="#6B7280" />
                <span className="text-gray-700 font-medium">{recipe.difficulty}</span>
              </div>
            )}
            {recipe?.rating > 0 && (
              <div className="flex items-center space-x-1">
                <Icon name="Star" size={16} color="#F59E0B" className="fill-current" />
                <span className="text-gray-700 font-medium">{recipe.rating}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recipe Info */}
      <div className="p-6">
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 print-title">
            {recipe?.title}
          </h1>
          {recipe?.description && (
            <p className="text-gray-600 leading-relaxed">
              {recipe.description}
            </p>
          )}
        </div>

        {/* Recipe Metadata */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-50 rounded-lg mb-2 mx-auto">
              <Icon name="Clock" size={20} color="#EA580C" />
            </div>
            <p className="text-sm text-gray-500">Prep Time</p>
            <p className="font-semibold text-gray-900">
              {recipe?.prepTime > 0 ? `${recipe.prepTime}m` : 'N/A'}
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-50 rounded-lg mb-2 mx-auto">
              <Icon name="Flame" size={20} color="#EA580C" />
            </div>
            <p className="text-sm text-gray-500">Cook Time</p>
            <p className="font-semibold text-gray-900">
              {recipe?.cookTime > 0 ? `${recipe.cookTime}m` : 'N/A'}
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-50 rounded-lg mb-2 mx-auto">
              <Icon name="Users" size={20} color="#EA580C" />
            </div>
            <p className="text-sm text-gray-500">Servings</p>
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => handleServingsChange(-1)}
                className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors no-print"
                disabled={servings <= 1}
              >
                <Icon name="Minus" size={12} color="#374151" />
              </button>
              <span className="font-semibold text-gray-900 min-w-[2ch] text-center">
                {servings}
              </span>
              <button
                onClick={() => handleServingsChange(1)}
                className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors no-print"
                disabled={servings >= 20}
              >
                <Icon name="Plus" size={12} color="#374151" />
              </button>
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-50 rounded-lg mb-2 mx-auto">
              <Icon name="TrendingUp" size={20} color="#EA580C" />
            </div>
            <p className="text-sm text-gray-500">Difficulty</p>
            <p className="font-semibold text-gray-900">{recipe?.difficulty}</p>
          </div>
        </div>

        {/* Category */}
        {recipe?.category && (
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
              {recipe.category}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeHero;