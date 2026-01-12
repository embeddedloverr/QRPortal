'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    CheckCircle2,
    XCircle,
    Clock,
    User,
    Wrench,
    ChevronRight,
    Image as ImageIcon,
    AlertTriangle,
} from 'lucide-react';
import { Button, Card, Badge, Modal } from '@/components/ui';
import { formatDateTime, getTimeAgo } from '@/lib/utils';

interface Ticket {
    _id: string;
    ticketNumber: string;
    equipment: any;
    raisedBy: any;
    assignedTo: any;
    priority: string;
    status: string;
    issueType: string;
    description: string;
    createdAt: string;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export default function VerificationPage() {
    const { data: session } = useSession();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        fetchPendingTickets();
    }, []);

    const fetchPendingTickets = async () => {
        try {
            const res = await fetch('/api/tickets?status=pending_verification');
            const data = await res.json();
            setTickets(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerification = async (ticketId: string, action: 'approve' | 'reject') => {
        setSubmitting(true);

        try {
            const newStatus = action === 'approve' ? 'closed' : 'in_progress';
            const notes = action === 'approve'
                ? 'Service verified and approved by supervisor'
                : `Service rejected: ${rejectReason || 'Needs rework'}`;

            const res = await fetch(`/api/tickets/${ticketId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: newStatus,
                    notes,
                }),
            });

            if (res.ok) {
                setShowModal(false);
                setSelectedTicket(null);
                setRejectReason('');
                fetchPendingTickets();
            }
        } catch (error) {
            console.error('Error updating ticket:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-dark-900 dark:text-white">
                            Verification Queue
                        </h1>
                        <p className="text-dark-500 dark:text-dark-400">
                            Review and verify completed service requests
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <Card hover={false} className="mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-purple-500" />
                        <span className="text-dark-600 dark:text-dark-300">Pending Verification</span>
                    </div>
                    <span className="text-2xl font-bold text-purple-500">{tickets.length}</span>
                </div>
            </Card>

            {/* Tickets List */}
            {loading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="skeleton h-32 rounded-2xl" />
                    ))}
                </div>
            ) : tickets.length === 0 ? (
                <Card hover={false} className="text-center py-12">
                    <CheckCircle2 className="w-16 h-16 mx-auto text-green-400 mb-4" />
                    <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-2">
                        All Caught Up!
                    </h3>
                    <p className="text-dark-500 dark:text-dark-400">
                        No pending verifications at the moment.
                    </p>
                </Card>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                >
                    {tickets.map((ticket) => (
                        <motion.div key={ticket._id} variants={itemVariants}>
                            <Card className="relative">
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    {/* Ticket Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-mono text-sm font-semibold text-primary-500">
                                                {ticket.ticketNumber}
                                            </span>
                                            <Badge variant="pending">Pending Verification</Badge>
                                            <Badge variant={ticket.priority as any}>{ticket.priority}</Badge>
                                        </div>
                                        <h3 className="font-semibold text-dark-900 dark:text-white mb-1">
                                            {ticket.issueType.replace('_', ' ')}
                                        </h3>
                                        <div className="flex flex-wrap gap-4 text-sm text-dark-500 dark:text-dark-400">
                                            <span className="flex items-center gap-1">
                                                <Wrench size={14} />
                                                {ticket.equipment?.name}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <User size={14} />
                                                {ticket.assignedTo?.name || 'Unassigned'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Button
                                            variant="accent"
                                            size="sm"
                                            onClick={() => handleVerification(ticket._id, 'approve')}
                                            disabled={submitting}
                                            leftIcon={<CheckCircle2 size={18} />}
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedTicket(ticket);
                                                setShowModal(true);
                                            }}
                                            disabled={submitting}
                                            leftIcon={<XCircle size={18} />}
                                        >
                                            Reject
                                        </Button>
                                        <Link href={`/dashboard/tickets/${ticket._id}`}>
                                            <Button variant="ghost" size="sm">
                                                <ChevronRight size={18} />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Reject Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setSelectedTicket(null);
                    setRejectReason('');
                }}
                title="Reject Service"
            >
                <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-yellow-700 dark:text-yellow-400">
                                    This will send the ticket back to the engineer
                                </p>
                                <p className="text-sm text-yellow-600 dark:text-yellow-500 mt-1">
                                    Ticket: {selectedTicket?.ticketNumber}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                            Reason for Rejection
                        </label>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Explain why this service is being rejected..."
                            className="w-full px-4 py-3 rounded-xl border border-dark-200 dark:border-dark-700 bg-white/50 dark:bg-dark-800/50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                            rows={3}
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setShowModal(false);
                                setSelectedTicket(null);
                                setRejectReason('');
                            }}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => selectedTicket && handleVerification(selectedTicket._id, 'reject')}
                            isLoading={submitting}
                            className="flex-1"
                        >
                            Reject Service
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
