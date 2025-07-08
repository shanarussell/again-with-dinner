import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';

const LoginRedirect = () => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate('/user-login');
  };

  return (
    <div className="mt-8 text-center">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-background text-text-secondary">
            Already have an account?
          </span>
        </div>
      </div>
      
      <div className="mt-6">
        <Button
          variant="outline"
          fullWidth
          onClick={handleLoginRedirect}
          className="h-12"
        >
          Sign In to Your Account
        </Button>
      </div>
    </div>
  );
};

export default LoginRedirect;