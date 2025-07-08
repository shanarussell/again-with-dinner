import React from 'react';
import Button from '../../../components/ui/Button';

const ImportError = ({ error, onRetry, onManualEntry }) => {
  const {
    title = 'Import Failed',
    message = 'We were unable to import the recipe from the provided URL.',
    suggestion = 'Please try a different URL or enter the recipe manually.'
  } = error || {};

  return (
    <div className="space-y-6 text-center">
      <div>
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 mb-2">
          {message}
        </p>
        <p className="text-sm text-gray-500">
          {suggestion}
        </p>
      </div>

      {/* Common Issues */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
        <h4 className="text-sm font-medium text-yellow-900 mb-2">
          Common Issues
        </h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Website may not be supported for recipe extraction</li>
          <li>• URL may not contain structured recipe data</li>
          <li>• Page may be behind a paywall or require login</li>
          <li>• Network connection issues or temporary site problems</li>
        </ul>
      </div>

      {/* Troubleshooting Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          💡 Troubleshooting Tips
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Make sure the URL is a direct link to a recipe page</li>
          <li>• Try copying the URL from your browser's address bar</li>
          <li>• Check if the website loads properly in your browser</li>
          <li>• Some recipe sites work better than others for import</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="primary"
          iconName="RotateCcw"
          iconPosition="left"
          onClick={onRetry}
          className="flex-1"
        >
          Try Different URL
        </Button>
        <Button
          variant="outline"
          iconName="Plus"
          iconPosition="left"
          onClick={onManualEntry}
          className="flex-1"
        >
          Enter Manually
        </Button>
      </div>

      {/* Alternative Suggestion */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          You can also copy and paste the recipe content directly into the manual entry form
        </p>
      </div>
    </div>
  );
};

export default ImportError;