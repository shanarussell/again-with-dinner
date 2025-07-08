import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import UnifiedHeader from '../../components/ui/UnifiedHeader';
import ImportOptions from './components/ImportOptions';
import URLImportForm from './components/URLImportForm';
import ImportProgress from './components/ImportProgress';
import ImportPreview from './components/ImportPreview';
import ImportError from './components/ImportError';
import recipeScraper from '../../utils/recipeScraper';

const RecipeImportModal = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  
  const [importState, setImportState] = useState('options'); // 'options', 'url-form', 'importing', 'preview', 'error'
  const [importData, setImportData] = useState(null);
  const [error, setError] = useState(null);
  const [url, setUrl] = useState('');

  const handleBack = () => {
    if (importState === 'options') {
      navigate('/recipe-dashboard');
    } else {
      setImportState('options');
      setError(null);
    }
  };

  const handleManualEntry = () => {
    navigate('/recipe-creation-edit');
  };

  const handleURLImport = () => {
    setImportState('url-form');
  };

  const handleImportFromURL = async (importUrl) => {
    setUrl(importUrl);
    setImportState('importing');
    setError(null);

    try {
      // Use the recipe scraper to extract recipe data
      const scrapedData = await recipeScraper.scrapeRecipe(importUrl);
      
      // Validate the scraped data
      if (!scrapedData?.title || !scrapedData?.ingredients?.length || !scrapedData?.instructions?.length) {
        throw new Error('Incomplete recipe data found');
      }

      setImportData(scrapedData);
      setImportState('preview');
    } catch (err) {
      console.error('Recipe import error:', err);
      
      let errorMessage = 'Unable to import recipe from this URL.';
      let errorSuggestion = 'Try manually entering the recipe or use a different URL.';
      
      if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to access the recipe page. The website may be blocking automated requests.';
        errorSuggestion = 'Try copying and pasting the recipe manually, or check if the URL is accessible.';
      } else if (err.message.includes('not found')) {
        errorMessage = 'Recipe data not found on this page.';
        errorSuggestion = 'Make sure the URL points to a recipe page with structured recipe data.';
      } else if (err.message.includes('Incomplete recipe data')) {
        errorMessage = 'The recipe page is missing required information.';
        errorSuggestion = 'Some recipe details may be missing. Try importing from a different page or add the missing information manually.';
      }
      
      setError({
        title: 'Import Failed',
        message: errorMessage,
        suggestion: errorSuggestion
      });
      setImportState('error');
    }
  };

  const handleSaveImportedRecipe = () => {
    if (importData) {
      navigate('/recipe-creation-edit', { 
        state: { importedRecipe: importData } 
      });
    }
  };

  const handleRetry = () => {
    setImportState('url-form');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedHeader 
        userProfile={userProfile}
        showSearch={false}
        showNavigation={false}
      />
      
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-green-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleBack}
                  className="p-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-xl font-bold">
                  {importState === 'options' ? 'Add Recipe' : 'Import Recipe'}
                </h2>
              </div>
              <button
                onClick={() => navigate('/recipe-dashboard')}
                className="p-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {importState === 'options' && (
              <ImportOptions 
                onURLImport={handleURLImport}
                onManualEntry={handleManualEntry}
              />
            )}
            
            {importState === 'url-form' && (
              <URLImportForm 
                onImport={handleImportFromURL}
                onBack={() => setImportState('options')}
              />
            )}
            
            {importState === 'importing' && (
              <ImportProgress url={url} />
            )}
            
            {importState === 'preview' && importData && (
              <ImportPreview 
                recipeData={importData}
                onSave={handleSaveImportedRecipe}
                onBack={() => setImportState('url-form')}
              />
            )}
            
            {importState === 'error' && error && (
              <ImportError 
                error={error}
                onRetry={handleRetry}
                onManualEntry={handleManualEntry}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeImportModal;