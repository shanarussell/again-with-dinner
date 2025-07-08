import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const EmptyState = ({ searchQuery, activeFilters = [] }) => {
  const navigate = useNavigate();

  const handleAddRecipe = () => {
    navigate('/recipe-creation-edit');
  };

  const isFiltered = searchQuery || (activeFilters?.length > 0 && !activeFilters.includes('all'));

  if (isFiltered) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-24 h-24 bg-surface-100 rounded-full flex items-center justify-center mb-6">
          <Icon name="Search" size={32} color="var(--color-text-muted)" />
        </div>
        
        <h3 className="text-xl font-heading font-semibold text-text-primary mb-2">
          No recipes found
        </h3>
        
        <p className="text-text-secondary text-center mb-6 max-w-md">
          {searchQuery 
            ? `No recipes match "${searchQuery}". Try adjusting your search terms.`
            : 'No recipes match your current filters. Try selecting different categories.'
          }
        </p>
        
        <Button
          variant="outline"
          iconName="RotateCcw"
          iconPosition="left"
          onClick={() => window.location.reload()}
        >
          Clear filters
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-32 h-32 bg-primary-50 rounded-full flex items-center justify-center mb-8">
        <Icon name="ChefHat" size={48} color="var(--color-primary)" />
      </div>
      
      <h3 className="text-2xl font-heading font-bold text-text-primary mb-3">
        Welcome to RecipeVault!
      </h3>
      
      <p className="text-text-secondary text-center mb-8 max-w-md leading-relaxed">
        Start building your personal recipe collection. Add your favorite recipes and organize them for easy access while cooking.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="primary"
          iconName="Plus"
          iconPosition="left"
          onClick={handleAddRecipe}
          className="px-6"
        >
          Add Your First Recipe
        </Button>
      </div>
      
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl">
        <div className="text-center">
          <div className="w-12 h-12 bg-success-50 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Icon name="BookOpen" size={24} color="var(--color-success)" />
          </div>
          <h4 className="font-heading font-semibold text-text-primary mb-1">
            Organize
          </h4>
          <p className="text-sm text-text-secondary">
            Keep all your recipes in one secure place
          </p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-accent-50 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Icon name="Calendar" size={24} color="var(--color-accent)" />
          </div>
          <h4 className="font-heading font-semibold text-text-primary mb-1">
            Plan
          </h4>
          <p className="text-sm text-text-secondary">
            Create weekly meal plans with ease
          </p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-secondary-50 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Icon name="Smartphone" size={24} color="var(--color-secondary)" />
          </div>
          <h4 className="font-heading font-semibold text-text-primary mb-1">
            Access
          </h4>
          <p className="text-sm text-text-secondary">
            View recipes on any device, anywhere
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;