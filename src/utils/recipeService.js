import { supabase } from './supabase';
import logger from './logger';

const recipeService = {
  // Get all recipes for the current user
  async getUserRecipes(userId) {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
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
      return { success: false, error: 'Failed to load recipes' };
    }
  },

  // Get a single recipe by ID
  async getRecipe(recipeId) {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
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
      return { success: false, error: 'Failed to load recipe' };
    }
  },

  // Get a single recipe by ID for public access (no authentication required)
  async getPublicRecipe(recipeId) {
    try {
      logger.debug('RecipeService: getPublicRecipe called with ID:', recipeId);
      
      // Enhanced validation
      if (!recipeId || typeof recipeId !== 'string') {
        logger.error('RecipeService: Invalid recipe ID format:', recipeId);
        return { success: false, error: 'Invalid recipe ID format' };
      }

      const trimmedId = recipeId.trim();
      if (trimmedId === '') {
        logger.error('RecipeService: Empty recipe ID');
        return { success: false, error: 'Invalid recipe ID format' };
      }

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(trimmedId)) {
        logger.error('RecipeService: Invalid UUID format:', trimmedId);
        return { success: false, error: 'Invalid recipe ID format' };
      }

      logger.debug('RecipeService: Making Supabase query for recipe:', trimmedId);

      // Try using the dedicated public function first
      try {
        const { data: functionData, error: functionError } = await supabase
          .rpc('get_public_recipe', { recipe_uuid: trimmedId });

        if (functionError) {
          logger.debug('RecipeService: Function call failed, trying direct query:', functionError);
        } else if (functionData && functionData.length > 0) {
          logger.debug('RecipeService: Successfully retrieved recipe via function');
          return { success: true, data: functionData[0] };
        }
      } catch (functionException) {
        logger.debug('RecipeService: Function call exception, trying direct query:', functionException);
      }

      // Fallback to direct query with explicit anonymous access
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          id,
          title,
          description,
          ingredients,
          instructions,
          prep_time_minutes,
          cook_time_minutes,
          servings,
          difficulty,
          category,
          image_url,
          rating,
          created_at
        `)
        .eq('id', trimmedId)
        .single();
      
      logger.debug('RecipeService: Supabase direct query response:', { data, error });

      if (error) {
        logger.error('RecipeService: Supabase error:', error);
        // Handle specific Supabase errors
        if (error.code === 'PGRST116' || error.code === 'PGRST301') {
          return { success: false, error: 'Recipe not found' };
        }
        if (error.message?.includes('JSON object requested, multiple (or no) rows returned')) {
          return { success: false, error: 'Recipe not found' };
        }
        if (error.message?.includes('row not found')) {
          return { success: false, error: 'Recipe not found' };
        }
        if (error.message?.includes('permission denied') || error.message?.includes('insufficient_privilege')) {
          return { success: false, error: 'Recipe access denied. This recipe may be private.' };
        }
        return { success: false, error: 'Recipe not found' };
      }

      if (!data) {
        logger.error('RecipeService: No data returned from Supabase');
        return { success: false, error: 'Recipe not found' };
      }

      logger.debug('RecipeService: Successfully retrieved recipe data');
      return { success: true, data };
    } catch (error) {
      logger.error('RecipeService: Exception in getPublicRecipe:', error);
      
      // Network and connection errors
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Please check your internet connection and try again.' 
        };
      }
      
      // Auth errors
      if (error?.message?.includes('Invalid API key') || 
          error?.message?.includes('unauthorized')) {
        return { 
          success: false, 
          error: 'Database configuration error. Please contact support.' 
        };
      }
      
      // Generic error
      return { success: false, error: 'Unable to load recipe. Please try again.' };
    }
  },

  // Create a new recipe
  async createRecipe(recipeData) {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .insert([recipeData])
        .select()
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
      return { success: false, error: 'Failed to create recipe' };
    }
  },

  // Update a recipe
  async updateRecipe(recipeId, updates) {
    // Always serialize notes if present and not a string
    if (updates.notes && typeof updates.notes !== 'string') {
      updates = { ...updates, notes: JSON.stringify(updates.notes) };
    }
    try {
      const { data, error } = await supabase
        .from('recipes')
        .update(updates)
        .eq('id', recipeId)
        .select()
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
      return { success: false, error: 'Failed to update recipe' };
    }
  },

  // Delete a recipe
  async deleteRecipe(recipeId) {
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeId);
      
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
      return { success: false, error: 'Failed to delete recipe' };
    }
  },

  // Search recipes with enhanced filtering
  async searchRecipes(userId, query, filters = {}) {
    try {
      if (!query || query.trim() === '') {
        return this.getFilteredRecipes(userId, filters);
      }

      // Sanitize search term
      const searchTerm = query.trim()
        .replace(/[%_]/g, '\\$&')
        .replace(/['"]/g, '')
        .replace(/[()]/g, '');

      const searchPattern = `%${searchTerm}%`;
      
      let queryBuilder = supabase
        .from('recipes')
        .select('*')
        .eq('user_id', userId);

      // Apply search filter
      queryBuilder = queryBuilder.or(`title.ilike.${searchPattern},description.ilike.${searchPattern}`);

      // Apply category filter if provided
      if (filters.category && filters.category !== 'all') {
        queryBuilder = queryBuilder.eq('category', filters.category);
      }

      // Apply difficulty filter if provided
      if (filters.difficulty && filters.difficulty !== 'all') {
        queryBuilder = queryBuilder.eq('difficulty', filters.difficulty);
      }

      // Apply rating filter if provided
      if (filters.rating && filters.rating !== 'all') {
        const minRating = parseFloat(filters.rating);
        queryBuilder = queryBuilder.gte('rating', minRating);
      }

      // Apply cooking time filter if provided
      if (filters.cookingTime && filters.cookingTime !== 'all') {
        switch (filters.cookingTime) {
          case 'quick':
            queryBuilder = queryBuilder.lt('cook_time_minutes', 30);
            break;
          case 'medium':
            queryBuilder = queryBuilder.gte('cook_time_minutes', 30).lte('cook_time_minutes', 60);
            break;
          case 'long':
            queryBuilder = queryBuilder.gt('cook_time_minutes', 60);
            break;
        }
      }

      const { data, error } = await queryBuilder.order('created_at', { ascending: false });

      if (error) {
        console.error('Search error:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Search exception:', error);
      if (
        error?.message?.includes('Failed to fetch') ||
        error?.message?.includes('NetworkError') ||
        (error?.name === 'TypeError' && error?.message?.includes('fetch'))
      ) {
        return {
          success: false,
          error:
            'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.'
        };
      }
      return { success: false, error: 'Failed to search recipes' };
    }
  },

  // Get filtered recipes without search query
  async getFilteredRecipes(userId, filters = {}) {
    try {
      let queryBuilder = supabase
        .from('recipes')
        .select('*')
        .eq('user_id', userId);

      // Apply category filter if provided
      if (filters.category && filters.category !== 'all') {
        queryBuilder = queryBuilder.eq('category', filters.category);
      }

      // Apply difficulty filter if provided
      if (filters.difficulty && filters.difficulty !== 'all') {
        queryBuilder = queryBuilder.eq('difficulty', filters.difficulty);
      }

      // Apply rating filter if provided
      if (filters.rating && filters.rating !== 'all') {
        const minRating = parseFloat(filters.rating);
        queryBuilder = queryBuilder.gte('rating', minRating);
      }

      const { data, error } = await queryBuilder.order('created_at', { ascending: false });

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
      return { success: false, error: 'Failed to load filtered recipes' };
    }
  },

  // Get recipes by category
  async getRecipesByCategory(userId, category) {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', userId)
        .eq('category', category)
        .order('created_at', { ascending: false });
      
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
      return { success: false, error: 'Failed to load recipes by category' };
    }
  },

  // Get recipes by difficulty
  async getRecipesByDifficulty(userId, difficulty) {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', userId)
        .eq('difficulty', difficulty)
        .order('created_at', { ascending: false });
      
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
      return { success: false, error: 'Failed to load recipes by difficulty' };
    }
  },

  // Toggle favorite status
  async toggleFavorite(recipeId, isFavorite) {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .update({ is_favorite: isFavorite })
        .eq('id', recipeId)
        .select()
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
      return { success: false, error: 'Failed to update favorite status' };
    }
  },

  // Get favorite recipes
  async getFavoriteRecipes(userId) {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', userId)
        .eq('is_favorite', true)
        .order('created_at', { ascending: false });
      
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
      return { success: false, error: 'Failed to load favorite recipes' };
    }
  },
};

export default recipeService;