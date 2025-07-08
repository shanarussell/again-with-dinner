import React from 'react';
import Icon from '../../../components/AppIcon';

const InstructionsList = ({ instructions }) => {
  if (!instructions?.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 print-section">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Icon name="List" size={24} color="#EA580C" className="mr-2" />
          Instructions
        </h2>
        <p className="text-gray-500 text-center py-8">No instructions available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 print-section">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <Icon name="List" size={24} color="#EA580C" className="mr-2" />
        Instructions
      </h2>
      
      <div className="space-y-6">
        {instructions.map((instruction, index) => (
          <div key={index} className="flex space-x-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
            </div>
            <div className="flex-1 pt-1">
              <p className="text-gray-900 leading-relaxed">
                {instruction?.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstructionsList;