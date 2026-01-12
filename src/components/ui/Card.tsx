'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    onClick?: () => void;
}

export default function Card({ children, className = '', hover = true, onClick }: CardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
            transition={{ duration: 0.3 }}
            onClick={onClick}
            className={`
        bg-white/70 dark:bg-dark-800/70
        backdrop-blur-xl
        border border-white/20 dark:border-dark-700/50
        rounded-2xl p-6
        shadow-lg shadow-dark-900/5 dark:shadow-dark-900/20
        transition-all duration-300
        ${hover ? 'cursor-pointer hover:shadow-xl hover:shadow-dark-900/10' : ''}
        ${className}
      `}
        >
            {children}
        </motion.div>
    );
}
