import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import mealPlanService from "../../utils/mealPlanService";
import recipeService from "../../utils/recipeService";
import logger from "../../utils/logger";
import UnifiedHeader from "../../components/ui/UnifiedHeader";
import WeekNavigator from "./components/WeekNavigator";
import DayCard from "./components/DayCard";
import QuickActions from "./components/QuickActions";
import ShoppingListModal from "./components/ShoppingListModal";
import RecipeSearchModal from "../recipe-search-modal";
import shoppingListService from '../../utils/shoppingListService';
import AddItemModal from '../shopping-list/components/AddItemModal';

const WeeklyMealPlanner = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [mealPlans, setMealPlans] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [showRecipeSearchModal, setShowRecipeSearchModal] = useState(false);
  const [selectedDateAndMeal, setSelectedDateAndMeal] = useState(null);
  const [shoppingItems, setShoppingItems] = useState([]);
  const [shoppingListUpdated, setShoppingListUpdated] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [addingItem, setAddingItem] = useState(false);

  const getWeekDates = (date) => {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDates = getWeekDates(currentWeek);

  // Get day names
  const getDayName = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  // Get all recipes for a specific date (modified to return array)
  const getRecipesForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    const dayMealPlans = mealPlans?.filter(plan => plan.planned_date === dateString) || [];
    // Return array of recipes from meal plans
    return dayMealPlans.map(plan => ({
      ...plan,
      recipe: plan.recipes || plan.recipe // Handle both nested and direct recipe objects
    }));
  };

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const startDate = weekDates[0].toISOString().split('T')[0];
        const endDate = weekDates[6].toISOString().split('T')[0];
        
        const [mealPlansResult, recipesResult] = await Promise.all([
          mealPlanService.getMealPlans(user.id, startDate, endDate),
          recipeService.getUserRecipes(user.id)
        ]);
        
        if (isMounted) {
          if (mealPlansResult?.success) {
            setMealPlans(mealPlansResult.data);
          } else {
            setError(mealPlansResult?.error || "Failed to load meal plans");
          }
          
          if (recipesResult?.success) {
            setRecipes(recipesResult.data);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError("Something went wrong loading data");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (!authLoading && user) {
      loadData();
    } else if (!authLoading && !user) {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [user, authLoading, currentWeek]);

  const handleWeekChange = (newWeek) => {
    setCurrentWeek(newWeek);
  };

  const handlePreviousWeek = () => {
    const previousWeek = new Date(currentWeek);
    previousWeek.setDate(currentWeek.getDate() - 7);
    setCurrentWeek(previousWeek);
  };

  const handleNextWeek = () => {
    const nextWeek = new Date(currentWeek);
    nextWeek.setDate(currentWeek.getDate() + 7);
    setCurrentWeek(nextWeek);
  };

  const handleTodayClick = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    setCurrentWeek(startOfWeek);
  };

  const handleAddRecipe = (dayName, date) => {
    setSelectedDateAndMeal({ date, dayName, mealType: 'dinner' });
    setShowRecipeSearchModal(true);
  };

  const handleRecipeAdded = (recipe, selectedDate) => {
    // Refresh meal plans to show the new addition
    const dateString = selectedDate.toISOString().split('T')[0];
    const newMealPlan = {
      id: Date.now() + Math.random(), // Temporary ID
      recipes: {
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        image_url: recipe.image_url,
        prep_time_minutes: recipe.prep_time_minutes,
        cook_time_minutes: recipe.cook_time_minutes,
        servings: recipe.servings,
        difficulty: recipe.difficulty
      },
      planned_date: dateString,
      meal_type: 'dinner',
      servings: recipe.servings || 4
    };
    
    setMealPlans(prev => [...prev, newMealPlan]);
    setSelectedDateAndMeal(null);
  };

  const handleRemoveRecipe = async (dayName, date, mealPlanId) => {
    try {
      const result = await mealPlanService.deleteMealPlan(mealPlanId);
      
      if (result?.success) {
        setMealPlans(prev => prev.filter(plan => plan.id !== mealPlanId));
      } else {
        setError(result?.error || "Failed to remove meal from plan");
      }
    } catch (err) {
      setError("Failed to remove meal from plan");
    }
  };

  const handleRecipeClick = (recipe) => {
    // Navigate to recipe detail view
    // Handle both direct recipe objects and meal plan recipe objects
    const recipeId = recipe?.id || recipe?.recipes?.id || recipe?.recipe?.id;
    if (recipeId) {
      window.location.href = `/recipe-detail-view?id=${recipeId}`;
    }
  };

  const handleGenerateShoppingList = async () => {
    if (!user?.id) return;
    
    try {
      const startDate = weekDates[0].toISOString().split('T')[0];
      const endDate = weekDates[6].toISOString().split('T')[0];
      
      logger.debug('Generating shopping list for:', { 
        startDate, 
        endDate, 
        mealPlansCount: mealPlans?.length,
        mealPlans: mealPlans 
      });
      
      // Additional debugging - check meal plans structure
      mealPlans?.forEach((plan, index) => {
        logger.debug(`Meal plan ${index + 1}:`, {
          id: plan.id,
          recipe_id: plan.recipe_id,
          planned_date: plan.planned_date,
          meal_type: plan.meal_type,
          servings: plan.servings,
          recipe: plan.recipes || plan.recipe,
          hasIngredients: !!(plan.recipes?.ingredients || plan.recipe?.ingredients)
        });
      });
      
      const result = await mealPlanService.generateShoppingList(user.id, startDate, endDate);
      
      logger.debug('Shopping list generation result:', result);
      
      if (result?.success) {
        setShoppingItems(result.data);
        setShowShoppingList(true);
        setError(null); // Clear any previous errors
      } else {
        setError(result?.error || "Failed to generate shopping list");
        logger.error('Shopping list generation failed:', result?.error);
      }
    } catch (err) {
      logger.error('Error generating shopping list:', err);
      setError("Failed to generate shopping list");
    }
  };

  const handleAddToShoppingList = () => {
    setShowAddItemModal(true);
  };

  const handleAddCustomItem = async (itemData) => {
    if (!user?.id) return;
    setAddingItem(true);
    try {
      const result = await shoppingListService.addItem(user.id, itemData);
      if (result?.success) {
        setShoppingListUpdated(true);
        // Optionally, allow adding more items in a row
        // setShowAddItemModal(false); // Uncomment to close after one
      } else {
        setError(result?.error || 'Failed to add custom item');
      }
    } catch (err) {
      setError('Failed to add custom item');
    } finally {
      setAddingItem(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UnifiedHeader 
          showSearch={false}
          showNavigation={true}
        />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Weekly Meal Planner
            </h1>
            <p className="text-gray-600 mb-8">
              Please sign in to access your meal planning features
            </p>
            <div className="space-x-4">
              <a
                href="/user-login"
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Sign In
              </a>
              <a
                href="/user-registration"
                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Sign Up
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedHeader 
        userProfile={userProfile}
        showSearch={false}
        showNavigation={true}
      />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Weekly Meal Planner
          </h1>
          <p className="text-gray-600">
            Plan your meals for the week and generate shopping lists
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <WeekNavigator 
          currentWeek={currentWeek} 
          onWeekChange={handleWeekChange}
          onPreviousWeek={handlePreviousWeek}
          onNextWeek={handleNextWeek}
          onTodayClick={handleTodayClick}
        />

        <QuickActions 
          onGenerateShoppingList={handleGenerateShoppingList}
          onAddToShoppingList={handleAddToShoppingList}
          hasPlannedMeals={mealPlans?.length > 0}
        />

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
            {weekDates.map(date => (
              <DayCard
                key={date.toISOString()}
                day={getDayName(date)}
                date={date}
                recipes={getRecipesForDate(date)}
                onAddRecipe={(dayName) => handleAddRecipe(dayName, date)}
                onRemoveRecipe={(dayName, mealPlanId) => handleRemoveRecipe(dayName, date, mealPlanId)}
                onRecipeClick={handleRecipeClick}
              />
            ))}
          </div>
        )}

        {showShoppingList && (
          <ShoppingListModal
            isOpen={showShoppingList}
            items={shoppingItems}
            onClose={() => setShowShoppingList(false)}
            userId={user.id}
            onShoppingListUpdated={() => setShoppingListUpdated(true)}
          />
        )}

        {showRecipeSearchModal && (
          <RecipeSearchModal
            isOpen={showRecipeSearchModal}
            onClose={() => {
              setShowRecipeSearchModal(false);
              setSelectedDateAndMeal(null);
            }}
            recipes={recipes}
            selectedDate={selectedDateAndMeal?.date}
            targetDay={selectedDateAndMeal?.dayName}
            onRecipeAdded={handleRecipeAdded}
            loading={loading}
          />
        )}
        {showAddItemModal && (
          <AddItemModal
            onClose={() => setShowAddItemModal(false)}
            onAddItem={handleAddCustomItem}
            loading={addingItem}
          />
        )}
      </div>
      {/* Notification for shopping list update */}
      {shoppingListUpdated && (
        <div
          className="fixed bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all"
          style={{ top: 80, left: '50%', transform: 'translateX(-50%)' }}
        >
          Shopping list updated!
        </div>
      )}
    </div>
  );
};

export default WeeklyMealPlanner;