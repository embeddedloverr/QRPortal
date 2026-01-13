'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Wrench,
    MapPin,
    Building2,
    Calendar,
    Phone,
    Mail,
    AlertTriangle,
    CheckCircle2,
    Clock,
    QrCode,
    ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { Card, Button, Badge } from '@/components/ui';

interface Equipment {
    _id: string;
    name: string;
    type: string;
    qrCode: string;
    status: string;
    serialNumber?: string;
    make?: string;
    modelNumber?: string;
    manufacturer?: string;
    capacity?: string;
    powerRating?: string;
    description?: string;
    location: { building: string; floor: string; room: string };
    supplier: { name: string; contact?: string; email?: string };
    installDate?: string;
    warrantyExpiry?: string;
    lastServiceDate?: string;
    nextServiceDate?: string;
}

export default function PublicEquipmentPage() {
    const params = useParams();
    const qrCode = params.qrCode as string;

    const [equipment, setEquipment] = useState<Equipment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                const res = await fetch(`/api/equipment/public/${qrCode}`);
                if (res.ok) {
                    const data = await res.json();
                    setEquipment(data);
                } else {
                    setError('Equipment not found');
                }
            } catch (err) {
                setError('Failed to load equipment details');
            } finally {
                setLoading(false);
            }
        };

        if (qrCode) {
            fetchEquipment();
        }
    }, [qrCode]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-dark-50 to-dark-100 dark:from-dark-900 dark:to-dark-950 flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (error || !equipment) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-dark-50 to-dark-100 dark:from-dark-900 dark:to-dark-950 flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center">
                    <AlertTriangle className="w-16 h-16 mx-auto text-orange-500 mb-4" />
                    <h1 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
                        Equipment Not Found
                    </h1>
                    <p className="text-dark-500 dark:text-dark-400 mb-6">
                        The QR code "{qrCode}" does not match any registered equipment.
                    </p>
                    <Link href="/login">
                        <Button variant="primary">Go to Login</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'from-green-400 to-green-600';
            case 'under_service': return 'from-orange-400 to-orange-600';
            default: return 'from-gray-400 to-gray-600';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-50 to-dark-100 dark:from-dark-900 dark:to-dark-950 p-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8 pt-8"
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/30 mb-4">
                        <QrCode className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-dark-900 dark:text-white">
                        Equipment Details
                    </h1>
                </motion.div>

                {/* Equipment Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card hover={false} className="mb-6">
                        <div className="flex items-start gap-4 mb-6">
                            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getStatusColor(equipment.status)} flex items-center justify-center text-white shrink-0`}>
                                <Wrench className="w-8 h-8" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-dark-900 dark:text-white">
                                    {equipment.name}
                                </h2>
                                <p className="text-dark-500 dark:text-dark-400 capitalize">
                                    {equipment.type.replace('_', ' ')}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant={equipment.status === 'active' ? 'closed' : equipment.status === 'under_service' ? 'pending' : 'rejected'}>
                                        {equipment.status.replace('_', ' ')}
                                    </Badge>
                                    <span className="text-sm font-mono text-dark-500">
                                        {equipment.qrCode}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="p-4 rounded-xl bg-dark-50 dark:bg-dark-800 mb-4">
                            <div className="flex items-center gap-2 text-dark-500 dark:text-dark-400 mb-2">
                                <MapPin size={18} />
                                <span className="font-medium">Location</span>
                            </div>
                            <p className="text-dark-900 dark:text-white">
                                {equipment.location.building}, Floor {equipment.location.floor}, Room {equipment.location.room}
                            </p>
                        </div>

                        {/* Supplier */}
                        <div className="p-4 rounded-xl bg-dark-50 dark:bg-dark-800 mb-4">
                            <div className="flex items-center gap-2 text-dark-500 dark:text-dark-400 mb-2">
                                <Building2 size={18} />
                                <span className="font-medium">Supplier</span>
                            </div>
                            <p className="text-dark-900 dark:text-white mb-1">{equipment.supplier.name}</p>
                            {equipment.supplier.contact && (
                                <p className="flex items-center gap-2 text-sm text-dark-500">
                                    <Phone size={14} /> {equipment.supplier.contact}
                                </p>
                            )}
                            {equipment.supplier.email && (
                                <p className="flex items-center gap-2 text-sm text-dark-500">
                                    <Mail size={14} /> {equipment.supplier.email}
                                </p>
                            )}
                        </div>

                        {/* Service Info */}
                        {(equipment.lastServiceDate || equipment.nextServiceDate) && (
                            <div className="p-4 rounded-xl bg-dark-50 dark:bg-dark-800">
                                <div className="flex items-center gap-2 text-dark-500 dark:text-dark-400 mb-2">
                                    <Calendar size={18} />
                                    <span className="font-medium">Service Info</span>
                                </div>
                                {equipment.lastServiceDate && (
                                    <p className="text-sm text-dark-600 dark:text-dark-300">
                                        Last Service: {new Date(equipment.lastServiceDate).toLocaleDateString()}
                                    </p>
                                )}
                                {equipment.nextServiceDate && (
                                    <p className="text-sm text-dark-600 dark:text-dark-300">
                                        Next Service: {new Date(equipment.nextServiceDate).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        )}
                    </Card>
                </motion.div>

                {/* Action Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center"
                >
                    <Link href="/login">
                        <Button variant="primary" size="lg" rightIcon={<AlertTriangle size={20} />}>
                            Report an Issue
                        </Button>
                    </Link>
                    <p className="text-sm text-dark-500 dark:text-dark-400 mt-3">
                        Login required to report issues
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
