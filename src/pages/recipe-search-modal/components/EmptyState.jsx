import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const EmptyState = ({ hasFilters, onClearFilters }) => {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon name="Search" size={24} className="text-gray-400" />
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {hasFilters ? 'No recipes found' : 'No recipes available'}
      </h3>
      
      <p className="text-gray-600 mb-6">
        {hasFilters 
          ? 'Try adjusting your search criteria or filters to find more recipes.' :'You haven\'t created any recipes yet. Start by adding your first recipe!'
        }
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {hasFilters && (
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="flex items-center space-x-2"
          >
            <Icon name="RotateCcw" size={16} />
            <span>Clear Filters</span>
          </Button>
        )}
        
        <Button
          variant="primary"
          onClick={() => window.location.href = '/recipe-creation-edit'}
          className="flex items-center space-x-2"
        >
          <Icon name="Plus" size={16} />
          <span>Create Recipe</span>
        </Button>
      </div>
    </div>
  );
};

export default EmptyState;