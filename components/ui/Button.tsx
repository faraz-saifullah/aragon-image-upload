import React from 'react';
import { theme } from '@/lib/theme';

type ButtonVariant = 'gradient-primary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  'gradient-primary': `text-white font-semibold`,
  outline: 'border-2 border-neutral-300 text-neutral-700 font-medium hover:border-neutral-400',
  ghost: 'text-neutral-700 hover:bg-neutral-100',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  variant = 'gradient-primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center rounded-lg transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const style = variant === 'gradient-primary' ? { background: theme.colors.primary.gradient } : {};

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
}
