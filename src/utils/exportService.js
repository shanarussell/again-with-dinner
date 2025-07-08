import { supabase } from './supabase';

export const exportService = {
  async exportRecipes(userId, options = {}) {
    try {
      const {
        format = 'json',
        includeImages = true,
        includeFavorites = true,
        includeNotes = true,
        includeCreated = true,
        includeImported = true
      } = options;

      // Build base query
      let query = supabase
        .from('recipes')
        .select('*')
        .eq('user_id', userId);

      // Apply filters based on options
      const conditions = [];
      if (includeCreated && !includeImported) {
        conditions.push('is_imported.eq.false');
      } else if (includeImported && !includeCreated) {
        conditions.push('is_imported.eq.true');
      } else if (!includeCreated && !includeImported) {
        // If neither is selected, return empty result
        return { recipes: [], totalCount: 0 };
      }

      if (conditions.length > 0) {
        conditions.forEach(condition => {
          const [field, operator, value] = condition.split('.');
          if (operator === 'eq') {
            query = query.eq(field, value === 'true');
          }
        });
      }

      const { data: recipes, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch recipes: ${error.message}`);
      }

      // Fetch recipe notes separately if requested
      let recipeNotes = [];
      if (includeNotes && recipes?.length > 0) {
        try {
          const recipeIds = recipes.map(recipe => recipe.id);
          const { data: notes, error: notesError } = await supabase
            .from('recipe_notes')
            .select('id, recipe_id, content, created_at')
            .in('recipe_id', recipeIds)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (!notesError) {
            recipeNotes = notes || [];
          } else {
            console.warn('Failed to fetch recipe notes:', notesError.message);
            // Continue without notes rather than failing entirely
          }
        } catch (notesError) {
          console.warn('Recipe notes table may not exist:', notesError.message);
          // Continue without notes rather than failing entirely
        }
      }

      // Filter favorites if needed
      let filteredRecipes = recipes || [];
      if (includeFavorites && !includeCreated && !includeImported) {
        filteredRecipes = filteredRecipes.filter(recipe => recipe.is_favorite);
      }

      // Process recipes based on options
      const processedRecipes = filteredRecipes.map(recipe => {
        const processedRecipe = {
          id: recipe.id,
          title: recipe.title,
          description: recipe.description,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          prep_time: recipe.prep_time_minutes,
          cook_time: recipe.cook_time_minutes,
          servings: recipe.servings,
          difficulty: recipe.difficulty,
          category: recipe.category,
          is_favorite: recipe.is_favorite,
          is_imported: recipe.is_imported,
          source_url: recipe.source_url,
          created_at: recipe.created_at,
          updated_at: recipe.updated_at
        };

        // Include image URL if requested
        if (includeImages && recipe.image_url) {
          processedRecipe.image_url = recipe.image_url;
        }

        // Include notes if requested and available
        if (includeNotes && recipeNotes.length > 0) {
          const recipeNotesFiltered = recipeNotes.filter(note => note.recipe_id === recipe.id);
          if (recipeNotesFiltered.length > 0) {
            processedRecipe.notes = recipeNotesFiltered.map(note => ({
              content: note.content,
              created_at: note.created_at
            }));
          }
        }

        return processedRecipe;
      });

      return {
        recipes: processedRecipes,
        totalCount: processedRecipes.length,
        exportedAt: new Date().toISOString(),
        options: options
      };

    } catch (error) {
      console.error('Export service error:', error);
      throw error;
    }
  },

  generateFileName(format, userId) {
    const timestamp = new Date().toISOString().split('T')[0];
    return `recipes_export_${timestamp}.${format}`;
  },

  formatAsJSON(exportData) {
    return JSON.stringify(exportData, null, 2);
  },

  formatAsText(exportData) {
    const { recipes, totalCount, exportedAt } = exportData;
    let content = `Recipe Collection Export\n`;
    content += `Exported: ${new Date(exportedAt).toLocaleDateString()}\n`;
    content += `Total Recipes: ${totalCount}\n`;
    content += `${'='.repeat(50)}\n\n`;

    recipes.forEach((recipe, index) => {
      content += `${index + 1}. ${recipe.title}\n`;
      content += `${'-'.repeat(recipe.title.length + 3)}\n`;
      
      if (recipe.description) {
        content += `Description: ${recipe.description}\n`;
      }
      
      content += `Prep Time: ${recipe.prep_time || 'N/A'} minutes\n`;
      content += `Cook Time: ${recipe.cook_time || 'N/A'} minutes\n`;
      content += `Servings: ${recipe.servings || 'N/A'}\n`;
      content += `Difficulty: ${recipe.difficulty || 'N/A'}\n`;
      content += `Category: ${recipe.category || 'N/A'}\n`;
      content += `Favorite: ${recipe.is_favorite ? 'Yes' : 'No'}\n`;
      
      if (recipe.source_url) {
        content += `Source: ${recipe.source_url}\n`;
      }
      
      content += `\nIngredients:\n`;
      recipe.ingredients?.forEach(ingredient => {
        content += `- ${ingredient}\n`;
      });
      
      content += `\nInstructions:\n`;
      recipe.instructions?.forEach((instruction, i) => {
        content += `${i + 1}. ${instruction}\n`;
      });
      
      if (recipe.notes?.length > 0) {
        content += `\nNotes:\n`;
        recipe.notes.forEach(note => {
          content += `- ${note.content} (${new Date(note.created_at).toLocaleDateString()})\n`;
        });
      }
      
      content += `\nCreated: ${new Date(recipe.created_at).toLocaleDateString()}\n`;
      content += `\n${'='.repeat(50)}\n\n`;
    });

    return content;
  },

  downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const element = document.createElement('a');
    element.setAttribute('href', url);
    element.setAttribute('download', fileName);
    element.style.display = 'none';
    
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    URL.revokeObjectURL(url);
  }
};