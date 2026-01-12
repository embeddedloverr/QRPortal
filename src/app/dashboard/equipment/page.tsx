'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    Filter,
    Grid3X3,
    List,
    Wrench,
    Wind,
    Droplets,
    Zap,
    ArrowUpDown,
    QrCode,
    MapPin,
    Building2,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    ChevronDown,
} from 'lucide-react';
import { Button, Card, Input, Select, Modal, Badge } from '@/components/ui';

interface Equipment {
    _id: string;
    name: string;
    type: string;
    qrCode: string;
    status: string;
    location: { building: string; floor: string; room: string };
    supplier: { name: string };
    createdAt: string;
}

const equipmentTypes = [
    { value: '', label: 'All Types' },
    { value: 'ac_unit', label: 'AC Unit' },
    { value: 'pump', label: 'Pump' },
    { value: 'generator', label: 'Generator' },
    { value: 'elevator', label: 'Elevator' },
    { value: 'other', label: 'Other' },
];

const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'under_service', label: 'Under Service' },
    { value: 'inactive', label: 'Inactive' },
];

const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
        ac_unit: <Wind className="w-6 h-6" />,
        pump: <Droplets className="w-6 h-6" />,
        generator: <Zap className="w-6 h-6" />,
        elevator: <ArrowUpDown className="w-6 h-6" />,
        other: <Wrench className="w-6 h-6" />,
    };
    return icons[type] || icons.other;
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

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export default function EquipmentPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const userRole = (session?.user as any)?.role;
    const canManage = ['admin', 'supervisor'].includes(userRole);

    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [customTypes, setCustomTypes] = useState<{ value: string, label: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [newEquipment, setNewEquipment] = useState({
        name: '',
        type: '',
        serialNumber: '',
        make: '',
        model: '',
        manufacturer: '',
        capacity: '',
        powerRating: '',
        building: '',
        floor: '',
        room: '',
        supplierName: '',
        supplierContact: '',
        supplierEmail: '',
        description: '',
        warrantyExpiry: '',
        installDate: '',
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchEquipmentTypes();
        fetchEquipment();
    }, [typeFilter, statusFilter]);

    const fetchEquipmentTypes = async () => {
        try {
            const res = await fetch('/api/equipment-types?active=true');
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                const typeOptions = data.map((t: any) => ({ value: t.code, label: t.name }));
                setCustomTypes(typeOptions);
            }
        } catch (error) {
            console.error('Error fetching equipment types:', error);
        }
    };

    const fetchEquipment = async () => {
        try {
            const params = new URLSearchParams();
            if (typeFilter) params.append('type', typeFilter);
            if (statusFilter) params.append('status', statusFilter);
            if (search) params.append('search', search);

            const res = await fetch(`/api/equipment?${params}`);
            const data = await res.json();
            setEquipment(data);
        } catch (error) {
            console.error('Error fetching equipment:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchEquipment();
    };

    const handleAddEquipment = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch('/api/equipment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newEquipment.name,
                    type: newEquipment.type,
                    serialNumber: newEquipment.serialNumber,
                    make: newEquipment.make,
                    model: newEquipment.model,
                    manufacturer: newEquipment.manufacturer,
                    capacity: newEquipment.capacity,
                    powerRating: newEquipment.powerRating,
                    location: {
                        building: newEquipment.building,
                        floor: newEquipment.floor,
                        room: newEquipment.room,
                    },
                    supplier: {
                        name: newEquipment.supplierName,
                        contact: newEquipment.supplierContact,
                        email: newEquipment.supplierEmail,
                    },
                    description: newEquipment.description,
                    warrantyExpiry: newEquipment.warrantyExpiry || undefined,
                    installDate: newEquipment.installDate || undefined,
                }),
            });

            if (res.ok) {
                setShowAddModal(false);
                setNewEquipment({
                    name: '',
                    type: '',
                    serialNumber: '',
                    make: '',
                    model: '',
                    manufacturer: '',
                    capacity: '',
                    powerRating: '',
                    building: '',
                    floor: '',
                    room: '',
                    supplierName: '',
                    supplierContact: '',
                    supplierEmail: '',
                    description: '',
                    warrantyExpiry: '',
                    installDate: '',
                });
                fetchEquipment();
            }
        } catch (error) {
            console.error('Error adding equipment:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredEquipment = equipment.filter((eq) =>
        eq.name.toLowerCase().includes(search.toLowerCase()) ||
        eq.qrCode.toLowerCase().includes(search.toLowerCase()) ||
        eq.location.building.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-dark-900 dark:text-white">
                        Equipment
                    </h1>
                    <p className="text-dark-500 dark:text-dark-400">
                        Manage all registered equipment
                    </p>
                </div>
                {canManage && (
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => window.open('/api/export?type=equipment', '_blank')}
                        >
                            Export Excel
                        </Button>
                        <Button
                            variant="primary"
                            leftIcon={<Plus size={20} />}
                            onClick={() => router.push('/dashboard/equipment/new')}
                        >
                            Add Equipment
                        </Button>
                    </div>
                )}
            </div>

            {/* Filters */}
            <Card hover={false} className="mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    <form onSubmit={handleSearch} className="flex-1">
                        <Input
                            placeholder="Search by name, QR code, or location..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            leftIcon={<Search size={20} />}
                        />
                    </form>
                    <div className="flex flex-wrap gap-4">
                        <Select
                            options={customTypes.length > 0 ? [{ value: '', label: 'All Types' }, ...customTypes] : equipmentTypes}
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="w-40"
                        />
                        <Select
                            options={statusOptions}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-40"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2.5 rounded-xl transition-colors ${viewMode === 'grid'
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-dark-100 dark:bg-dark-700 text-dark-500'
                                    }`}
                            >
                                <Grid3X3 size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2.5 rounded-xl transition-colors ${viewMode === 'list'
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-dark-100 dark:bg-dark-700 text-dark-500'
                                    }`}
                            >
                                <List size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Equipment Grid/List */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="skeleton h-48 rounded-2xl" />
                    ))}
                </div>
            ) : filteredEquipment.length === 0 ? (
                <Card hover={false} className="text-center py-12">
                    <Wrench className="w-16 h-16 mx-auto text-dark-300 mb-4" />
                    <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-2">
                        No Equipment Found
                    </h3>
                    <p className="text-dark-500 dark:text-dark-400 mb-4">
                        {search || typeFilter || statusFilter
                            ? 'Try adjusting your filters'
                            : 'Add your first equipment to get started'}
                    </p>
                    {canManage && !search && !typeFilter && !statusFilter && (
                        <Button variant="primary" onClick={() => setShowAddModal(true)}>
                            Add Equipment
                        </Button>
                    )}
                </Card>
            ) : viewMode === 'grid' ? (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {filteredEquipment.map((eq) => (
                        <motion.div key={eq._id} variants={itemVariants}>
                            <Card className="relative group">
                                <div className="flex items-start gap-4">
                                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getTypeColor(eq.type)} flex items-center justify-center text-white shrink-0`}>
                                        {getTypeIcon(eq.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-dark-900 dark:text-white truncate">
                                            {eq.name}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-dark-500 dark:text-dark-400 mt-1">
                                            <QrCode size={14} />
                                            <span className="font-mono">{eq.qrCode}</span>
                                        </div>
                                    </div>
                                    <Badge variant={eq.status === 'active' ? 'closed' : eq.status === 'under_service' ? 'pending' : 'rejected'}>
                                        {eq.status.replace('_', ' ')}
                                    </Badge>
                                </div>

                                <div className="mt-4 space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-dark-500 dark:text-dark-400">
                                        <MapPin size={14} />
                                        <span>{eq.location.building}, Floor {eq.location.floor}, Room {eq.location.room}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-dark-500 dark:text-dark-400">
                                        <Building2 size={14} />
                                        <span>{eq.supplier.name}</span>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="flex gap-1">
                                        <button className="p-2 rounded-lg bg-dark-100 dark:bg-dark-700 hover:bg-dark-200 dark:hover:bg-dark-600 transition-colors">
                                            <Eye size={16} className="text-dark-500" />
                                        </button>
                                        {canManage && (
                                            <>
                                                <button className="p-2 rounded-lg bg-dark-100 dark:bg-dark-700 hover:bg-dark-200 dark:hover:bg-dark-600 transition-colors">
                                                    <Edit size={16} className="text-dark-500" />
                                                </button>
                                                <button className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                                                    <Trash2 size={16} className="text-red-500" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <Card hover={false} className="overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-dark-50 dark:bg-dark-800">
                                <tr>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-dark-600 dark:text-dark-300">Equipment</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-dark-600 dark:text-dark-300">QR Code</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-dark-600 dark:text-dark-300">Location</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-dark-600 dark:text-dark-300">Status</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-dark-600 dark:text-dark-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-100 dark:divide-dark-700">
                                {filteredEquipment.map((eq) => (
                                    <tr key={eq._id} className="hover:bg-dark-50 dark:hover:bg-dark-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getTypeColor(eq.type)} flex items-center justify-center text-white`}>
                                                    {getTypeIcon(eq.type)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-dark-900 dark:text-white">{eq.name}</p>
                                                    <p className="text-sm text-dark-500 capitalize">{eq.type.replace('_', ' ')}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm text-dark-600 dark:text-dark-300">{eq.qrCode}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-dark-600 dark:text-dark-300">
                                                {eq.location.building}, {eq.location.floor}, {eq.location.room}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={eq.status === 'active' ? 'closed' : eq.status === 'under_service' ? 'pending' : 'rejected'}>
                                                {eq.status.replace('_', ' ')}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors">
                                                    <Eye size={16} className="text-dark-500" />
                                                </button>
                                                {canManage && (
                                                    <button className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors">
                                                        <Edit size={16} className="text-dark-500" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Add Equipment Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add New Equipment"
                size="lg"
            >
                <form onSubmit={handleAddEquipment} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Equipment Name"
                            placeholder="e.g., Split AC Unit"
                            value={newEquipment.name}
                            onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                            required
                        />
                        <Select
                            label="Type"
                            options={customTypes.length > 0 ? customTypes : equipmentTypes.filter(t => t.value)}
                            value={newEquipment.type}
                            onChange={(e) => setNewEquipment({ ...newEquipment, type: e.target.value })}
                            placeholder="Select equipment type"
                            required
                        />
                    </div>

                    <Input
                        label="Serial Number"
                        placeholder="Enter serial number (optional)"
                        value={newEquipment.serialNumber}
                        onChange={(e) => setNewEquipment({ ...newEquipment, serialNumber: e.target.value })}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            label="Building"
                            placeholder="Building A"
                            value={newEquipment.building}
                            onChange={(e) => setNewEquipment({ ...newEquipment, building: e.target.value })}
                            required
                        />
                        <Input
                            label="Floor"
                            placeholder="3rd Floor"
                            value={newEquipment.floor}
                            onChange={(e) => setNewEquipment({ ...newEquipment, floor: e.target.value })}
                            required
                        />
                        <Input
                            label="Room"
                            placeholder="Room 301"
                            value={newEquipment.room}
                            onChange={(e) => setNewEquipment({ ...newEquipment, room: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            label="Supplier Name"
                            placeholder="Supplier company"
                            value={newEquipment.supplierName}
                            onChange={(e) => setNewEquipment({ ...newEquipment, supplierName: e.target.value })}
                            required
                        />
                        <Input
                            label="Supplier Contact"
                            placeholder="Phone number"
                            value={newEquipment.supplierContact}
                            onChange={(e) => setNewEquipment({ ...newEquipment, supplierContact: e.target.value })}
                        />
                        <Input
                            label="Supplier Email"
                            type="email"
                            placeholder="Email address"
                            value={newEquipment.supplierEmail}
                            onChange={(e) => setNewEquipment({ ...newEquipment, supplierEmail: e.target.value })}
                        />
                    </div>

                    {/* Advanced Fields Toggle */}
                    <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center gap-2 text-sm text-primary-500 hover:text-primary-600 transition-colors"
                    >
                        <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                        {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                    </button>

                    {showAdvanced && (
                        <div className="space-y-4 p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50 border border-dark-200 dark:border-dark-700">
                            <p className="text-xs text-dark-500 dark:text-dark-400 mb-4">All fields below are optional</p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    label="Make"
                                    placeholder="e.g., Daikin"
                                    value={newEquipment.make}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, make: e.target.value })}
                                />
                                <Input
                                    label="Model"
                                    placeholder="e.g., FTKF35TV"
                                    value={newEquipment.model}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, model: e.target.value })}
                                />
                                <Input
                                    label="Manufacturer"
                                    placeholder="e.g., Daikin Industries"
                                    value={newEquipment.manufacturer}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, manufacturer: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Capacity"
                                    placeholder="e.g., 1.5 Ton, 5 HP"
                                    value={newEquipment.capacity}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, capacity: e.target.value })}
                                />
                                <Input
                                    label="Power Rating"
                                    placeholder="e.g., 1200W, 3 kVA"
                                    value={newEquipment.powerRating}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, powerRating: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Installation Date"
                                    type="date"
                                    value={newEquipment.installDate}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, installDate: e.target.value })}
                                />
                                <Input
                                    label="Warranty Expiry"
                                    type="date"
                                    value={newEquipment.warrantyExpiry}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, warrantyExpiry: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                                    Description / Notes
                                </label>
                                <textarea
                                    value={newEquipment.description}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, description: e.target.value })}
                                    placeholder="Additional notes about the equipment..."
                                    className="w-full px-4 py-3 rounded-xl border border-dark-200 dark:border-dark-700 bg-white/50 dark:bg-dark-800/50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setShowAddModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={submitting}
                        >
                            Add Equipment
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
