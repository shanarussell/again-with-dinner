import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import logger from '../../../utils/logger';

const DeleteAccount = () => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteRequest = () => {
    setShowConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (confirmationText.toLowerCase() !== 'delete my account') {
      return;
    }

    setIsDeleting(true);
    
    try {
      // Simulate account deletion process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, this would call the delete account API
      logger.info('Account deletion would be processed here');
      
      // Redirect to login or show success message
      
    } catch (error) {
      logger.error('Account deletion error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setConfirmationText('');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-red-900">Delete Account</h2>
        <Icon name="AlertTriangle" size={24} color="#EF4444" />
      </div>

      {!showConfirmation ? (
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Icon name="AlertTriangle" size={20} color="#EF4444" className="mt-0.5" />
              <div className="text-sm text-red-800">
                <div className="font-medium">Warning: This action is irreversible</div>
                <div className="mt-1">
                  Deleting your account will permanently remove all your recipes, meal plans, 
                  shopping lists, and personal data. This action cannot be undone.
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">What will be deleted:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Icon name="X" size={16} color="#EF4444" />
                All your saved recipes and favorites
              </li>
              <li className="flex items-center gap-2">
                <Icon name="X" size={16} color="#EF4444" />
                Your meal plans and planning history
              </li>
              <li className="flex items-center gap-2">
                <Icon name="X" size={16} color="#EF4444" />
                Shopping lists and preferences
              </li>
              <li className="flex items-center gap-2">
                <Icon name="X" size={16} color="#EF4444" />
                Personal notes and recipe modifications
              </li>
              <li className="flex items-center gap-2">
                <Icon name="X" size={16} color="#EF4444" />
                Account settings and preferences
              </li>
            </ul>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleDeleteRequest}
              variant="danger"
              className="w-full"
            >
              I understand, delete my account
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Icon name="AlertTriangle" size={20} color="#EF4444" className="mt-0.5" />
              <div className="text-sm text-red-800">
                <div className="font-medium">Final Confirmation Required</div>
                <div className="mt-1">
                  To confirm account deletion, please type "delete my account" 
                  (without quotes) in the field below.
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmation Text
            </label>
            <input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Type: delete my account"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleConfirmDelete}
              disabled={confirmationText.toLowerCase() !== 'delete my account' || isDeleting}
              loading={isDeleting}
              variant="danger"
              className="flex-1"
            >
              {isDeleting ? 'Deleting Account...' : 'Delete Account'}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              disabled={isDeleting}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteAccount;