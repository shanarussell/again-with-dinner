import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import Button from '../../../components/ui/Button';

const FilterChips = ({ selectedFilters, onFilterChange, onClearFilters }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRefs = useRef({});

  // Categories based on the database enum
  const categories = [
    { value: 'all', label: 'All Categories' },
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

  // Difficulty levels based on the database enum
  const difficulties = [
    { value: 'all', label: 'All Difficulties' },
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' }
  ];

  // Star ratings
  const ratings = [
    { value: 'all', label: 'All Ratings' },
    { value: '5', label: '5 Stars' },
    { value: '4', label: '4+ Stars' },
    { value: '3', label: '3+ Stars' },
    { value: '2', label: '2+ Stars' },
    { value: '1', label: '1+ Stars' }
  ];

  // Special filters
  const specialFilters = [
    { id: 'favorites', name: 'Favorites', color: 'bg-red-500' },
    { id: 'recent', name: 'Recent', color: 'bg-blue-500' },
    { id: 'quick', name: 'Quick (≤30 min)', color: 'bg-green-500' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown && dropdownRefs.current[activeDropdown] && 
          !dropdownRefs.current[activeDropdown].contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  const handleFilterSelect = (filterType, value) => {
    onFilterChange?.(filterType, value);
    setActiveDropdown(null);
  };

  const handleSpecialFilterClick = (filterId) => {
    onFilterChange?.('special', filterId);
  };

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const getSelectedLabel = (filterType, options) => {
    const selectedValue = selectedFilters?.[filterType];
    if (!selectedValue || selectedValue === 'all') {
      return options[0]?.label || 'All';
    }
    const option = options.find(opt => opt.value === selectedValue);
    return option?.label || selectedValue;
  };

  const hasActiveFilters = selectedFilters && (
    (selectedFilters.category && selectedFilters.category !== 'all') ||
    (selectedFilters.difficulty && selectedFilters.difficulty !== 'all') ||
    (selectedFilters.rating && selectedFilters.rating !== 'all') ||
    selectedFilters.special
  );

  const renderDropdown = (filterType, options, title) => (
    <div className="relative" ref={el => dropdownRefs.current[filterType] = el}>
      <button
        onClick={() => toggleDropdown(filterType)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border flex items-center gap-2 ${
          (selectedFilters?.[filterType] && selectedFilters[filterType] !== 'all')
            ? 'bg-orange-500 text-white border-orange-500' :'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
        }`}
      >
        {getSelectedLabel(filterType, options)}
        <ChevronDown className={`w-4 h-4 transition-transform ${
          activeDropdown === filterType ? 'rotate-180' : ''
        }`} />
      </button>
      
      {activeDropdown === filterType && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-2 py-1">
              {title}
            </div>
            {options.map(option => (
              <button
                key={option.value}
                onClick={() => handleFilterSelect(filterType, option.value)}
                className={`w-full text-left px-2 py-2 rounded text-sm transition-colors ${
                  selectedFilters?.[filterType] === option.value
                    ? 'bg-orange-100 text-orange-800' :'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-3 mb-4">
        {/* Filter Dropdowns */}
        <div className="flex flex-wrap gap-2">
          {renderDropdown('category', categories, 'Category')}
          {renderDropdown('difficulty', difficulties, 'Difficulty')}
          {renderDropdown('rating', ratings, 'Rating')}
        </div>

        {/* Special Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {specialFilters.map(filter => (
            <button
              key={filter.id}
              onClick={() => handleSpecialFilterClick(filter.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedFilters?.special === filter.id
                  ? `${filter.color} text-white shadow-sm` 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {filter.name}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {selectedFilters?.category && selectedFilters.category !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                Category: {getSelectedLabel('category', categories)}
                <button
                  onClick={() => handleFilterSelect('category', 'all')}
                  className="hover:bg-orange-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedFilters?.difficulty && selectedFilters.difficulty !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Difficulty: {getSelectedLabel('difficulty', difficulties)}
                <button
                  onClick={() => handleFilterSelect('difficulty', 'all')}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedFilters?.rating && selectedFilters.rating !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                Rating: {getSelectedLabel('rating', ratings)}
                <button
                  onClick={() => handleFilterSelect('rating', 'all')}
                  className="hover:bg-yellow-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedFilters?.special && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                {specialFilters.find(f => f.id === selectedFilters.special)?.name}
                <button
                  onClick={() => handleFilterSelect('special', null)}
                  className="hover:bg-purple-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default FilterChips;