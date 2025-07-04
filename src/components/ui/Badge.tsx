import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'md',
  dot = false,
  icon,
  children,
  className,
  ...props
}) => {
  const baseClasses = [
    'inline-flex items-center font-medium rounded-full',
    'transition-all duration-200',
  ];

  const variantClasses = {
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    neutral: 'bg-gray-100 text-gray-800',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const iconClasses = cn(
    'flex-shrink-0',
    size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
  );

  const dotClasses = cn(
    'w-2 h-2 rounded-full mr-2',
    variant === 'primary' && 'bg-primary-500',
    variant === 'secondary' && 'bg-secondary-500',
    variant === 'success' && 'bg-green-500',
    variant === 'warning' && 'bg-yellow-500',
    variant === 'error' && 'bg-red-500',
    variant === 'neutral' && 'bg-gray-500'
  );

  const classes = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  return (
    <span className={classes} {...props}>
      {dot && <span className={dotClasses} />}
      {icon && (
        <span className={cn(iconClasses, children ? 'mr-1.5' : '')}>
          {icon}
        </span>
      )}
      {children}
    </span>
  );
};

export default Badge;
