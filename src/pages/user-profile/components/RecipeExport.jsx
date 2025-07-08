import React, { useState, useContext, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import AuthContext from '../../../contexts/AuthContext';
import { exportService } from '../../../utils/exportService';

const RecipeExport = () => {
  const { user } = useContext(AuthContext);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');
  const [exportStatus, setExportStatus] = useState({ type: '', message: '' });
  const [exportOptions, setExportOptions] = useState({
    includeImages: true
  });
  
  // Ref to track if component is mounted
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleExportFormatChange = (format) => {
    setExportFormat(format);
    setExportStatus({ type: '', message: '' });
  };

  const handleOptionToggle = (option) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleExport = async () => {
    if (!user?.id) {
      setExportStatus({ type: 'error', message: 'Please log in to export recipes' });
      return;
    }

    setIsExporting(true);
    setExportStatus({ type: '', message: '' });
    
    try {
      // Export recipes using the service
      const exportData = await exportService.exportRecipes(user.id, {
        format: exportFormat,
        ...exportOptions,
        // Include all recipe types by default since we removed those options
        includeCreated: true,
        includeImported: true,
        includeFavorites: true,
        includeNotes: true
      });

      // Check if component is still mounted before updating state
      if (!isMountedRef.current) return;

      // Validate export data structure
      if (!exportData || typeof exportData.totalCount !== 'number') {
        throw new Error('Invalid export data received from server');
      }

      if (exportData.totalCount === 0) {
        setExportStatus({ type: 'warning', message: 'No recipes found matching your export criteria' });
        setIsExporting(false); // Reset loading state
        return;
      }

      // Generate file content based on format
      let content;
      let mimeType;
      
      if (exportFormat === 'json') {
        content = exportService.formatAsJSON(exportData);
        mimeType = 'application/json';
      } else if (exportFormat === 'txt') {
        content = exportService.formatAsText(exportData);
        mimeType = 'text/plain';
      } else {
        throw new Error(`Unsupported export format: ${exportFormat}`);
      }

      // Validate generated content
      if (!content || content.trim().length === 0) {
        throw new Error('Failed to generate export content');
      }

      // Generate filename and download
      const fileName = exportService.generateFileName(exportFormat, user.id);
      exportService.downloadFile(content, fileName, mimeType);

      if (isMountedRef.current) {
        setExportStatus({ 
          type: 'success', 
          message: `Successfully exported ${exportData.totalCount} recipes as ${fileName}` 
        });
      }
      
    } catch (error) {
      console.error('Export error:', error);
      
      if (isMountedRef.current) {
        // Provide more specific error messages
        let errorMessage = 'Failed to export recipes. Please try again.';
        
        if (error.name === 'NetworkError' || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('Invalid export data')) {
          errorMessage = 'Server returned invalid data. Please try again or contact support.';
        } else if (error.message.includes('Unsupported export format')) {
          errorMessage = 'Selected export format is not supported.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setExportStatus({ 
          type: 'error', 
          message: errorMessage
        });
      }
    } finally {
      if (isMountedRef.current) {
        setIsExporting(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Recipe Export</h2>
        <Icon name="Download" size={24} color="#10B981" />
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Export your entire recipe collection for backup or sharing purposes. 
            Choose your preferred format and options below.
          </p>
        </div>

        {/* Export Status */}
        {exportStatus.message && (
          <div 
            className={`p-3 rounded-lg border ${
              exportStatus.type === 'success' ? 'bg-green-50 border-green-200' :
              exportStatus.type === 'warning'? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
            }`}
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-start gap-2">
              <Icon 
                name={exportStatus.type === 'success' ? 'CheckCircle' : 
                      exportStatus.type === 'warning' ? 'AlertCircle' : 'XCircle'} 
                size={16} 
                color={exportStatus.type === 'success' ? '#10B981' : 
                       exportStatus.type === 'warning' ? '#F59E0B' : '#EF4444'} 
                className="mt-0.5" 
              />
              <div className={`text-sm ${
                exportStatus.type === 'success' ? 'text-green-800' :
                exportStatus.type === 'warning'? 'text-yellow-800' : 'text-red-800'
              }`}>
                {exportStatus.message}
              </div>
            </div>
          </div>
        )}

        {/* Export Format */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Export Format</h3>
          <div className="flex gap-4" role="radiogroup" aria-label="Export format selection">
            <button
              onClick={() => handleExportFormatChange('json')}
              className={`flex-1 p-4 rounded-lg border text-center transition-colors ${
                exportFormat === 'json' ?'border-green-500 bg-green-50 text-green-700' :'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
              role="radio"
              aria-checked={exportFormat === 'json'}
              aria-label="JSON format - structured data"
            >
              <Icon name="Code" size={24} className="mx-auto mb-2" />
              <div className="font-medium">JSON</div>
              <div className="text-sm text-gray-500">Structured data</div>
            </button>
            <button
              onClick={() => handleExportFormatChange('txt')}
              className={`flex-1 p-4 rounded-lg border text-center transition-colors ${
                exportFormat === 'txt' ?'border-green-500 bg-green-50 text-green-700' :'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
              role="radio"
              aria-checked={exportFormat === 'txt'}
              aria-label="Text format - plain text file"
            >
              <Icon name="FileText" size={24} className="mx-auto mb-2" />
              <div className="font-medium">Text</div>
              <div className="text-sm text-gray-500">Plain text file</div>
            </button>
          </div>
        </div>

        {/* Export Options */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Export Options</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Icon name="Image" size={20} color="#6B7280" />
                <div>
                  <div className="text-sm font-medium text-gray-700">Include Images</div>
                  <div className="text-sm text-gray-500">Export recipe photos</div>
                </div>
              </div>
              <button
                onClick={() => handleOptionToggle('includeImages')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  exportOptions.includeImages ? 'bg-green-500' : 'bg-gray-300'
                }`}
                role="switch"
                aria-checked={exportOptions.includeImages}
                aria-label="Include images in export"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    exportOptions.includeImages ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="pt-4">
          <Button
            onClick={handleExport}
            loading={isExporting}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2"
            aria-describedby="export-info"
          >
            <Icon name="Download" size={20} />
            {isExporting ? 'Exporting...' : `Export as ${exportFormat.toUpperCase()}`}
          </Button>
        </div>

        {/* Info Note */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg" id="export-info">
          <div className="flex items-start gap-2">
            <Icon name="Info" size={16} color="#3B82F6" className="mt-0.5" />
            <div className="text-sm text-blue-800">
              <div className="font-medium">Export Information</div>
              <div className="mt-1">
                Your recipe export will include all your recipes, favorites, and notes in the chosen format. 
                JSON format preserves all data structure, while TXT format provides a readable layout.
                The file will be automatically downloaded to your device.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeExport;