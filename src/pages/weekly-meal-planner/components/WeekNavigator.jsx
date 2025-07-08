import React from 'react';
import Button from '../../../components/ui/Button';

const WeekNavigator = ({ currentWeek, onPreviousWeek, onNextWeek, onTodayClick }) => {
  const formatWeekRange = (startDate) => {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
    const startDay = startDate.getDate();
    const endDay = endDate.getDate();
    const year = startDate.getFullYear();
    
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay}-${endDay}, ${year}`;
    } else {
      return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
    }
  };

  const getWeekStartDate = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    return startOfWeek;
  };

  const isCurrentWeek = () => {
    const today = new Date();
    const todayWeekStart = getWeekStartDate(today);
    const currentWeekStart = getWeekStartDate(currentWeek);
    
    return todayWeekStart.toDateString() === currentWeekStart.toDateString();
  };

  return (
    <div className="flex items-center justify-between py-4 px-4 bg-background border-b border-border">
      <Button
        variant="ghost"
        size="sm"
        onClick={onPreviousWeek}
        iconName="ChevronLeft"
        className="px-2"
        aria-label="Previous week"
      />
      
      <div className="flex flex-col items-center space-y-1">
        <h2 className="text-lg font-heading font-semibold text-text-primary">
          {formatWeekRange(getWeekStartDate(currentWeek))}
        </h2>
        {!isCurrentWeek() && (
          <Button
            variant="ghost"
            size="xs"
            onClick={onTodayClick}
            className="text-xs text-orange-600 hover:text-orange-700"
          >
            Go to This Week
          </Button>
        )}
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onNextWeek}
        iconName="ChevronRight"
        className="px-2"
        aria-label="Next week"
      />
    </div>
  );
};

export default WeekNavigator;