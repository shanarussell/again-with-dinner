import React from 'react';
import Icon from '../../../components/AppIcon';

const RecipeMetadata = ({ recipe }) => {
  if (!recipe) return null;

  const metadata = [
    {
      icon: 'Clock',
      label: 'Total Time',
      value: recipe?.totalTime > 0 ? `${recipe.totalTime} minutes` : 'Not specified',
      color: '#EA580C'
    },
    {
      icon: 'Users',
      label: 'Servings',
      value: recipe?.servings || 'Not specified',
      color: '#EA580C'
    },
    {
      icon: 'TrendingUp',
      label: 'Difficulty',
      value: recipe?.difficulty || 'Not specified',
      color: '#EA580C'
    },
    {
      icon: 'Tag',
      label: 'Category',
      value: recipe?.category || 'Not specified',
      color: '#EA580C'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 print-section">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <Icon name="Info" size={24} color="#EA580C" className="mr-2" />
        Recipe Details
      </h2>
      
      <div className="space-y-4">
        {metadata.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <Icon name={item.icon} size={20} color={item.color} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="font-semibold text-gray-900">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Rating Display */}
      {recipe?.rating > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <Icon name="Star" size={20} color="#F59E0B" className="fill-current" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">Rating</p>
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Icon
                      key={star}
                      name="Star"
                      size={16}
                      color={star <= recipe.rating ? "#F59E0B" : "#D1D5DB"}
                      className={star <= recipe.rating ? "fill-current" : ""}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">({recipe.rating}/5)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeMetadata;