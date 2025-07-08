import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DayCard = ({ day, date, recipes = [], onAddRecipe, onRemoveRecipe, onRecipeClick }) => {
  const isToday = () => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Helper function to get recipe image URL
  const getRecipeImageUrl = (recipe) => {
    // Handle both direct recipe objects and meal plan recipe objects
    return recipe?.image_url || recipe?.image || recipe?.recipes?.image_url || recipe?.recipe?.image_url;
  };

  // Helper function to get recipe title
  const getRecipeTitle = (recipe) => {
    return recipe?.title || recipe?.recipes?.title || recipe?.recipe?.title;
  };

  // Helper function to get recipe cook time
  const getRecipeCookTime = (recipe) => {
    const cookTime = recipe?.cook_time_minutes || recipe?.recipes?.cook_time_minutes || recipe?.recipe?.cook_time_minutes;
    return cookTime ? `${cookTime}m` : recipe?.cookTime || recipe?.recipes?.cookTime || recipe?.recipe?.cookTime || 'N/A';
  };

  // Helper function to get recipe servings
  const getRecipeServings = (recipe) => {
    return recipe?.servings || recipe?.recipes?.servings || recipe?.recipe?.servings || 4;
  };

  return (
    <div className={`bg-surface-50 rounded-lg border transition-all duration-200 hover:shadow-card ${
      isToday() ? 'border-primary bg-primary-50' : 'border-border'
    }`}>
      {/* Day Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className={`font-heading font-semibold ${
              isToday() ? 'text-primary' : 'text-text-primary'
            }`}>
              {day}
            </h3>
            <p className="text-sm text-text-secondary">
              {formatDate(date)}
              {isToday() && (
                <span className="ml-2 text-xs bg-primary text-white px-2 py-1 rounded-full">
                  Today
                </span>
              )}
            </p>
          </div>
          
          {recipes?.length > 0 && (
            <div className="flex items-center space-x-1">
              <span className="text-xs text-text-secondary bg-surface-100 px-2 py-1 rounded-full">
                {recipes.length} recipe{recipes.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Recipe Content */}
      <div className="p-4">
        {recipes?.length > 0 ? (
          <div className="space-y-3">
            {recipes.map((mealPlan, index) => (
              <div 
                key={mealPlan.id || index}
                className="group relative flex items-center space-x-3 cursor-pointer hover:bg-surface-100 rounded-lg p-2 -m-2 transition-colors duration-200"
                onClick={() => onRecipeClick(mealPlan)}
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-200 flex-shrink-0">
                  <Image
                    src={getRecipeImageUrl(mealPlan)}
                    alt={getRecipeTitle(mealPlan) || 'Recipe image'}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-heading font-medium text-text-primary truncate text-sm">
                    {getRecipeTitle(mealPlan)}
                  </h4>
                  <div className="flex items-center space-x-3 mt-1">
                    <div className="flex items-center space-x-1 text-text-secondary">
                      <Icon name="Clock" size={12} />
                      <span className="text-xs">{getRecipeCookTime(mealPlan)}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-text-secondary">
                      <Icon name="Users" size={12} />
                      <span className="text-xs">{getRecipeServings(mealPlan)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveRecipe(day, mealPlan.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-text-secondary hover:text-error p-1 h-auto"
                    aria-label="Remove recipe"
                  >
                    <Icon name="X" size={14} />
                  </Button>
                  
                  <Icon 
                    name="ChevronRight" 
                    size={14} 
                    color="var(--color-text-secondary)" 
                  />
                </div>
              </div>
            ))}
            
            {/* Add More Recipe Button */}
            <button
              onClick={() => onAddRecipe(day)}
              className="w-full flex items-center justify-center py-2 border border-dashed border-border rounded-lg hover:border-primary hover:bg-primary-50 transition-all duration-200 group mt-2"
            >
              <Icon 
                name="Plus" 
                size={14} 
                color="var(--color-text-secondary)" 
                className="group-hover:text-primary mr-2"
              />
              <span className="text-sm text-text-secondary group-hover:text-primary font-medium">
                Add Another Recipe
              </span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => onAddRecipe(day)}
            className="w-full flex flex-col items-center justify-center py-8 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-primary-50 transition-all duration-200 group"
          >
            <div className="w-12 h-12 bg-surface-200 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary-100 transition-colors duration-200">
              <Icon 
                name="Plus" 
                size={20} 
                color="var(--color-text-secondary)" 
                className="group-hover:text-primary"
              />
            </div>
            <p className="text-text-secondary group-hover:text-primary font-medium">
              Add Recipe
            </p>
            <p className="text-sm text-text-muted mt-1">
              Plan your meals
            </p>
          </button>
        )}
      </div>
    </div>
  );
};

export default DayCard;