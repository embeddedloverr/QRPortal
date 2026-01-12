'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    QrCode,
    Ticket,
    ScanLine,
    CheckCircle2,
    Settings,
    Users,
    LogOut,
    Menu,
    X,
    ChevronLeft,
    Sun,
    Moon,
    BarChart3,
    Wrench,
    Tags,
    Calendar,
    Printer,
    Map,
} from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import NotificationBell from '@/components/features/NotificationBell';

interface NavItem {
    name: string;
    href: string;
    icon: React.ReactNode;
    roles?: string[];
}

const navItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Equipment', href: '/dashboard/equipment', icon: <Wrench size={20} /> },
    { name: 'Tickets', href: '/dashboard/tickets', icon: <Ticket size={20} /> },
    { name: 'Scan QR', href: '/dashboard/scan', icon: <ScanLine size={20} /> },
    { name: 'Maintenance', href: '/dashboard/maintenance', icon: <Calendar size={20} />, roles: ['supervisor', 'admin'] },
    { name: 'Verification', href: '/dashboard/verification', icon: <CheckCircle2 size={20} />, roles: ['supervisor', 'admin'] },
    { name: 'Reports', href: '/dashboard/reports', icon: <BarChart3 size={20} />, roles: ['supervisor', 'admin'] },
    { name: 'Floor Maps', href: '/dashboard/floor-maps', icon: <Map size={20} />, roles: ['admin', 'supervisor'] },
    { name: 'QR Print', href: '/dashboard/qr-print', icon: <Printer size={20} />, roles: ['admin', 'supervisor'] },
    { name: 'Equipment Types', href: '/dashboard/equipment-types', icon: <Tags size={20} />, roles: ['admin', 'supervisor'] },
    { name: 'Users', href: '/dashboard/users', icon: <Users size={20} />, roles: ['admin'] },
    { name: 'Settings', href: '/dashboard/settings', icon: <Settings size={20} /> },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const { theme, toggleTheme } = useTheme();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const userRole = (session?.user as any)?.role || 'user';

    const filteredNavItems = navItems.filter(
        (item) => !item.roles || item.roles.includes(userRole)
    );

    const sidebarContent = (
        <>
            {/* Logo */}
            <div className="flex items-center justify-between px-4 py-6 border-b border-dark-700">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30">
                        <QrCode className="w-6 h-6 text-white" />
                    </div>
                    {!isCollapsed && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="font-bold text-lg text-white"
                        >
                            QR Portal
                        </motion.span>
                    )}
                </Link>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden lg:flex p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-white transition-colors"
                >
                    <ChevronLeft className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {filteredNavItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsMobileOpen(false)}
                            className={`
                flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200
                ${isActive
                                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-600/20'
                                    : 'text-dark-400 hover:text-white hover:bg-dark-800'
                                }
              `}
                        >
                            {item.icon}
                            {!isCollapsed && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="font-medium"
                                >
                                    {item.name}
                                </motion.span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-dark-700">
                {/* Notifications */}
                {!isCollapsed && (
                    <div className="flex items-center justify-between px-4 py-2 mb-2">
                        <span className="text-dark-400 text-sm font-medium">Notifications</span>
                        <NotificationBell />
                    </div>
                )}

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-dark-400 hover:text-white hover:bg-dark-800 transition-colors mb-2"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    {!isCollapsed && (
                        <span className="font-medium">
                            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                        </span>
                    )}
                </button>

                {/* User Info */}
                {session?.user && (
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary-500 to-secondary-700 flex items-center justify-center text-white font-bold">
                            {session.user.name?.charAt(0).toUpperCase()}
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                    {session.user.name}
                                </p>
                                <p className="text-xs text-dark-400 capitalize">{userRole}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Logout */}
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
                >
                    <LogOut size={20} />
                    {!isCollapsed && <span className="font-medium">Logout</span>}
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-dark-900 text-white shadow-lg"
            >
                <Menu size={24} />
            </button>

            {/* Desktop Sidebar */}
            <aside
                className={`
          hidden lg:flex flex-col
          fixed left-0 top-0 h-full
          bg-dark-900 text-white z-40
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-64'}
        `}
            >
                {sidebarContent}
            </aside>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="lg:hidden fixed inset-0 bg-dark-900/80 backdrop-blur-sm z-50"
                        />

                        {/* Sidebar */}
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="lg:hidden fixed left-0 top-0 h-full w-64 bg-dark-900 text-white z-50 flex flex-col"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setIsMobileOpen(false)}
                                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                            {sidebarContent}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
