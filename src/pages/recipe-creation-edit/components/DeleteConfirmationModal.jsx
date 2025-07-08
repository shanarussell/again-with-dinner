import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, recipeName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-300">
      <div className="bg-background rounded-lg shadow-modal max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-error-50 rounded-full flex items-center justify-center">
              <Icon name="Trash2" size={24} color="var(--color-error)" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">
                Delete Recipe
              </h3>
              <p className="text-sm text-text-secondary">
                This action cannot be undone
              </p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-text-primary">
              Are you sure you want to delete{' '}
              <span className="font-medium">"{recipeName}"</span>?
            </p>
            <p className="text-sm text-text-secondary mt-2">
              This recipe will be permanently removed from your collection.
            </p>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={onConfirm}
              className="flex-1"
              iconName="Trash2"
              iconPosition="left"
            >
              Delete Recipe
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;