import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  children,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = [
    'inline-flex items-center justify-center font-semibold rounded-lg',
    'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'active:scale-95',
  ];

  const variantClasses = {
    primary: [
      'bg-gradient-primary text-white',
      'hover:shadow-lg focus:ring-primary-500',
      'shadow-primary',
    ],
    secondary: [
      'bg-white text-gray-600 border-2 border-gray-200',
      'hover:border-gray-300 hover:bg-gray-50',
      'focus:ring-gray-500',
    ],
    ghost: [
      'bg-transparent text-primary-500',
      'hover:bg-primary-50',
      'focus:ring-primary-500',
    ],
    danger: [
      'bg-red-500 text-white',
      'hover:bg-red-600 focus:ring-red-500',
      'shadow-md hover:shadow-lg',
    ],
  };

  const sizeClasses = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-6 text-base',
    lg: 'py-4 px-8 text-lg',
  };

  const classes = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  const iconClasses = cn(
    'flex-shrink-0',
    size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
  );

  const LoadingSpinner = () => (
    <svg
      className={cn('animate-spin', iconClasses)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
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

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {!loading && icon && iconPosition === 'left' && (
        <span className={cn(iconClasses, 'mr-2')}>{icon}</span>
      )}
      {children}
      {!loading && icon && iconPosition === 'right' && (
        <span className={cn(iconClasses, 'ml-2')}>{icon}</span>
      )}
    </button>
  );
};

export default Button;
