import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import recipeService from "../../utils/recipeService";
import UnifiedHeader from "../../components/ui/UnifiedHeader";
import UserMenu from "../recipe-dashboard/components/UserMenu";
import RecipeGrid from "../recipe-dashboard/components/RecipeGrid";
import Icon from "../../components/AppIcon";
import Button from "../../components/ui/Button";

const Favorites = () => {
  const navigate = useNavigate();
  const { user, userProfile, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFavorites, setFilteredFavorites] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const loadFavorites = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const result = await recipeService.getFavoriteRecipes(user.id);
        
        if (result?.success && isMounted) {
          setFavorites(result.data);
          setFilteredFavorites(result.data);
        } else if (isMounted) {
          setError(result?.error || "Failed to load favorite recipes");
        }
      } catch (err) {
        if (isMounted) {
          setError("Something went wrong loading favorite recipes");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (!authLoading && user) {
      loadFavorites();
    } else if (!authLoading && !user) {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  useEffect(() => {
    // Filter favorites based on search query
    if (!searchQuery?.trim()) {
      setFilteredFavorites(favorites);
    } else {
      const searchTerm = searchQuery.toLowerCase();
      const filtered = favorites.filter(recipe => 
        recipe.title?.toLowerCase().includes(searchTerm) || 
        recipe.description?.toLowerCase().includes(searchTerm) ||
        recipe.category?.toLowerCase().includes(searchTerm)
      );
      setFilteredFavorites(filtered);
    }
  }, [searchQuery, favorites]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleToggleFavorite = async (recipeId, isFavorite) => {
    try {
      const result = await recipeService.toggleFavorite(recipeId, isFavorite);
      if (result?.success) {
        if (!isFavorite) {
          // Recipe was unfavorited, remove it from the list
          setFavorites(prev => prev.filter(recipe => recipe.id !== recipeId));
        } else {
          // Recipe was favorited, update the state
          setFavorites(prev => 
            prev.map(recipe => 
              recipe.id === recipeId 
                ? { ...recipe, is_favorite: isFavorite }
                : recipe
            )
          );
        }
      }
    } catch (err) {
      setError("Failed to update favorite status");
    }
  };

  const handleDeleteRecipe = async (recipeId) => {
    try {
      const result = await recipeService.deleteRecipe(recipeId);
      if (result?.success) {
        // Remove the recipe from favorites
        setFavorites(prev => prev.filter(recipe => recipe.id !== recipeId));
      } else {
        setError(result?.error || "Failed to delete recipe");
      }
    } catch (err) {
      setError("Failed to delete recipe");
    }
  };

  const handleBackToRecipes = () => {
    navigate('/recipe-dashboard');
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
        showNavigation={false}
      />
      
      <UserMenu 
        userProfile={userProfile} 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
      />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBackToRecipes}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                aria-label="Back to recipes"
              >
                <Icon name="ArrowLeft" size={20} color="var(--color-text-secondary)" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
                <p className="text-gray-600">
                  {favorites.length} favorite recipe{favorites.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="Heart" size={24} color="var(--color-error)" className="fill-current" />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : filteredFavorites?.length > 0 ? (
          <RecipeGrid 
            recipes={filteredFavorites} 
            searchQuery={searchQuery}
            activeFilters={['favorites']}
            onToggleFavorite={handleToggleFavorite}
            onDeleteRecipe={handleDeleteRecipe}
          />
        ) : favorites?.length > 0 ? (
          // Show when search yields no results but favorites exist
          <div className="text-center py-12">
            <Icon name="Search" size={48} color="var(--color-text-secondary)" className="mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No matching favorites found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search to find your favorite recipes
            </p>
            <Button
              onClick={() => setSearchQuery('')}
              variant="outline"
              className="mx-auto"
            >
              Clear search
            </Button>
          </div>
        ) : (
          // Empty state when no favorites exist
          <div className="text-center py-12">
            <Icon name="Heart" size={64} color="var(--color-text-secondary)" className="mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-gray-600 mb-6">
              Start adding recipes to your favorites to see them here. Click the heart icon on any recipe card to save it to your favorites.
            </p>
            <Button
              onClick={handleBackToRecipes}
              iconName="ArrowLeft"
              className="mx-auto"
            >
              Browse Recipes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;