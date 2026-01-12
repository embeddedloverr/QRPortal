'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import {
    Building2,
    Plus,
    Trash2,
    Edit,
    Map,
    Upload,
    Save,
    X,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { Button, Card, Input, Modal } from '@/components/ui';

interface Floor {
    _id?: string;
    name: string;
    level: number;
    mapImage?: string;
}

interface Building {
    _id: string;
    name: string;
    code: string;
    address?: string;
    floors: Floor[];
    isActive: boolean;
}

export default function FloorMapsPage() {
    const { data: session } = useSession();
    const userRole = (session?.user as any)?.role;

    const [buildings, setBuildings] = useState<Building[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
    const [expandedBuilding, setExpandedBuilding] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        address: '',
        floors: [] as Floor[],
    });

    useEffect(() => {
        fetchBuildings();
    }, []);

    const fetchBuildings = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/buildings');
            if (res.ok) {
                const data = await res.json();
                setBuildings(data);
            }
        } catch (error) {
            console.error('Error fetching buildings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingBuilding
                ? `/api/buildings/${editingBuilding._id}`
                : '/api/buildings';
            const method = editingBuilding ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                fetchBuildings();
                setShowAddModal(false);
                setEditingBuilding(null);
                resetForm();
            }
        } catch (error) {
            console.error('Error saving building:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this building?')) return;

        try {
            const res = await fetch(`/api/buildings/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchBuildings();
            }
        } catch (error) {
            console.error('Error deleting building:', error);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', code: '', address: '', floors: [] });
    };

    const openEditModal = (building: Building) => {
        setEditingBuilding(building);
        setFormData({
            name: building.name,
            code: building.code,
            address: building.address || '',
            floors: building.floors,
        });
        setShowAddModal(true);
    };

    const addFloor = () => {
        const newLevel = formData.floors.length > 0
            ? Math.max(...formData.floors.map(f => f.level)) + 1
            : 0;
        setFormData({
            ...formData,
            floors: [...formData.floors, { name: `Floor ${newLevel}`, level: newLevel }],
        });
    };

    const updateFloor = (index: number, field: string, value: any) => {
        const newFloors = [...formData.floors];
        (newFloors[index] as any)[field] = value;
        setFormData({ ...formData, floors: newFloors });
    };

    const removeFloor = (index: number) => {
        const newFloors = formData.floors.filter((_, i) => i !== index);
        setFormData({ ...formData, floors: newFloors });
    };

    const handleFloorMapUpload = async (index: number, file: File) => {
        const formDataUpload = new FormData();
        formDataUpload.append('files', file);
        formDataUpload.append('folder', 'floor-maps');

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formDataUpload,
            });

            if (res.ok) {
                const data = await res.json();
                if (data.urls && data.urls.length > 0) {
                    updateFloor(index, 'mapImage', data.urls[0]);
                }
            }
        } catch (error) {
            console.error('Error uploading floor map:', error);
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-dark-900 dark:text-white">
                        Floor Maps
                    </h1>
                    <p className="text-dark-500 dark:text-dark-400">
                        Manage buildings and floor map images
                    </p>
                </div>
                {userRole === 'admin' && (
                    <Button
                        variant="primary"
                        leftIcon={<Plus size={20} />}
                        onClick={() => {
                            resetForm();
                            setEditingBuilding(null);
                            setShowAddModal(true);
                        }}
                    >
                        Add Building
                    </Button>
                )}
            </div>

            {/* Buildings List */}
            {loading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="skeleton h-24 rounded-2xl" />
                    ))}
                </div>
            ) : buildings.length === 0 ? (
                <Card hover={false} className="text-center py-12">
                    <Building2 className="w-16 h-16 mx-auto text-dark-300 mb-4" />
                    <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-2">
                        No Buildings Found
                    </h3>
                    <p className="text-dark-500 dark:text-dark-400 mb-4">
                        Add a building to start managing floor maps
                    </p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {buildings.map((building) => (
                        <motion.div
                            key={building._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card hover={false}>
                                {/* Building Header */}
                                <div
                                    className="flex items-center gap-4 cursor-pointer"
                                    onClick={() => setExpandedBuilding(
                                        expandedBuilding === building._id ? null : building._id
                                    )}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white">
                                        <Building2 size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-dark-900 dark:text-white">
                                            {building.name}
                                        </h3>
                                        <p className="text-sm text-dark-500">
                                            Code: {building.code} • {building.floors.length} floors
                                        </p>
                                    </div>
                                    {userRole === 'admin' && (
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openEditModal(building);
                                                }}
                                            >
                                                <Edit size={16} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(building._id);
                                                }}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    )}
                                    {expandedBuilding === building._id ? (
                                        <ChevronUp size={20} className="text-dark-400" />
                                    ) : (
                                        <ChevronDown size={20} className="text-dark-400" />
                                    )}
                                </div>

                                {/* Expanded Floor List */}
                                {expandedBuilding === building._id && building.floors.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-dark-200 dark:border-dark-700">
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {building.floors.sort((a, b) => a.level - b.level).map((floor) => (
                                                <div
                                                    key={floor._id || floor.level}
                                                    className="relative group rounded-xl overflow-hidden border border-dark-200 dark:border-dark-700"
                                                >
                                                    {floor.mapImage ? (
                                                        <img
                                                            src={floor.mapImage}
                                                            alt={floor.name}
                                                            className="w-full h-32 object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-32 bg-dark-100 dark:bg-dark-800 flex items-center justify-center">
                                                            <Map size={32} className="text-dark-300" />
                                                        </div>
                                                    )}
                                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                                                        <p className="text-white text-sm font-medium">
                                                            {floor.name}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => {
                    setShowAddModal(false);
                    setEditingBuilding(null);
                    resetForm();
                }}
                title={editingBuilding ? 'Edit Building' : 'Add Building'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Building Name *"
                            placeholder="e.g., Main Office"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <Input
                            label="Code *"
                            placeholder="e.g., MAIN"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            required
                        />
                    </div>
                    <Input
                        label="Address"
                        placeholder="Building address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />

                    {/* Floors Management */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-dark-700 dark:text-dark-300">
                                Floors
                            </label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addFloor}
                            >
                                <Plus size={16} className="mr-1" /> Add Floor
                            </Button>
                        </div>
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                            {formData.floors.map((floor, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-dark-50 dark:bg-dark-800"
                                >
                                    <Input
                                        placeholder="Floor name"
                                        value={floor.name}
                                        onChange={(e) => updateFloor(index, 'name', e.target.value)}
                                        className="flex-1"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Level"
                                        value={floor.level}
                                        onChange={(e) => updateFloor(index, 'level', parseInt(e.target.value))}
                                        className="w-20"
                                    />
                                    <label className="cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                if (e.target.files?.[0]) {
                                                    handleFloorMapUpload(index, e.target.files[0]);
                                                }
                                            }}
                                        />
                                        <div className={`p-2 rounded-lg ${floor.mapImage
                                                ? 'bg-green-100 text-green-600'
                                                : 'bg-dark-200 dark:bg-dark-700 text-dark-500'
                                            }`}>
                                            <Upload size={18} />
                                        </div>
                                    </label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFloor(index)}
                                    >
                                        <X size={16} />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                setShowAddModal(false);
                                setEditingBuilding(null);
                                resetForm();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            leftIcon={<Save size={18} />}
                        >
                            {editingBuilding ? 'Update' : 'Save'} Building
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
