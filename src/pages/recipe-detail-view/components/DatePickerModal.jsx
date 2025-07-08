import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import mealPlanService from '../../../utils/mealPlanService';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const DatePickerModal = ({ isOpen, onClose, onDateSelect, recipe }) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = previous week, 1 = next week

  // Get week dates based on offset
  const getWeekDates = (offset = 0) => {
    const today = new Date();
    const week = [];
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (offset * 7));
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDates = getWeekDates(weekOffset);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Get week title based on offset
  const getWeekTitle = () => {
    if (weekOffset === 0) return "This Week's Dinners";
    if (weekOffset === -1) return "Last Week's Dinners";
    if (weekOffset === 1) return "Next Week's Dinners";
    
    const firstDay = weekDates[0];
    const lastDay = weekDates[6];
    const monthName = firstDay.toLocaleDateString('en-US', { month: 'short' });
    const endMonthName = lastDay.toLocaleDateString('en-US', { month: 'short' });
    
    if (monthName === endMonthName) {
      return `${monthName} ${firstDay.getDate()}-${lastDay.getDate()}`;
    } else {
      return `${monthName} ${firstDay.getDate()} - ${endMonthName} ${lastDay.getDate()}`;
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setError('');
    setSuccess('');
  };

  const handlePreviousWeek = () => {
    setWeekOffset(prev => prev - 1);
    setSelectedDate(null); // Clear selection when changing weeks
  };

  const handleNextWeek = () => {
    setWeekOffset(prev => prev + 1);
    setSelectedDate(null); // Clear selection when changing weeks
  };

  const handleSubmit = async () => {
    if (!selectedDate || !user?.id || !recipe?.id) return;

    setIsSubmitting(true);
    setError('');

    try {
      const mealPlanData = {
        user_id: user.id,
        recipe_id: recipe.id,
        planned_date: selectedDate.toISOString().split('T')[0],
        meal_type: 'dinner',
        servings: recipe.servings || 4
      };

      const result = await mealPlanService.createMealPlan(mealPlanData);

      if (result?.success) {
        setSuccess(`Added "${recipe.title}" to ${dayNames[selectedDate.getDay()]} dinner!`);
        onDateSelect(selectedDate);
        
        // Close modal after success
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(result?.error || 'Failed to add recipe to meal plan');
      }
    } catch (err) {
      setError('An error occurred while adding the recipe');
      console.error('Error adding recipe to meal plan:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl my-8 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Add to Meal Plan
            </h2>
            <p className="text-gray-600 mt-1">
              Select a day for "{recipe?.title}"
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
            disabled={isSubmitting}
          >
            <Icon name="X" size={20} className="text-gray-500" />
          </Button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Check" size={24} className="text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Recipe Added Successfully!
                </h3>
                <p className="text-gray-600">{success}</p>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="space-y-3">
                  {/* Week Navigation Header */}
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePreviousWeek}
                      disabled={isSubmitting}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <Icon name="ChevronLeft" size={20} className="text-gray-600" />
                    </Button>
                    
                    <h3 className="text-lg font-medium text-gray-900 text-center flex-1">
                      {getWeekTitle()}
                    </h3>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleNextWeek}
                      disabled={isSubmitting}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <Icon name="ChevronRight" size={20} className="text-gray-600" />
                    </Button>
                  </div>
                  
                  {weekDates.map((date, index) => (
                    <button
                      key={date.toISOString()}
                      onClick={() => handleDateSelect(date)}
                      disabled={isPastDate(date) || isSubmitting}
                      className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
                        isPastDate(date)
                          ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                          : selectedDate?.toDateString() === date.toDateString()
                          ? 'bg-orange-50 border-orange-500 text-orange-700' :'bg-gray-50 border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-left">
                          <div className="font-medium">
                            {dayNames[index]}
                            {isToday(date) && (
                              <span className="ml-2 text-xs bg-orange-500 text-white px-2 py-1 rounded-full">
                                Today
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {date.toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                        </div>
                      </div>
                      
                      {selectedDate?.toDateString() === date.toDateString() && (
                        <Icon name="Check" size={20} className="text-orange-600" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer - Fixed */}
        {!success && (
          <div className="p-6 border-t border-gray-200 flex-shrink-0">
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selectedDate || isSubmitting}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Adding...</span>
                  </div>
                ) : (
                  'Add to Meal Plan'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatePickerModal;