import React, { forwardRef, useState } from "react";
import Icon from "../AppIcon";

const Input = forwardRef(({ 
  className = "", 
  type = "text", 
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  onIconClick,
  showPasswordToggle = false,
  ...props 
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Handle password visibility toggle
  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  // Handle icon click
  const handleIconClick = (e) => {
    if (onIconClick) {
      e.preventDefault();
      onIconClick();
    }
  };

  // Base input classes
  const getBaseClasses = () => {
    const baseClasses = [
      "flex h-10 w-full rounded-md border px-3 py-2 text-base",
      "bg-white text-gray-900 placeholder:text-gray-500",
      "focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
      "transition-colors duration-200",
      "md:text-sm"
    ];

    // Border and focus states
    if (error) {
      baseClasses.push("border-red-300 focus:border-red-500 focus:ring-red-500");
    } else if (isFocused) {
      baseClasses.push("border-green-300 focus:border-green-500");
    } else {
      baseClasses.push("border-gray-300 hover:border-gray-400");
    }

    // Icon positioning
    if (icon && iconPosition === "left") {
      baseClasses.push("pl-10");
    }
    if (icon && iconPosition === "right") {
      baseClasses.push("pr-10");
    }
    if (showPasswordToggle) {
      baseClasses.push("pr-10");
    }

    return baseClasses.join(" ");
  };

  // Checkbox-specific styles
  if (type === "checkbox") {
    return (
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          className={`
            h-4 w-4 rounded border-gray-300 text-green-600
            focus:ring-2 focus:ring-green-500 focus:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50
            ${error ? 'border-red-300 focus:ring-red-500' : ''}
            ${className}
          `.trim()}
          ref={ref}
          disabled={disabled || loading}
          {...props}
        />
        {label && (
          <label className="text-sm font-medium text-gray-700 disabled:text-gray-500">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
      </div>
    );
  }

  // Radio button-specific styles
  if (type === "radio") {
    return (
      <div className="flex items-center space-x-2">
        <input
          type="radio"
          className={`
            h-4 w-4 rounded-full border-gray-300 text-green-600
            focus:ring-2 focus:ring-green-500 focus:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50
            ${error ? 'border-red-300 focus:ring-red-500' : ''}
            ${className}
          `.trim()}
          ref={ref}
          disabled={disabled || loading}
          {...props}
        />
        {label && (
          <label className="text-sm font-medium text-gray-700 disabled:text-gray-500">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
      </div>
    );
  }

  // Password input with toggle
  const inputType = type === "password" && showPasswordToggle ? (showPassword ?"text" : "password") 
    : type;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Left Icon */}
        {icon && iconPosition === "left" && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <button
              type="button"
              onClick={handleIconClick}
              className={`
                text-gray-400 hover:text-gray-600 transition-colors
                ${onIconClick ? 'cursor-pointer' : 'cursor-default'}
              `}
              disabled={!onIconClick}
            >
              <Icon name={icon} size={18} />
            </button>
          </div>
        )}

        {/* Input Field */}
        <input
          type={inputType}
          className={`${getBaseClasses()} ${className}`}
          ref={ref}
          disabled={disabled || loading}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${props.id || 'input'}-error` : helperText ? `${props.id || 'input'}-helper` : undefined}
          {...props}
        />

        {/* Right Icon or Password Toggle */}
        {(icon && iconPosition === "right") || showPasswordToggle ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {showPasswordToggle ? (
              <button
                type="button"
                onClick={handlePasswordToggle}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <Icon 
                  name={showPassword ? "EyeOff" : "Eye"} 
                  size={18} 
                />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleIconClick}
                className={`
                  text-gray-400 hover:text-gray-600 transition-colors
                  ${onIconClick ? 'cursor-pointer' : 'cursor-default'}
                `}
                disabled={!onIconClick}
              >
                <Icon name={icon} size={18} />
              </button>
            )}
          </div>
        ) : null}

        {/* Loading Indicator */}
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin">
              <Icon name="Loader2" size={18} color="#6b7280" />
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p 
          id={`${props.id || 'input'}-error`}
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p 
          id={`${props.id || 'input'}-helper`}
          className="mt-1 text-sm text-gray-500"
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";

export default Input;
