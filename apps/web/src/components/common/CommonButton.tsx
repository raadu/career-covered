import React, { type ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive';

interface CommonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  icon?: ReactNode;
  shimmer?: boolean;
  fullWidth?: boolean;
}

// 40px min-height, not derived from padding — padding can shrink for a
// denser look without silently reintroducing an undersized touch target.
const baseStyles =
  'relative flex items-center justify-center gap-2 min-h-10 px-4 text-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 overflow-hidden';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700',
  secondary:
    'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700',
  ghost:
    'px-3 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100',
  outline:
    'bg-transparent border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:border-brand-500 hover:text-brand-700 dark:hover:text-brand-300',
  destructive:
    'bg-transparent border border-danger-border dark:border-danger-border-dark text-danger-fg dark:text-danger-fg-dark hover:bg-danger-subtle dark:hover:bg-danger-subtle-dark',
};

const CommonButton = ({
  children,
  variant = 'primary',
  isLoading = false,
  icon,
  shimmer = false,
  fullWidth = false,
  className,
  disabled,
  ...props
}: CommonButtonProps) => {
  return (
    <button
      className={cn(baseStyles, variants[variant], fullWidth && 'w-full', className)}
      disabled={isLoading || disabled}
      {...props}
    >
      {shimmer && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-60 w-full h-full transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out animate-[shimmer_2s_infinite]" />
      )}

      {isLoading ? (
        <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
      ) : (
        <>
          {icon}
          <span className="relative z-10">{children}</span>
        </>
      )}
    </button>
  );
};

export default CommonButton;
