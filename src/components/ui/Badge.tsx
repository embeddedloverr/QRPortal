interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'open' | 'assigned' | 'in_progress' | 'pending' | 'pending_verification' | 'closed' | 'rejected' | 'reopened' | 'low' | 'medium' | 'high' | 'critical';
    className?: string;
}

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
    const variants: Record<string, string> = {
        default: 'bg-dark-100 text-dark-700 dark:bg-dark-700 dark:text-dark-300',
        open: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        pending: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        pending_verification: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        closed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        reopened: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
        low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
        critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 animate-pulse',
    };

    return (
        <span
            className={`
        inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
        ${variants[variant]}
        ${className}
      `}
        >
            {children}
        </span>
    );
}
