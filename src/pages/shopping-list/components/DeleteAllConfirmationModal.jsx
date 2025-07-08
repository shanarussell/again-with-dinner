import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DeleteAllConfirmationModal = ({ isOpen, onClose, onConfirm, itemCount }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
              <Icon name="Trash2" size={24} color="#DC2626" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Delete All Items
              </h3>
              <p className="text-sm text-gray-600">
                This action cannot be undone
              </p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-900">
              Are you sure you want to delete all{' '}
              <span className="font-medium">{itemCount} items</span> from your shopping list?
            </p>
            <p className="text-sm text-gray-600 mt-2">
              This will permanently remove all items from your current shopping list.
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
              Delete All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAllConfirmationModal;