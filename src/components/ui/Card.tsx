import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated' | 'gradient';
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  hover = false,
  padding = 'md',
  children,
  className,
  ...props
}) => {
  const baseClasses = [
    'rounded-xl transition-all duration-300',
  ];

  const variantClasses = {
    default: [
      'bg-white border border-gray-100 shadow-card',
    ],
    outlined: [
      'bg-white border-2 border-gray-200',
    ],
    elevated: [
      'bg-white shadow-large',
    ],
    gradient: [
      'bg-gradient-to-br from-primary-50 via-white to-secondary-50',
      'border border-gray-100',
    ],
  };

  const hoverClasses = hover ? [
    'hover:shadow-large hover:-translate-y-1',
    'cursor-pointer',
  ] : [];

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  const classes = cn(
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    hoverClasses,
    className
  );

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

// Card Sub-components
export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={cn('mb-6', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className,
  ...props
}) => (
  <h3 className={cn('text-2xl font-bold text-gray-900 mb-2', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className,
  ...props
}) => (
  <p className={cn('text-gray-600 leading-relaxed', className)} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={cn('', className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={cn('mt-6 pt-6 border-t border-gray-100', className)} {...props}>
    {children}
  </div>
);

export default Card;
