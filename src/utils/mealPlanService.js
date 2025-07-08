import { supabase } from './supabase';
import { normalizeIngredients, validateIngredient } from './ingredientParser';
import logger from './logger';

const mealPlanService = {
  // Get meal plans for a date range
  async getMealPlans(userId, startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select(`
          *,
          recipes (
            id,
            title,
            description,
            image_url,
            prep_time_minutes,
            cook_time_minutes,
            servings,
            difficulty
          )
        `)
        .eq('user_id', userId)
        .gte('planned_date', startDate)
        .lte('planned_date', endDate)
        .order('planned_date', { ascending: true });
      
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data: data || [] };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to load meal plans' };
    }
  },

  // Get meal plans for a specific date
  async getMealPlansByDate(userId, date) {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select(`
          *,
          recipes (
            id,
            title,
            description,
            image_url,
            prep_time_minutes,
            cook_time_minutes,
            servings,
            difficulty
          )
        `)
        .eq('user_id', userId)
        .eq('planned_date', date)
        .order('meal_type', { ascending: true });
      
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data: data || [] };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to load meal plans for date' };
    }
  },

  // Create a new meal plan
  async createMealPlan(mealPlanData) {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .insert([mealPlanData])
        .select(`
          *,
          recipes (
            id,
            title,
            description,
            image_url,
            prep_time_minutes,
            cook_time_minutes,
            servings,
            difficulty
          )
        `)
        .single();
      
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to create meal plan' };
    }
  },

  // Update a meal plan
  async updateMealPlan(mealPlanId, updates) {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .update(updates)
        .eq('id', mealPlanId)
        .select(`
          *,
          recipes (
            id,
            title,
            description,
            image_url,
            prep_time_minutes,
            cook_time_minutes,
            servings,
            difficulty
          )
        `)
        .single();
      
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to update meal plan' };
    }
  },

  // Delete a meal plan
  async deleteMealPlan(mealPlanId) {
    try {
      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', mealPlanId);
      
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to delete meal plan' };
    }
  },

  // Get shopping list items from meal plans
  async generateShoppingList(userId, startDate, endDate) {
    try {
      logger.debug('Starting shopping list generation:', { userId, startDate, endDate });
      
      const { data, error } = await supabase
        .from('meal_plans')
        .select(`
          servings,
          recipes (
            id,
            title,
            ingredients
          )
        `)
        .eq('user_id', userId)
        .gte('planned_date', startDate)
        .lte('planned_date', endDate);
      
      logger.debug('Raw meal plans data:', data);
      
      if (error) {
        logger.error('Supabase error:', error);
        return { success: false, error: error.message };
      }

      // Check if we have any meal plans
      if (!data || data.length === 0) {
        logger.info('No meal plans found for date range');
        return { success: false, error: 'No items in your shopping list. Add some meals to your weekly plan to generate a shopping list.' };
      }

      logger.debug('Found meal plans:', data.length);

      // Process ingredients to create shopping list
      const shoppingItems = [];
      const itemMap = new Map();
      let totalIngredientsProcessed = 0;
      let recipesWithoutIngredients = [];
      let recipesWithInvalidIngredients = [];

      data.forEach((mealPlan, index) => {
        logger.debug(`Processing meal plan ${index + 1}:`, mealPlan);
        
        const recipe = mealPlan?.recipes;
        if (!recipe) {
          logger.warn(`Meal plan ${index + 1} has no recipe data:`, mealPlan);
          return;
        }

        logger.debug(`Recipe for meal plan ${index + 1}:`, recipe);
        
        const rawIngredients = recipe?.ingredients || [];
        const normalizedIngredients = normalizeIngredients(rawIngredients, recipe.title);
        const servings = mealPlan?.servings || 1;

        logger.debug(`Processing "${recipe.title}" with ${normalizedIngredients.length} ingredients, servings: ${servings}`);

        if (normalizedIngredients.length === 0) {
          logger.warn(`Recipe "${recipe.title}" has no ingredients defined`);
          recipesWithoutIngredients.push(recipe.title);
          return;
        }

        let validIngredientsCount = 0;
        let invalidIngredientsCount = 0;

        normalizedIngredients.forEach((ingredient, ingredientIndex) => {
          const validatedIngredient = validateIngredient(ingredient, recipe.title, ingredientIndex);
          
          if (!validatedIngredient) {
            invalidIngredientsCount++;
            return;
          }

          validIngredientsCount++;
          totalIngredientsProcessed++;

          const { name, amount } = validatedIngredient;
          const key = name.toLowerCase();
          
          // Create shopping list item
          const shoppingItem = {
            name: name,
            amount: servings > 1 ? `${amount} (${servings} servings)` : amount,
            checked: false,
            category: ingredient.category || 'Other',
            recipeTitle: recipe.title,
            servings: servings
          };

          if (itemMap.has(key)) {
            // If item already exists, append to existing entry
            const existingIndex = itemMap.get(key);
            const existingItem = shoppingItems[existingIndex];
            
            // Combine amounts intelligently
            if (existingItem.amount.includes('servings') && shoppingItem.amount.includes('servings')) {
              existingItem.amount = `${amount} (multiple recipes)`;
            } else if (!existingItem.amount.includes('multiple recipes')) {
              existingItem.amount = `${amount} (multiple recipes)`;
            }
            
            // Add recipe to the list
            if (!existingItem.recipeTitle.includes(recipe.title)) {
              existingItem.recipeTitle += `, ${recipe.title}`;
            }
          } else {
            itemMap.set(key, shoppingItems.length);
            shoppingItems.push(shoppingItem);
          }
        });

        if (invalidIngredientsCount > 0) {
          recipesWithInvalidIngredients.push({
            title: recipe.title,
            validCount: validIngredientsCount,
            invalidCount: invalidIngredientsCount
          });
        }

        logger.debug(`Processed "${recipe.title}": ${validIngredientsCount} valid, ${invalidIngredientsCount} invalid ingredients`);
      });

      logger.debug(`Total ingredients processed: ${totalIngredientsProcessed}`);
      logger.debug(`Shopping items generated: ${shoppingItems.length}`);
      logger.debug(`Recipes without ingredients: ${recipesWithoutIngredients.length}`);
      logger.debug(`Recipes with invalid ingredients: ${recipesWithInvalidIngredients.length}`);

      // Enhanced error reporting
      if (shoppingItems.length === 0) {
        logger.warn('No shopping items generated despite having meal plans');
        
        let errorMessage = 'No items in your shopping list. ';
        
        if (recipesWithoutIngredients.length > 0) {
          errorMessage += `The following recipes don't have ingredients defined: ${recipesWithoutIngredients.join(', ')}. `;
        }
        
        if (recipesWithInvalidIngredients.length > 0) {
          const invalidRecipeNames = recipesWithInvalidIngredients.map(r => r.title).join(', ');
          errorMessage += `The following recipes have corrupted ingredient data: ${invalidRecipeNames}. `;
        }
        
        errorMessage += 'Please edit these recipes to add proper ingredients with names and amounts.';
        
        return { 
          success: false, 
          error: errorMessage,
          debugInfo: {
            totalMealPlans: data.length,
            recipesWithoutIngredients,
            recipesWithInvalidIngredients
          }
        };
      }

      // Success with warnings
      let warnings = [];
      if (recipesWithoutIngredients.length > 0) {
        warnings.push(`${recipesWithoutIngredients.length} recipes have no ingredients defined`);
      }
      if (recipesWithInvalidIngredients.length > 0) {
        warnings.push(`${recipesWithInvalidIngredients.length} recipes have some invalid ingredient data`);
      }

      logger.info('Shopping list generation successful');
      return { 
        success: true, 
        data: shoppingItems,
        warnings: warnings.length > 0 ? warnings : undefined
      };
    } catch (error) {
      logger.error('Error in generateShoppingList:', error);
      
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to generate shopping list. Please try again.' };
    }
  },

  // Get this week's meal plans
  async getThisWeekMealPlans(userId) {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    
    const startDate = startOfWeek.toISOString().split('T')[0];
    const endDate = endOfWeek.toISOString().split('T')[0];
    
    return this.getMealPlans(userId, startDate, endDate);
  },
};

export default mealPlanService;