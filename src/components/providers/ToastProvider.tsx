'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
}

interface ToastContextType {
    showToast: (type: ToastType, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((type: ToastType, title: string, message?: string) => {
        const id = Math.random().toString(36).substring(7);
        const newToast = { id, type, title, message };

        setToasts((current) => [...current, newToast]);

        // Auto remove after 4 seconds
        setTimeout(() => {
            setToasts((current) => current.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((current) => current.filter((t) => t.id !== id));
    };

    const getIcon = (type: ToastType) => {
        const icons = {
            success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
            error: <XCircle className="w-5 h-5 text-red-500" />,
            warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
            info: <Info className="w-5 h-5 text-blue-500" />,
        };
        return icons[type];
    };

    const getStyles = (type: ToastType) => {
        const styles = {
            success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
            error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
            warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
            info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
        };
        return styles[type];
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-[200] space-y-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 100, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 100, scale: 0.9 }}
                            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg max-w-sm ${getStyles(toast.type)}`}
                        >
                            {getIcon(toast.type)}
                            <div className="flex-1">
                                <p className="font-medium text-dark-900 dark:text-white">{toast.title}</p>
                                {toast.message && (
                                    <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">{toast.message}</p>
                                )}
                            </div>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="text-dark-400 hover:text-dark-600 dark:hover:text-dark-200"
                            >
                                <X size={18} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
