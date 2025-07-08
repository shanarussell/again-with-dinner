import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { parseIngredientList } from '../../../utils/ingredientParser';

const IngredientsSection = ({ ingredients, onIngredientsChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const addIngredient = () => {
    const newIngredients = [...ingredients, { id: Date.now(), text: '' }];
    onIngredientsChange(newIngredients);
  };

  const removeIngredient = (id) => {
    const newIngredients = ingredients.filter(ingredient => ingredient.id !== id);
    onIngredientsChange(newIngredients);
  };

  const updateIngredient = (id, text) => {
    const newIngredients = ingredients.map(ingredient =>
      ingredient.id === id ? { ...ingredient, text } : ingredient
    );
    onIngredientsChange(newIngredients);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      addIngredient();
    }
  };

  const handlePaste = (e) => {
    const pastedText = e.clipboardData.getData('text');
    
    // Check if pasted text contains line breaks (multiple ingredients)
    if (pastedText.includes('\n')) {
      e.preventDefault(); // Prevent default paste behavior
      
      // Split by line breaks and filter out empty lines
      const lines = pastedText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      // Only process if we have multiple lines
      if (lines.length > 1) {
        // Clean up ingredient text by removing cost information in parentheses
        const cleanedLines = lines.map(line => {
          // Remove cost information like ($0.12) from the end
          return line.replace(/\s*\([^)]*\)$/, '').trim();
        });
        
        // Parse the ingredients using the existing utility
        const parsedIngredients = parseIngredientList(cleanedLines);
        
        // Convert parsed ingredients to the format expected by the component
        const newIngredients = parsedIngredients.map(ingredient => ({
          id: Date.now() + Math.random(), // Ensure unique IDs
          text: ingredient.amount && ingredient.amount !== '1' 
            ? `${ingredient.amount} ${ingredient.name}` 
            : ingredient.name
        }));
        
        // Find the current ingredient being edited and replace it with the first parsed ingredient
        const currentIngredientIndex = ingredients.findIndex(ing => 
          document.activeElement && 
          document.activeElement.value === ing.text
        );
        
        if (currentIngredientIndex !== -1 && newIngredients.length > 0) {
          // Replace current ingredient with first parsed ingredient
          const updatedIngredients = [...ingredients];
          updatedIngredients[currentIngredientIndex] = newIngredients[0];
          
          // Add remaining parsed ingredients after the current one
          const remainingIngredients = newIngredients.slice(1);
          updatedIngredients.splice(currentIngredientIndex + 1, 0, ...remainingIngredients);
          
          onIngredientsChange(updatedIngredients);
        } else {
          // If no current ingredient is being edited, add all parsed ingredients
          const updatedIngredients = [...ingredients, ...newIngredients];
          onIngredientsChange(updatedIngredients);
        }
        
        return;
      }
    }
    
    // For single line paste, allow default behavior
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-text-primary">
          Ingredients *
        </label>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded-md hover:bg-surface-100 transition-colors duration-200"
        >
          <Icon
            name={isExpanded ? "ChevronUp" : "ChevronDown"}
            size={20}
            color="var(--color-text-secondary)"
          />
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-3">
          {ingredients.map((ingredient, index) => (
            <div key={ingredient.id} className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-primary">
                  {index + 1}
                </span>
              </div>
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="e.g., 2 cups all-purpose flour (or paste multiple ingredients)"
                  value={ingredient.text}
                  onChange={(e) => updateIngredient(ingredient.id, e.target.value)}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                  className="w-full"
                />
              </div>
              {ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIngredient(ingredient.id)}
                  className="flex-shrink-0 p-2 text-error hover:bg-error-50 rounded-md transition-colors duration-200"
                >
                  <Icon name="X" size={16} />
                </button>
              )}
            </div>
          ))}

          <Button
            type="button"
            variant="ghost"
            onClick={addIngredient}
            iconName="Plus"
            iconPosition="left"
            className="w-full justify-center border border-dashed border-border hover:border-primary hover:bg-primary-50"
          >
            Add Ingredient
          </Button>
        </div>
      )}
    </div>
  );
};

export default IngredientsSection;