import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import recipeService from '../../utils/recipeService';
import logger from '../../utils/logger';
import PublicHeader from './components/PublicHeader';
import RecipeHero from './components/RecipeHero';
import IngredientsList from './components/IngredientsList';
import InstructionsList from './components/InstructionsList';
import RecipeMetadata from './components/RecipeMetadata';
import SignUpPrompt from './components/SignUpPrompt';
import FloatingSignUpPrompt from './components/FloatingSignUpPrompt';

const PublicRecipeView = () => {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [servings, setServings] = useState(4);
  const [showFloatingPrompt, setShowFloatingPrompt] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        setLoading(true);
        setError(null);

        // Enhanced recipe ID validation with better error messages
        if (!recipeId) {
          logger.error('Public Recipe View: No recipe ID provided in URL parameters');
          setError('Recipe ID is missing from the URL. Please check the link and try again.');
          return;
        }

        if (typeof recipeId !== 'string') {
          logger.error('Public Recipe View: Recipe ID is not a string:', typeof recipeId, recipeId);
          setError('Invalid recipe ID format. Please check the link and try again.');
          return;
        }

        const trimmedId = recipeId.trim();
        if (trimmedId === '' || trimmedId === ':recipeId') {
          logger.error('Public Recipe View: Recipe ID is empty or placeholder:', trimmedId);
          setError('Recipe ID is missing or invalid. Please check the link and try again.');
          return;
        }

        // Check if the recipeId looks like a route parameter placeholder
        if (trimmedId.startsWith(':')) {
          logger.error('Public Recipe View: Recipe ID appears to be a route parameter placeholder:', trimmedId);
          setError('Invalid recipe link. The recipe ID appears to be a placeholder. Please check the link and try again.');
          return;
        }

        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(trimmedId)) {
          logger.error('Public Recipe View: Invalid UUID format:', trimmedId);
          setError('Invalid recipe ID format. Recipe IDs must be valid UUIDs. Please check the link and try again.');
          return;
        }

        logger.debug('Public Recipe View: Loading recipe with ID:', trimmedId);
        
        // Clear any existing session for anonymous access
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          logger.debug('Public Recipe View: Sign out not necessary or failed:', signOutError);
        }
        
        // Use the public recipe access method
        const result = await recipeService.getPublicRecipe(trimmedId);
        
        logger.debug('Public Recipe View: API result:', result);
        
        if (result.success && result.data) {
          logger.debug('Public Recipe View: Raw recipe data:', result.data);
          
          const transformedRecipe = transformRecipeForDisplay(result.data);
          logger.debug('Public Recipe View: Transformed recipe:', transformedRecipe);
          
          if (transformedRecipe) {
            setRecipe(transformedRecipe);
            setServings(transformedRecipe.servings || 4);
          } else {
            logger.error('Public Recipe View: Failed to transform recipe data');
            setError('Recipe data is invalid or corrupted. Please try again or contact support.');
          }
        } else {
          logger.error('Public Recipe View: API error:', result.error);
          setError(result.error || 'Recipe not found. It may have been deleted or is not publicly available.');
        }
      } catch (err) {
        logger.error('Public Recipe View: Exception during loading:', err);
        setError('Failed to load recipe. Please check your internet connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    loadRecipe();
  }, [recipeId]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      
      setScrollProgress(progress);
      
      // Show floating prompt after 50% scroll
      if (progress > 50 && !showFloatingPrompt) {
        setShowFloatingPrompt(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showFloatingPrompt]);

  const transformRecipeForDisplay = (dbRecipe) => {
    try {
      logger.debug('Transforming recipe data:', dbRecipe);
      
      if (!dbRecipe || typeof dbRecipe !== 'object') {
        logger.error('Invalid recipe data for transformation:', dbRecipe);
        return null;
      }

      const transformed = {
        id: dbRecipe.id || '',
        title: dbRecipe.title || "Untitled Recipe",
        image: dbRecipe.image_url || "/assets/images/no_image.png",
        description: dbRecipe.description || "A delicious recipe",
        servings: Math.max(1, parseInt(dbRecipe.servings) || 4),
        prepTime: Math.max(0, parseInt(dbRecipe.prep_time_minutes) || 0),
        cookTime: Math.max(0, parseInt(dbRecipe.cook_time_minutes) || 0),
        totalTime: Math.max(0, (parseInt(dbRecipe.prep_time_minutes) || 0) + (parseInt(dbRecipe.cook_time_minutes) || 0)),
        difficulty: dbRecipe.difficulty ? 
          dbRecipe.difficulty.charAt(0).toUpperCase() + dbRecipe.difficulty.slice(1) : 
          "Medium",
        category: dbRecipe.category || "Main Course",
        rating: Math.max(0, Math.min(5, parseFloat(dbRecipe.rating) || 0)),
        ingredients: [],
        instructions: []
      };

      // Transform ingredients with better error handling
      if (dbRecipe.ingredients && Array.isArray(dbRecipe.ingredients)) {
        transformed.ingredients = dbRecipe.ingredients.map((ing, index) => {
          if (typeof ing === 'string') {
            return {
              name: ing,
              amount: "1",
              unit: "piece"
            };
          } else if (ing && typeof ing === 'object') {
            return {
              name: ing.name || ing.ingredient || `Ingredient ${index + 1}`,
              amount: ing.amount || ing.quantity || "1",
              unit: ing.unit || "piece"
            };
          } else {
            return {
              name: `Ingredient ${index + 1}`,
              amount: "1",
              unit: "piece"
            };
          }
        }).filter(ing => ing.name.trim() !== '');
      }

      // Transform instructions with better error handling
      if (dbRecipe.instructions && Array.isArray(dbRecipe.instructions)) {
        transformed.instructions = dbRecipe.instructions.map((inst, index) => {
          if (typeof inst === 'string') {
            return {
              text: inst.trim() || `Step ${index + 1}`
            };
          } else if (inst && typeof inst === 'object') {
            return {
              text: (inst.instruction || inst.text || inst.step || `Step ${index + 1}`).trim()
            };
          } else {
            return {
              text: `Step ${index + 1}`
            };
          }
        }).filter(inst => inst.text.trim() !== '');
      }

      logger.debug('Recipe transformation complete:', transformed);
      return transformed;
    } catch (error) {
      logger.error('Error transforming recipe data:', error);
      return null;
    }
  };

  const handleServingsChange = (newServings) => {
    const validServings = Math.max(1, Math.min(20, newServings));
    setServings(validServings);
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch (error) {
      logger.error('Print error:', error);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: recipe?.title || 'Recipe',
      text: `Check out this delicious recipe: ${recipe?.title}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        logger.debug('Share cancelled or failed:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        // Show success message
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        toast.textContent = 'Recipe link copied to clipboard!';
        document.body.appendChild(toast);
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
        }, 3000);
      } catch (error) {
        logger.error('Failed to copy link:', error);
      }
    }
  };

  // Enhanced loading state with debugging info
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading recipe...</p>
            {process.env.NODE_ENV === 'development' && (
              <div className="text-sm text-gray-400 mt-2">
                <p>Recipe ID: {recipeId}</p>
                <p>Trimmed ID: {recipeId?.trim?.()}</p>
                <p>Is placeholder: {recipeId?.trim?.() === ':recipeId' ? 'Yes' : 'No'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Enhanced error state with better messaging and troubleshooting
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-2xl mx-auto px-4">
            <div className="text-6xl mb-4">🍽️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Recipe</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            
            {/* Additional help for common issues */}
            <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-800 mb-2">Common Issues:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Make sure the recipe link is complete and hasn't been truncated</li>
                <li>• Check that the recipe ID in the URL is a valid UUID format</li>
                <li>• Verify that the recipe is publicly available</li>
                <li>• Try refreshing the page or check your internet connection</li>
              </ul>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-red-800 mb-2">Debug Information:</h3>
                <div className="text-sm text-red-700 space-y-1">
                  <p><strong>Recipe ID:</strong> {recipeId || 'undefined'}</p>
                  <p><strong>Trimmed ID:</strong> {recipeId?.trim?.() || 'undefined'}</p>
                  <p><strong>Is placeholder:</strong> {recipeId?.trim?.() === ':recipeId' ? 'Yes' : 'No'}</p>
                  <p><strong>Error:</strong> {error}</p>
                  <p><strong>URL:</strong> {window.location.href}</p>
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/user-registration')}
                className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Explore More Recipes
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced validation for recipe data
  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="text-6xl mb-4">🍽️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Recipe Not Available</h1>
            <p className="text-gray-600 mb-6">The recipe data could not be loaded or is invalid.</p>
            {process.env.NODE_ENV === 'development' && (
              <div className="text-sm text-gray-400 mb-4">
                <p>Recipe ID: {recipeId}</p>
                <p>Loading completed but no recipe data received</p>
              </div>
            )}
            <button
              onClick={() => navigate('/user-registration')}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Explore More Recipes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Recipe Hero Section */}
        <RecipeHero 
          recipe={recipe} 
          servings={servings}
          onServingsChange={handleServingsChange}
          onPrint={handlePrint}
          onShare={handleShare}
        />

        {/* Sign Up Prompt - After Hero */}
        <SignUpPrompt 
          variant="banner" 
          message="Want to save this recipe and discover thousands more?"
          className="my-8"
        />

        {/* Recipe Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Mobile Layout - Single Column */}
          <div className="lg:hidden space-y-8">
            <RecipeMetadata recipe={recipe} />
            
            <IngredientsList
              ingredients={recipe.ingredients || []}
              servings={servings}
              originalServings={recipe.servings}
            />

            <InstructionsList instructions={recipe.instructions || []} />

            {/* Mid-content Sign Up Prompt */}
            <SignUpPrompt 
              variant="card" 
              message="Love this recipe? Join thousands of home cooks!"
              features={[
                "Save and organize your favorite recipes",
                "Create weekly meal plans",
                "Generate smart shopping lists",
                "Access premium recipe collection"
              ]}
            />
          </div>

          {/* Desktop Layout - Two Column */}
          <div className="hidden lg:block lg:col-span-5 space-y-8">
            <RecipeMetadata recipe={recipe} />
            
            <IngredientsList
              ingredients={recipe.ingredients || []}
              servings={servings}
              originalServings={recipe.servings}
            />

            {/* Desktop Sidebar Sign Up Prompt */}
            <SignUpPrompt 
              variant="sidebar" 
              message="Ready to become a better cook?"
              features={[
                "Save unlimited recipes",
                "Plan your weekly meals",
                "Smart shopping lists",
                "Recipe scaling & notes"
              ]}
            />
          </div>

          <div className="hidden lg:block lg:col-span-7 space-y-8">
            <InstructionsList instructions={recipe.instructions || []} />
          </div>
        </div>

        {/* Final Sign Up Prompt */}
        <div className="mt-12">
          <SignUpPrompt 
            variant="final" 
            message="Ready to start your culinary journey?"
            subMessage="Join RecipeVault and transform the way you cook"
          />
        </div>
      </main>

      {/* Floating Sign Up Prompt */}
      {showFloatingPrompt && (
        <FloatingSignUpPrompt
          onClose={() => setShowFloatingPrompt(false)}
          recipe={recipe}
        />
      )}

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          .print-only {
            display: block !important;
          }
          
          body {
            font-size: 12px;
            line-height: 1.4;
          }
          
          .print-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 16px;
          }
          
          .print-section {
            margin-bottom: 24px;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default PublicRecipeView;