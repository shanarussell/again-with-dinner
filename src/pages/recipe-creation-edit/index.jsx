import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import recipeService from "../../utils/recipeService";
import { parseIngredientList, ingredientToText } from "../../utils/ingredientParser";
import UnifiedHeader from "../../components/ui/UnifiedHeader";
import RecipeImageUpload from "./components/RecipeImageUpload";
import RecipeMetadata from "./components/RecipeMetadata";
import IngredientsSection from "./components/IngredientsSection";
import InstructionsSection from "./components/InstructionsSection";
import DeleteConfirmationModal from "./components/DeleteConfirmationModal";
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const RecipeCreationEdit = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const existingRecipe = location.state?.recipe;
  const isEditing = Boolean(existingRecipe?.id);
  
  // Form state
  const [recipe, setRecipe] = useState({
    id: existingRecipe?.id || null,
    title: '',
    image: null,
    ingredients: [{ id: Date.now(), text: '' }],
    instructions: [{ id: Date.now(), text: '' }],
    metadata: {
      category: '',
      prepTime: '',
      cookTime: '',
      servings: 4,
      difficulty: '',
      tags: ''
    }
  });

  // UI state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  // Load existing recipe data for editing
  useEffect(() => {
    if (isEditing && existingRecipe) {
      // Transform database recipe to component format
      const transformedRecipe = {
        id: existingRecipe.id,
        title: existingRecipe.title || '',
        image: existingRecipe.image_url || null,
        originalImageUrl: existingRecipe.image_url || null,
        ingredients: existingRecipe.ingredients?.length ? 
          existingRecipe.ingredients.map((ing, index) => ({
            id: index + 1,
            text: typeof ing === 'string' ? ing : ingredientToText(ing)
          })) : 
          [{ id: Date.now(), text: '' }],
        instructions: existingRecipe.instructions?.length ? 
          existingRecipe.instructions.map((inst, index) => ({
            id: index + 1,
            text: typeof inst === 'string' ? inst : inst.instruction || inst.text || ''
          })) : 
          [{ id: Date.now(), text: '' }],
        metadata: {
          category: existingRecipe.category || '',
          prepTime: existingRecipe.prep_time_minutes || '',
          cookTime: existingRecipe.cook_time_minutes || '',
          servings: existingRecipe.servings || 4,
          difficulty: existingRecipe.difficulty || '',
          tags: existingRecipe.tags?.join(', ') || ''
        }
      };
      setRecipe(transformedRecipe);
    }
  }, [isEditing, existingRecipe]);

  const transformRecipeForDatabase = (recipeData) => {
    // Improved image handling logic - preserve existing image properly
    let imageUrl = null;
    let shouldUpdateImage = false;
    
    if (recipeData.image) {
      // If image starts with 'data:', it's a new uploaded image (base64)
      if (recipeData.image.startsWith('data:')) {
        // This is a new image upload - keep the data URL
        imageUrl = recipeData.image;
        shouldUpdateImage = true;
      } else {
        // This is an existing image URL - preserve it exactly as is
        imageUrl = recipeData.image;
        shouldUpdateImage = true;
      }
    } else if (isEditing) {
      // If editing and no new image is set, check if the user ever removed the image
      if (typeof recipeData.originalImageUrl === 'string' && recipeData.originalImageUrl) {
        // User never removed the image, preserve it
        imageUrl = recipeData.originalImageUrl;
        shouldUpdateImage = true;
      } else if (typeof existingRecipe?.image_url === 'string' && existingRecipe.image_url) {
        // Fallback to original recipe image if available
        imageUrl = existingRecipe.image_url;
        shouldUpdateImage = true;
      } else {
        // Only set to null if both are null/empty (user removed image)
        imageUrl = null;
        shouldUpdateImage = true;
      }
    }

    // Parse ingredients into structured format
    const ingredientTexts = recipeData.ingredients
      .filter(ing => ing.text.trim())
      .map(ing => ing.text.trim());
    
    const parsedIngredients = parseIngredientList(ingredientTexts);

    const baseData = {
      user_id: user?.id,
      title: recipeData.title.trim(),
      description: '', // Could be added later
      ingredients: parsedIngredients,
      instructions: recipeData.instructions
        .filter(inst => inst.text.trim())
        .map((inst, index) => ({
          step: index + 1,
          instruction: inst.text.trim()
        })),
      prep_time_minutes: recipeData.metadata.prepTime ? parseInt(recipeData.metadata.prepTime) : null,
      cook_time_minutes: recipeData.metadata.cookTime ? parseInt(recipeData.metadata.cookTime) : null,
      servings: recipeData.metadata.servings || 4,
      difficulty: recipeData.metadata.difficulty ? recipeData.metadata.difficulty.toLowerCase() : 'medium',
      category: recipeData.metadata.category || 'main_course',
      is_favorite: isEditing ? existingRecipe?.is_favorite || false : false,
      rating: isEditing ? existingRecipe?.rating || 0.0 : 0.0
    };

    // Only include image_url if it should be updated
    if (shouldUpdateImage) {
      baseData.image_url = imageUrl;
    }

    return baseData;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    if (!user?.id) {
      alert('You must be logged in to save recipes');
      return;
    }

    setIsLoading(true);
    setSaveMessage(null);
    
    try {
      const recipeData = transformRecipeForDatabase(recipe);
      let result;
      
      if (recipe.id && isEditing) {
        result = await recipeService.updateRecipe(recipe.id, recipeData);
      } else {
        result = await recipeService.createRecipe(recipeData);
        if (result.success) {
          setRecipe(prev => ({ ...prev, id: result.data.id }));
        }
      }
      
      if (result.success) {
        setSaveMessage('Recipe saved successfully!');
        setHasUnsavedChanges(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSaveMessage(null);
        }, 3000);
      } else {
        setSaveMessage(`Failed to save recipe: ${result.error}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveMessage('An error occurred while saving the recipe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    // If there are unsaved changes, warn the user
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      );
      if (!confirmLeave) return;
    }
    
    // Try to go back in history, fallback to dashboard
    try {
      navigate(-1);
    } catch (error) {
      // If navigate(-1) fails, go to dashboard
      navigate('/recipe-dashboard');
    }
  };

  const validateForm = () => {
    if (!recipe.title.trim()) {
      alert('Please enter a recipe title');
      return false;
    }
    // Ingredients and instructions are now optional
    return true;
  };

  const handleDelete = async () => {
    if (!recipe.id) return;
    
    try {
      const result = await recipeService.deleteRecipe(recipe.id);
      if (result.success) {
        navigate('/recipe-dashboard');
      } else {
        alert(`Failed to delete recipe: ${result.error}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('An error occurred while deleting the recipe. Please try again.');
    }
  };

  const updateRecipe = (field, value) => {
    setRecipe(prev => {
      const newRecipe = { ...prev };
      
      // Handle metadata updates specially to preserve image
      if (field === 'metadata') {
        newRecipe.metadata = { ...prev.metadata, ...value };
      } else {
        newRecipe[field] = value;
      }
      
      return newRecipe;
    });
    setHasUnsavedChanges(true);
  };

  const updateRecipeMetadata = (metadata) => {
    setRecipe(prev => ({
      ...prev,
      metadata: { ...prev.metadata, ...metadata }
    }));
    setHasUnsavedChanges(true);
  };

  const handleImageRemove = () => {
    setRecipe(prev => ({
      ...prev,
      image: null
    }));
    setHasUnsavedChanges(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedHeader 
        userProfile={userProfile}
        showSearch={false}
        showNavigation={true}
      />
      
      <div className="max-w-2xl mx-auto px-4 py-6 pb-20 md:pb-6">
        <div className="space-y-8">
          {/* Back button */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              iconName="ArrowLeft"
              onClick={handleBack}
              className="flex items-center space-x-2"
            >
              Back
            </Button>
            {isEditing && (
              <Button
                variant="ghost"
                size="sm"
                iconName="Trash2"
                onClick={() => setShowDeleteModal(true)}
                className="text-red-600 hover:text-red-700"
              >
                Delete
              </Button>
            )}
          </div>

          {/* Recipe Title */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary">
              Recipe Title *
            </label>
            <Input
              type="text"
              placeholder="Enter recipe name..."
              value={recipe.title}
              onChange={(e) => updateRecipe('title', e.target.value)}
              className="text-lg font-medium"
            />
          </div>

          {/* Recipe Image */}
          <RecipeImageUpload
            image={recipe.image}
            onImageChange={(image) => updateRecipe('image', image)}
            onImageRemove={handleImageRemove}
          />

          {/* Ingredients */}
          <IngredientsSection
            ingredients={recipe.ingredients}
            onIngredientsChange={(ingredients) => updateRecipe('ingredients', ingredients)}
          />

          {/* Instructions */}
          <InstructionsSection
            instructions={recipe.instructions}
            onInstructionsChange={(instructions) => updateRecipe('instructions', instructions)}
          />

          {/* Recipe Metadata */}
          <RecipeMetadata
            metadata={recipe.metadata}
            onMetadataChange={updateRecipeMetadata}
          />

          {/* Save Button Section */}
          <div className="pt-6 border-t border-gray-200">
            {saveMessage && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${
                saveMessage.includes('successfully') 
                  ? 'bg-green-100 text-green-800 border border-green-200' :'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {saveMessage}
              </div>
            )}
            
            <Button
              variant="primary"
              size="lg"
              fullWidth
              iconName="Save"
              onClick={handleSave}
              disabled={isLoading}
              loading={isLoading}
              className="font-medium"
            >
              {isLoading ? 'Saving...' : (isEditing ? 'Update Recipe' : 'Save Recipe')}
            </Button>
            
            {hasUnsavedChanges && (
              <p className="mt-2 text-sm text-amber-600 text-center">
                You have unsaved changes
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        recipeName={recipe.title || 'this recipe'}
      />
    </div>
  );
};

export default RecipeCreationEdit;