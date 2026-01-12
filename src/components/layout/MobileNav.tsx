'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Ticket,
    ScanLine,
    Wrench,
    Settings,
} from 'lucide-react';

const navItems = [
    { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Equipment', href: '/dashboard/equipment', icon: Wrench },
    { name: 'Scan', href: '/dashboard/scan', icon: ScanLine, highlight: true },
    { name: 'Tickets', href: '/dashboard/tickets', icon: Ticket },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function MobileNav() {
    const pathname = usePathname();
    const { data: session } = useSession();

    if (!session) return null;

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-dark-900 border-t border-dark-200 dark:border-dark-700 px-2 pt-2 pb-safe">
            <div className="flex items-center justify-around">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    const Icon = item.icon;

                    if (item.highlight) {
                        return (
                            <Link key={item.name} href={item.href}>
                                <motion.div
                                    whileTap={{ scale: 0.9 }}
                                    className="relative -mt-6"
                                >
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                </motion.div>
                            </Link>
                        );
                    }

                    return (
                        <Link key={item.name} href={item.href}>
                            <motion.div
                                whileTap={{ scale: 0.9 }}
                                className={`flex flex-col items-center py-2 px-3 rounded-xl transition-colors ${isActive
                                        ? 'text-primary-500'
                                        : 'text-dark-400 hover:text-dark-600 dark:hover:text-dark-300'
                                    }`}
                            >
                                <Icon className="w-6 h-6" />
                                <span className="text-xs mt-1 font-medium">{item.name}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="mobile-nav-indicator"
                                        className="absolute bottom-0 w-1 h-1 rounded-full bg-primary-500"
                                    />
                                )}
                            </motion.div>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
