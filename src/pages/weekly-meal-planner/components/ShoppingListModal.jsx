import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import ShareButton from '../../../components/ui/ShareButton';
import logger from '../../../utils/logger';
import shoppingListService from '../../../utils/shoppingListService';

/**
 * ShoppingListModal
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {array} items
 * @param {string} userId
 * @param {function} [onShoppingListUpdated] - called after successful update
 */
const ShoppingListModal = ({ isOpen, onClose, items = [], userId, onShoppingListUpdated }) => {
  const [checkedItems, setCheckedItems] = useState(new Set());

  const shoppingList = useMemo(() => {
    // If items are already processed (from mealPlanService), use them directly
    if (items?.length > 0 && items[0]?.name) {
      // Group processed items by category (default to 'Other' if no category)
      const categories = {
        'Produce': [],
        'Meat & Seafood': [],
        'Dairy & Eggs': [],
        'Pantry': [],
        'Spices & Seasonings': [],
        'Other': []
      };

      items.forEach(item => {
        const category = item?.category || 'Other';
        if (categories[category]) {
          categories[category].push(item);
        } else {
          categories['Other'].push(item);
        }
      });

      return categories;
    }

    // Fallback for meal plans processing (if items are meal plans)
    const ingredientMap = new Map();
    
    // Handle both plannedMeals and items props with proper null checks
    const mealsData = items || [];
    
    if (Array.isArray(mealsData)) {
      mealsData.forEach(meal => {
        // Handle different data structures
        const recipe = meal?.recipes || meal?.recipe || meal;
        const ingredients = recipe?.ingredients || [];
        
        if (Array.isArray(ingredients)) {
          ingredients.forEach(ingredient => {
            if (ingredient?.name) {
              const key = ingredient.name.toLowerCase();
              if (ingredientMap.has(key)) {
                const existing = ingredientMap.get(key);
                ingredientMap.set(key, {
                  ...existing,
                  quantity: (existing.quantity || 0) + (ingredient.quantity || 0),
                  recipes: [...(existing.recipes || []), recipe?.title || 'Unknown Recipe']
                });
              } else {
                ingredientMap.set(key, {
                  name: ingredient.name,
                  quantity: ingredient.quantity || 0,
                  unit: ingredient.unit || '',
                  category: ingredient.category || 'Other',
                  recipes: [recipe?.title || 'Unknown Recipe']
                });
              }
            }
          });
        }
      });
    } else if (mealsData && typeof mealsData === 'object') {
      // Handle object format (if plannedMeals is an object)
      Object.values(mealsData).forEach(recipe => {
        if (recipe?.ingredients && Array.isArray(recipe.ingredients)) {
          recipe.ingredients.forEach(ingredient => {
            if (ingredient?.name) {
              const key = ingredient.name.toLowerCase();
              if (ingredientMap.has(key)) {
                const existing = ingredientMap.get(key);
                ingredientMap.set(key, {
                  ...existing,
                  quantity: (existing.quantity || 0) + (ingredient.quantity || 0),
                  recipes: [...(existing.recipes || []), recipe?.title || 'Unknown Recipe']
                });
              } else {
                ingredientMap.set(key, {
                  name: ingredient.name,
                  quantity: ingredient.quantity || 0,
                  unit: ingredient.unit || '',
                  category: ingredient.category || 'Other',
                  recipes: [recipe?.title || 'Unknown Recipe']
                });
              }
            }
          });
        }
      });
    }

    // Group by category
    const categories = {
      'Produce': [],
      'Meat & Seafood': [],
      'Dairy & Eggs': [],
      'Pantry': [],
      'Spices & Seasonings': [],
      'Other': []
    };

    ingredientMap.forEach(ingredient => {
      const category = ingredient.category || 'Other';
      if (categories[category]) {
        categories[category].push(ingredient);
      } else {
        categories['Other'].push(ingredient);
      }
    });

    return categories;
  }, [items]);

  // Helper to get a unique key for each item
  const getItemKey = (item) => {
    // Prefer id if available, else fallback to name+unit+category
    return item.id || `${item.name}|${item.unit || ''}|${item.category || ''}`;
  };

  const toggleItem = (itemKey) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(itemKey)) {
      newCheckedItems.delete(itemKey);
    } else {
      newCheckedItems.add(itemKey);
    }
    setCheckedItems(newCheckedItems);
  };

  const handleShareComplete = (result) => {
    if (result?.success) {
      logger.info('Share completed successfully');
    }
  };

  if (!isOpen) return null;

  // Calculate total items
  const totalItems = Object.values(shoppingList).reduce((sum, items) => sum + (items?.length || 0), 0);

  // Convert categorized items to flat array for sharing and saving
  const flatItems = Object.values(shoppingList).flat();

  // Get only unchecked items
  const uncheckedItems = flatItems.filter(item => !checkedItems.has(getItemKey(item)));

  const handleAddToShoppingList = async () => {
    if (uncheckedItems.length === 0) return;
    try {
      // Save only unchecked items to the database
      const result = await shoppingListService.updateShoppingListItems(
        userId, // Use the userId prop
        uncheckedItems
      );
      logger.debug('Add to Shopping List (modal):', result);
      if (result?.success) {
        if (onShoppingListUpdated) onShoppingListUpdated();
        onClose();
      } else {
        alert('Failed to update shopping list: ' + (result?.error || 'Unknown error'));
      }
    } catch (err) {
      logger.error('Error updating shopping list from modal:', err);
      alert('Error updating shopping list.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-300 flex items-end md:items-center justify-center">
      <div className="bg-background w-full max-w-2xl max-h-[90vh] md:max-h-[80vh] rounded-t-2xl md:rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-heading font-semibold text-text-primary">
              Shopping List
            </h2>
            <p className="text-sm text-text-secondary">
              {totalItems > 0 ? `${totalItems} items for your weekly meal plan` : 'No items in your shopping list'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <ShareButton
              items={flatItems}
              title="Weekly Shopping List"
              variant="ghost"
              size="sm"
              showOptions={true}
              categorized={true}
              disabled={totalItems === 0}
              onShareComplete={handleShareComplete}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              iconName="X"
              className="px-2"
              aria-label="Close"
            />
          </div>
        </div>

        {/* Shopping List */}
        <div className="flex-1 overflow-y-auto p-4">
          {totalItems === 0 ? (
            <div className="text-center py-8">
              <Icon name="ShoppingBag" size={48} color="var(--color-text-muted)" className="mx-auto mb-4" />
              <p className="text-text-muted">No items in your shopping list</p>
              <p className="text-sm text-text-secondary mt-2">Add some meals to your weekly plan to generate a shopping list</p>
            </div>
          ) : (
            Object.entries(shoppingList).map(([category, items]) => {
              if (!items?.length) return null;
              
              return (
                <div key={category} className="mb-6">
                  <h3 className="font-heading font-semibold text-text-primary mb-3 flex items-center">
                    <Icon 
                      name={getCategoryIcon(category)} 
                      size={18} 
                      color="var(--color-primary)"
                      className="mr-2"
                    />
                    {category}
                  </h3>
                  
                  <div className="space-y-2">
                    {items.map((item, index) => {
                      const itemKey = `${category}-${index}`;
                      const isChecked = checkedItems.has(getItemKey(item));
                      
                      return (
                        <div
                          key={itemKey}
                          onClick={() => toggleItem(getItemKey(item))}
                          className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                            isChecked 
                              ? 'bg-success-50 border-success-200 opacity-60' :'bg-surface-50 border-border hover:border-primary hover:bg-primary-50'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-colors duration-200 ${
                            isChecked 
                              ? 'bg-success border-success' :'border-border hover:border-primary'
                          }`}>
                            {isChecked && (
                              <Icon name="Check" size={12} color="white" strokeWidth={3} />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium transition-colors duration-200 ${
                              isChecked ? 'text-text-secondary line-through' : 'text-text-primary'
                            }`}>
                              {/* Handle different item structures */}
                              {item?.amount ? (
                                `${item.amount} ${item.name}`
                              ) : item?.quantity && item?.unit ? (
                                `${item.quantity} ${item.unit} ${item.name}`
                              ) : (
                                item?.name || 'Unknown item'
                              )}
                            </div>
                            {item?.recipes && (
                              <div className="text-sm text-text-muted mt-1">
                                For: {Array.isArray(item.recipes) ? item.recipes.join(', ') : item.recipes}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
        {/* Modal Footer: Add to Shopping List button */}
        {uncheckedItems.length > 0 && (
          <div className="p-4 border-t border-border flex justify-end">
            <Button
              variant="primary"
              iconName="PlusCircle"
              onClick={handleAddToShoppingList}
            >
              Add to Shopping List
            </Button>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-text-secondary">
              {checkedItems.size} of {totalItems} items checked
            </div>
            <ShareButton
              items={flatItems}
              title="Weekly Shopping List"
              variant="primary"
              size="sm"
              showOptions={false}
              categorized={true}
              disabled={totalItems === 0}
              onShareComplete={handleShareComplete}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const getCategoryIcon = (category) => {
  const icons = {
    'Produce': 'Apple',
    'Meat & Seafood': 'Fish',
    'Dairy & Eggs': 'Milk',
    'Pantry': 'Package',
    'Spices & Seasonings': 'Sparkles',
    'Other': 'ShoppingBag'
  };
  return icons[category] || 'ShoppingBag';
};

export default ShoppingListModal;