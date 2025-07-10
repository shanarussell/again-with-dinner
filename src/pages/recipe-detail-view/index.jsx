import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ContextualActionHeader from '../../components/ui/ContextualActionHeader';
import RecipeHero from './components/RecipeHero';
import ServingScaler from './components/ServingScaler';
import IngredientsList from './components/IngredientsList';
import InstructionsList from './components/InstructionsList';
import RecipeTags from './components/RecipeTags';
import RecipeNotes from './components/RecipeNotes';
import RecipeRating from './components/RecipeRating';
import FloatingActionMenu from './components/FloatingActionMenu';
import recipeService from '../../utils/recipeService';
import sharingService from '../../utils/sharingService';

const RecipeDetailView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [servings, setServings] = useState(4);
  const [cookingMode, setCookingMode] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get recipe from location state or URL params
  const stateRecipe = location.state?.recipe;
  const recipeId = location.state?.recipeId || new URLSearchParams(location.search).get('id');

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        setLoading(true);
        setError(null);

        if (stateRecipe) {
          // Use recipe from navigation state
          setRecipe(transformRecipeForDisplay(stateRecipe));
          setServings(stateRecipe.servings || 4);
        } else if (recipeId) {
          // Fetch recipe from database
          const result = await recipeService.getRecipe(recipeId);
          if (result.success) {
            setRecipe(transformRecipeForDisplay(result.data));
            setServings(result.data.servings || 4);
          } else {
            setError(result.error || 'Failed to load recipe');
          }
        } else {
          setError('No recipe specified');
        }
      } catch (err) {
        setError('An error occurred while loading the recipe');
        console.error('Recipe loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRecipe();
  }, [stateRecipe, recipeId]);

  const transformRecipeForDisplay = (dbRecipe) => {
    // Transform database recipe to component format
    return {
      id: dbRecipe.id,
      title: dbRecipe.title || "Untitled Recipe",
      image: dbRecipe.image_url || "https://images.unsplash.com/photo-1546548970-71785318a17b?w=800&h=600&fit=crop",
      description: dbRecipe.description || "A delicious recipe",
      servings: dbRecipe.servings || 4,
      prepTime: dbRecipe.prep_time_minutes ? `${dbRecipe.prep_time_minutes} min` : "N/A",
      cookTime: dbRecipe.cook_time_minutes ? `${dbRecipe.cook_time_minutes} min` : "N/A",
      totalTime: dbRecipe.prep_time_minutes && dbRecipe.cook_time_minutes ? 
        `${dbRecipe.prep_time_minutes + dbRecipe.cook_time_minutes} min` : "N/A",
      difficulty: dbRecipe.difficulty ? dbRecipe.difficulty.charAt(0).toUpperCase() + dbRecipe.difficulty.slice(1) : "Medium",
      category: dbRecipe.category || "Main Course",
      cuisine: dbRecipe.cuisine || "International",
      dietaryRestrictions: dbRecipe.dietary_restrictions || [],
      tags: dbRecipe.tags || [],
      rating: dbRecipe.rating || 0,
      ingredients: dbRecipe.ingredients?.length ? 
        dbRecipe.ingredients.map((ing, index) => ({
          name: typeof ing === 'string' ? ing : ing.name || ing,
          amount: typeof ing === 'object' ? ing.amount : "1",
          unit: typeof ing === 'object' ? ing.unit : "piece",
          notes: typeof ing === 'object' ? ing.notes : ""
        })) : 
        [],
      instructions: dbRecipe.instructions?.length ? 
        dbRecipe.instructions.map((inst, index) => ({
          text: typeof inst === 'string' ? inst : inst.instruction || inst.text || '',
          temperature: typeof inst === 'object' ? inst.temperature : undefined,
          timer: typeof inst === 'object' ? inst.timer : undefined
        })) : 
        [],
      notes: typeof dbRecipe.notes === 'string'
        ? JSON.parse(dbRecipe.notes)
        : dbRecipe.notes || []
    };
  };

  const handleServingsChange = async (newServings) => {
    setServings(newServings);
    if (!recipe?.id) return;
    try {
      const result = await recipeService.updateRecipe(recipe.id, { servings: newServings });
      if (result.success) {
        setRecipe(prev => ({ ...prev, servings: newServings }));
      }
    } catch (error) {
      console.error('Failed to update servings:', error);
    }
  };

  const handleRatingChange = async (newRating) => {
    if (!recipe?.id) return;
    
    try {
      const result = await recipeService.updateRecipe(recipe.id, { rating: newRating });
      if (result.success) {
        setRecipe(prev => ({ ...prev, rating: newRating }));
      }
    } catch (error) {
      console.error('Failed to update rating:', error);
    }
  };

  const handleAddToMealPlan = (selectedDate) => {
    // Navigate to weekly meal planner with success message
    navigate('/weekly-meal-planner', { 
      state: { 
        recipe, 
        addedDate: selectedDate,
        message: `Added "${recipe.title}" to ${selectedDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric' 
        })} dinner!`
      } 
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (!recipe?.id) {
      console.error('Recipe ID is required for sharing');
      return;
    }

    try {
      const result = await sharingService.shareRecipe(recipe);
      
      if (result.success) {
        // Show success message if using clipboard method
        if (result.method === 'clipboard') {
          const toast = document.createElement('div');
          toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
          toast.textContent = result.message || 'Recipe shared successfully!';
          document.body.appendChild(toast);
          setTimeout(() => {
            if (document.body.contains(toast)) {
              document.body.removeChild(toast);
            }
          }, 3000);
        }
      } else {
        // Show error message
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        toast.textContent = result.error || 'Failed to share recipe';
        document.body.appendChild(toast);
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
        }, 3000);
      }
    } catch (error) {
      console.error('Share failed:', error);
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      toast.textContent = 'Share failed. Please try again.';
      document.body.appendChild(toast);
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 3000);
    }
  };

  const handleSpecificShare = async (method) => {
    if (!recipe?.id) {
      console.error('Recipe ID is required for sharing');
      return;
    }

    try {
      const result = await sharingService.shareRecipe(recipe, method);
      
      if (result.success) {
        // Show success message for clipboard method
        if (result.method === 'clipboard') {
          const toast = document.createElement('div');
          toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
          toast.textContent = result.message || 'Recipe shared successfully!';
          document.body.appendChild(toast);
          setTimeout(() => {
            if (document.body.contains(toast)) {
              document.body.removeChild(toast);
            }
          }, 3000);
        }
      } else {
        // Show error message
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        toast.textContent = result.error || 'Failed to share recipe';
        document.body.appendChild(toast);
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
        }, 3000);
      }
    } catch (error) {
      console.error('Share failed:', error);
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      toast.textContent = 'Share failed. Please try again.';
      document.body.appendChild(toast);
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 3000);
    }
  };

  const handleNotesChange = async (newNotes) => {
    if (!recipe?.id) return;
    try {
      const result = await recipeService.updateRecipe(recipe.id, { notes: newNotes });
      if (result.success) {
        setRecipe(prev => ({ ...prev, notes: newNotes }));
      }
    } catch (error) {
      // Optionally show an error message
    }
  };

  const toggleCookingMode = () => {
    setCookingMode(!cookingMode);
    if (!cookingMode) {
      // Request wake lock to keep screen on
      if ('wakeLock' in navigator) {
        navigator.wakeLock.request('screen');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary mb-4">{error}</p>
          <button
            onClick={() => navigate('/recipe-dashboard')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            Back to Recipes
          </button>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary mb-4">Recipe not found</p>
          <button
            onClick={() => navigate('/recipe-dashboard')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            Back to Recipes
          </button>
        </div>
      </div>
    );
  }

  // Custom header actions
  const headerActions = [
    {
      label: 'Edit',
      icon: 'Edit',
      variant: 'ghost',
      onClick: () => navigate('/recipe-creation-edit', { state: { recipe } })
    },
    {
      label: cookingMode ? 'Exit Cooking' : 'Cooking Mode',
      icon: cookingMode ? 'X' : 'ChefHat',
      variant: cookingMode ? 'danger' : 'ghost',
      onClick: toggleCookingMode
    },
    {
      label: 'Share',
      icon: 'Share',
      variant: 'ghost',
      onClick: handleShare
    }
  ];

  return (
    <div className={`min-h-screen ${cookingMode ? 'bg-green-50' : 'bg-background'} ${cookingMode ? 'text-xl' : ''}`}>
      <ContextualActionHeader
        title={recipe.title}
        subtitle={`${recipe.category} • ${recipe.totalTime}`}
        actions={headerActions}
      />

      <main className="max-w-7xl mx-auto px-4 py-6 pb-20 md:pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Mobile Layout - Single Column */}
          <div className="lg:hidden space-y-6">
            <RecipeHero 
              recipe={recipe} 
              onSpecificShare={handleSpecificShare}
            />
            
            <div className="space-y-4">
              <ServingScaler
                servings={servings}
                originalServings={recipe.servings}
                onServingsChange={handleServingsChange}
              />
              
              <RecipeRating
                rating={recipe.rating}
                onRatingChange={handleRatingChange}
              />
            </div>

            <IngredientsList
              ingredients={recipe.ingredients}
              servings={servings}
              originalServings={recipe.servings}
              cookingMode={cookingMode}
            />

            <InstructionsList instructions={recipe.instructions} ingredients={recipe.ingredients} cookingMode={cookingMode} onFinishCooking={() => setCookingMode(false)} />

            <RecipeTags
              tags={recipe.tags}
              category={recipe.category}
              cuisine={recipe.cuisine}
              dietaryRestrictions={recipe.dietaryRestrictions}
            />

            <RecipeNotes notes={recipe.notes} onNotesChange={handleNotesChange} />
          </div>

          {/* Desktop Layout - Two Column */}
          <div className="hidden lg:block lg:col-span-5 space-y-6">
            <RecipeHero 
              recipe={recipe} 
              onSpecificShare={handleSpecificShare}
            />
            
            <div className="space-y-4">
              <ServingScaler
                servings={servings}
                originalServings={recipe.servings}
                onServingsChange={handleServingsChange}
              />
              
              <RecipeRating
                rating={recipe.rating}
                onRatingChange={handleRatingChange}
              />
            </div>

            <IngredientsList
              ingredients={recipe.ingredients}
              servings={servings}
              originalServings={recipe.servings}
              cookingMode={cookingMode}
            />

            <RecipeTags
              tags={recipe.tags}
              category={recipe.category}
              cuisine={recipe.cuisine}
              dietaryRestrictions={recipe.dietaryRestrictions}
            />
          </div>

          <div className="hidden lg:block lg:col-span-7 space-y-6">
            <InstructionsList instructions={recipe.instructions} ingredients={recipe.ingredients} cookingMode={cookingMode} onFinishCooking={() => setCookingMode(false)} />
            <RecipeNotes notes={recipe.notes} onNotesChange={handleNotesChange} />
          </div>
        </div>
      </main>

      <FloatingActionMenu
        recipe={recipe}
        onAddToMealPlan={handleAddToMealPlan}
        onPrint={handlePrint}
        onShare={handleSpecificShare}
      />
    </div>
  );
};

export default RecipeDetailView;