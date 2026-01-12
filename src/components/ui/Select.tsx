'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';

interface Option {
    value: string;
    label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: Option[];
    placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, placeholder = 'Select an option', className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    className={`
            w-full px-4 py-3 rounded-xl border bg-white/50 dark:bg-dark-800/50
            focus:outline-none focus:ring-2 focus:border-transparent
            transition-all duration-200 appearance-none cursor-pointer
            ${error
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-dark-200 dark:border-dark-700 focus:ring-primary-500'
                        }
            ${className}
          `}
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.75rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.25rem',
                    }}
                    {...props}
                >
                    <option value="">{placeholder}</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
            </div>
        );
    }
);

Select.displayName = 'Select';

export default Select;
