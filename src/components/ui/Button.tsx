import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
}) => {
  const baseStyles =
    'rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.97] select-none';

  const variantStyles = {
    primary:
      'bg-navy-600 text-white shadow-soft hover:bg-navy-700 active:bg-navy-800 dark:bg-sky-600 dark:hover:bg-sky-500',
    secondary:
      'bg-sky-100 text-navy-700 hover:bg-sky-200 active:bg-sky-300 dark:bg-sky-500/15 dark:text-sky-300 dark:hover:bg-sky-500/25',
    outline:
      'bg-transparent border border-border-strong text-ink hover:bg-surface-muted',
    ghost: 'bg-transparent text-ink-muted hover:bg-surface-muted hover:text-ink',
    danger: 'bg-coral-500 text-white shadow-soft hover:bg-coral-600 active:bg-coral-700',
  };

  const sizeStyles = {
    sm: 'text-sm py-1.5 px-3',
    md: 'text-base py-2 px-4',
    lg: 'text-lg py-2.5 px-5',
  };

  const widthStyle = fullWidth ? 'w-full' : '';
  const disabledStyle = disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  return (
    <button
      type={type}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${disabledStyle} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
