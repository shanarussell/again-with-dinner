import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import mealPlanService from '../../utils/mealPlanService';
import shoppingListService from '../../utils/shoppingListService';
import logger from '../../utils/logger';
import UnifiedHeader from '../../components/ui/UnifiedHeader';
import FloatingActionButton from '../../components/ui/FloatingActionButton';
import ShareButton from '../../components/ui/ShareButton';
import CategorySection from './components/CategorySection';
import ProgressIndicator from './components/ProgressIndicator';
import AddItemModal from './components/AddItemModal';
import DeleteAllConfirmationModal from './components/DeleteAllConfirmationModal';
import EmptyState from './components/EmptyState';
import Icon from '../../components/AppIcon';

const ShoppingList = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [shoppingItems, setShoppingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [unitPreference, setUnitPreference] = useState('metric');
  
  // Get current week dates
  const getCurrentWeekDates = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return {
      start: startOfWeek.toISOString().split('T')[0],
      end: endOfWeek.toISOString().split('T')[0]
    };
  };

  // Categorize ingredients
  const categorizeIngredients = (items) => {
    const categories = {
      'Produce': { icon: 'Apple', items: [] },
      'Dairy': { icon: 'Milk', items: [] },
      'Meat & Seafood': { icon: 'Fish', items: [] },
      'Pantry': { icon: 'Package', items: [] },
      'Spices & Seasonings': { icon: 'Flower', items: [] },
      'Beverages': { icon: 'Coffee', items: [] },
      'Other': { icon: 'ShoppingCart', items: [] }
    };

    const produceKeywords = ['apple', 'banana', 'orange', 'lettuce', 'tomato', 'onion', 'garlic', 'carrot', 'potato', 'pepper', 'cucumber', 'spinach', 'broccoli', 'mushroom', 'herb', 'lemon', 'lime', 'avocado', 'celery', 'ginger'];
    const dairyKeywords = ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'egg', 'sour cream'];
    const meatKeywords = ['chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'turkey', 'ham', 'bacon', 'sausage', 'shrimp', 'crab'];
    const pantryKeywords = ['flour', 'sugar', 'rice', 'pasta', 'bread', 'oil', 'vinegar', 'sauce', 'can', 'jar', 'box', 'bag', 'beans', 'lentils', 'quinoa', 'oats', 'cereal'];
    const spiceKeywords = ['salt', 'pepper', 'paprika', 'cumin', 'oregano', 'basil', 'thyme', 'rosemary', 'cinnamon', 'nutmeg', 'vanilla', 'bay leaves', 'parsley', 'cilantro', 'dill'];
    const beverageKeywords = ['water', 'juice', 'wine', 'beer', 'soda', 'tea', 'coffee', 'broth', 'stock'];

    items.forEach(item => {
      const itemName = item.name.toLowerCase();
      let categorized = false;

      if (produceKeywords.some(keyword => itemName.includes(keyword))) {
        categories['Produce'].items.push(item);
        categorized = true;
      } else if (dairyKeywords.some(keyword => itemName.includes(keyword))) {
        categories['Dairy'].items.push(item);
        categorized = true;
      } else if (meatKeywords.some(keyword => itemName.includes(keyword))) {
        categories['Meat & Seafood'].items.push(item);
        categorized = true;
      } else if (spiceKeywords.some(keyword => itemName.includes(keyword))) {
        categories['Spices & Seasonings'].items.push(item);
        categorized = true;
      } else if (beverageKeywords.some(keyword => itemName.includes(keyword))) {
        categories['Beverages'].items.push(item);
        categorized = true;
      } else if (pantryKeywords.some(keyword => itemName.includes(keyword))) {
        categories['Pantry'].items.push(item);
        categorized = true;
      }

      if (!categorized) {
        categories['Other'].items.push(item);
      }
    });

    return categories;
  };

  // Load shopping list data
  const loadShoppingList = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // First, try to get existing shopping list from database
      const existingList = await shoppingListService.getShoppingList(user.id);
      
      if (existingList?.success) {
        // Always use the existing shopping list, even if empty
        setShoppingItems(existingList.data.items || []);
      } else {
        setShoppingItems([]);
        setError(existingList?.error || 'Failed to load shopping list');
      }
    } catch (err) {
      logger.error('Error loading shopping list:', err);
      setError('Failed to load shopping list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadShoppingList();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const handleItemCheck = async (itemId) => {
    try {
      const updatedItems = shoppingItems.map(item => 
        item.id === itemId 
          ? { ...item, checked: !item.checked }
          : item
      );
      
      setShoppingItems(updatedItems);
      
      // Update in database
      const result = await shoppingListService.updateShoppingListItems(user.id, updatedItems);
      if (!result?.success) {
        logger.error('Failed to update item check status:', result?.error);
      }
    } catch (err) {
      logger.error('Error updating item check status:', err);
    }
  };

  const handleAddCustomItem = async (itemData) => {
    try {
      const newItem = {
        id: Date.now() + Math.random(), // Generate unique ID
        name: itemData.name,
        amount: itemData.amount,
        checked: false,
        notes: itemData.notes || '',
        customItem: true,
        addedAt: new Date().toISOString()
      };
      
      const updatedItems = [...shoppingItems, newItem];
      setShoppingItems(updatedItems);
      
      // Save to database
      const result = await shoppingListService.updateShoppingListItems(user.id, updatedItems);
      if (!result?.success) {
        logger.error('Failed to add custom item:', result?.error);
      }
    } catch (err) {
      logger.error('Error adding custom item:', err);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      const updatedItems = shoppingItems.filter(item => item.id !== itemId);
      setShoppingItems(updatedItems);
      
      // Update in database
      const result = await shoppingListService.updateShoppingListItems(user.id, updatedItems);
      if (!result?.success) {
        logger.error('Failed to delete item:', result?.error);
      }
    } catch (err) {
      logger.error('Error deleting item:', err);
    }
  };

  const handleUpdateNotes = async (itemId, notes) => {
    try {
      const updatedItems = shoppingItems.map(item => 
        item.id === itemId 
          ? { ...item, notes }
          : item
      );
      
      setShoppingItems(updatedItems);
      
      // Update in database
      const result = await shoppingListService.updateShoppingListItems(user.id, updatedItems);
      if (!result?.success) {
        logger.error('Failed to update notes:', result?.error);
      }
    } catch (err) {
      logger.error('Error updating notes:', err);
    }
  };

  const handleShareComplete = (result) => {
    if (result?.success) {
      logger.info('Share completed successfully');
    }
  };

  // Regenerate shopping list from meal plans
  const handleRegenerateFromMealPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { start, end } = getCurrentWeekDates();
      const result = await mealPlanService.generateShoppingList(user.id, start, end);
      
      if (result?.success) {
        const itemsWithId = result.data.map((item, index) => ({
          ...item,
          id: Date.now() + index, // Generate unique IDs
          checked: false,
          notes: '',
          customItem: false
        }));
        
        setShoppingItems(itemsWithId);
        
        // Save the regenerated list to database
        const saveResult = await shoppingListService.updateShoppingListItems(user.id, itemsWithId);
        if (!saveResult?.success) {
          logger.error('Failed to save regenerated shopping list:', saveResult?.error);
        }
      } else {
        setError(result?.error || 'Failed to regenerate shopping list');
      }
    } catch (err) {
      logger.error('Error regenerating shopping list:', err);
      setError('Failed to regenerate shopping list');
    } finally {
      setLoading(false);
    }
  };

  const completedCount = shoppingItems.filter(item => item.checked).length;
  const totalCount = shoppingItems.length;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UnifiedHeader showSearch={false} showNavigation={true} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Icon name="ShoppingCart" size={48} color="#9CA3AF" className="mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Shopping List</h1>
            <p className="text-gray-600 mb-8">Please sign in to access your shopping list</p>
            <div className="space-x-4">
              <button
                onClick={() => navigate('/user-login')}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/user-registration')}
                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleDeleteAll = async () => {
    try {
      logger.info('Delete all button clicked. User ID:', user.id);
      logger.debug('Current shopping items before deletion:', shoppingItems);
      
      setShoppingItems([]);
      setShowDeleteAllModal(false);
      
      // Delete all items from database
      const result = await shoppingListService.deleteAllItems(user.id);
      logger.debug('Delete all result:', result);
      
      if (!result?.success) {
        logger.error('Failed to delete all items:', result?.error);
        // Revert local state if database update failed
        await loadShoppingList();
      } else {
        logger.info('Successfully deleted all items from shopping list');
      }
    } catch (err) {
      logger.error('Error deleting all items:', err);
      // Revert local state if database update failed
      await loadShoppingList();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedHeader 
        userProfile={userProfile}
        showSearch={false}
        showNavigation={true}
      />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Shopping List</h1>
              <p className="text-gray-600">
                Items from your weekly meal plan
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setUnitPreference(unitPreference === 'metric' ? 'imperial' : 'metric')}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {unitPreference === 'metric' ? 'Metric' : 'Imperial'}
              </button>
              <button
                onClick={handleRegenerateFromMealPlans}
                disabled={loading}
                className="text-sm text-blue-500 hover:text-blue-700 px-3 py-1 rounded bg-blue-50 hover:bg-blue-100 transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Regenerate from meal plans"
              >
                <Icon name="RefreshCw" size={14} />
                <span>Refresh</span>
              </button>
              {totalCount > 0 && (
                <button
                  onClick={() => setShowDeleteAllModal(true)}
                  className="text-sm text-red-500 hover:text-red-700 px-3 py-1 rounded bg-red-50 hover:bg-red-100 transition-colors flex items-center space-x-1"
                >
                  <Icon name="Trash2" size={14} />
                  <span>Delete All</span>
                </button>
              )}
              <ShareButton
                items={shoppingItems}
                title="My Shopping List"
                variant="ghost"
                size="sm"
                showOptions={true}
                categorized={true}
                disabled={totalCount === 0}
                onShareComplete={handleShareComplete}
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {totalCount > 0 && (
            <ProgressIndicator 
              completed={completedCount}
              total={totalCount}
            />
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : totalCount === 0 ? (
          <EmptyState 
            onAddItem={() => setShowAddItemModal(true)}
            errorMessage={error}
          />
        ) : (
          <div className="space-y-4">
            {Object.entries(categorizeIngredients(shoppingItems)).map(([categoryName, category]) => (
              category.items.length > 0 && (
                <CategorySection
                  key={categoryName}
                  title={categoryName}
                  icon={category.icon}
                  items={category.items}
                  onItemCheck={handleItemCheck}
                  onDeleteItem={handleDeleteItem}
                  onUpdateNotes={handleUpdateNotes}
                />
              )
            ))}
          </div>
        )}

        <FloatingActionButton
          onClick={() => setShowAddItemModal(true)}
          icon="Plus"
          ariaLabel="Add custom item"
        />

        {showAddItemModal && (
          <AddItemModal
            onClose={() => setShowAddItemModal(false)}
            onAddItem={handleAddCustomItem}
          />
        )}

        {showDeleteAllModal && (
          <DeleteAllConfirmationModal
            isOpen={showDeleteAllModal}
            onClose={() => setShowDeleteAllModal(false)}
            onConfirm={handleDeleteAll}
            itemCount={totalCount}
          />
        )}
      </div>
    </div>
  );
};

export default ShoppingList;