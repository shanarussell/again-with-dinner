import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const RegistrationForm = ({ onRegister, isLoading, disabled }) => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
    };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Real-time validation
    if (name === 'email' && value) {
      if (!validateEmail(value)) {
        setErrors(prev => ({
          ...prev,
          email: 'Please enter a valid email address'
        }));
      }
    }

    if (name === 'confirmPassword' && value) {
      if (value !== formData.password) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: 'Passwords do not match'
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = 'Password must meet all requirements';
      }
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});
    
    try {
      // Use AuthContext signUp function with Supabase
      const result = await signUp(formData.email, formData.password, {
        full_name: formData.fullName
      });
      
      if (result?.success) {
        // Registration successful - redirect to dashboard
        navigate('/recipe-dashboard');
      } else {
        // Handle registration errors
        setErrors({
          submit: result?.error || 'Registration failed. Please try again.'
        });
      }
    } catch (error) {
      setErrors({
        submit: 'Something went wrong during registration. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordValidation = validatePassword(formData.password);

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-text-primary mb-2">
            Full Name
          </label>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={handleInputChange}
            className={errors.fullName ? 'border-error' : ''}
            required
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-error flex items-center">
              <Icon name="AlertCircle" size={16} className="mr-1" />
              {errors.fullName}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
            Email Address
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleInputChange}
            className={errors.email ? 'border-error' : ''}
            required
          />
          {errors.email && (
            <p className="mt-1 text-sm text-error flex items-center">
              <Icon name="AlertCircle" size={16} className="mr-1" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleInputChange}
              className={`pr-12 ${errors.password ? 'border-error' : ''}`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} />
            </button>
          </div>
          
          {formData.password && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center text-xs">
                <Icon 
                  name={passwordValidation.minLength ? 'Check' : 'X'} 
                  size={14} 
                  color={passwordValidation.minLength ? 'var(--color-success)' : 'var(--color-error)'} 
                  className="mr-1"
                />
                <span className={passwordValidation.minLength ? 'text-success' : 'text-error'}>
                  At least 8 characters
                </span>
              </div>
              <div className="flex items-center text-xs">
                <Icon 
                  name={passwordValidation.hasUpperCase ? 'Check' : 'X'} 
                  size={14} 
                  color={passwordValidation.hasUpperCase ? 'var(--color-success)' : 'var(--color-error)'} 
                  className="mr-1"
                />
                <span className={passwordValidation.hasUpperCase ? 'text-success' : 'text-error'}>
                  One uppercase letter
                </span>
              </div>
              <div className="flex items-center text-xs">
                <Icon 
                  name={passwordValidation.hasLowerCase ? 'Check' : 'X'} 
                  size={14} 
                  color={passwordValidation.hasLowerCase ? 'var(--color-success)' : 'var(--color-error)'} 
                  className="mr-1"
                />
                <span className={passwordValidation.hasLowerCase ? 'text-success' : 'text-error'}>
                  One lowercase letter
                </span>
              </div>
              <div className="flex items-center text-xs">
                <Icon 
                  name={passwordValidation.hasNumbers ? 'Check' : 'X'} 
                  size={14} 
                  color={passwordValidation.hasNumbers ? 'var(--color-success)' : 'var(--color-error)'} 
                  className="mr-1"
                />
                <span className={passwordValidation.hasNumbers ? 'text-success' : 'text-error'}>
                  One number
                </span>
              </div>
              <div className="flex items-center text-xs">
                <Icon 
                  name={passwordValidation.hasSpecialChar ? 'Check' : 'X'} 
                  size={14} 
                  color={passwordValidation.hasSpecialChar ? 'var(--color-success)' : 'var(--color-error)'} 
                  className="mr-1"
                />
                <span className={passwordValidation.hasSpecialChar ? 'text-success' : 'text-error'}>
                  One special character
                </span>
              </div>
            </div>
          )}
          
          {errors.password && (
            <p className="mt-1 text-sm text-error flex items-center">
              <Icon name="AlertCircle" size={16} className="mr-1" />
              {errors.password}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`pr-12 ${errors.confirmPassword ? 'border-error' : ''}`}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} size={20} />
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-error flex items-center">
              <Icon name="AlertCircle" size={16} className="mr-1" />
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="p-3 bg-error-50 border border-error-200 rounded-lg">
            <p className="text-sm text-error flex items-center">
              <Icon name="AlertCircle" size={16} className="mr-2" />
              {errors.submit}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
          className="h-12"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>
    </div>
  );
};

export default RegistrationForm;