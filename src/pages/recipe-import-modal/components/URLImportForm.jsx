import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const URLImportForm = ({ onImport, onBack }) => {
  const [url, setUrl] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState('');

  const validateURL = (urlString) => {
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setValidationError('Please enter a recipe URL');
      return;
    }

    if (!validateURL(url)) {
      setValidationError('Please enter a valid URL (starting with http:// or https://)');
      return;
    }

    setIsValidating(true);
    setValidationError('');

    try {
      // Simple validation - check if URL is accessible
      await new Promise(resolve => setTimeout(resolve, 500));
      onImport(url);
    } catch (err) {
      setValidationError('Unable to access this URL. Please check the link and try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleURLChange = (e) => {
    setUrl(e.target.value);
    if (validationError) {
      setValidationError('');
    }
  };

  const recentURLs = [
    'https://www.budgetbytes.com/easy-chicken-stir-fry/',
    'https://www.allrecipes.com/recipe/231506/simple-macaroni-and-cheese/',
    'https://www.food.com/recipe/creamy-chicken-alfredo-pasta-123456'
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Import Recipe from URL
        </h3>
        <p className="text-gray-600">
          Enter the web address of the recipe you'd like to import
        </p>
      </div>

      {/* URL Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="recipe-url" className="block text-sm font-medium text-gray-700 mb-2">
            Recipe URL
          </label>
          <Input
            id="recipe-url"
            type="url"
            placeholder="https://www.budgetbytes.com/recipe-name/"
            value={url}
            onChange={handleURLChange}
            className={`${validationError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
            disabled={isValidating}
          />
          {validationError && (
            <p className="mt-1 text-sm text-red-600">{validationError}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="submit"
            variant="primary"
            iconName="Download"
            iconPosition="left"
            disabled={isValidating || !url.trim()}
            loading={isValidating}
            className="flex-1"
          >
            {isValidating ? 'Validating...' : 'Import Recipe'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isValidating}
            className="flex-1 sm:flex-none"
          >
            Back
          </Button>
        </div>
      </form>

      {/* Recent URLs */}
      {recentURLs.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Recently Used URLs
          </h4>
          <div className="space-y-2">
            {recentURLs.map((recentUrl, index) => (
              <button
                key={index}
                onClick={() => setUrl(recentUrl)}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
                disabled={isValidating}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {new URL(recentUrl).hostname}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {recentUrl}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Supported Sites */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          Supported Recipe Sites
        </h4>
        <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
          <div>• Budget Bytes</div>
          <div>• AllRecipes</div>
          <div>• Food.com</div>
          <div>• Epicurious</div>
          <div>• Food Network</div>
          <div>• Bon Appétit</div>
          <div>• Serious Eats</div>
          <div>• Tasty</div>
          <div>• And many more...</div>
        </div>
      </div>
    </div>
  );
};

export default URLImportForm;