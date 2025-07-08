import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import mealPlanService from '../../utils/mealPlanService';
import SearchBar from './components/SearchBar';
import FilterChips from './components/FilterChips';
import RecipeGrid from './components/RecipeGrid';
import LoadingState from './components/LoadingState';
import EmptyState from './components/EmptyState';
import SuccessMessage from './components/SuccessMessage';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const RecipeSearchModal = ({ 
  isOpen, 
  onClose, 
  recipes = [], 
  selectedDate, 
  targetDay,
  onRecipeAdded,
  loading = false 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedCookingTime, setSelectedCookingTime] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Reset multi-select state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedRecipes([]);
      setIsMultiSelectMode(false);
    }
  }, [isOpen]);

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'breakfast', name: 'Breakfast' },
    { id: 'lunch', name: 'Lunch' },
    { id: 'dinner', name: 'Dinner' },
    { id: 'snack', name: 'Snacks' },
    { id: 'dessert', name: 'Desserts' },
    { id: 'appetizer', name: 'Appetizers' }
  ];

  const difficulties = [
    { id: 'all', name: 'All Levels' },
    { id: 'easy', name: 'Easy' },
    { id: 'medium', name: 'Medium' },
    { id: 'hard', name: 'Hard' }
  ];

  const cookingTimes = [
    { id: 'all', name: 'Any Time' },
    { id: 'quick', name: 'Under 30 min' },
    { id: 'medium', name: '30-60 min' },
    { id: 'long', name: 'Over 60 min' }
  ];

  // Get recent recipes (last 5 accessed)
  const recentRecipes = useMemo(() => {
    return recipes
      .filter(recipe => recipe.last_accessed)
      .sort((a, b) => new Date(b.last_accessed) - new Date(a.last_accessed))
      .slice(0, 5);
  }, [recipes]);

  // Filter recipes based on search and filters
  const filteredRecipes = useMemo(() => {
    let filtered = recipes;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(recipe => {
        // Search in title
        const titleMatch = recipe.title?.toLowerCase().includes(query);
        
        // Search in description
        const descriptionMatch = recipe.description?.toLowerCase().includes(query);
        
        // Search in category
        const categoryMatch = recipe.category?.toLowerCase().includes(query);
        
        // Search in ingredients (JSONB array)
        const ingredientsMatch = recipe.ingredients?.some(ingredient => {
          if (typeof ingredient === 'string') {
            return ingredient.toLowerCase().includes(query);
          } else if (ingredient?.name) {
            return ingredient.name.toLowerCase().includes(query) ||
                   ingredient.amount?.toLowerCase().includes(query);
          }
          return false;
        });
        
        // Search in instructions (JSONB array)
        const instructionsMatch = recipe.instructions?.some(instruction => {
          if (typeof instruction === 'string') {
            return instruction.toLowerCase().includes(query);
          } else if (instruction?.instruction) {
            return instruction.instruction.toLowerCase().includes(query);
          }
          return false;
        });
        
        return titleMatch || descriptionMatch || categoryMatch || ingredientsMatch || instructionsMatch;
      });
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(recipe => 
        recipe.category?.toLowerCase() === selectedCategory
      );
    }

    // Apply difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(recipe => 
        recipe.difficulty?.toLowerCase() === selectedDifficulty
      );
    }

    // Apply cooking time filter
    if (selectedCookingTime !== 'all') {
      filtered = filtered.filter(recipe => {
        const cookTime = recipe.cook_time_minutes || 0;
        switch (selectedCookingTime) {
          case 'quick':
            return cookTime < 30;
          case 'medium':
            return cookTime >= 30 && cookTime <= 60;
          case 'long':
            return cookTime > 60;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [recipes, searchQuery, selectedCategory, selectedDifficulty, selectedCookingTime]);

  const handleRecipeSelect = async (recipe) => {
    if (isMultiSelectMode) {
      // Toggle recipe selection in multi-select mode
      setSelectedRecipes(prev => {
        const isSelected = prev.find(r => r.id === recipe.id);
        if (isSelected) {
          return prev.filter(r => r.id !== recipe.id);
        } else {
          return [...prev, recipe];
        }
      });
      return;
    }

    // Single recipe selection (existing behavior)
    if (!user?.id || !selectedDate) return;

    setIsSubmitting(true);
    setError('');

    try {
      const mealPlanData = {
        user_id: user.id,
        recipe_id: recipe.id,
        planned_date: selectedDate.toISOString().split('T')[0],
        meal_type: 'dinner',
        servings: recipe.servings || 4
      };

      const result = await mealPlanService.createMealPlan(mealPlanData);

      if (result?.success) {
        setSuccessMessage(`Added "${recipe.title}" to ${targetDay} dinner!`);
        onRecipeAdded?.(recipe, selectedDate);
        
        // Close modal after success animation
        setTimeout(() => {
          onClose();
          setSuccessMessage('');
        }, 2000);
      } else {
        setError(result?.error || 'Failed to add recipe to meal plan');
      }
    } catch (err) {
      setError('An error occurred while adding the recipe');
      console.error('Error adding recipe to meal plan:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMultipleRecipes = async () => {
    if (!user?.id || !selectedDate || selectedRecipes.length === 0) return;

    setIsSubmitting(true);
    setError('');

    try {
      const mealPlanPromises = selectedRecipes.map(recipe => {
        const mealPlanData = {
          user_id: user.id,
          recipe_id: recipe.id,
          planned_date: selectedDate.toISOString().split('T')[0],
          meal_type: 'dinner',
          servings: recipe.servings || 4
        };
        return mealPlanService.createMealPlan(mealPlanData);
      });

      const results = await Promise.all(mealPlanPromises);
      const successfulResults = results.filter(result => result?.success);

      if (successfulResults.length === selectedRecipes.length) {
        setSuccessMessage(`Added ${selectedRecipes.length} recipes to ${targetDay}!`);
        
        // Notify parent component about all added recipes
        selectedRecipes.forEach(recipe => {
          onRecipeAdded?.(recipe, selectedDate);
        });
        
        // Close modal after success animation
        setTimeout(() => {
          onClose();
          setSuccessMessage('');
          setSelectedRecipes([]);
          setIsMultiSelectMode(false);
        }, 2000);
      } else {
        const failedCount = selectedRecipes.length - successfulResults.length;
        setError(`Failed to add ${failedCount} recipe${failedCount > 1 ? 's' : ''} to meal plan`);
      }
    } catch (err) {
      setError('An error occurred while adding the recipes');
      console.error('Error adding recipes to meal plan:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecipePreview = (recipe) => {
    navigate('/recipe-detail-view', { 
      state: { recipe, returnTo: 'meal-planner' } 
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedDifficulty('all');
    setSelectedCookingTime('all');
  };

  const toggleMultiSelectMode = () => {
    setIsMultiSelectMode(!isMultiSelectMode);
    setSelectedRecipes([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              Add Recipe{isMultiSelectMode ? 's' : ''} to {targetDay || 'Meal Plan'}
            </h2>
            <p className="text-gray-600 mt-1">
              {selectedDate ? 
                `Choose recipe${isMultiSelectMode ? 's' : ''} for ${selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}` : 
                'Select a recipe to add to your meal plan'
              }
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={isMultiSelectMode ? "primary" : "outline"}
              size="sm"
              onClick={toggleMultiSelectMode}
              disabled={isSubmitting}
              className="text-sm"
            >
              {isMultiSelectMode ? 'Cancel Multi-Select' : 'Select Multiple'}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
              disabled={isSubmitting}
            >
              <Icon name="X" size={24} className="text-gray-500" />
            </Button>
          </div>
        </div>

        {/* Multi-select actions */}
        {isMultiSelectMode && (
          <div className="px-6 py-3 bg-blue-50 border-b border-blue-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="Info" size={16} className="text-blue-600" />
              <span className="text-sm text-blue-800">
                {selectedRecipes.length} recipe{selectedRecipes.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            {selectedRecipes.length > 0 && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddMultipleRecipes}
                disabled={isSubmitting}
                className="text-sm"
              >
                Add {selectedRecipes.length} Recipe{selectedRecipes.length !== 1 ? 's' : ''}
              </Button>
            )}
          </div>
        )}

        {/* Content - Make entire content scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* Search and Filters - moved inside scrollable area */}
          <div className="p-6 border-b border-gray-200 space-y-4 bg-white">
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              placeholder="Search recipes by name, ingredients, or tags..."
            />

            <FilterChips
              categories={categories}
              difficulties={difficulties}
              cookingTimes={cookingTimes}
              selectedCategory={selectedCategory}
              selectedDifficulty={selectedDifficulty}
              selectedCookingTime={selectedCookingTime}
              onCategoryChange={setSelectedCategory}
              onDifficultyChange={setSelectedDifficulty}
              onCookingTimeChange={setSelectedCookingTime}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Recipe Content */}
          {loading ? (
            <LoadingState />
          ) : error ? (
            <div className="p-6 text-center">
              <div className="text-red-600 mb-4">{error}</div>
              <Button
                variant="outline"
                onClick={() => setError('')}
                className="text-sm"
              >
                Try Again
              </Button>
            </div>
          ) : successMessage ? (
            <SuccessMessage message={successMessage} />
          ) : (
            <div className="p-6">
              {/* Recent Recipes Section - shown when no search query */}
              {!searchQuery.trim() && recentRecipes.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Recent Recipes
                  </h3>
                  <RecipeGrid
                    recipes={recentRecipes}
                    onRecipeSelect={handleRecipeSelect}
                    onRecipePreview={handleRecipePreview}
                    isSubmitting={isSubmitting}
                    targetDay={targetDay}
                    columns={{ mobile: 1, tablet: 2, desktop: 3 }}
                    isMultiSelectMode={isMultiSelectMode}
                    selectedRecipes={selectedRecipes}
                  />
                </div>
              )}

              {/* Main Recipe Grid */}
              {filteredRecipes.length > 0 ? (
                <div>
                  {!searchQuery.trim() && recentRecipes.length > 0 && (
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      All Recipes
                    </h3>
                  )}
                  <RecipeGrid
                    recipes={filteredRecipes}
                    onRecipeSelect={handleRecipeSelect}
                    onRecipePreview={handleRecipePreview}
                    isSubmitting={isSubmitting}
                    targetDay={targetDay}
                    columns={{ mobile: 1, tablet: 2, desktop: 3 }}
                    isMultiSelectMode={isMultiSelectMode}
                    selectedRecipes={selectedRecipes}
                  />
                </div>
              ) : (
                <EmptyState
                  hasFilters={searchQuery.trim() || selectedCategory !== 'all' || selectedDifficulty !== 'all' || selectedCookingTime !== 'all'}
                  onClearFilters={clearFilters}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeSearchModal;