import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const IngredientsList = ({ ingredients, servings, originalServings, cookingMode = false }) => {
  const [checkedIngredients, setCheckedIngredients] = useState(new Set());
  
  const toggleIngredient = (index) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedIngredients(newChecked);
  };

  const scaleAmount = (amount) => {
    if (!amount || isNaN(amount)) return amount;
    const scaled = (parseFloat(amount) * servings) / originalServings;
    return scaled % 1 === 0 ? scaled.toString() : scaled.toFixed(2);
  };

  return (
    <div className="bg-surface-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-heading font-semibold text-text-primary">
          Ingredients
        </h3>
        <span className="text-sm text-text-secondary">
          {checkedIngredients.size}/{ingredients.length} checked
        </span>
      </div>
      
      <div className="space-y-3">
        {ingredients.map((ingredient, index) => (
          <div
            key={index}
            className={`flex items-start space-x-3 p-2 rounded-lg transition-colors duration-200 ${
              checkedIngredients.has(index) 
                ? 'bg-success-50 text-success-700' :'hover:bg-surface-100'
            }`}
          >
            <button
              onClick={() => toggleIngredient(index)}
              className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-200 ${
                checkedIngredients.has(index)
                  ? 'bg-success border-success text-white' :'border-border hover:border-success'
              }`}
            >
              {checkedIngredients.has(index) && (
                <Icon name="Check" size={12} color="white" strokeWidth={3} />
              )}
            </button>
            
            <div className="flex-1 min-w-0">
              <p className={`${cookingMode ? 'text-base' : 'text-sm'} leading-relaxed ${
                checkedIngredients.has(index) ? 'text-success-700' : 'text-text-primary'
              }`}>
                <span className="font-medium">
                  {scaleAmount(ingredient.amount)} {ingredient.unit}
                </span>
                {' '}
                <span className="capitalize">{ingredient.name}</span>
                {ingredient.notes && (
                  <span className="text-text-secondary italic">
                    {' '}({ingredient.notes})
                  </span>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IngredientsList;