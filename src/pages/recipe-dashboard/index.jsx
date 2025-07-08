import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import recipeService from "../../utils/recipeService";
import UnifiedHeader from "../../components/ui/UnifiedHeader";
import UserMenu from "./components/UserMenu";
import FilterChips from "./components/FilterChips";
import RecipeGrid from "./components/RecipeGrid";
import EmptyState from "./components/EmptyState";

const RecipeDashboard = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    category: 'all',
    difficulty: 'all',
    rating: 'all',
    special: null
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const loadRecipes = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const result = await recipeService.getUserRecipes(user.id);
        
        if (result?.success && isMounted) {
          setRecipes(result.data);
        } else if (isMounted) {
          setError(result?.error || "Failed to load recipes");
        }
      } catch (err) {
        if (isMounted) {
          setError("Something went wrong loading recipes");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (!authLoading && user) {
      loadRecipes();
    } else if (!authLoading && !user) {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  const handleSearch = async (query) => {
    if (!user?.id) return;
    
    setSearchQuery(query);
    await applyFilters(query, selectedFilters);
  };

  const applyFilters = async (query = searchQuery, filters = selectedFilters) => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      let result;
      let filteredRecipes = [];

      // Handle special filters first
      if (filters.special === 'favorites') {
        result = await recipeService.getFavoriteRecipes(user.id);
      } else if (filters.special === 'recent') {
        result = await recipeService.getUserRecipes(user.id);
        if (result?.success) {
          // Filter for recipes created in the last 7 days
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          result.data = result.data.filter(recipe => 
            new Date(recipe.created_at) > sevenDaysAgo
          );
        }
      } else if (filters.special === 'quick') {
        result = await recipeService.getUserRecipes(user.id);
        if (result?.success) {
          // Filter for recipes with total time <= 30 minutes
          result.data = result.data.filter(recipe => 
            (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0) <= 30
          );
        }
      } else {
        // Apply regular filters through service layer
        const filterParams = {
          category: filters.category !== 'all' ? filters.category : null,
          difficulty: filters.difficulty !== 'all' ? filters.difficulty : null,
          rating: filters.rating !== 'all' ? filters.rating : null,
        };

        if (query?.trim()) {
          result = await recipeService.searchRecipes(user.id, query, filterParams);
        } else {
          result = await recipeService.getFilteredRecipes(user.id, filterParams);
        }
      }

      if (result?.success) {
        filteredRecipes = result.data;

        // For special filters, apply ALL other active filters to ensure AND logic
        if (filters.special) {
          // Apply category filter
          if (filters.category !== 'all') {
            filteredRecipes = filteredRecipes.filter(recipe => 
              recipe.category === filters.category
            );
          }

          // Apply difficulty filter
          if (filters.difficulty !== 'all') {
            filteredRecipes = filteredRecipes.filter(recipe => 
              recipe.difficulty === filters.difficulty
            );
          }

          // Apply rating filter
          if (filters.rating !== 'all') {
            const minRating = parseFloat(filters.rating);
            filteredRecipes = filteredRecipes.filter(recipe => 
              (recipe.rating || 0) >= minRating
            );
          }

          // Apply search query filter if exists
          if (query?.trim()) {
            const searchTerm = query.trim().toLowerCase();
            filteredRecipes = filteredRecipes.filter(recipe => 
              recipe.title?.toLowerCase().includes(searchTerm) || 
              recipe.description?.toLowerCase().includes(searchTerm)
            );
          }
        }

        setRecipes(filteredRecipes);
      } else {
        setError(result?.error || "Failed to filter recipes");
      }
    } catch (err) {
      setError("Failed to filter recipes");
    } finally {
      setLoading(false);
    }
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleFilterChange = async (filterType, value) => {
    const newFilters = { ...selectedFilters };
    
    if (filterType === 'special') {
      newFilters.special = newFilters.special === value ? null : value;
    } else {
      newFilters[filterType] = value;
    }

    setSelectedFilters(newFilters);
    await applyFilters(searchQuery, newFilters);
  };

  const handleClearFilters = async () => {
    const clearedFilters = {
      category: 'all',
      difficulty: 'all',
      rating: 'all',
      special: null
    };
    setSelectedFilters(clearedFilters);
    await applyFilters(searchQuery, clearedFilters);
  };

  const handleToggleFavorite = async (recipeId, isFavorite) => {
    try {
      const result = await recipeService.toggleFavorite(recipeId, isFavorite);
      if (result?.success) {
        // Update the recipe in the local state
        setRecipes(prev => 
          prev.map(recipe => 
            recipe.id === recipeId 
              ? { ...recipe, is_favorite: isFavorite }
              : recipe
          )
        );
      }
    } catch (err) {
      setError("Failed to update favorite status");
    }
  };

  const handleDeleteRecipe = async (recipeId) => {
    try {
      const result = await recipeService.deleteRecipe(recipeId);
      if (result?.success) {
        // Remove the recipe from the local state
        setRecipes(prev => prev.filter(recipe => recipe.id !== recipeId));
      } else {
        setError(result?.error || "Failed to delete recipe");
      }
    } catch (err) {
      setError("Failed to delete recipe");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedHeader 
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        onMenuToggle={handleMenuToggle}
        userProfile={userProfile}
        showSearch={true}
        showNavigation={true}
      />
      
      <UserMenu 
        userProfile={userProfile} 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
      />
      
      <div className="container mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <FilterChips 
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : recipes?.length > 0 ? (
          <RecipeGrid 
            recipes={recipes} 
            searchQuery={searchQuery}
            activeFilters={Object.entries(selectedFilters).filter(([key, value]) => 
              value && value !== 'all'
            ).map(([key, value]) => value)}
            onToggleFavorite={handleToggleFavorite}
            onDeleteRecipe={handleDeleteRecipe}
          />
        ) : (
          <EmptyState 
            searchQuery={searchQuery}
            activeFilters={Object.entries(selectedFilters).filter(([key, value]) => 
              value && value !== 'all'
            ).map(([key, value]) => value)}
          />
        )}
      </div>
    </div>
  );
};

export default RecipeDashboard;