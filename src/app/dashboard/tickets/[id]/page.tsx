'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Clock,
    User,
    Wrench,
    MapPin,
    Phone,
    Mail,
    CheckCircle2,
    XCircle,
    Camera,
    Send,
    AlertTriangle,
    RotateCcw,
} from 'lucide-react';
import { Button, Card, Badge, Modal, Select, Input } from '@/components/ui';
import { formatDateTime } from '@/lib/utils';
import TicketComments from '@/components/features/TicketComments';

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
    timeline: any[];
    reopenCount?: number;
    createdAt: string;
    closedAt?: string;
}

export default function TicketDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const userRole = (session?.user as any)?.role;
    const userId = (session?.user as any)?.id;

    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [engineers, setEngineers] = useState<any[]>([]);
    const [selectedEngineer, setSelectedEngineer] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Service report state
    const [serviceData, setServiceData] = useState({
        workDescription: '',
        timeSpent: 30,
        beforePhotos: [] as string[],
        afterPhotos: [] as string[],
    });

    useEffect(() => {
        fetchTicket();
    }, [params.id]);

    const fetchTicket = async () => {
        try {
            const res = await fetch(`/api/tickets/${params.id}`);
            const data = await res.json();
            if (res.ok) {
                setTicket(data);
            }
        } catch (error) {
            console.error('Error fetching ticket:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEngineers = async () => {
        try {
            const res = await fetch('/api/users?role=engineer');
            const data = await res.json();
            if (Array.isArray(data)) {
                setEngineers(data);
            }
        } catch (error) {
            console.error('Error fetching engineers:', error);
        }
    };

    const handleAssign = async () => {
        if (!selectedEngineer) return;
        setSubmitting(true);

        try {
            const res = await fetch(`/api/tickets/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assignedTo: selectedEngineer,
                    status: 'assigned',
                    notes: 'Ticket assigned to engineer',
                }),
            });

            if (res.ok) {
                setShowAssignModal(false);
                fetchTicket();
            }
        } catch (error) {
            console.error('Error assigning ticket:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusUpdate = async (newStatus: string, notes?: string) => {
        setSubmitting(true);

        try {
            const res = await fetch(`/api/tickets/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: newStatus,
                    notes: notes || `Status updated to ${newStatus}`,
                }),
            });

            if (res.ok) {
                fetchTicket();
            }
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitService = async () => {
        if (!serviceData.workDescription) return;
        setSubmitting(true);

        try {
            // Create service report
            const res = await fetch('/api/service-reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ticketId: params.id,
                    workDescription: serviceData.workDescription,
                    timeSpent: serviceData.timeSpent,
                    beforePhotos: serviceData.beforePhotos,
                    afterPhotos: serviceData.afterPhotos,
                }),
            });

            if (res.ok) {
                // Update ticket status to pending verification
                await handleStatusUpdate('pending_verification', 'Service completed, pending supervisor verification');
                setShowServiceModal(false);
                fetchTicket();
            }
        } catch (error) {
            console.error('Error submitting service:', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="skeleton h-8 w-48 mb-8" />
                <div className="skeleton h-64 rounded-2xl mb-6" />
                <div className="skeleton h-48 rounded-2xl" />
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="max-w-4xl mx-auto text-center py-12">
                <AlertTriangle className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
                <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">
                    Ticket Not Found
                </h2>
                <Button variant="ghost" onClick={() => router.back()} leftIcon={<ArrowLeft size={20} />}>
                    Go Back
                </Button>
            </div>
        );
    }

    const isEngineerAssigned = ticket.assignedTo?._id === userId;
    const canAssign = ['admin', 'supervisor'].includes(userRole) && (ticket.status === 'open' || ticket.status === 'reopened');
    const canStartService = userRole === 'engineer' && isEngineerAssigned && (ticket.status === 'assigned' || ticket.status === 'reopened');
    const canCompleteService = userRole === 'engineer' && isEngineerAssigned && ticket.status === 'in_progress';
    const canVerify = ['supervisor', 'admin'].includes(userRole) && ticket.status === 'pending_verification';
    const canReopen = ticket.status === 'closed'; // Anyone can request reopen of closed tickets

    return (
        <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-dark-500 hover:text-dark-700 dark:hover:text-dark-300 transition-colors mb-6"
            >
                <ArrowLeft size={20} />
                <span>Back to Tickets</span>
            </button>

            {/* Ticket Header */}
            <Card hover={false} className="mb-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono text-lg font-bold text-primary-500">
                                {ticket.ticketNumber}
                            </span>
                            <Badge variant={ticket.status as any} className="text-sm">
                                {ticket.status.replace('_', ' ')}
                            </Badge>
                            <Badge variant={ticket.priority as any} className="text-sm">
                                {ticket.priority}
                            </Badge>
                            {ticket.reopenCount && ticket.reopenCount > 0 && (
                                <Badge variant="pending" className="text-sm">
                                    Reopened {ticket.reopenCount}x
                                </Badge>
                            )}
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold text-dark-900 dark:text-white mb-2">
                            {ticket.issueType.replace('_', ' ')}
                        </h1>
                        <p className="text-dark-500 dark:text-dark-400">{ticket.description}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                        {canAssign && (
                            <Button
                                variant="primary"
                                onClick={() => {
                                    fetchEngineers();
                                    setShowAssignModal(true);
                                }}
                            >
                                Assign Engineer
                            </Button>
                        )}
                        {canStartService && (
                            <Button
                                variant="primary"
                                onClick={() => handleStatusUpdate('in_progress', 'Service started')}
                                disabled={submitting}
                            >
                                Start Service
                            </Button>
                        )}
                        {canCompleteService && (
                            <Button
                                variant="accent"
                                onClick={() => setShowServiceModal(true)}
                                leftIcon={<Camera size={20} />}
                            >
                                Complete Service
                            </Button>
                        )}
                        {canVerify && (
                            <div className="flex gap-2">
                                <Button
                                    variant="accent"
                                    onClick={() => handleStatusUpdate('closed', 'Service verified and approved')}
                                    disabled={submitting}
                                    leftIcon={<CheckCircle2 size={20} />}
                                >
                                    Approve
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={() => handleStatusUpdate('rejected', 'Service rejected, needs rework')}
                                    disabled={submitting}
                                    leftIcon={<XCircle size={20} />}
                                >
                                    Reject
                                </Button>
                            </div>
                        )}
                        {canReopen && (
                            <Button
                                variant="outline"
                                onClick={() => handleStatusUpdate('reopened', 'Issue recurred, ticket reopened')}
                                disabled={submitting}
                                leftIcon={<RotateCcw size={20} />}
                            >
                                Reopen Ticket
                            </Button>
                        )}
                    </div>
                </div>

                {/* Ticket Meta */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Equipment Info */}
                    <div className="p-4 rounded-xl bg-dark-50 dark:bg-dark-700/50">
                        <h3 className="font-semibold text-dark-900 dark:text-white mb-3 flex items-center gap-2">
                            <Wrench size={18} /> Equipment
                        </h3>
                        <div className="space-y-2 text-sm">
                            <p className="text-dark-700 dark:text-dark-300">{ticket.equipment?.name}</p>
                            <p className="text-dark-500 flex items-center gap-2">
                                <MapPin size={14} />
                                {ticket.equipment?.location?.building}, Floor {ticket.equipment?.location?.floor}, Room {ticket.equipment?.location?.room}
                            </p>
                            <p className="font-mono text-dark-400 text-xs">{ticket.equipment?.qrCode}</p>
                        </div>
                    </div>

                    {/* People Info */}
                    <div className="p-4 rounded-xl bg-dark-50 dark:bg-dark-700/50">
                        <h3 className="font-semibold text-dark-900 dark:text-white mb-3 flex items-center gap-2">
                            <User size={18} /> People
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-dark-500 text-xs mb-1">Raised By</p>
                                <p className="text-dark-700 dark:text-dark-300">{ticket.raisedBy?.name}</p>
                                <p className="text-dark-400 text-xs">{ticket.raisedBy?.email}</p>
                            </div>
                            {ticket.assignedTo && (
                                <div>
                                    <p className="text-dark-500 text-xs mb-1">Assigned To</p>
                                    <p className="text-dark-700 dark:text-dark-300">{ticket.assignedTo.name}</p>
                                    <p className="text-dark-400 text-xs">{ticket.assignedTo.email}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Timeline */}
            <Card hover={false}>
                <h3 className="font-semibold text-dark-900 dark:text-white mb-6 flex items-center gap-2">
                    <Clock size={18} /> Timeline
                </h3>
                <div className="space-y-4">
                    {ticket.timeline?.map((entry, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex gap-4"
                        >
                            <div className="flex flex-col items-center">
                                <div className={`w-3 h-3 rounded-full ${entry.status === 'closed' ? 'bg-green-500' :
                                    entry.status === 'rejected' ? 'bg-red-500' :
                                        'bg-primary-500'
                                    }`} />
                                {index < ticket.timeline.length - 1 && (
                                    <div className="w-0.5 h-full bg-dark-200 dark:bg-dark-700 mt-2" />
                                )}
                            </div>
                            <div className="flex-1 pb-4">
                                <p className="font-medium text-dark-900 dark:text-white capitalize">
                                    {entry.status.replace('_', ' ')}
                                </p>
                                {entry.notes && (
                                    <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
                                        {entry.notes}
                                    </p>
                                )}
                                <p className="text-xs text-dark-400 mt-1">
                                    {formatDateTime(entry.timestamp)}
                                    {entry.updatedBy?.name && ` • ${entry.updatedBy.name}`}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Card>

            {/* Comments Section */}
            <Card hover={false}>
                <TicketComments ticketId={params.id as string} />
            </Card>

            {/* Assign Modal */}
            <Modal
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                title="Assign Engineer"
            >
                <div className="space-y-4">
                    <Select
                        label="Select Engineer"
                        options={engineers.map(e => ({ value: e._id, label: `${e.name} (${e.email})` }))}
                        value={selectedEngineer}
                        onChange={(e) => setSelectedEngineer(e.target.value)}
                        placeholder="Choose an engineer"
                    />
                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={() => setShowAssignModal(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleAssign}
                            isLoading={submitting}
                            className="flex-1"
                        >
                            Assign
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Service Completion Modal */}
            <Modal
                isOpen={showServiceModal}
                onClose={() => setShowServiceModal(false)}
                title="Complete Service"
                size="lg"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                            Work Description
                        </label>
                        <textarea
                            value={serviceData.workDescription}
                            onChange={(e) => setServiceData({ ...serviceData, workDescription: e.target.value })}
                            placeholder="Describe the work completed..."
                            className="w-full px-4 py-3 rounded-xl border border-dark-200 dark:border-dark-700 bg-white/50 dark:bg-dark-800/50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                            rows={4}
                            required
                        />
                    </div>

                    <Input
                        label="Time Spent (minutes)"
                        type="number"
                        value={serviceData.timeSpent.toString()}
                        onChange={(e) => setServiceData({ ...serviceData, timeSpent: parseInt(e.target.value) || 0 })}
                        min={1}
                    />

                    <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                        <p className="text-sm text-yellow-700 dark:text-yellow-400">
                            <strong>Note:</strong> Before and after photos can be uploaded via the photo upload feature (coming soon).
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button variant="ghost" onClick={() => setShowServiceModal(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSubmitService}
                            isLoading={submitting}
                            className="flex-1"
                            leftIcon={<Send size={20} />}
                        >
                            Submit for Verification
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
