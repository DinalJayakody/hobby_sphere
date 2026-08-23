import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  className?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = false, className = '', ...props }, ref) => {
    return (
      <div className={`mb-4 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-ink-muted mb-1"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-3 py-2 bg-surface text-ink border rounded-lg
                     placeholder:text-ink-faint
                     focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-500/40 focus:border-sky-500
                     ${error ? 'border-coral-500' : 'border-border-strong'}
                     ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-coral-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;