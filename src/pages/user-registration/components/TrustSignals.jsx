import React from 'react';
import Icon from '../../../components/AppIcon';

const TrustSignals = () => {
  return (
    <div className="mt-8 pt-6 border-t border-border">
      <div className="flex flex-col items-center space-y-4">
        {/* Security Badge */}
        <div className="flex items-center space-x-2 text-sm text-text-secondary">
          <div className="flex items-center justify-center w-8 h-8 bg-success-50 rounded-full">
            <Icon name="Shield" size={16} color="var(--color-success)" />
          </div>
          <span>Your data is protected with SSL encryption</span>
        </div>

        {/* Privacy Policy Link */}
        <div className="text-center">
          <p className="text-xs text-text-muted">
            By creating an account, you agree to our{' '}
            <button className="text-primary hover:text-primary-600 underline transition-colors">
              Privacy Policy
            </button>
            {' '}and{' '}
            <button className="text-primary hover:text-primary-600 underline transition-colors">
              Terms of Service
            </button>
          </p>
        </div>

        {/* Security Features */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          <div className="flex items-center space-x-2 text-xs text-text-secondary">
            <Icon name="Lock" size={14} color="var(--color-success)" />
            <span>Secure Login</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-text-secondary">
            <Icon name="Database" size={14} color="var(--color-success)" />
            <span>Private Recipes</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-text-secondary">
            <Icon name="UserCheck" size={14} color="var(--color-success)" />
            <span>Account Control</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-text-secondary">
            <Icon name="Smartphone" size={14} color="var(--color-success)" />
            <span>Mobile Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustSignals;