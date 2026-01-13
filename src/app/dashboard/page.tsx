'use client';

import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
    Ticket,
    Wrench,
    ScanLine,
    CheckCircle2,
    Clock,
    AlertTriangle,
    TrendingUp,
    Users,
    ArrowRight,
} from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
    const { data: session } = useSession();
    const userRole = (session?.user as any)?.role || 'user';
    const userName = session?.user?.name || 'User';

    // Real stats from API
    const [stats, setStats] = useState({
        user: { myTickets: 0, openTickets: 0, closedTickets: 0 },
        engineer: { assignedTickets: 0, pendingService: 0, completedToday: 0 },
        supervisor: { pendingVerification: 0, approvedToday: 0, rejectedToday: 0 },
        admin: { totalEquipment: 0, totalTickets: 0, activeUsers: 0, openTickets: 0 },
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/dashboard');
                const data = await res.json();
                if (res.ok) {
                    setStats({
                        user: {
                            myTickets: data.tickets?.total || 0,
                            openTickets: data.tickets?.open || 0,
                            closedTickets: data.tickets?.closed || 0,
                        },
                        engineer: {
                            assignedTickets: data.tickets?.total || 0,
                            pendingService: data.tickets?.inProgress || 0,
                            completedToday: data.tickets?.closed || 0,
                        },
                        supervisor: {
                            pendingVerification: data.tickets?.pendingVerification || 0,
                            approvedToday: data.tickets?.closed || 0,
                            rejectedToday: 0,
                        },
                        admin: {
                            totalEquipment: data.equipment?.total || 0,
                            totalTickets: data.tickets?.total || 0,
                            activeUsers: data.users?.total || 0,
                            openTickets: data.tickets?.open || 0,
                        },
                    });
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const renderUserDashboard = () => (
        <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <motion.div variants={itemVariants}>
                    <Card className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-dark-500 dark:text-dark-400">Open Tickets</p>
                            <p className="text-2xl font-bold text-dark-900 dark:text-white">{stats.user.openTickets}</p>
                        </div>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                            <Ticket className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-dark-500 dark:text-dark-400">My Tickets</p>
                            <p className="text-2xl font-bold text-dark-900 dark:text-white">{stats.user.myTickets}</p>
                        </div>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-dark-500 dark:text-dark-400">Resolved</p>
                            <p className="text-2xl font-bold text-dark-900 dark:text-white">{stats.user.closedTickets}</p>
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
                <Card hover={false}>
                    <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link href="/dashboard/scan">
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary-500/10 to-primary-600/10 hover:from-primary-500/20 hover:to-primary-600/20 border border-primary-500/20 transition-all cursor-pointer group">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                                    <ScanLine className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-dark-900 dark:text-white">Scan QR Code</p>
                                    <p className="text-sm text-dark-500 dark:text-dark-400">Report an issue</p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-primary-500 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                        <Link href="/dashboard/tickets">
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-secondary-500/10 to-secondary-600/10 hover:from-secondary-500/20 hover:to-secondary-600/20 border border-secondary-500/20 transition-all cursor-pointer group">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary-500 to-secondary-700 flex items-center justify-center">
                                    <Ticket className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-dark-900 dark:text-white">View Tickets</p>
                                    <p className="text-sm text-dark-500 dark:text-dark-400">Track your requests</p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-secondary-500 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    </div>
                </Card>
            </motion.div>
        </>
    );

    const renderEngineerDashboard = () => (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <motion.div variants={itemVariants}>
                    <Card className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-dark-500 dark:text-dark-400">Assigned</p>
                            <p className="text-2xl font-bold text-dark-900 dark:text-white">{stats.engineer.assignedTickets}</p>
                        </div>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                            <Wrench className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-dark-500 dark:text-dark-400">Pending Service</p>
                            <p className="text-2xl font-bold text-dark-900 dark:text-white">{stats.engineer.pendingService}</p>
                        </div>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-dark-500 dark:text-dark-400">Completed Today</p>
                            <p className="text-2xl font-bold text-dark-900 dark:text-white">{stats.engineer.completedToday}</p>
                        </div>
                    </Card>
                </motion.div>
            </div>

            <motion.div variants={itemVariants}>
                <Card hover={false}>
                    <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link href="/dashboard/scan">
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary-500/10 to-primary-600/10 hover:from-primary-500/20 hover:to-primary-600/20 border border-primary-500/20 transition-all cursor-pointer group">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                                    <ScanLine className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-dark-900 dark:text-white">Scan to Attend</p>
                                    <p className="text-sm text-dark-500 dark:text-dark-400">Start service</p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-primary-500 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                        <Link href="/dashboard/tickets?filter=assigned">
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-accent-500/10 to-accent-600/10 hover:from-accent-500/20 hover:to-accent-600/20 border border-accent-500/20 transition-all cursor-pointer group">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center">
                                    <Ticket className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-dark-900 dark:text-white">My Assignments</p>
                                    <p className="text-sm text-dark-500 dark:text-dark-400">View pending tasks</p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-accent-500 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    </div>
                </Card>
            </motion.div>
        </>
    );

    const renderSupervisorDashboard = () => (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <motion.div variants={itemVariants}>
                    <Card className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-dark-500 dark:text-dark-400">Pending Verification</p>
                            <p className="text-2xl font-bold text-dark-900 dark:text-white">{stats.supervisor.pendingVerification}</p>
                        </div>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-dark-500 dark:text-dark-400">Approved Today</p>
                            <p className="text-2xl font-bold text-dark-900 dark:text-white">{stats.supervisor.approvedToday}</p>
                        </div>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-dark-500 dark:text-dark-400">Rejected Today</p>
                            <p className="text-2xl font-bold text-dark-900 dark:text-white">{stats.supervisor.rejectedToday}</p>
                        </div>
                    </Card>
                </motion.div>
            </div>

            <motion.div variants={itemVariants}>
                <Link href="/dashboard/verification">
                    <Button variant="primary" size="lg" rightIcon={<ArrowRight size={20} />}>
                        Review Pending Verifications
                    </Button>
                </Link>
            </motion.div>
        </>
    );

    const renderAdminDashboard = () => (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <motion.div variants={itemVariants}>
                    <Card className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                            <Wrench className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-dark-500 dark:text-dark-400">Total Equipment</p>
                            <p className="text-2xl font-bold text-dark-900 dark:text-white">{stats.admin.totalEquipment}</p>
                        </div>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                            <Ticket className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-dark-500 dark:text-dark-400">Total Tickets</p>
                            <p className="text-2xl font-bold text-dark-900 dark:text-white">{stats.admin.totalTickets}</p>
                        </div>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-dark-500 dark:text-dark-400">Active Users</p>
                            <p className="text-2xl font-bold text-dark-900 dark:text-white">{stats.admin.activeUsers}</p>
                        </div>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-dark-500 dark:text-dark-400">Open Tickets</p>
                            <p className="text-2xl font-bold text-dark-900 dark:text-white">{stats.admin.openTickets}</p>
                        </div>
                    </Card>
                </motion.div>
            </div>

            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/dashboard/equipment">
                    <Card className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                                <Wrench className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="font-medium text-dark-900 dark:text-white">Manage Equipment</p>
                                <p className="text-sm text-dark-500 dark:text-dark-400">Add, edit, or remove equipment</p>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-dark-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                    </Card>
                </Link>
                <Link href="/dashboard/users">
                    <Card className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary-500 to-secondary-700 flex items-center justify-center">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="font-medium text-dark-900 dark:text-white">Manage Users</p>
                                <p className="text-sm text-dark-500 dark:text-dark-400">User roles and permissions</p>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-dark-400 group-hover:text-secondary-500 group-hover:translate-x-1 transition-all" />
                    </Card>
                </Link>
            </motion.div>
        </>
    );

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-7xl mx-auto"
        >
            {/* Welcome Header */}
            <motion.div variants={itemVariants} className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-dark-900 dark:text-white mb-2">
                    {getGreeting()}, {userName}! 👋
                </h1>
                <p className="text-dark-500 dark:text-dark-400">
                    Welcome to your QR Equipment Portal dashboard
                </p>
            </motion.div>

            {/* Role-specific Dashboard */}
            {userRole === 'user' && renderUserDashboard()}
            {userRole === 'engineer' && renderEngineerDashboard()}
            {userRole === 'supervisor' && renderSupervisorDashboard()}
            {userRole === 'admin' && renderAdminDashboard()}
        </motion.div>
    );
}
