import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const RecipeMetadata = ({ metadata, onMetadataChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const categories = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' }, 
    { value: 'dinner', label: 'Dinner' },
    { value: 'appetizer', label: 'Appetizer' },
    { value: 'dessert', label: 'Dessert' },
    { value: 'snack', label: 'Snack' },
    { value: 'beverage', label: 'Beverage' },
    { value: 'soup', label: 'Soup' },
    { value: 'salad', label: 'Salad' },
    { value: 'main_course', label: 'Main Course' },
    { value: 'side_dish', label: 'Side Dish' },
    { value: 'sauce', label: 'Sauce' },
    { value: 'baking', label: 'Baking' }
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy', icon: '🟢' },
    { value: 'medium', label: 'Medium', icon: '🟡' },
    { value: 'hard', label: 'Hard', icon: '🔴' }
  ];

  const updateMetadata = (field, value) => {
    onMetadataChange({
      ...metadata,
      [field]: value
    });
  };

  const adjustServings = (increment) => {
    const newServings = Math.max(1, (metadata.servings || 1) + increment);
    updateMetadata('servings', newServings);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-text-primary">
          Recipe Details
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
        <div className="space-y-6">
          {/* Category */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary">
              Category
            </label>
            <select
              value={metadata.category || ''}
              onChange={(e) => updateMetadata('category', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Cooking Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary">
                Prep Time (minutes)
              </label>
              <Input
                type="number"
                placeholder="15"
                value={metadata.prepTime || ''}
                onChange={(e) => updateMetadata('prepTime', parseInt(e.target.value) || '')}
                min="0"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary">
                Cook Time (minutes)
              </label>
              <Input
                type="number"
                placeholder="30"
                value={metadata.cookTime || ''}
                onChange={(e) => updateMetadata('cookTime', parseInt(e.target.value) || '')}
                min="0"
              />
            </div>
          </div>

          {/* Servings */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary">
              Servings
            </label>
            <div className="flex items-center space-x-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => adjustServings(-1)}
                disabled={(metadata.servings || 1) <= 1}
                iconName="Minus"
                className="w-10 h-10 p-0"
              />
              <div className="flex-1 text-center">
                <span className="text-lg font-medium text-text-primary">
                  {metadata.servings || 1}
                </span>
                <span className="text-sm text-text-secondary ml-1">
                  {(metadata.servings || 1) === 1 ? 'serving' : 'servings'}
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => adjustServings(1)}
                iconName="Plus"
                className="w-10 h-10 p-0"
              />
            </div>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary">
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {difficulties.map(difficulty => (
                <button
                  key={difficulty.value}
                  type="button"
                  onClick={() => updateMetadata('difficulty', difficulty.value)}
                  className={`p-3 rounded-lg border transition-colors duration-200 ${
                    metadata.difficulty === difficulty.value
                      ? 'border-primary bg-primary-50 text-primary' :'border-border hover:border-primary hover:bg-surface-50'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg mb-1">{difficulty.icon}</div>
                    <div className="text-sm font-medium">{difficulty.label}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeMetadata;