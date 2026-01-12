'use client';

import { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-[95vw] h-[90vh]',
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-dark-900/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className={`
              relative w-full ${sizes[size]}
              bg-white dark:bg-dark-800
              rounded-2xl shadow-2xl
              overflow-hidden
            `}
                    >
                        {/* Header */}
                        {title && (
                            <div className="flex items-center justify-between px-6 py-4 border-b border-dark-200 dark:border-dark-700">
                                <h2 className="text-xl font-semibold text-dark-900 dark:text-white">
                                    {title}
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
                                >
                                    <X size={20} className="text-dark-500" />
                                </button>
                            </div>
                        )}

                        {/* Body */}
                        <div className={`p-6 ${size === 'full' ? 'overflow-y-auto max-h-[calc(90vh-80px)]' : ''}`}>
                            {children}
                        </div>

                        {/* Close button if no title */}
                        {!title && (
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
                            >
                                <X size={20} className="text-dark-500" />
                            </button>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
