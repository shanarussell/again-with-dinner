import React from 'react';

import Button from '../../../components/ui/Button';

const ServingScaler = ({ servings, originalServings, onServingsChange }) => {
  const decreaseServings = () => {
    if (servings > 1) {
      onServingsChange(servings - 1);
    }
  };

  const increaseServings = () => {
    if (servings < 20) {
      onServingsChange(servings + 1);
    }
  };

  const resetServings = () => {
    onServingsChange(originalServings);
  };

  return (
    <div className="bg-surface-50 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-heading font-semibold text-text-primary">
          Adjust Servings
        </h4>
        {servings !== originalServings && (
          <Button
            variant="ghost"
            size="xs"
            onClick={resetServings}
            className="text-xs"
          >
            Reset
          </Button>
        )}
      </div>
      
      <div className="flex items-center justify-center space-x-4 mt-3">
        <Button
          variant="outline"
          size="sm"
          onClick={decreaseServings}
          disabled={servings <= 1}
          iconName="Minus"
          className="w-10 h-10 p-0"
        />
        
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-primary">
            {servings}
          </span>
          <span className="text-xs text-text-secondary">
            servings
          </span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={increaseServings}
          disabled={servings >= 20}
          iconName="Plus"
          className="w-10 h-10 p-0"
        />
      </div>
      
      {servings !== originalServings && (
        <div className="mt-3 text-center">
          <span className="text-xs text-text-secondary">
            Scaled from {originalServings} servings
          </span>
        </div>
      )}
    </div>
  );
};

export default ServingScaler;