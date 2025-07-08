import React, { useState, useEffect } from 'react';

const ImportProgress = ({ url }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const steps = [
    { id: 1, label: 'Accessing webpage...', duration: 800 },
    { id: 2, label: 'Analyzing recipe content...', duration: 600 },
    { id: 3, label: 'Extracting ingredients...', duration: 500 },
    { id: 4, label: 'Processing instructions...', duration: 400 },
    { id: 5, label: 'Finalizing import...', duration: 300 }
  ];

  useEffect(() => {
    let stepIndex = 0;
    let progressValue = 0;

    const runStep = () => {
      if (stepIndex < steps.length) {
        const step = steps[stepIndex];
        setCurrentStep(step.label);
        
        const stepProgress = (stepIndex + 1) / steps.length * 100;
        const interval = setInterval(() => {
          progressValue += 2;
          if (progressValue >= stepProgress) {
            setProgress(stepProgress);
            clearInterval(interval);
            stepIndex++;
            setTimeout(runStep, 100);
          } else {
            setProgress(progressValue);
          }
        }, step.duration / 50);
      }
    };

    runStep();
  }, []);

  return (
    <div className="space-y-6 text-center">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Importing Recipe
        </h3>
        <p className="text-gray-600">
          Please wait while we extract the recipe details
        </p>
      </div>

      {/* Progress Animation */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-gray-200 rounded-full animate-spin">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-green-600 rounded-full animate-pulse" 
                 style={{ borderTopColor: 'transparent' }}></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 font-medium">
          {currentStep}
        </p>
        <p className="text-xs text-gray-500">
          {Math.round(progress)}% complete
        </p>
      </div>

      {/* Source URL */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600 mb-1">Importing from:</p>
        <p className="text-sm font-medium text-gray-900 break-all">
          {url}
        </p>
      </div>

      {/* Tips */}
      <div className="text-left bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          💡 Did you know?
        </h4>
        <p className="text-sm text-blue-800">
          You can edit all imported recipe details after the import is complete. 
          We'll extract as much information as possible, but you can always fine-tune it to your preferences.
        </p>
      </div>
    </div>
  );
};

export default ImportProgress;