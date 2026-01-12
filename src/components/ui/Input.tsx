'use client';

import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            error,
            helperText,
            leftIcon,
            rightIcon,
            type = 'text',
            className = '',
            ...props
        },
        ref
    ) => {
        const [showPassword, setShowPassword] = useState(false);
        const isPassword = type === 'password';

        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        type={isPassword && showPassword ? 'text' : type}
                        className={`
              w-full px-4 py-3 rounded-xl border bg-white/50 dark:bg-dark-800/50
              focus:outline-none focus:ring-2 focus:border-transparent
              transition-all duration-200 placeholder:text-dark-400
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon || isPassword ? 'pr-10' : ''}
              ${error
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-dark-200 dark:border-dark-700 focus:ring-primary-500'
                            }
              ${className}
            `}
                        {...props}
                    />
                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600 transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    )}
                    {rightIcon && !isPassword && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && (
                    <p className="mt-1.5 text-sm text-red-500">{error}</p>
                )}
                {helperText && !error && (
                    <p className="mt-1.5 text-sm text-dark-500">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
