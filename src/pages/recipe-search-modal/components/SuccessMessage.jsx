import React from 'react';
import Icon from '../../../components/AppIcon';

const SuccessMessage = ({ message }) => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Check" size={24} className="text-green-600" />
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Recipe Added Successfully!
        </h3>
        
        <p className="text-gray-600">
          {message}
        </p>
        
        <div className="mt-4 flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
        </div>
      </div>
    </div>
  );
};

export default SuccessMessage;