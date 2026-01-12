'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
    Camera,
    QrCode,
    ScanLine,
    AlertCircle,
    CheckCircle2,
    ArrowRight,
    Keyboard,
    X,
} from 'lucide-react';
import { Button, Card, Input, Modal, Select } from '@/components/ui';

interface Equipment {
    _id: string;
    name: string;
    type: string;
    qrCode: string;
    status: string;
    location: { building: string; floor: string; room: string };
    supplier: { name: string };
}

const issueTypes = [
    { value: 'not_working', label: 'Not Working' },
    { value: 'strange_noise', label: 'Strange Noise' },
    { value: 'leaking', label: 'Leaking' },
    { value: 'overheating', label: 'Overheating' },
    { value: 'performance_issue', label: 'Performance Issue' },
    { value: 'scheduled_maintenance', label: 'Scheduled Maintenance' },
    { value: 'other', label: 'Other' },
];

const priorityOptions = [
    { value: 'low', label: 'Low - Can wait' },
    { value: 'medium', label: 'Medium - Needs attention' },
    { value: 'high', label: 'High - Urgent' },
    { value: 'critical', label: 'Critical - Emergency' },
];

export default function ScanPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const userRole = (session?.user as any)?.role;

    const [scanning, setScanning] = useState(false);
    const [manualCode, setManualCode] = useState('');
    const [showManualInput, setShowManualInput] = useState(false);
    const [equipment, setEquipment] = useState<Equipment | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Ticket creation state
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [ticketData, setTicketData] = useState({
        issueType: '',
        priority: 'medium',
        description: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const scannerRef = useRef<any>(null);

    useEffect(() => {
        return () => {
            stopScanner();
        };
    }, []);

    const startScanner = async () => {
        setScanning(true);
        setError('');
        setEquipment(null);

        try {
            // Dynamic import of html5-qrcode
            const { Html5Qrcode } = await import('html5-qrcode');

            scannerRef.current = new Html5Qrcode('qr-reader');

            await scannerRef.current.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                },
                (decodedText: string) => {
                    handleScanResult(decodedText);
                    stopScanner();
                },
                () => { } // Ignore errors during scanning
            );
        } catch (err: any) {
            console.error('Scanner error:', err);
            setError('Unable to access camera. Please use manual entry.');
            setScanning(false);
            setShowManualInput(true);
        }
    };

    const stopScanner = () => {
        if (scannerRef.current) {
            scannerRef.current.stop().catch(() => { });
            scannerRef.current = null;
        }
        setScanning(false);
    };

    const handleScanResult = async (code: string) => {
        // Extract QR code from URL if needed
        let qrCode = code;
        if (code.includes('/')) {
            const parts = code.split('/');
            qrCode = parts[parts.length - 1];
        }

        await lookupEquipment(qrCode);
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualCode.trim()) return;
        await lookupEquipment(manualCode.trim().toUpperCase());
    };

    const lookupEquipment = async (code: string) => {
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`/api/equipment/qr/${code}`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Equipment not found');
            }

            setEquipment(data);
            setShowTicketModal(true);
        } catch (err: any) {
            setError(err.message || 'Failed to find equipment');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!equipment) return;

        setSubmitting(true);

        try {
            const res = await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    equipmentId: equipment._id,
                    issueType: ticketData.issueType,
                    priority: ticketData.priority,
                    description: ticketData.description,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to create ticket');
            }

            const ticket = await res.json();
            setSuccess(true);

            // Redirect after short delay
            setTimeout(() => {
                router.push(`/dashboard/tickets/${ticket._id}`);
            }, 1500);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const resetState = () => {
        setEquipment(null);
        setError('');
        setManualCode('');
        setShowTicketModal(false);
        setSuccess(false);
        setTicketData({ issueType: '', priority: 'medium', description: '' });
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/30 mb-4"
                >
                    <ScanLine className="w-10 h-10 text-white" />
                </motion.div>
                <h1 className="text-2xl md:text-3xl font-bold text-dark-900 dark:text-white mb-2">
                    Scan QR Code
                </h1>
                <p className="text-dark-500 dark:text-dark-400">
                    {userRole === 'engineer'
                        ? 'Scan to attend a service request'
                        : 'Scan equipment QR code to raise a complaint'}
                </p>
            </div>

            {/* Scanner Container */}
            <Card hover={false} className="mb-6 overflow-hidden">
                {!scanning && !equipment && (
                    <div className="text-center py-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="w-32 h-32 mx-auto rounded-2xl border-4 border-dashed border-dark-200 dark:border-dark-700 flex items-center justify-center">
                                <QrCode className="w-16 h-16 text-dark-300" />
                            </div>

                            <div className="space-y-3">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    onClick={startScanner}
                                    leftIcon={<Camera size={20} />}
                                    className="w-full sm:w-auto"
                                >
                                    Start Scanner
                                </Button>

                                <div className="text-dark-400">or</div>

                                <Button
                                    variant="outline"
                                    onClick={() => setShowManualInput(!showManualInput)}
                                    leftIcon={<Keyboard size={20} />}
                                >
                                    Enter Code Manually
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* QR Scanner View */}
                {scanning && (
                    <div className="relative">
                        <div id="qr-reader" className="w-full" style={{ minHeight: '300px' }} />
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={stopScanner}
                            className="absolute top-4 right-4"
                            leftIcon={<X size={16} />}
                        >
                            Stop
                        </Button>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto rounded-full border-4 border-primary-500 border-t-transparent animate-spin mb-4" />
                        <p className="text-dark-500">Looking up equipment...</p>
                    </div>
                )}
            </Card>

            {/* Manual Input */}
            {showManualInput && !scanning && !equipment && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card hover={false} className="mb-6">
                        <form onSubmit={handleManualSubmit} className="flex gap-3">
                            <Input
                                placeholder="Enter QR code (e.g., EQ-ABC12345)"
                                value={manualCode}
                                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                                className="flex-1"
                            />
                            <Button type="submit" variant="primary" isLoading={loading}>
                                Lookup
                            </Button>
                        </form>
                    </Card>
                </motion.div>
            )}

            {/* Error Message */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card hover={false} className="mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
                            <div>
                                <p className="font-medium text-red-600 dark:text-red-400">{error}</p>
                                <button
                                    onClick={resetState}
                                    className="text-sm text-red-500 hover:underline mt-1"
                                >
                                    Try again
                                </button>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* Create Ticket Modal */}
            <Modal
                isOpen={showTicketModal && !!equipment}
                onClose={() => {
                    if (!submitting && !success) {
                        setShowTicketModal(false);
                        resetState();
                    }
                }}
                title={success ? 'Ticket Created!' : 'Create Service Request'}
                size="lg"
            >
                {success ? (
                    <div className="text-center py-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                            className="w-20 h-20 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4"
                        >
                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                        </motion.div>
                        <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">
                            Ticket created successfully!
                        </h3>
                        <p className="text-dark-500 dark:text-dark-400">
                            Redirecting to ticket details...
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Equipment Info */}
                        {equipment && (
                            <div className="mb-6 p-4 rounded-xl bg-dark-50 dark:bg-dark-700/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white">
                                        <QrCode className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-dark-900 dark:text-white">{equipment.name}</h4>
                                        <p className="text-sm text-dark-500 dark:text-dark-400">
                                            {equipment.location.building}, Floor {equipment.location.floor}, Room {equipment.location.room}
                                        </p>
                                        <p className="text-xs text-dark-400 font-mono">{equipment.qrCode}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleCreateTicket} className="space-y-4">
                            <Select
                                label="Issue Type"
                                options={issueTypes}
                                value={ticketData.issueType}
                                onChange={(e) => setTicketData({ ...ticketData, issueType: e.target.value })}
                                placeholder="Select issue type"
                                required
                            />

                            <Select
                                label="Priority"
                                options={priorityOptions}
                                value={ticketData.priority}
                                onChange={(e) => setTicketData({ ...ticketData, priority: e.target.value })}
                            />

                            <div>
                                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                                    Description
                                </label>
                                <textarea
                                    value={ticketData.description}
                                    onChange={(e) => setTicketData({ ...ticketData, description: e.target.value })}
                                    placeholder="Describe the issue in detail..."
                                    className="w-full px-4 py-3 rounded-xl border border-dark-200 dark:border-dark-700 bg-white/50 dark:bg-dark-800/50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                                    rows={4}
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                        setShowTicketModal(false);
                                        resetState();
                                    }}
                                    className="flex-1"
                                    disabled={submitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="flex-1"
                                    isLoading={submitting}
                                    rightIcon={<ArrowRight size={20} />}
                                >
                                    Create Ticket
                                </Button>
                            </div>
                        </form>
                    </>
                )}
            </Modal>
        </div>
    );
}
