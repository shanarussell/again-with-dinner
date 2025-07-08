import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const RecipeRating = ({ rating: initialRating = 0, onRatingChange }) => {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);

  const handleRatingClick = (newRating) => {
    setRating(newRating);
    if (onRatingChange) {
      onRatingChange(newRating);
    }
  };

  const getRatingText = (rating) => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Not rated';
    }
  };

  return (
    <div className="bg-surface-50 rounded-lg p-4">
      <h4 className="text-sm font-heading font-semibold text-text-primary mb-3">
        Rate this Recipe
      </h4>
      
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRatingClick(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 rounded transition-colors duration-200 hover:bg-surface-100"
            >
              <Icon
                name="Star"
                size={20}
                color={
                  star <= (hoverRating || rating)
                    ? 'var(--color-warning)'
                    : 'var(--color-text-muted)'
                }
                strokeWidth={star <= (hoverRating || rating) ? 0 : 2}
                className={star <= (hoverRating || rating) ? 'fill-current' : ''}
              />
            </button>
          ))}
        </div>
        
        <span className="text-sm text-text-secondary ml-2">
          {getRatingText(hoverRating || rating)}
        </span>
      </div>
      
      {rating > 0 && (
        <div className="mt-2 text-xs text-text-secondary">
          You rated this recipe {rating} out of 5 stars
        </div>
      )}
    </div>
  );
};

export default RecipeRating;