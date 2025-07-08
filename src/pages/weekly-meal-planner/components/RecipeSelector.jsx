import React, { useState, useMemo } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const RecipeSelector = ({ isOpen, onClose, onSelectRecipe, selectedDay, recipes }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Recipes' },
    { id: 'quick', name: 'Quick & Easy' },
    { id: 'healthy', name: 'Healthy' },
    { id: 'comfort', name: 'Comfort Food' },
    { id: 'vegetarian', name: 'Vegetarian' },
    { id: 'international', name: 'International' }
  ];

  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [recipes, searchQuery, selectedCategory]);

  const handleRecipeSelect = (recipe) => {
    onSelectRecipe(selectedDay, recipe);
    onClose();
    setSearchQuery('');
    setSelectedCategory('all');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-300 flex items-end md:items-center justify-center">
      <div className="bg-background w-full max-w-2xl max-h-[90vh] md:max-h-[80vh] rounded-t-2xl md:rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-heading font-semibold text-text-primary">
              Select Recipe
            </h2>
            <p className="text-sm text-text-secondary">
              Choose a recipe for {selectedDay}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            iconName="X"
            className="px-2"
            aria-label="Close"
          />
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b border-border space-y-4">
          <div className="relative">
            <Icon 
              name="Search" 
              size={20} 
              color="var(--color-text-secondary)"
              className="absolute left-3 top-1/2 transform -translate-y-1/2"
            />
            <Input
              type="search"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-primary text-white' :'bg-surface-100 text-text-secondary hover:bg-surface-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Recipe List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredRecipes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-surface-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Search" size={24} color="var(--color-text-secondary)" />
              </div>
              <p className="text-text-secondary font-medium">No recipes found</p>
              <p className="text-sm text-text-muted mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRecipes.map(recipe => (
                <div
                  key={recipe.id}
                  onClick={() => handleRecipeSelect(recipe)}
                  className="bg-surface-50 rounded-lg border border-border hover:border-primary hover:shadow-card transition-all duration-200 cursor-pointer group"
                >
                  <div className="aspect-video rounded-t-lg overflow-hidden bg-surface-200">
                    <Image
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-heading font-medium text-text-primary group-hover:text-primary transition-colors duration-200">
                      {recipe.title}
                    </h3>
                    <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                      {recipe.description}
                    </p>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1 text-text-secondary">
                          <Icon name="Clock" size={14} />
                          <span className="text-sm">{recipe.cookTime}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-text-secondary">
                          <Icon name="Users" size={14} />
                          <span className="text-sm">{recipe.servings}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Icon name="Star" size={14} color="var(--color-warning)" />
                        <span className="text-sm text-text-secondary">{recipe.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeSelector;