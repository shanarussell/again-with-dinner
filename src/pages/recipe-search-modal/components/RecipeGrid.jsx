import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RecipeGrid = ({ 
  recipes, 
  onRecipeSelect, 
  onRecipePreview, 
  isSubmitting, 
  targetDay,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  isMultiSelectMode = false,
  selectedRecipes = []
}) => {
  
  const getGridCols = () => {
    return `grid-cols-${columns.mobile} md:grid-cols-${columns.tablet} lg:grid-cols-${columns.desktop}`;
  };

  const formatCookTime = (minutes) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'text-green-600 bg-green-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'hard':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const isRecipeSelected = (recipe) => {
    return selectedRecipes.some(r => r.id === recipe.id);
  };

  return (
    <div className={`grid ${getGridCols()} gap-4`}>
      {recipes.map((recipe) => (
        <div
          key={recipe.id}
          className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group ${
            isMultiSelectMode && isRecipeSelected(recipe) 
              ? 'ring-2 ring-blue-500 border-blue-500' :'border-gray-200'
          }`}
        >
          {/* Recipe Image */}
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={recipe.image_url}
              alt={recipe.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Multi-select checkbox */}
            {isMultiSelectMode && (
              <div className="absolute top-2 right-2">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  isRecipeSelected(recipe) 
                    ? 'bg-blue-500 border-blue-500' :'bg-white border-gray-300'
                }`}>
                  {isRecipeSelected(recipe) && (
                    <Icon name="Check" size={14} className="text-white" />
                  )}
                </div>
              </div>
            )}
            
            {/* Difficulty Badge */}
            {recipe.difficulty && (
              <div className="absolute top-2 left-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                  {recipe.difficulty}
                </span>
              </div>
            )}
          </div>

          {/* Recipe Content */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">
              {recipe.title}
            </h3>
            
            {recipe.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {recipe.description}
              </p>
            )}

            {/* Recipe Meta */}
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-4">
                {recipe.prep_time_minutes && (
                  <div className="flex items-center space-x-1">
                    <Icon name="Clock" size={14} />
                    <span>{formatCookTime(recipe.prep_time_minutes + (recipe.cook_time_minutes || 0))}</span>
                  </div>
                )}
                
                {recipe.servings && (
                  <div className="flex items-center space-x-1">
                    <Icon name="Users" size={14} />
                    <span>{recipe.servings}</span>
                  </div>
                )}
              </div>
              
              {recipe.rating && recipe.rating > 0 && (
                <div className="flex items-center space-x-1">
                  <Icon name="Star" size={14} className="text-yellow-500 fill-current" />
                  <span>{recipe.rating}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => onRecipeSelect(recipe)}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isMultiSelectMode ? (
                  isRecipeSelected(recipe) ? 'Remove' : 'Select'
                ) : (
                  `Add to ${targetDay || 'Plan'}`
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRecipePreview(recipe)}
                disabled={isSubmitting}
                className="px-3"
              >
                <Icon name="Eye" size={16} />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecipeGrid;