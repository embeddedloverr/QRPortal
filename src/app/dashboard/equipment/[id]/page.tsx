'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import QRCodeLib from 'qrcode';
import {
    ArrowLeft,
    Wrench,
    MapPin,
    Building2,
    Phone,
    Mail,
    QrCode,
    Edit,
    Trash2,
    Ticket,
    Clock,
    Calendar,
    AlertTriangle,
    Download,
} from 'lucide-react';
import { Button, Card, Badge, Modal, Input, Select } from '@/components/ui';

interface Equipment {
    _id: string;
    name: string;
    type: string;
    qrCode: string;
    serialNumber?: string;
    status: string;
    location: { building: string; floor: string; room: string };
    supplier: { name: string; contact?: string; email?: string };
    installDate?: string;
    warrantyExpiry?: string;
    lastServiceDate?: string;
    description?: string;
    createdAt: string;
}

export default function EquipmentDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [equipment, setEquipment] = useState<Equipment | null>(null);
    const [loading, setLoading] = useState(true);
    const [showQRModal, setShowQRModal] = useState(false);
    const [isEditing, setIsEditing] = useState(searchParams.get('edit') === 'true');
    const [saving, setSaving] = useState(false);
    const [qrDataUrl, setQrDataUrl] = useState('');
    const [editData, setEditData] = useState({
        name: '',
        status: '',
        building: '',
        floor: '',
        room: '',
    });

    useEffect(() => {
        fetchEquipment();
    }, [params.id]);

    const fetchEquipment = async () => {
        try {
            const res = await fetch(`/api/equipment/${params.id}`);
            const data = await res.json();
            if (res.ok) {
                setEquipment(data);
                setEditData({
                    name: data.name,
                    status: data.status,
                    building: data.location.building,
                    floor: data.location.floor,
                    room: data.location.room,
                });
                // Generate QR code
                const baseUrl = 'https://service.smartdwell.in';
                const qrUrl = `${baseUrl}/equipment/${data.qrCode}`;
                const dataUrl = await QRCodeLib.toDataURL(qrUrl, { width: 200, margin: 2 });
                setQrDataUrl(dataUrl);
            }
        } catch (error) {
            console.error('Error fetching equipment:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/equipment/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editData.name,
                    status: editData.status,
                    location: {
                        building: editData.building,
                        floor: editData.floor,
                        room: editData.room,
                    },
                }),
            });
            if (res.ok) {
                setIsEditing(false);
                fetchEquipment();
            }
        } catch (error) {
            console.error('Error saving:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDownloadQR = () => {
        if (!qrDataUrl || !equipment) return;
        const link = document.createElement('a');
        link.download = `qr-${equipment.qrCode}.png`;
        link.href = qrDataUrl;
        link.click();
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            ac_unit: 'from-blue-400 to-blue-600',
            pump: 'from-green-400 to-green-600',
            generator: 'from-orange-400 to-orange-600',
            elevator: 'from-purple-400 to-purple-600',
            other: 'from-gray-400 to-gray-600',
        };
        return colors[type] || colors.other;
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="skeleton h-8 w-48 mb-8" />
                <div className="skeleton h-64 rounded-2xl" />
            </div>
        );
    }

    if (!equipment) {
        return (
            <div className="max-w-4xl mx-auto text-center py-12">
                <AlertTriangle className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
                <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">
                    Equipment Not Found
                </h2>
                <Button variant="ghost" onClick={() => router.back()} leftIcon={<ArrowLeft size={20} />}>
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-dark-500 hover:text-dark-700 dark:hover:text-dark-300 transition-colors mb-6"
            >
                <ArrowLeft size={20} />
                <span>Back to Equipment</span>
            </button>

            {/* Equipment Header */}
            <Card hover={false} className="mb-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getTypeColor(equipment.type)} flex items-center justify-center text-white shrink-0`}>
                            <Wrench className="w-8 h-8" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-xl md:text-2xl font-bold text-dark-900 dark:text-white">
                                    {equipment.name}
                                </h1>
                                <Badge variant={equipment.status === 'active' ? 'closed' : equipment.status === 'under_service' ? 'pending' : 'rejected'}>
                                    {equipment.status.replace('_', ' ')}
                                </Badge>
                            </div>
                            <p className="text-dark-500 dark:text-dark-400 capitalize">
                                {equipment.type.replace('_', ' ')}
                            </p>
                            {equipment.serialNumber && (
                                <p className="text-sm text-dark-400 mt-1">
                                    S/N: {equipment.serialNumber}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowQRModal(true)}
                            leftIcon={<QrCode size={18} />}
                        >
                            View QR
                        </Button>
                        <Button
                            variant="ghost"
                            leftIcon={<Edit size={18} />}
                            onClick={() => setIsEditing(!isEditing)}
                        >
                            {isEditing ? 'Cancel' : 'Edit'}
                        </Button>
                        {isEditing && (
                            <Button variant="primary" onClick={handleSave} isLoading={saving}>
                                Save
                            </Button>
                        )}
                    </div>
                </div>
            </Card>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Location */}
                <Card hover={false}>
                    <h3 className="font-semibold text-dark-900 dark:text-white mb-4 flex items-center gap-2">
                        <MapPin size={18} className="text-primary-500" />
                        Location
                    </h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-dark-500 dark:text-dark-400">Building</span>
                            <span className="text-dark-900 dark:text-white font-medium">{equipment.location.building}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-dark-500 dark:text-dark-400">Floor</span>
                            <span className="text-dark-900 dark:text-white font-medium">{equipment.location.floor}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-dark-500 dark:text-dark-400">Room</span>
                            <span className="text-dark-900 dark:text-white font-medium">{equipment.location.room}</span>
                        </div>
                    </div>
                </Card>

                {/* Supplier */}
                <Card hover={false}>
                    <h3 className="font-semibold text-dark-900 dark:text-white mb-4 flex items-center gap-2">
                        <Building2 size={18} className="text-secondary-500" />
                        Supplier
                    </h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-dark-500 dark:text-dark-400">Company</span>
                            <span className="text-dark-900 dark:text-white font-medium">{equipment.supplier.name}</span>
                        </div>
                        {equipment.supplier.contact && (
                            <div className="flex justify-between items-center">
                                <span className="text-dark-500 dark:text-dark-400">Contact</span>
                                <a href={`tel:${equipment.supplier.contact}`} className="text-primary-500 hover:underline flex items-center gap-1">
                                    <Phone size={14} />
                                    {equipment.supplier.contact}
                                </a>
                            </div>
                        )}
                        {equipment.supplier.email && (
                            <div className="flex justify-between items-center">
                                <span className="text-dark-500 dark:text-dark-400">Email</span>
                                <a href={`mailto:${equipment.supplier.email}`} className="text-primary-500 hover:underline flex items-center gap-1">
                                    <Mail size={14} />
                                    {equipment.supplier.email}
                                </a>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Dates and Service Info */}
            <Card hover={false} className="mb-6">
                <h3 className="font-semibold text-dark-900 dark:text-white mb-4 flex items-center gap-2">
                    <Calendar size={18} className="text-accent-500" />
                    Service Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-dark-50 dark:bg-dark-700/50 text-center">
                        <p className="text-sm text-dark-500 dark:text-dark-400 mb-1">Install Date</p>
                        <p className="font-semibold text-dark-900 dark:text-white">
                            {equipment.installDate ? new Date(equipment.installDate).toLocaleDateString() : 'N/A'}
                        </p>
                    </div>
                    <div className="p-4 rounded-xl bg-dark-50 dark:bg-dark-700/50 text-center">
                        <p className="text-sm text-dark-500 dark:text-dark-400 mb-1">Warranty Expiry</p>
                        <p className="font-semibold text-dark-900 dark:text-white">
                            {equipment.warrantyExpiry ? new Date(equipment.warrantyExpiry).toLocaleDateString() : 'N/A'}
                        </p>
                    </div>
                    <div className="p-4 rounded-xl bg-dark-50 dark:bg-dark-700/50 text-center">
                        <p className="text-sm text-dark-500 dark:text-dark-400 mb-1">Last Service</p>
                        <p className="font-semibold text-dark-900 dark:text-white">
                            {equipment.lastServiceDate ? new Date(equipment.lastServiceDate).toLocaleDateString() : 'Never'}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Quick Actions */}
            <Card hover={false}>
                <h3 className="font-semibold text-dark-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                    <Link href={`/dashboard/scan?equipment=${equipment.qrCode}`}>
                        <Button variant="primary" leftIcon={<Ticket size={18} />}>
                            Raise Ticket
                        </Button>
                    </Link>
                    <Link href={`/dashboard/tickets?equipment=${equipment._id}`}>
                        <Button variant="outline" leftIcon={<Clock size={18} />}>
                            View History
                        </Button>
                    </Link>
                </div>
            </Card>

            {/* QR Modal */}
            <Modal
                isOpen={showQRModal}
                onClose={() => setShowQRModal(false)}
                title="Equipment QR Code"
            >
                <div className="text-center py-6">
                    <div className="inline-block p-6 bg-white rounded-2xl shadow-lg mb-4">
                        {qrDataUrl ? (
                            <img src={qrDataUrl} alt={equipment.qrCode} className="w-48 h-48" />
                        ) : (
                            <div className="w-48 h-48 bg-dark-100 rounded-xl flex items-center justify-center">
                                <QrCode className="w-24 h-24 text-dark-400" />
                            </div>
                        )}
                    </div>
                    <p className="font-mono text-lg font-semibold text-dark-900 dark:text-white mb-2">
                        {equipment.qrCode}
                    </p>
                    <p className="text-sm text-dark-500 dark:text-dark-400 mb-6">
                        Scan this code to identify the equipment
                    </p>
                    <Button variant="primary" leftIcon={<Download size={18} />} onClick={handleDownloadQR}>
                        Download QR Code
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
