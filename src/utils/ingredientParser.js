// Utility functions for parsing and handling recipe ingredients

/**
 * Parse ingredient text into structured object with name and amount
 * @param {string} ingredientText - Raw ingredient text like "2 cups flour"
 * @returns {Object} Structured ingredient object with name and amount
 */
export const parseIngredientText = (ingredientText) => {
  if (!ingredientText || typeof ingredientText !== 'string') {
    return null;
  }

  const text = ingredientText.trim();
  if (!text) {
    return null;
  }

  // Common patterns for ingredient parsing
  const patterns = [
    // Pattern 1: "2 cups flour" or "1 1/2 cups flour"
    /^(\d+(?:\s+\d+\/\d+)?(?:\.\d+)?)\s+(cups?|tbsp?|tsp?|tablespoons?|teaspoons?|oz|pounds?|lbs?|g|grams?|kg|kilograms?|ml|liters?|l|gallons?|quarts?|pints?|inches?|inch|cloves?|pieces?|slices?|whole|large|medium|small|pinch|dash|handful)\s+(.+)$/i,
    
    // Pattern 2: "2 flour" (just number and ingredient)
    /^(\d+(?:\s+\d+\/\d+)?(?:\.\d+)?)\s+(.+)$/i,
    
    // Pattern 3: "1/2 cup flour" (fraction with unit)
    /^(\d+\/\d+)\s+(cups?|tbsp?|tsp?|tablespoons?|teaspoons?|oz|pounds?|lbs?|g|grams?|kg|kilograms?|ml|liters?|l|gallons?|quarts?|pints?|inches?|inch|cloves?|pieces?|slices?|whole|large|medium|small|pinch|dash|handful)\s+(.+)$/i,
    
    // Pattern 4: "1/2 flour" (fraction without unit)
    /^(\d+\/\d+)\s+(.+)$/i,
    
    // Pattern 5: "to taste salt" or "as needed flour"
    /^(to\s+taste|as\s+needed)\s+(.+)$/i,
  ];

  // Try each pattern
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let amount, unit, name;
      
      if (match.length === 4) {
        // Pattern with unit: amount, unit, name
        amount = match[1];
        unit = match[2];
        name = match[3];
        return {
          name: name.trim(),
          amount: `${amount} ${unit}`.trim(),
          unit: unit.trim(),
          quantity: parseFloat(amount.replace(/\s+\d+\/\d+/, '')) || 0
        };
      } else if (match.length === 3) {
        // Pattern without unit: amount, name
        amount = match[1];
        name = match[2];
        return {
          name: name.trim(),
          amount: amount.trim(),
          unit: '',
          quantity: parseFloat(amount.replace(/\s+\d+\/\d+/, '')) || 0
        };
      }
    }
  }

  // If no pattern matches, treat entire text as ingredient name
  return {
    name: text,
    amount: '1',
    unit: '',
    quantity: 1
  };
};

/**
 * Parse array of ingredient texts into structured objects
 * @param {Array} ingredientTexts - Array of ingredient text strings
 * @returns {Array} Array of structured ingredient objects
 */
export const parseIngredientList = (ingredientTexts) => {
  if (!Array.isArray(ingredientTexts)) {
    return [];
  }

  return ingredientTexts
    .map(text => parseIngredientText(text))
    .filter(ingredient => ingredient !== null);
};

/**
 * Convert structured ingredient back to text format
 * @param {Object} ingredient - Structured ingredient object
 * @returns {string} Ingredient text
 */
export const ingredientToText = (ingredient) => {
  if (!ingredient || typeof ingredient !== 'object') {
    return '';
  }

  // If it's already a text string, return as is
  if (typeof ingredient === 'string') {
    return ingredient;
  }

  // If it has name and amount properties, format them
  if (ingredient.name) {
    const name = ingredient.name.trim();
    const amount = ingredient.amount || '1';
    return `${amount} ${name}`.trim();
  }

  return '';
};

/**
 * Validate ingredient object structure
 * @param {Object} ingredient - Ingredient object to validate
 * @param {string} recipeTitle - Recipe title for error context
 * @param {number} index - Ingredient index for error context
 * @returns {Object|null} Validated ingredient or null if invalid
 */
export const validateIngredient = (ingredient, recipeTitle = '', index = 0) => {
  if (!ingredient || typeof ingredient !== 'object') {
    console.warn(`Invalid ingredient at index ${index} in recipe "${recipeTitle}":`, ingredient);
    return null;
  }

  const name = ingredient.name || ingredient.ingredient || ingredient.item;
  const amount = ingredient.amount || ingredient.quantity || ingredient.measure;
  
  if (!name || typeof name !== 'string' || name.trim() === '') {
    console.warn(`Missing or invalid ingredient name at index ${index} in recipe "${recipeTitle}":`, ingredient);
    return null;
  }

  if (!amount || (typeof amount !== 'string' && typeof amount !== 'number')) {
    console.warn(`Missing or invalid ingredient amount at index ${index} in recipe "${recipeTitle}":`, ingredient);
    return null;
  }

  return { 
    name: name.trim(), 
    amount: String(amount).trim(),
    unit: ingredient.unit || '',
    quantity: ingredient.quantity || 0
  };
};

/**
 * Normalize ingredients from database to handle both old and new formats
 * @param {Array|string} ingredients - Raw ingredients from database
 * @param {string} recipeTitle - Recipe title for error context
 * @returns {Array} Normalized ingredient objects
 */
export const normalizeIngredients = (ingredients, recipeTitle = '') => {
  // Handle different data types
  if (!ingredients) {
    console.warn(`Recipe "${recipeTitle}" has null/undefined ingredients`);
    return [];
  }

  if (typeof ingredients === 'string') {
    try {
      ingredients = JSON.parse(ingredients);
    } catch (e) {
      console.warn(`Failed to parse ingredients string for recipe "${recipeTitle}":`, ingredients);
      return [];
    }
  }

  if (!Array.isArray(ingredients)) {
    console.warn(`Recipe "${recipeTitle}" has non-array ingredients:`, ingredients);
    return [];
  }

  // Process each ingredient
  return ingredients
    .map((ingredient, index) => {
      // If it's a string, parse it into structured format
      if (typeof ingredient === 'string') {
        return parseIngredientText(ingredient);
      }
      
      // If it's already an object, validate it
      if (typeof ingredient === 'object') {
        return validateIngredient(ingredient, recipeTitle, index);
      }
      
      return null;
    })
    .filter(ingredient => ingredient !== null);
};

export default {
  parseIngredientText,
  parseIngredientList,
  ingredientToText,
  validateIngredient,
  normalizeIngredients
};