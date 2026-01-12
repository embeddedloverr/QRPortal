'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X, Ticket, Wrench, MessageSquare, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
    _id: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    read: boolean;
    createdAt: string;
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications?limit=10');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch('/api/notifications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markAll: true }),
            });
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'ticket_created':
            case 'ticket_assigned':
            case 'ticket_updated':
            case 'ticket_closed':
                return <Ticket size={16} />;
            case 'comment_added':
                return <MessageSquare size={16} />;
            case 'maintenance_due':
                return <Wrench size={16} />;
            default:
                return <AlertTriangle size={16} />;
        }
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case 'ticket_created':
                return 'bg-blue-500';
            case 'ticket_assigned':
                return 'bg-purple-500';
            case 'ticket_closed':
                return 'bg-green-500';
            case 'comment_added':
                return 'bg-yellow-500';
            case 'maintenance_due':
                return 'bg-orange-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
            >
                <Bell size={22} className="text-dark-500 dark:text-dark-400" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Dropdown */}
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white dark:bg-dark-800 rounded-2xl shadow-xl border border-dark-200 dark:border-dark-700 z-50 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-dark-200 dark:border-dark-700">
                                <h3 className="font-semibold text-dark-900 dark:text-white">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs text-primary-500 hover:text-primary-600 font-medium"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>

                            {/* Notifications List */}
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <Bell className="w-12 h-12 mx-auto text-dark-300 dark:text-dark-600 mb-3" />
                                        <p className="text-dark-500 dark:text-dark-400">No notifications yet</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-dark-100 dark:divide-dark-700">
                                        {notifications.map((notification) => (
                                            <a
                                                key={notification._id}
                                                href={notification.link || '#'}
                                                onClick={() => setIsOpen(false)}
                                                className={`block p-4 hover:bg-dark-50 dark:hover:bg-dark-700/50 transition-colors ${!notification.read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                                                    }`}
                                            >
                                                <div className="flex gap-3">
                                                    <div className={`w-8 h-8 rounded-full ${getIconColor(notification.type)} flex items-center justify-center text-white shrink-0`}>
                                                        {getIcon(notification.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-dark-900 dark:text-white text-sm">
                                                            {notification.title}
                                                        </p>
                                                        <p className="text-dark-500 dark:text-dark-400 text-sm line-clamp-2">
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-xs text-dark-400 dark:text-dark-500 mt-1">
                                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                        </p>
                                                    </div>
                                                    {!notification.read && (
                                                        <div className="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-2" />
                                                    )}
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            {notifications.length > 0 && (
                                <div className="p-3 border-t border-dark-200 dark:border-dark-700 text-center">
                                    <a
                                        href="/dashboard/notifications"
                                        className="text-sm text-primary-500 hover:text-primary-600 font-medium"
                                    >
                                        View all notifications
                                    </a>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
