'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Ticket,
    Wrench,
    Users,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Calendar,
    Download,
} from 'lucide-react';
import { Card, Select, Button } from '@/components/ui';

interface Stats {
    totalTickets: number;
    openTickets: number;
    closedTickets: number;
    avgResolutionTime: number;
    ticketsByPriority: { priority: string; count: number }[];
    ticketsByStatus: { status: string; count: number }[];
    recentActivity: { date: string; count: number }[];
}

const periodOptions = [
    { value: '7', label: 'Last 7 Days' },
    { value: '30', label: 'Last 30 Days' },
    { value: '90', label: 'Last 90 Days' },
    { value: '365', label: 'Last Year' },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export default function ReportsPage() {
    const { data: session } = useSession();
    const [period, setPeriod] = useState('30');
    const [loading, setLoading] = useState(true);

    // Mock stats data - in production, fetch from API
    const [stats, setStats] = useState<Stats>({
        totalTickets: 0,
        openTickets: 0,
        closedTickets: 0,
        avgResolutionTime: 0,
        ticketsByPriority: [],
        ticketsByStatus: [],
        recentActivity: [],
    });

    useEffect(() => {
        fetchStats();
    }, [period]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            // Fetch tickets to calculate stats
            const res = await fetch('/api/tickets');
            const tickets = await res.json();

            if (Array.isArray(tickets)) {
                const now = new Date();
                const periodDays = parseInt(period);
                const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

                const filteredTickets = tickets.filter(t => new Date(t.createdAt) >= startDate);

                const openCount = filteredTickets.filter(t => !['closed', 'rejected'].includes(t.status)).length;
                const closedCount = filteredTickets.filter(t => t.status === 'closed').length;

                // Calculate by priority
                const priorityCounts = ['low', 'medium', 'high', 'critical'].map(p => ({
                    priority: p,
                    count: filteredTickets.filter(t => t.priority === p).length
                }));

                // Calculate by status
                const statusCounts = ['open', 'assigned', 'in_progress', 'pending_verification', 'closed', 'rejected'].map(s => ({
                    status: s,
                    count: filteredTickets.filter(t => t.status === s).length
                }));

                setStats({
                    totalTickets: filteredTickets.length,
                    openTickets: openCount,
                    closedTickets: closedCount,
                    avgResolutionTime: 4.5, // Mock value
                    ticketsByPriority: priorityCounts,
                    ticketsByStatus: statusCounts,
                    recentActivity: [],
                });
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const getMaxCount = (items: { count: number }[]) => {
        return Math.max(...items.map(i => i.count), 1);
    };

    const getPriorityColor = (priority: string) => {
        const colors: Record<string, string> = {
            low: 'bg-green-500',
            medium: 'bg-yellow-500',
            high: 'bg-orange-500',
            critical: 'bg-red-500',
        };
        return colors[priority] || 'bg-gray-500';
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            open: 'bg-yellow-500',
            assigned: 'bg-blue-500',
            in_progress: 'bg-blue-600',
            pending_verification: 'bg-purple-500',
            closed: 'bg-green-500',
            rejected: 'bg-red-500',
        };
        return colors[status] || 'bg-gray-500';
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-dark-900 dark:text-white">
                        Reports & Analytics
                    </h1>
                    <p className="text-dark-500 dark:text-dark-400">
                        Track performance and service metrics
                    </p>
                </div>
                <div className="flex gap-3">
                    <Select
                        options={periodOptions}
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="w-40"
                    />
                    <Button variant="outline" leftIcon={<Download size={18} />}>
                        Export
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="skeleton h-32 rounded-2xl" />
                    ))}
                </div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                >
                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <motion.div variants={itemVariants}>
                            <Card className="relative overflow-hidden">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-dark-500 dark:text-dark-400">Total Tickets</p>
                                        <p className="text-3xl font-bold text-dark-900 dark:text-white mt-1">
                                            {stats.totalTickets}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                        <Ticket className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600" />
                            </Card>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Card className="relative overflow-hidden">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-dark-500 dark:text-dark-400">Open Tickets</p>
                                        <p className="text-3xl font-bold text-yellow-500 mt-1">
                                            {stats.openTickets}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                                        <Clock className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600" />
                            </Card>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Card className="relative overflow-hidden">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-dark-500 dark:text-dark-400">Closed Tickets</p>
                                        <p className="text-3xl font-bold text-green-500 mt-1">
                                            {stats.closedTickets}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                                        <CheckCircle2 className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-green-600" />
                            </Card>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Card className="relative overflow-hidden">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-dark-500 dark:text-dark-400">Avg. Resolution</p>
                                        <p className="text-3xl font-bold text-dark-900 dark:text-white mt-1">
                                            {stats.avgResolutionTime}h
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-purple-600" />
                            </Card>
                        </motion.div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Tickets by Priority */}
                        <motion.div variants={itemVariants}>
                            <Card hover={false}>
                                <h3 className="font-semibold text-dark-900 dark:text-white mb-6 flex items-center gap-2">
                                    <AlertTriangle size={18} className="text-orange-500" />
                                    Tickets by Priority
                                </h3>
                                <div className="space-y-4">
                                    {stats.ticketsByPriority.map((item) => (
                                        <div key={item.priority} className="flex items-center gap-4">
                                            <span className="w-20 text-sm capitalize text-dark-600 dark:text-dark-300">
                                                {item.priority}
                                            </span>
                                            <div className="flex-1 h-8 bg-dark-100 dark:bg-dark-700 rounded-lg overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(item.count / getMaxCount(stats.ticketsByPriority)) * 100}%` }}
                                                    transition={{ duration: 0.5, delay: 0.2 }}
                                                    className={`h-full ${getPriorityColor(item.priority)} rounded-lg flex items-center justify-end px-3`}
                                                >
                                                    <span className="text-white text-sm font-semibold">{item.count}</span>
                                                </motion.div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </motion.div>

                        {/* Tickets by Status */}
                        <motion.div variants={itemVariants}>
                            <Card hover={false}>
                                <h3 className="font-semibold text-dark-900 dark:text-white mb-6 flex items-center gap-2">
                                    <BarChart3 size={18} className="text-blue-500" />
                                    Tickets by Status
                                </h3>
                                <div className="space-y-4">
                                    {stats.ticketsByStatus.map((item) => (
                                        <div key={item.status} className="flex items-center gap-4">
                                            <span className="w-28 text-sm capitalize text-dark-600 dark:text-dark-300">
                                                {item.status.replace('_', ' ')}
                                            </span>
                                            <div className="flex-1 h-8 bg-dark-100 dark:bg-dark-700 rounded-lg overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(item.count / getMaxCount(stats.ticketsByStatus)) * 100}%` }}
                                                    transition={{ duration: 0.5, delay: 0.2 }}
                                                    className={`h-full ${getStatusColor(item.status)} rounded-lg flex items-center justify-end px-3`}
                                                >
                                                    <span className="text-white text-sm font-semibold">{item.count}</span>
                                                </motion.div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Performance Metrics */}
                    <motion.div variants={itemVariants}>
                        <Card hover={false}>
                            <h3 className="font-semibold text-dark-900 dark:text-white mb-6 flex items-center gap-2">
                                <TrendingUp size={18} className="text-green-500" />
                                Performance Metrics
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="text-center p-4 rounded-xl bg-dark-50 dark:bg-dark-700/50">
                                    <p className="text-3xl font-bold text-green-500">
                                        {stats.totalTickets > 0 ? Math.round((stats.closedTickets / stats.totalTickets) * 100) : 0}%
                                    </p>
                                    <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">Resolution Rate</p>
                                </div>
                                <div className="text-center p-4 rounded-xl bg-dark-50 dark:bg-dark-700/50">
                                    <p className="text-3xl font-bold text-blue-500">
                                        {stats.avgResolutionTime}h
                                    </p>
                                    <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">Avg. Resolution Time</p>
                                </div>
                                <div className="text-center p-4 rounded-xl bg-dark-50 dark:bg-dark-700/50">
                                    <p className="text-3xl font-bold text-purple-500">
                                        {stats.ticketsByPriority.find(p => p.priority === 'critical')?.count || 0}
                                    </p>
                                    <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">Critical Issues</p>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}
