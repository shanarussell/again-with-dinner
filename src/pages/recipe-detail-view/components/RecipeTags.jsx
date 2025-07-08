import React from 'react';

const RecipeTags = ({ category, cuisine, dietaryRestrictions }) => {
  const allTags = [
    ...(category ? [{ label: category, type: 'category' }] : []),
    ...(cuisine ? [{ label: cuisine, type: 'cuisine' }] : []),
    ...(dietaryRestrictions || []).map(restriction => ({ label: restriction, type: 'dietary' }))
  ];

  const getTagColor = (type) => {
    switch (type) {
      case 'category':
        return 'bg-primary-100 text-primary-700';
      case 'cuisine':
        return 'bg-secondary-100 text-secondary-700';
      case 'dietary':
        return 'bg-success-100 text-success-700';
      default:
        return 'bg-surface-200 text-text-secondary';
    }
  };

  if (allTags.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-heading font-semibold text-text-primary">
        Category
      </h4>
      <div className="flex flex-wrap gap-2">
        {allTags.map((tag, index) => (
          <span
            key={index}
            className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getTagColor(tag.type)}`}
          >
            {tag.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default RecipeTags;