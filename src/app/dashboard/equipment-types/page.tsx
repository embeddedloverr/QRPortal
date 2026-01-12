'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
    Plus,
    Tags,
    Edit,
    Trash2,
    Check,
    X,
    Wrench,
    Zap,
    Droplet,
    Wind,
    Box,
} from 'lucide-react';
import { Button, Card, Input, Modal } from '@/components/ui';

interface EquipmentType {
    _id: string;
    name: string;
    code: string;
    description?: string;
    icon?: string;
    isActive: boolean;
}

const iconOptions = [
    { value: 'wrench', label: 'Wrench', icon: <Wrench size={20} /> },
    { value: 'zap', label: 'Electrical', icon: <Zap size={20} /> },
    { value: 'droplet', label: 'Plumbing', icon: <Droplet size={20} /> },
    { value: 'wind', label: 'HVAC', icon: <Wind size={20} /> },
    { value: 'box', label: 'General', icon: <Box size={20} /> },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export default function EquipmentTypesPage() {
    const { data: session } = useSession();
    const [types, setTypes] = useState<EquipmentType[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingType, setEditingType] = useState<EquipmentType | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        icon: 'wrench',
    });

    useEffect(() => {
        fetchTypes();
    }, []);

    const fetchTypes = async () => {
        try {
            const res = await fetch('/api/equipment-types');
            const data = await res.json();
            if (Array.isArray(data)) {
                setTypes(data);
            }
        } catch (error) {
            console.error('Error fetching types:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (type?: EquipmentType) => {
        if (type) {
            setEditingType(type);
            setFormData({
                name: type.name,
                code: type.code,
                description: type.description || '',
                icon: type.icon || 'wrench',
            });
        } else {
            setEditingType(null);
            setFormData({ name: '', code: '', description: '', icon: 'wrench' });
        }
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.code) return;
        setSubmitting(true);

        try {
            const url = editingType
                ? `/api/equipment-types/${editingType._id}`
                : '/api/equipment-types';

            const res = await fetch(url, {
                method: editingType ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setShowModal(false);
                fetchTypes();
            }
        } catch (error) {
            console.error('Error saving type:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleActive = async (type: EquipmentType) => {
        try {
            await fetch(`/api/equipment-types/${type._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !type.isActive }),
            });
            fetchTypes();
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this equipment type?')) return;

        try {
            await fetch(`/api/equipment-types/${id}`, { method: 'DELETE' });
            fetchTypes();
        } catch (error) {
            console.error('Error deleting type:', error);
        }
    };

    const getIconComponent = (iconName: string) => {
        const iconMap: Record<string, React.ReactNode> = {
            wrench: <Wrench size={24} />,
            zap: <Zap size={24} />,
            droplet: <Droplet size={24} />,
            wind: <Wind size={24} />,
            box: <Box size={24} />,
        };
        return iconMap[iconName] || <Wrench size={24} />;
    };

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-dark-900 dark:text-white">
                        Equipment Types
                    </h1>
                    <p className="text-dark-500 dark:text-dark-400">
                        Manage equipment categories and types
                    </p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => handleOpenModal()}
                    leftIcon={<Plus size={20} />}
                >
                    Add Type
                </Button>
            </div>

            {/* Types Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="skeleton h-40 rounded-2xl" />
                    ))}
                </div>
            ) : types.length === 0 ? (
                <Card hover={false} className="text-center py-12">
                    <Tags className="w-16 h-16 mx-auto text-dark-300 dark:text-dark-600 mb-4" />
                    <h3 className="text-lg font-semibold text-dark-700 dark:text-dark-300 mb-2">
                        No Equipment Types
                    </h3>
                    <p className="text-dark-500 dark:text-dark-400 mb-4">
                        Create your first equipment type to get started
                    </p>
                    <Button variant="primary" onClick={() => handleOpenModal()} leftIcon={<Plus size={20} />}>
                        Add Type
                    </Button>
                </Card>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {types.map((type) => (
                        <motion.div key={type._id} variants={itemVariants}>
                            <Card className={`relative ${!type.isActive ? 'opacity-60' : ''}`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${type.isActive
                                            ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
                                            : 'bg-dark-200 dark:bg-dark-700 text-dark-500'
                                        }`}>
                                        {getIconComponent(type.icon || 'wrench')}
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleToggleActive(type)}
                                            className={`p-2 rounded-lg transition-colors ${type.isActive
                                                    ? 'text-green-500 hover:bg-green-100 dark:hover:bg-green-900/20'
                                                    : 'text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-700'
                                                }`}
                                            title={type.isActive ? 'Deactivate' : 'Activate'}
                                        >
                                            <Check size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleOpenModal(type)}
                                            className="p-2 rounded-lg text-dark-400 hover:text-primary-500 hover:bg-primary-100 dark:hover:bg-primary-900/20 transition-colors"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(type._id)}
                                            className="p-2 rounded-lg text-dark-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="font-semibold text-dark-900 dark:text-white mb-1">
                                    {type.name}
                                </h3>
                                <p className="text-sm font-mono text-primary-500 mb-2">{type.code}</p>
                                {type.description && (
                                    <p className="text-sm text-dark-500 dark:text-dark-400 line-clamp-2">
                                        {type.description}
                                    </p>
                                )}
                                {!type.isActive && (
                                    <span className="absolute top-3 right-3 px-2 py-1 text-xs font-medium bg-dark-200 dark:bg-dark-700 text-dark-500 rounded-full">
                                        Inactive
                                    </span>
                                )}
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingType ? 'Edit Equipment Type' : 'Add Equipment Type'}
            >
                <div className="space-y-4">
                    <Input
                        label="Type Name"
                        placeholder="e.g., Air Conditioner"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Type Code"
                        placeholder="e.g., ac_unit"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                        required
                        disabled={!!editingType}
                    />
                    <div>
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                            Icon
                        </label>
                        <div className="flex gap-2 flex-wrap">
                            {iconOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, icon: opt.value })}
                                    className={`p-3 rounded-xl border-2 transition-all ${formData.icon === opt.value
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                                            : 'border-dark-200 dark:border-dark-700 text-dark-500 hover:border-dark-300'
                                        }`}
                                    title={opt.label}
                                >
                                    {opt.icon}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                            Description (optional)
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description of this equipment type..."
                            className="w-full px-4 py-3 rounded-xl border border-dark-200 dark:border-dark-700 bg-white/50 dark:bg-dark-800/50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                            rows={3}
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button variant="ghost" onClick={() => setShowModal(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSubmit}
                            isLoading={submitting}
                            className="flex-1"
                        >
                            {editingType ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
