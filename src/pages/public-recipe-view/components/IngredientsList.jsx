import React from 'react';
import Icon from '../../../components/AppIcon';

const IngredientsList = ({ ingredients, servings, originalServings }) => {
  const scaleAmount = (amount, unit) => {
    if (!amount || !originalServings || originalServings === 0) return amount;
    
    const scale = servings / originalServings;
    const numericAmount = parseFloat(amount);
    
    if (isNaN(numericAmount)) return amount;
    
    const scaledAmount = numericAmount * scale;
    
    // Handle fractional amounts nicely
    if (scaledAmount < 1) {
      const fraction = scaledAmount;
      if (fraction === 0.5) return '1/2';
      if (fraction === 0.25) return '1/4';
      if (fraction === 0.75) return '3/4';
      if (fraction === 0.33) return '1/3';
      if (fraction === 0.67) return '2/3';
      return scaledAmount.toFixed(2);
    }
    
    return scaledAmount % 1 === 0 ? scaledAmount.toString() : scaledAmount.toFixed(1);
  };

  if (!ingredients?.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 print-section">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Icon name="ShoppingList" size={24} color="#EA580C" className="mr-2" />
          Ingredients
        </h2>
        <p className="text-gray-500 text-center py-8">No ingredients available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 print-section">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <Icon name="ShoppingList" size={24} color="#EA580C" className="mr-2" />
        Ingredients
        {servings !== originalServings && (
          <span className="ml-2 text-sm text-orange-600 font-normal">
            (scaled for {servings} servings)
          </span>
        )}
      </h2>
      
      <div className="space-y-3">
        {ingredients.map((ingredient, index) => (
          <div key={index} className="flex items-start space-x-3 py-2">
            <div className="flex-shrink-0 w-5 h-5 border-2 border-gray-300 rounded mt-0.5"></div>
            <div className="flex-1">
              <span className="text-gray-900">
                {ingredient?.amount && (
                  <span className="font-semibold text-orange-700">
                    {scaleAmount(ingredient.amount, ingredient.unit)}
                    {ingredient?.unit && ` ${ingredient.unit}`}
                  </span>
                )}
                {ingredient?.amount && ' '}
                {ingredient?.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IngredientsList;