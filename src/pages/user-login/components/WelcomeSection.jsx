import React from 'react';
import Icon from '../../../components/AppIcon';

const WelcomeSection = () => {
  return (
    <div className="text-center space-y-4 mb-8">
      {/* Welcome Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
          <Icon name="ChefHat" size={32} color="var(--color-primary)" />
        </div>
      </div>

      {/* Welcome Text */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-text-primary">
          Welcome Back
        </h1>
        <p className="text-text-secondary text-base md:text-lg">
          Sign in to access your personal recipe collection
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-border">
        <div className="text-center">
          <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Icon name="Shield" size={20} color="var(--color-success)" />
          </div>
          <p className="text-xs text-text-secondary font-medium">Secure</p>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Icon name="BookOpen" size={20} color="var(--color-accent)" />
          </div>
          <p className="text-xs text-text-secondary font-medium">Organized</p>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Icon name="Calendar" size={20} color="var(--color-primary)" />
          </div>
          <p className="text-xs text-text-secondary font-medium">Planned</p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;