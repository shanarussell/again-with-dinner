import React from 'react';
import Button from '../../../components/ui/Button';

const ImportOptions = ({ onURLImport, onManualEntry }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          How would you like to add your recipe?
        </h3>
        <p className="text-gray-600">
          Choose between importing from a web page or entering manually
        </p>
      </div>

      {/* URL Import Option */}
      <div className="border border-gray-200 rounded-lg p-6 hover:border-green-300 transition-colors">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-2">
              Import from Web Page
            </h4>
            <p className="text-gray-600 text-sm mb-4">
              Paste a recipe URL and we'll automatically extract the ingredients, instructions, and other details for you.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                allrecipes.com
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                food.com
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                epicurious.com
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                + many more
              </span>
            </div>
            <Button
              variant="primary"
              iconName="Download"
              iconPosition="left"
              onClick={onURLImport}
              className="w-full sm:w-auto"
            >
              Import from URL
            </Button>
          </div>
        </div>
      </div>

      {/* Manual Entry Option */}
      <div className="border border-gray-200 rounded-lg p-6 hover:border-green-300 transition-colors">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-2">
              Enter Manually
            </h4>
            <p className="text-gray-600 text-sm mb-4">
              Type or paste your recipe ingredients and instructions manually. Perfect for family recipes or your own creations.
            </p>
            <Button
              variant="outline"
              iconName="Plus"
              iconPosition="left"
              onClick={onManualEntry}
              className="w-full sm:w-auto"
            >
              Create from Scratch
            </Button>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          You can always edit imported recipes after they're added to your collection
        </p>
      </div>
    </div>
  );
};

export default ImportOptions;