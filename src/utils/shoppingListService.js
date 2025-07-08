import { supabase } from './supabase';
import logger from './logger';

const shoppingListService = {
  // Get current shopping list for user
  async getShoppingList(userId) {
    try {
      logger.debug('Getting shopping list for user:', userId);
      
      const { data, error } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('user_id', userId)
        .eq('is_completed', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        logger.debug('Shopping list query error:', error);
        if (error.code === 'PGRST116') {
          // No shopping list found, create one
          logger.info('No shopping list found, creating new one');
          return this.createShoppingList(userId);
        }
        return { success: false, error: error.message };
      }
      
      logger.debug('Shopping list found:', data);
      return { success: true, data: data || { items: [] } };
    } catch (error) {
      logger.error('Error in getShoppingList:', error);
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to load shopping list' };
    }
  },

  // Create a new shopping list
  async createShoppingList(userId, name = 'Shopping List') {
    try {
      const { data, error } = await supabase
        .from('shopping_lists')
        .insert([{
          user_id: userId,
          name: name,
          items: [],
          is_completed: false
        }])
        .select()
        .single();
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true, data };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to create shopping list' };
    }
  },

  // Update shopping list items
  async updateShoppingListItems(userId, items) {
    try {
      logger.debug('Updating shopping list items for user:', userId, 'Items count:', items.length);
      
      const { data, error } = await supabase
        .from('shopping_lists')
        .update({ 
          items: items,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_completed', false)
        .select()
        .single();
      
      if (error) {
        logger.error('Error updating shopping list items:', error);
        return { success: false, error: error.message };
      }
      
      logger.debug('Shopping list items updated successfully:', data);
      return { success: true, data };
    } catch (error) {
      logger.error('Error in updateShoppingListItems:', error);
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to update shopping list' };
    }
  },

  // Add item to shopping list
  async addItem(userId, item) {
    try {
      // Get current shopping list
      const currentList = await this.getShoppingList(userId);
      if (!currentList.success) {
        return currentList;
      }

      const currentItems = currentList.data.items || [];
      const newItem = {
        id: Date.now() + Math.random(), // Generate unique ID
        name: item.name,
        amount: item.amount,
        checked: false,
        notes: item.notes || '',
        customItem: true,
        addedAt: new Date().toISOString()
      };

      const updatedItems = [...currentItems, newItem];
      
      return this.updateShoppingListItems(userId, updatedItems);
    } catch (error) {
      return { success: false, error: 'Failed to add item to shopping list' };
    }
  },

  // Update item in shopping list
  async updateItem(userId, itemId, updates) {
    try {
      const currentList = await this.getShoppingList(userId);
      if (!currentList.success) {
        return currentList;
      }

      const currentItems = currentList.data.items || [];
      const updatedItems = currentItems.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      );
      
      return this.updateShoppingListItems(userId, updatedItems);
    } catch (error) {
      return { success: false, error: 'Failed to update item' };
    }
  },

  // Delete item from shopping list
  async deleteItem(userId, itemId) {
    try {
      const currentList = await this.getShoppingList(userId);
      if (!currentList.success) {
        return currentList;
      }

      const currentItems = currentList.data.items || [];
      const updatedItems = currentItems.filter(item => item.id !== itemId);
      
      return this.updateShoppingListItems(userId, updatedItems);
    } catch (error) {
      return { success: false, error: 'Failed to delete item' };
    }
  },

  // Delete all items from shopping list
  async deleteAllItems(userId) {
    try {
      logger.info('Deleting all items from shopping list for user:', userId);
      
      // First, get the current shopping list to see what we're working with
      const currentList = await this.getShoppingList(userId);
      logger.debug('Current shopping list before deletion:', currentList);
      
      if (!currentList.success) {
        logger.error('Failed to get current shopping list:', currentList.error);
        return currentList;
      }
      
      const result = await this.updateShoppingListItems(userId, []);
      logger.debug('Delete all items result:', result);
      
      // Verify the deletion worked
      const verifyList = await this.getShoppingList(userId);
      logger.debug('Shopping list after deletion:', verifyList);
      
      return result;
    } catch (error) {
      logger.error('Error in deleteAllItems:', error);
      return { success: false, error: 'Failed to delete all items' };
    }
  },

  // Mark shopping list as completed
  async completeShoppingList(userId) {
    try {
      const { data, error } = await supabase
        .from('shopping_lists')
        .update({ 
          is_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_completed', false)
        .select()
        .single();
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true, data };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to complete shopping list' };
    }
  },

  // Get shopping list history
  async getShoppingListHistory(userId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true, data: data || [] };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to load shopping list history' };
    }
  }
};

export default shoppingListService; 