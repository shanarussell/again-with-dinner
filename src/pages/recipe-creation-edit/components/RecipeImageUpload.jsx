import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const RecipeImageUpload = ({ image, onImageChange, onImageRemove }) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file.type.startsWith('image/')) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageChange(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select a valid image file');
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // Check if image is a data URL (new upload) or existing URL
  const isNewImageUpload = image && image.startsWith('data:');
  const isExistingImage = image && !image.startsWith('data:');

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-text-primary">
        Recipe Photo
      </label>
      
      {image ? (
        <div className="relative">
          <div className="w-full h-48 rounded-lg overflow-hidden bg-surface-100">
            <Image
              src={image}
              alt="Recipe preview"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-2 right-2 flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={openFileDialog}
              className="bg-background/80 backdrop-blur-sm"
              iconName="Edit"
              title="Change image"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={onImageRemove}
              className="bg-background/80 backdrop-blur-sm text-error hover:text-error"
              iconName="Trash2"
              title="Remove image"
            />
          </div>
          {isNewImageUpload && (
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-primary/90 text-white text-xs rounded-md">
              New image uploaded
            </div>
          )}
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
            dragActive
              ? 'border-primary bg-primary-50' :'border-border hover:border-primary hover:bg-surface-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center">
              <Icon name="Camera" size={24} color="var(--color-text-secondary)" />
            </div>
            <div className="space-y-2">
              <p className="text-text-primary font-medium">Add a photo of your recipe</p>
              <p className="text-sm text-text-secondary">
                Drag and drop an image here, or click to select
              </p>
            </div>
            <Button
              variant="outline"
              onClick={openFileDialog}
              iconName="Upload"
              iconPosition="left"
            >
              Choose Photo
            </Button>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  );
};

export default RecipeImageUpload;