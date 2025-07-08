import React from 'react';
import Button from '../../../components/ui/Button';
import logger from '../../../utils/logger';

const QuickActions = ({ onGenerateShoppingList, onAddToShoppingList, hasPlannedMeals }) => {
  const handleGenerateShoppingList = () => {
    logger.debug('Generate shopping list clicked, hasPlannedMeals:', hasPlannedMeals);
    onGenerateShoppingList();
  };

  const handleAddToShoppingList = () => {
    logger.debug('Add to shopping list clicked, hasPlannedMeals:', hasPlannedMeals);
    onAddToShoppingList();
  };

  return (
    <div className="mb-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
        
        <div className="flex flex-wrap gap-3">
          <Button
            variant="primary"
            onClick={handleGenerateShoppingList}
            iconName="ShoppingCart"
            iconPosition="left"
            disabled={!hasPlannedMeals}
          >
            Generate Shopping List
          </Button>
          <Button
            variant="secondary"
            onClick={handleAddToShoppingList}
            iconName="PlusCircle"
            iconPosition="left"
            disabled={!hasPlannedMeals}
          >
            Add to Shopping List
          </Button>
          {!hasPlannedMeals && (
            <p className="text-sm text-gray-600 self-center">
              Add meals to your weekly plan to generate or add a shopping list
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;