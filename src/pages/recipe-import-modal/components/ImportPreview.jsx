import React from 'react';
import Button from '../../../components/ui/Button';

const ImportPreview = ({ recipeData, onSave, onBack }) => {
  const {
    title,
    image,
    ingredients = [],
    instructions = [],
    metadata = {}
  } = recipeData || {};

  const totalTime = (parseInt(metadata?.prepTime) || 0) + (parseInt(metadata?.cookTime) || 0);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Recipe Import Preview
        </h3>
        <p className="text-gray-600">
          Review the imported recipe details before saving
        </p>
      </div>

      {/* Recipe Overview */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start space-x-4">
          {image ? (
            <img 
              src={image} 
              alt={title}
              className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
            />
          ) : (
            <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">
              {title || 'Untitled Recipe'}
            </h4>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {metadata?.servings && (
                <span>🍽️ {metadata.servings} servings</span>
              )}
              {totalTime > 0 && (
                <span>⏱️ {totalTime} mins</span>
              )}
              {metadata?.difficulty && (
                <span>📊 {metadata.difficulty}</span>
              )}
              {metadata?.category && (
                <span>🏷️ {metadata.category}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ingredients Preview */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v1a2 2 0 00-2 2v2a2 2 0 002 2v1a2 2 0 002 2h2m0-13h6a2 2 0 012 2v1a2 2 0 012 2v2a2 2 0 01-2 2v1a2 2 0 01-2 2H9" />
          </svg>
          Ingredients ({ingredients.length})
        </h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {ingredients.slice(0, 5).map((ingredient, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-600 rounded-full flex-shrink-0"></div>
              <span className="text-sm text-gray-700">{ingredient.text}</span>
            </div>
          ))}
          {ingredients.length > 5 && (
            <p className="text-sm text-gray-500 italic">
              ...and {ingredients.length - 5} more ingredients
            </p>
          )}
        </div>
      </div>

      {/* Instructions Preview */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Instructions ({instructions.length} steps)
        </h4>
        <div className="space-y-3 max-h-40 overflow-y-auto">
          {instructions.slice(0, 3).map((instruction, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                {index + 1}
              </div>
              <p className="text-sm text-gray-700 flex-1">{instruction.text}</p>
            </div>
          ))}
          {instructions.length > 3 && (
            <p className="text-sm text-gray-500 italic">
              ...and {instructions.length - 3} more steps
            </p>
          )}
        </div>
      </div>

      {/* Success Message */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-green-900">
              Recipe imported successfully!
            </p>
            <p className="text-sm text-green-700">
              You can edit any details before saving to your collection.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="primary"
          iconName="Save"
          iconPosition="left"
          onClick={onSave}
          className="flex-1"
        >
          Save Recipe
        </Button>
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 sm:flex-none"
        >
          Back to URL
        </Button>
      </div>
    </div>
  );
};

export default ImportPreview;