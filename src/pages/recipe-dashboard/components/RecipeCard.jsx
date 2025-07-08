import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import DatePickerModal from '../../recipe-detail-view/components/DatePickerModal';
import logger from '../../../utils/logger';

const RecipeCard = ({ recipe, onToggleFavorite, onDelete }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showActions, setShowActions] = useState(false);
  const [showMealPlanModal, setShowMealPlanModal] = useState(false);

  const handleCardClick = () => {
    navigate('/recipe-detail-view', { state: { recipe } });
  };

  const handleImageClick = (e) => {
    // Ensure image click navigates to recipe detail view
    e.stopPropagation();
    navigate('/recipe-detail-view', { state: { recipe } });
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onToggleFavorite(recipe?.id, !recipe?.is_favorite);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    navigate('/recipe-creation-edit', { state: { recipe } });
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(recipe?.id);
  };

  const handleMealPlanClick = (e) => {
    e.stopPropagation();
    setShowMealPlanModal(true);
  };

  const handleActionsToggle = (e) => {
    e.stopPropagation();
    setShowActions(!showActions);
  };

  const handleMealPlanModalClose = () => {
    setShowMealPlanModal(false);
  };

  const handleDateSelect = (date) => {
    // Optional: Add success feedback or refresh logic here
    logger.info('Recipe added to meal plan for:', date);
  };

  // Handle both image_url (from database) and image (legacy) field names
  const imageUrl = recipe?.image_url || recipe?.image;
  const isFavorite = recipe?.is_favorite || recipe?.isFavorite;

  return (
    <>
      <div className="bg-surface-50 rounded-lg shadow-card hover:shadow-modal transition-all duration-200 overflow-hidden cursor-pointer group">
        {/* Recipe Image */}
        <div className="relative h-48 overflow-hidden">
          <div 
            className="absolute inset-0 cursor-pointer z-0"
            onClick={handleImageClick}
            aria-label={`View ${recipe?.title || 'recipe'} details`}
          >
            <Image
              src={imageUrl}
              alt={recipe?.title || 'Recipe'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
            />
          </div>
          
          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200 z-20 ${
              isFavorite 
                ? 'bg-red-50/90 hover:bg-red-100/90 border border-red-200/50' :'bg-background/80 hover:bg-background/90'
            }`}
            style={{ pointerEvents: 'auto' }}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Icon
              name="Heart"
              size={18}
              color={isFavorite ? '#ef4444' : 'var(--color-text-secondary)'}
              strokeWidth={isFavorite ? 0 : 2}
              className={`transition-all duration-200 ${isFavorite ? 'fill-current scale-110' : 'hover:scale-105'}`}
              style={{ pointerEvents: 'none' }}
            />
          </button>

          {/* Cooking Time Badge */}
          {(recipe?.cookingTime || recipe?.cook_time_minutes) && (
            <div className="absolute bottom-3 left-3 px-2 py-1 bg-background/90 backdrop-blur-sm rounded-md z-10 pointer-events-none">
              <div className="flex items-center space-x-1">
                <Icon name="Clock" size={14} color="var(--color-text-secondary)" />
                <span className="text-xs font-caption text-text-secondary">
                  {recipe?.cookingTime || `${recipe?.cook_time_minutes}m`}
                </span>
              </div>
            </div>
          )}

          {/* Desktop Actions Overlay */}
          <div className="hidden md:flex absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 items-center justify-center space-x-2 z-10">
            <Button
              variant="ghost"
              size="sm"
              iconName="Edit"
              onClick={handleEditClick}
              className="bg-background/90 text-text-primary hover:bg-background"
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              iconName="Calendar"
              onClick={handleMealPlanClick}
              className="bg-background/90 text-primary hover:bg-primary-50"
            >
              Add to Plan
            </Button>
            <Button
              variant="ghost"
              size="sm"
              iconName="Trash2"
              onClick={handleDeleteClick}
              className="bg-background/90 text-error hover:bg-error-50"
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Recipe Content */}
        <div className="p-4" onClick={handleCardClick}>
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-heading font-semibold text-text-primary text-lg leading-tight line-clamp-2 flex-1">
              {recipe?.title || 'Untitled Recipe'}
            </h3>
            
            {/* Mobile Actions Menu */}
            <div className="md:hidden relative ml-2">
              <button
                onClick={handleActionsToggle}
                className="p-1 rounded-md hover:bg-surface-100 transition-colors duration-200"
                aria-label="Recipe actions"
              >
                <Icon name="MoreVertical" size={16} color="var(--color-text-secondary)" />
              </button>
              
              {showActions && (
                <div className="absolute right-0 top-8 bg-background border border-border rounded-lg shadow-modal py-1 z-10 min-w-[140px]">
                  <button
                    onClick={handleEditClick}
                    className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-surface-100 flex items-center space-x-2"
                  >
                    <Icon name="Edit" size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={handleMealPlanClick}
                    className="w-full px-3 py-2 text-left text-sm text-primary hover:bg-primary-50 flex items-center space-x-2"
                  >
                    <Icon name="Calendar" size={14} />
                    <span>Add to Plan</span>
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    className="w-full px-3 py-2 text-left text-sm text-error hover:bg-error-50 flex items-center space-x-2"
                  >
                    <Icon name="Trash2" size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Category Tags */}
          {recipe?.category && (
            <div className="flex flex-wrap gap-1 mb-3">
              <span className="px-2 py-1 bg-primary-50 text-primary text-xs font-caption rounded-md">
                {recipe?.category}
              </span>
              {recipe?.difficulty && (
                <span className="px-2 py-1 bg-accent-50 text-accent text-xs font-caption rounded-md">
                  {recipe?.difficulty}
                </span>
              )}
            </div>
          )}

          {/* Recipe Stats */}
          <div className="flex items-center justify-between text-sm text-text-secondary">
            <div className="flex items-center space-x-4">
              {recipe?.servings && (
                <div className="flex items-center space-x-1">
                  <Icon name="Users" size={14} />
                  <span>{recipe?.servings} servings</span>
                </div>
              )}
              {recipe?.rating && (
                <div className="flex items-center space-x-1">
                  <Icon name="Star" size={14} color="var(--color-warning)" className="fill-current" />
                  <span>{recipe?.rating}</span>
                </div>
              )}
            </div>
            
            <span className="text-xs">
              {recipe?.createdAt 
                ? new Date(recipe.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })
                : recipe?.created_at
                ? new Date(recipe.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })
                : 'Unknown'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Meal Plan Modal */}
      <DatePickerModal
        isOpen={showMealPlanModal}
        onClose={handleMealPlanModalClose}
        onDateSelect={handleDateSelect}
        recipe={recipe}
      />
    </>
  );
};

export default RecipeCard;