import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';

const RegistrationPrompt = () => {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate('/user-registration');
  };

  return (
    <div className="mt-8 pt-6 border-t border-border">
      <div className="text-center space-y-4">
        <p className="text-text-secondary text-sm">
          Don't have an account yet?
        </p>
        <Button
          variant="outline"
          fullWidth
          onClick={handleRegisterClick}
          iconName="UserPlus"
          iconPosition="left"
          className="h-12"
        >
          Create New Account
        </Button>
        <p className="text-xs text-text-muted">
          Join thousands of home cooks organizing their recipes
        </p>
      </div>
    </div>
  );
};

export default RegistrationPrompt;