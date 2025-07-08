import React from 'react';
import Button from '../../../components/ui/Button';

const FilterChips = ({
  categories,
  difficulties,
  cookingTimes,
  selectedCategory,
  selectedDifficulty,
  selectedCookingTime,
  onCategoryChange,
  onDifficultyChange,
  onCookingTimeChange,
  onClearFilters
}) => {
  const hasActiveFilters = selectedCategory !== 'all' || selectedDifficulty !== 'all' || selectedCookingTime !== 'all';

  return (
    <div className="space-y-3">
      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-orange-500 text-white' :'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Difficulty
        </label>
        <div className="flex flex-wrap gap-2">
          {difficulties.map(difficulty => (
            <button
              key={difficulty.id}
              onClick={() => onDifficultyChange(difficulty.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedDifficulty === difficulty.id
                  ? 'bg-orange-500 text-white' :'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {difficulty.name}
            </button>
          ))}
        </div>
      </div>

      {/* Cooking Time Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cooking Time
        </label>
        <div className="flex flex-wrap gap-2">
          {cookingTimes.map(time => (
            <button
              key={time.id}
              onClick={() => onCookingTimeChange(time.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCookingTime === time.id
                  ? 'bg-orange-500 text-white' :'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {time.name}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="text-sm"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default FilterChips;