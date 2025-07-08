import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const EmptyState = ({ onAddItem, errorMessage }) => {
  const navigate = useNavigate();

  // Check if this is an error state vs truly empty
  const isErrorState = errorMessage && errorMessage.includes('ingredients');
  const isNoMealsState = errorMessage && errorMessage.includes('Add some meals');

  return (
    <div className="text-center py-12">
      <div className="mb-6">
        <Icon 
          name={isErrorState ? "AlertCircle" : "ShoppingCart"} 
          size={64} 
          color={isErrorState ? "#EF4444" : "#D1D5DB"} 
          className="mx-auto mb-4" 
        />
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          {isErrorState ? 'Shopping List Generation Failed' : 'Your shopping list is empty'}
        </h3>
        
        {errorMessage ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-left">
            <p className="text-red-800 text-sm leading-relaxed">
              {errorMessage}
            </p>
          </div>
        ) : (
          <p className="text-gray-600 mb-4">
            Add recipes to your meal plan to generate a shopping list automatically
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
        {isNoMealsState ? (
          <button
            onClick={() => navigate('/weekly-meal-planner')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Plan Your Meals
          </button>
        ) : isErrorState ? (
          <>
            <button
              onClick={() => navigate('/recipe-dashboard')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Edit Your Recipes
            </button>
            <button
              onClick={() => navigate('/weekly-meal-planner')}
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              View Meal Plan
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate('/weekly-meal-planner')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Plan Your Meals
            </button>
            <button
              onClick={onAddItem}
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Add Custom Item
            </button>
          </>
        )}
      </div>

      {isErrorState && (
        <div className="mt-8 text-left bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h4 className="font-medium text-yellow-800 mb-3 flex items-center">
            <Icon name="AlertTriangle" size={20} color="#D97706" className="mr-2" />
            How to Fix This Issue:
          </h4>
          <ol className="space-y-2 text-sm text-yellow-700 list-decimal list-inside">
            <li>Go to your Recipe Dashboard</li>
            <li>Edit the recipes mentioned in the error</li>
            <li>Make sure each ingredient has both a name and amount</li>
            <li>Save your changes and try generating the shopping list again</li>
          </ol>
          <div className="mt-4 p-3 bg-yellow-100 rounded">
            <p className="text-xs text-yellow-600">
              <strong>Example of proper ingredient format:</strong><br/>
              Name: "Chicken breast", Amount: "2 lbs"<br/>
              Name: "Olive oil", Amount: "2 tablespoons"
            </p>
          </div>
        </div>
      )}

      {!isErrorState && (
        <div className="mt-8 text-left bg-gray-50 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-3">Smart Shopping Features:</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center space-x-2">
              <Icon name="Check" size={16} color="#10B981" />
              <span>Automatically categorized ingredients</span>
            </li>
            <li className="flex items-center space-x-2">
              <Icon name="Check" size={16} color="#10B981" />
              <span>Smart quantity aggregation</span>
            </li>
            <li className="flex items-center space-x-2">
              <Icon name="Check" size={16} color="#10B981" />
              <span>Progress tracking and checkboxes</span>
            </li>
            <li className="flex items-center space-x-2">
              <Icon name="Check" size={16} color="#10B981" />
              <span>Notes for brand preferences</span>
            </li>
            <li className="flex items-center space-x-2">
              <Icon name="Check" size={16} color="#10B981" />
              <span>Easy sharing via text or email</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default EmptyState;