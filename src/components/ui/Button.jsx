import React from 'react';
import Icon from '../AppIcon';

const Button = React.forwardRef(({
    children,
    variant = 'primary',
    size = 'md',
    shape = 'rounded',
    fullWidth = false,
    disabled = false,
    loading = false,
    icon = null,
    iconName = null,
    iconPosition = 'left',
    type = 'button',
    iconSize = null,
    iconColor = null,
    className = '',
    onClick,
    ...rest
}, ref) => {
    // Base classes
    const baseClasses = 'inline-flex items-center justify-center transition-all duration-200 font-medium focus:ring-2 focus:outline-none focus:ring-offset-2';

    // Size classes
    const sizeClasses = {
        '2xs': 'text-xs py-0.5 px-1.5',
        xs: 'text-xs py-1 px-2',
        sm: 'text-sm py-1.5 px-3',
        md: 'text-base py-2 px-4',
        lg: 'text-lg py-2.5 px-5',
        xl: 'text-xl py-3 px-6',
        '2xl': 'text-2xl py-4 px-8',
    };

    // Shape classes
    const shapeClasses = {
        rounded: 'rounded',
        square: 'rounded-none',
        pill: 'rounded-full',
        circle: 'rounded-full aspect-square',
    };

    // Variant classes with fallback colors
    const variantClasses = {
        primary: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
        secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
        success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-400',
        danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400',
        warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400',
        info: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-400',
        ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-400',
        link: 'text-blue-600 underline hover:text-blue-700 p-0 focus:ring-blue-400',
        outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-400',
        text: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-400',
    };

    // Width classes
    const widthClasses = fullWidth ? 'w-full' : '';

    // Disabled classes
    const disabledClasses = (disabled || loading) ? 'cursor-not-allowed opacity-60' : '';

    // Loading spinner
    const LoadingSpinner = () => (
        <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
            />
            <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
    );

    // Icon rendering
    const renderIcon = () => {
        if (iconName) {
            const iconSizeMap = {
                '2xs': 12,
                xs: 14,
                sm: 16,
                md: 18,
                lg: 20,
                xl: 22,
                '2xl': 24,
            };

            const calculatedSize = iconSize || iconSizeMap[size] || 18;
            const iconColorValue = iconColor || 'currentColor';

            return (
                <Icon
                    name={iconName}
                    size={calculatedSize}
                    color={iconColorValue}
                    className={`${children ? (iconPosition === 'left' ? 'mr-2' : 'ml-2') : ''}`}
                />
            );
        }

        if (icon) {
            return React.cloneElement(icon, {
                className: `${children ? (iconPosition === 'left' ? 'mr-2' : 'ml-2') : ''} h-5 w-5`,
                color: iconColor || 'currentColor'
            });
        }

        return null;
    };

    // Combine all classes
    const classes = [
        baseClasses,
        sizeClasses[size] || sizeClasses.md,
        shapeClasses[shape] || shapeClasses.rounded,
        variantClasses[variant] || variantClasses.primary,
        widthClasses,
        disabledClasses,
        className
    ].filter(Boolean).join(' ');

    const isDisabled = disabled || loading;

    return (
        <button
            ref={ref}
            type={type}
            className={classes}
            disabled={isDisabled}
            onClick={onClick}
            aria-disabled={isDisabled}
            aria-busy={loading}
            {...rest}
        >
            {loading && <LoadingSpinner />}
            {(icon || iconName) && iconPosition === 'left' && renderIcon()}
            {children}
            {(icon || iconName) && iconPosition === 'right' && renderIcon()}
        </button>
    );
});

Button.displayName = 'Button';

export default Button;