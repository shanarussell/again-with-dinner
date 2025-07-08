import React from 'react';
import Icon from '../../../components/AppIcon';

const ProgressIndicator = ({ completed, total }) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Icon name="ShoppingCart" size={18} color="#6B7280" />
          <span className="text-sm font-medium text-gray-700">
            Shopping Progress
          </span>
        </div>
        <span className="text-sm text-gray-500">
          {completed} of {total} items
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-green-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="text-right mt-1">
        <span className="text-sm text-gray-600">{percentage}% complete</span>
      </div>
    </div>
  );
};

export default ProgressIndicator;