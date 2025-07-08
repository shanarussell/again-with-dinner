import React, { useState, useEffect } from 'react';
import RecipeCard from './RecipeCard';

const RecipeGrid = ({ recipes = [], searchQuery = '', activeFilters = [], onToggleFavorite, onDeleteRecipe }) => {
  const [filteredRecipes, setFilteredRecipes] = useState(recipes);

  useEffect(() => {
    let filtered = [...(recipes || [])];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(recipe =>
        recipe?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe?.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe?.ingredients?.some(ingredient => 
          ingredient?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Apply category filters
    if (activeFilters?.length > 0 && !activeFilters.includes('all')) {
      filtered = filtered.filter(recipe => {
        return activeFilters.some(filter => {
          switch (filter) {
            case 'favorites':
              return recipe?.is_favorite || recipe?.isFavorite;
            case 'recent':
              const oneWeekAgo = new Date();
              oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
              const recipeDate = recipe?.created_at || recipe?.createdAt;
              return recipeDate ? new Date(recipeDate) > oneWeekAgo : false;
            case 'quick':
              const cookTime = recipe?.cook_time_minutes || recipe?.cookingTime;
              return cookTime && parseInt(cookTime) <= 30;
            case 'breakfast': case'lunch': case'dinner': case'dessert':
              return recipe?.category?.toLowerCase() === filter;
            default:
              return true;
          }
        });
      });
    }

    setFilteredRecipes(filtered);
  }, [recipes, searchQuery, activeFilters]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredRecipes?.map((recipe) => (
        <RecipeCard
          key={recipe?.id}
          recipe={recipe}
          onToggleFavorite={onToggleFavorite}
          onDelete={onDeleteRecipe}
        />
      ))}
    </div>
  );
};

export default RecipeGrid;