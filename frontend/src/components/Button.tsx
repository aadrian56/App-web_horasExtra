import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 min-w-[44px] min-h-[44px] px-4 py-2 text-sm shadow-sm';
  
  const variants = {
    primary: 'bg-sucua-green text-white hover:bg-teal-800 focus:ring-sucua-green active:scale-95',
    secondary: 'bg-sucua-yellow text-slate-900 hover:bg-amber-600 focus:ring-sucua-yellow active:scale-95',
    danger: 'bg-red-700 text-white hover:bg-red-800 focus:ring-red-500 active:scale-95',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 border border-slate-200 focus:ring-slate-300 active:scale-95',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
