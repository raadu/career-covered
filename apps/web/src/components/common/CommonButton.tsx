import React, { type ReactNode } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ButtonVariant = 
  | "primary" 
  | "secondary" 
  | "ghost" 
  | "outline" 
  | "gradient" 
  | "dark" 
  | "cyan";

interface CommonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  icon?: ReactNode;
  shimmer?: boolean;
  fullWidth?: boolean;
}

const CommonButton = ({
  children,
  variant = "primary",
  isLoading = false,
  icon,
  shimmer = false,
  fullWidth = false,
  className,
  disabled,
  ...props
}: CommonButtonProps) => {
  const baseStyles = "relative flex items-center justify-center gap-2 rounded-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 overflow-hidden shadow-sm";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 h-9 px-4 text-xs",
    secondary: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 h-9 px-4 text-xs",
    dark: "bg-gray-800 dark:bg-gray-600 text-white hover:bg-black dark:hover:bg-gray-500 h-9 px-3 text-xs font-bold",
    ghost: "text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 h-auto p-1.5 text-[10px] uppercase tracking-wider font-bold shadow-none",
    outline: "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-blue-200 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 h-8 px-3 text-[11px] font-semibold",
    gradient: "bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 text-white hover:from-cyan-600 hover:to-violet-700 h-9 px-4 text-xs shadow-cyan-500/20",
    cyan: "bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 h-9 px-3 text-xs",
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        fullWidth && "w-full",
        className
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {shimmer && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-60 w-full h-full transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out animate-[shimmer_2s_infinite]" />
      )}
      
      {isLoading ? (
        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
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
