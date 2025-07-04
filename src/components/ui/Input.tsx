import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  variant = 'default',
  size = 'md',
  className,
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const baseClasses = [
    'w-full border-2 rounded-lg transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-primary-100',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'placeholder:text-gray-400',
  ];

  const variantClasses = {
    default: [
      'bg-white border-gray-200',
      'hover:border-gray-300',
      'focus:border-primary-500',
    ],
    filled: [
      'bg-gray-50 border-gray-200',
      'hover:bg-gray-100 hover:border-gray-300',
      'focus:bg-white focus:border-primary-500',
    ],
    outlined: [
      'bg-transparent border-gray-300',
      'hover:border-gray-400',
      'focus:border-primary-500',
    ],
  };

  const sizeClasses = {
    sm: 'py-2 px-3 text-sm',
    md: 'py-3 px-4 text-base',
    lg: 'py-4 px-5 text-lg',
  };

  const errorClasses = error ? [
    'border-red-500 focus:border-red-500 focus:ring-red-100',
  ] : [];

  const iconPaddingClasses = {
    left: leftIcon ? (size === 'sm' ? 'pl-10' : size === 'lg' ? 'pl-14' : 'pl-12') : '',
    right: rightIcon ? (size === 'sm' ? 'pr-10' : size === 'lg' ? 'pr-14' : 'pr-12') : '',
  };

  const inputClasses = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    errorClasses,
    iconPaddingClasses.left,
    iconPaddingClasses.right,
    className
  );

  const iconClasses = cn(
    'absolute top-1/2 transform -translate-y-1/2 pointer-events-none',
    size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5',
    error ? 'text-red-500' : 'text-gray-400'
  );

  const leftIconClasses = cn(
    iconClasses,
    size === 'sm' ? 'left-3' : size === 'lg' ? 'left-5' : 'left-4'
  );

  const rightIconClasses = cn(
    iconClasses,
    size === 'sm' ? 'right-3' : size === 'lg' ? 'right-5' : 'right-4'
  );

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className={leftIconClasses}>
            {leftIcon}
          </div>
        )}
        
        <input
          id={inputId}
          className={inputClasses}
          {...props}
        />
        
        {rightIcon && (
          <div className={rightIconClasses}>
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
