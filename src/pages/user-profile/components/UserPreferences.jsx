import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const UserPreferences = ({ userProfile }) => {
  const [preferences, setPreferences] = useState({
    measurement_units: userProfile?.preferences?.measurement_units || 'metric',
    default_serving_size: userProfile?.preferences?.default_serving_size || 4,
    dietary_restrictions: userProfile?.preferences?.dietary_restrictions || [],
    notifications: {
      meal_reminders: userProfile?.preferences?.notifications?.meal_reminders || true,
      recipe_recommendations: userProfile?.preferences?.notifications?.recipe_recommendations || true,
      shopping_list_updates: userProfile?.preferences?.notifications?.shopping_list_updates || false
    }
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const dietaryOptions = [
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Dairy-Free',
    'Keto',
    'Paleo',
    'Low-Carb',
    'Low-Fat',
    'Nut-Free',
    'Soy-Free'
  ];

  const handleMeasurementChange = (value) => {
    setPreferences(prev => ({
      ...prev,
      measurement_units: value
    }));
  };

  const handleServingSizeChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= 20) {
      setPreferences(prev => ({
        ...prev,
        default_serving_size: value
      }));
    }
  };

  const handleDietaryRestrictionToggle = (restriction) => {
    setPreferences(prev => ({
      ...prev,
      dietary_restrictions: prev.dietary_restrictions.includes(restriction)
        ? prev.dietary_restrictions.filter(r => r !== restriction)
        : [...prev.dietary_restrictions, restriction]
    }));
  };

  const handleNotificationToggle = (type) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type]
      }
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setSuccessMessage('');
    
    try {
      // Here you would typically call an API to save preferences
      // For now, we'll simulate the save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage('Preferences saved successfully!');
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setPreferences({
      measurement_units: userProfile?.preferences?.measurement_units || 'metric',
      default_serving_size: userProfile?.preferences?.default_serving_size || 4,
      dietary_restrictions: userProfile?.preferences?.dietary_restrictions || [],
      notifications: {
        meal_reminders: userProfile?.preferences?.notifications?.meal_reminders || true,
        recipe_recommendations: userProfile?.preferences?.notifications?.recipe_recommendations || true,
        shopping_list_updates: userProfile?.preferences?.notifications?.shopping_list_updates || false
      }
    });
    setIsEditing(false);
    setSuccessMessage('');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Preferences</h2>
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2"
          >
            <Icon name="Settings" size={16} />
            Edit
          </Button>
        )}
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <Icon name="CheckCircle" size={20} color="#10B981" />
          <span className="text-green-800">{successMessage}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Measurement Units */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Measurement Units</h3>
          <div className="flex gap-4">
            <button
              onClick={() => isEditing && handleMeasurementChange('metric')}
              disabled={!isEditing}
              className={`flex-1 p-3 rounded-lg border text-center transition-colors ${
                preferences.measurement_units === 'metric' ?'border-green-500 bg-green-50 text-green-700' :'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              } ${!isEditing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
            >
              <div className="font-medium">Metric</div>
              <div className="text-sm text-gray-500">grams, liters, celsius</div>
            </button>
            <button
              onClick={() => isEditing && handleMeasurementChange('imperial')}
              disabled={!isEditing}
              className={`flex-1 p-3 rounded-lg border text-center transition-colors ${
                preferences.measurement_units === 'imperial' ?'border-green-500 bg-green-50 text-green-700' :'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              } ${!isEditing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
            >
              <div className="font-medium">Imperial</div>
              <div className="text-sm text-gray-500">cups, ounces, fahrenheit</div>
            </button>
          </div>
        </div>

        {/* Default Serving Size */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Default Serving Size</h3>
          <div className="flex items-center gap-4">
            <input
              type="number"
              min="1"
              max="20"
              value={preferences.default_serving_size}
              onChange={handleServingSizeChange}
              disabled={!isEditing}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
            <span className="text-gray-600">people</span>
          </div>
        </div>

        {/* Dietary Restrictions */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Dietary Restrictions</h3>
          <div className="grid grid-cols-2 gap-3">
            {dietaryOptions.map(option => (
              <button
                key={option}
                onClick={() => isEditing && handleDietaryRestrictionToggle(option)}
                disabled={!isEditing}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  preferences.dietary_restrictions.includes(option)
                    ? 'border-green-500 bg-green-50 text-green-700' :'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                } ${!isEditing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    preferences.dietary_restrictions.includes(option)
                      ? 'border-green-500 bg-green-500' :'border-gray-300'
                  }`}>
                    {preferences.dietary_restrictions.includes(option) && (
                      <Icon name="Check" size={12} color="white" />
                    )}
                  </div>
                  <span className="text-sm">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Notifications</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-700">Meal Reminders</div>
                <div className="text-sm text-gray-500">Get notified about planned meals</div>
              </div>
              <button
                onClick={() => isEditing && handleNotificationToggle('meal_reminders')}
                disabled={!isEditing}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.notifications.meal_reminders ? 'bg-green-500' : 'bg-gray-300'
                } ${!isEditing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    preferences.notifications.meal_reminders ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-700">Recipe Recommendations</div>
                <div className="text-sm text-gray-500">Receive personalized recipe suggestions</div>
              </div>
              <button
                onClick={() => isEditing && handleNotificationToggle('recipe_recommendations')}
                disabled={!isEditing}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.notifications.recipe_recommendations ? 'bg-green-500' : 'bg-gray-300'
                } ${!isEditing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    preferences.notifications.recipe_recommendations ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-700">Shopping List Updates</div>
                <div className="text-sm text-gray-500">Notify when shopping list changes</div>
              </div>
              <button
                onClick={() => isEditing && handleNotificationToggle('shopping_list_updates')}
                disabled={!isEditing}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.notifications.shopping_list_updates ? 'bg-green-500' : 'bg-gray-300'
                } ${!isEditing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    preferences.notifications.shopping_list_updates ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              loading={isLoading}
              className="flex-1"
            >
              Save Preferences
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPreferences;