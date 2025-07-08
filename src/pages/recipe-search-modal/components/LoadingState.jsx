import React from 'react';

const LoadingState = () => {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Image Skeleton */}
            <div className="aspect-video bg-gray-200 animate-pulse"></div>
            
            {/* Content Skeleton */}
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
              
              <div className="flex items-center justify-between pt-2">
                <div className="flex space-x-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-12"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-8"></div>
                </div>
                <div className="h-5 bg-gray-200 rounded animate-pulse w-16"></div>
              </div>
              
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingState;