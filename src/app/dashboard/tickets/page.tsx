'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Search,
    Filter,
    Ticket as TicketIcon,
    Clock,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    ChevronRight,
    Plus,
    User,
    Wrench,
} from 'lucide-react';
import { Button, Card, Input, Select, Badge } from '@/components/ui';
import { formatDateTime, getTimeAgo } from '@/lib/utils';

interface Ticket {
    _id: string;
    ticketNumber: string;
    equipment: { _id: string; name: string; type: string; qrCode: string; location: any };
    raisedBy: { _id: string; name: string; email: string };
    assignedTo?: { _id: string; name: string; email: string };
    priority: string;
    status: string;
    issueType: string;
    description: string;
    createdAt: string;
}

const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'open', label: 'Open' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'pending_verification', label: 'Pending Verification' },
    { value: 'closed', label: 'Closed' },
    { value: 'rejected', label: 'Rejected' },
];

const priorityOptions = [
    { value: '', label: 'All Priority' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
];

const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
        open: <Clock className="w-4 h-4" />,
        assigned: <User className="w-4 h-4" />,
        in_progress: <Wrench className="w-4 h-4" />,
        pending_verification: <AlertTriangle className="w-4 h-4" />,
        closed: <CheckCircle2 className="w-4 h-4" />,
        rejected: <XCircle className="w-4 h-4" />,
    };
    return icons[status] || <TicketIcon className="w-4 h-4" />;
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export default function TicketsPage() {
    const { data: session } = useSession();
    const userRole = (session?.user as any)?.role;

    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');

    useEffect(() => {
        fetchTickets();
    }, [statusFilter, priorityFilter]);

    const fetchTickets = async () => {
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.append('status', statusFilter);
            if (priorityFilter) params.append('priority', priorityFilter);

            const res = await fetch(`/api/tickets?${params}`);
            const data = await res.json();
            setTickets(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching tickets:', error);
            setTickets([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredTickets = tickets.filter((ticket) =>
        ticket.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
        ticket.equipment?.name?.toLowerCase().includes(search.toLowerCase()) ||
        ticket.issueType.toLowerCase().includes(search.toLowerCase())
    );

    // Group tickets by status for kanban-like view
    const groupedTickets = {
        open: filteredTickets.filter(t => t.status === 'open'),
        in_progress: filteredTickets.filter(t => ['assigned', 'in_progress'].includes(t.status)),
        pending: filteredTickets.filter(t => t.status === 'pending_verification'),
        closed: filteredTickets.filter(t => ['closed', 'rejected'].includes(t.status)),
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-dark-900 dark:text-white">
                        Tickets
                    </h1>
                    <p className="text-dark-500 dark:text-dark-400">
                        {userRole === 'user' ? 'Your service requests' : 'Manage service requests'}
                    </p>
                </div>
                <div className="flex gap-2">
                    {['admin', 'supervisor'].includes(userRole) && (
                        <Button
                            variant="outline"
                            onClick={() => window.open('/api/export?type=tickets', '_blank')}
                        >
                            Export Excel
                        </Button>
                    )}
                    <Link href="/dashboard/scan">
                        <Button variant="primary" leftIcon={<Plus size={20} />}>
                            New Ticket
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <Card hover={false} className="mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Search tickets..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            leftIcon={<Search size={20} />}
                        />
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <Select
                            options={statusOptions}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-44"
                        />
                        <Select
                            options={priorityOptions}
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="w-36"
                        />
                    </div>
                </div>
            </Card>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card className="text-center py-4">
                    <p className="text-2xl font-bold text-yellow-500">{groupedTickets.open.length}</p>
                    <p className="text-sm text-dark-500 dark:text-dark-400">Open</p>
                </Card>
                <Card className="text-center py-4">
                    <p className="text-2xl font-bold text-blue-500">{groupedTickets.in_progress.length}</p>
                    <p className="text-sm text-dark-500 dark:text-dark-400">In Progress</p>
                </Card>
                <Card className="text-center py-4">
                    <p className="text-2xl font-bold text-purple-500">{groupedTickets.pending.length}</p>
                    <p className="text-sm text-dark-500 dark:text-dark-400">Pending</p>
                </Card>
                <Card className="text-center py-4">
                    <p className="text-2xl font-bold text-green-500">{groupedTickets.closed.length}</p>
                    <p className="text-sm text-dark-500 dark:text-dark-400">Closed</p>
                </Card>
            </div>

            {/* Tickets List */}
            {loading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="skeleton h-24 rounded-2xl" />
                    ))}
                </div>
            ) : filteredTickets.length === 0 ? (
                <Card hover={false} className="text-center py-12">
                    <TicketIcon className="w-16 h-16 mx-auto text-dark-300 mb-4" />
                    <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-2">
                        No Tickets Found
                    </h3>
                    <p className="text-dark-500 dark:text-dark-400 mb-4">
                        {search || statusFilter || priorityFilter
                            ? 'Try adjusting your filters'
                            : 'Scan a QR code to create your first ticket'}
                    </p>
                    {!search && !statusFilter && !priorityFilter && (
                        <Link href="/dashboard/scan">
                            <Button variant="primary">Scan QR Code</Button>
                        </Link>
                    )}
                </Card>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                >
                    {filteredTickets.map((ticket) => (
                        <motion.div key={ticket._id} variants={itemVariants}>
                            <Link href={`/dashboard/tickets/${ticket._id}`}>
                                <Card className="flex flex-col md:flex-row md:items-center gap-4 group">
                                    {/* Left: Ticket Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-mono text-sm font-semibold text-primary-500">
                                                {ticket.ticketNumber}
                                            </span>
                                            <Badge variant={ticket.status as any}>
                                                {ticket.status.replace('_', ' ')}
                                            </Badge>
                                            <Badge variant={ticket.priority as any}>
                                                {ticket.priority}
                                            </Badge>
                                        </div>
                                        <h3 className="font-semibold text-dark-900 dark:text-white mb-1">
                                            {ticket.issueType}
                                        </h3>
                                        <p className="text-sm text-dark-500 dark:text-dark-400 line-clamp-1">
                                            {ticket.description}
                                        </p>
                                    </div>

                                    {/* Middle: Equipment & User Info */}
                                    <div className="flex flex-col md:items-end gap-1 text-sm">
                                        <div className="flex items-center gap-2 text-dark-600 dark:text-dark-300">
                                            <Wrench size={14} />
                                            <span>{ticket.equipment?.name || 'Unknown Equipment'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-dark-500 dark:text-dark-400">
                                            <User size={14} />
                                            <span>{ticket.raisedBy?.name || 'Unknown'}</span>
                                        </div>
                                        <span className="text-dark-400 text-xs">
                                            {getTimeAgo(ticket.createdAt)}
                                        </span>
                                    </div>

                                    {/* Right: Arrow */}
                                    <ChevronRight className="w-5 h-5 text-dark-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}
