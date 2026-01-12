'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import {
    Calendar,
    Wrench,
    AlertTriangle,
    Clock,
    CheckCircle2,
    Plus,
    RefreshCw,
} from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';

interface MaintenanceItem {
    _id: string;
    name: string;
    type: string;
    qrCode: string;
    location: { building: string; floor: string; room: string };
    dueDate: string;
    daysUntilDue: number;
    isOverdue: boolean;
}

export default function MaintenancePage() {
    const { data: session } = useSession();
    const userRole = (session?.user as any)?.role;

    const [items, setItems] = useState<MaintenanceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState<string | null>(null);

    useEffect(() => {
        fetchMaintenance();
    }, []);

    const fetchMaintenance = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/maintenance?days=30');
            if (res.ok) {
                const data = await res.json();
                setItems(data);
            }
        } catch (error) {
            console.error('Error fetching maintenance:', error);
        } finally {
            setLoading(false);
        }
    };

    const createTicket = async (equipmentId: string) => {
        setCreating(equipmentId);
        try {
            const res = await fetch('/api/maintenance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ equipmentId }),
            });

            if (res.ok) {
                // Remove from list after ticket created
                setItems(items.filter(i => i._id !== equipmentId));
            }
        } catch (error) {
            console.error('Error creating ticket:', error);
        } finally {
            setCreating(null);
        }
    };

    const overdueCount = items.filter(i => i.isOverdue).length;
    const upcomingCount = items.filter(i => !i.isOverdue).length;

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-dark-900 dark:text-white">
                        Preventive Maintenance
                    </h1>
                    <p className="text-dark-500 dark:text-dark-400">
                        Equipment scheduled for maintenance in the next 30 days
                    </p>
                </div>
                <Button
                    variant="outline"
                    leftIcon={<RefreshCw size={20} />}
                    onClick={fetchMaintenance}
                    isLoading={loading}
                >
                    Refresh
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-dark-900 dark:text-white">{overdueCount}</p>
                        <p className="text-sm text-dark-500">Overdue</p>
                    </div>
                </Card>
                <Card className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-white">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-dark-900 dark:text-white">{upcomingCount}</p>
                        <p className="text-sm text-dark-500">Due Soon</p>
                    </div>
                </Card>
                <Card className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-dark-900 dark:text-white">{items.length}</p>
                        <p className="text-sm text-dark-500">Total Scheduled</p>
                    </div>
                </Card>
            </div>

            {/* Maintenance List */}
            {loading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="skeleton h-24 rounded-2xl" />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <Card hover={false} className="text-center py-12">
                    <Calendar className="w-16 h-16 mx-auto text-dark-300 mb-4" />
                    <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-2">
                        No Scheduled Maintenance
                    </h3>
                    <p className="text-dark-500 dark:text-dark-400">
                        All equipment is up to date with maintenance
                    </p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {items.map((item, index) => (
                        <motion.div
                            key={item._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="flex flex-col md:flex-row md:items-center gap-4">
                                {/* Icon */}
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 ${item.isOverdue ? 'bg-gradient-to-br from-red-500 to-red-600' :
                                        item.daysUntilDue <= 7 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                                            'bg-gradient-to-br from-blue-500 to-blue-600'
                                    }`}>
                                    <Wrench size={24} />
                                </div>

                                {/* Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-dark-900 dark:text-white">
                                            {item.name}
                                        </h3>
                                        {item.isOverdue && (
                                            <Badge variant="critical">Overdue</Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-dark-500 dark:text-dark-400">
                                        {item.location?.building} • {item.location?.floor} • {item.location?.room}
                                    </p>
                                    <p className="text-xs text-dark-400 mt-1">
                                        <span className="font-mono">{item.qrCode}</span> • {item.type}
                                    </p>
                                </div>

                                {/* Due Date */}
                                <div className="text-right">
                                    <p className={`font-semibold ${item.isOverdue ? 'text-red-500' :
                                            item.daysUntilDue <= 7 ? 'text-yellow-500' :
                                                'text-dark-700 dark:text-dark-300'
                                        }`}>
                                        {item.isOverdue
                                            ? `${Math.abs(item.daysUntilDue)} days overdue`
                                            : item.daysUntilDue === 0
                                                ? 'Due today'
                                                : `Due in ${item.daysUntilDue} days`
                                        }
                                    </p>
                                    <p className="text-xs text-dark-400">
                                        {new Date(item.dueDate).toLocaleDateString()}
                                    </p>
                                </div>

                                {/* Action */}
                                {['admin', 'supervisor'].includes(userRole) && (
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        leftIcon={<Plus size={16} />}
                                        onClick={() => createTicket(item._id)}
                                        isLoading={creating === item._id}
                                    >
                                        Create Ticket
                                    </Button>
                                )}
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
