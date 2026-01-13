'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    MapPin,
    Search,
    Edit,
    Trash2,
    Building2,
} from 'lucide-react';
import { Button, Card, Input, Modal, Badge, Select } from '@/components/ui';

interface Client {
    _id: string;
    name: string;
    code: string;
}

interface Area {
    _id: string;
    name: string;
    code: string;
    client: Client;
    building?: string;
    floor?: string;
    description?: string;
    isActive: boolean;
}

export default function AreasPage() {
    const [areas, setAreas] = useState<Area[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingArea, setEditingArea] = useState<Area | null>(null);
    const [search, setSearch] = useState('');
    const [clientFilter, setClientFilter] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        client: '',
        building: '',
        floor: '',
        description: '',
    });

    useEffect(() => {
        fetchClients();
    }, []);

    useEffect(() => {
        fetchAreas();
    }, [clientFilter]);

    const fetchClients = async () => {
        try {
            const res = await fetch('/api/clients?active=true');
            const data = await res.json();
            setClients(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    const fetchAreas = async () => {
        try {
            const params = new URLSearchParams();
            if (clientFilter) params.append('client', clientFilter);

            const res = await fetch(`/api/areas?${params}`);
            const data = await res.json();
            setAreas(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching areas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const url = editingArea ? `/api/areas/${editingArea._id}` : '/api/areas';
            const method = editingArea ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setShowModal(false);
                setEditingArea(null);
                setFormData({ name: '', code: '', client: '', building: '', floor: '', description: '' });
                fetchAreas();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to save area');
            }
        } catch (error) {
            console.error('Error saving area:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (area: Area) => {
        setEditingArea(area);
        setFormData({
            name: area.name,
            code: area.code,
            client: area.client._id,
            building: area.building || '',
            floor: area.floor || '',
            description: area.description || '',
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete area "${name}"?`)) return;
        try {
            const res = await fetch(`/api/areas/${id}`, { method: 'DELETE' });
            if (res.ok) fetchAreas();
        } catch (error) {
            console.error('Error deleting area:', error);
        }
    };

    const filteredAreas = areas.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.code.toLowerCase().includes(search.toLowerCase())
    );

    const clientOptions = [
        { value: '', label: 'All Clients' },
        ...clients.map(c => ({ value: c._id, label: c.name }))
    ];

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-dark-900 dark:text-white">
                        Areas / Locations
                    </h1>
                    <p className="text-dark-500 dark:text-dark-400">
                        Manage areas and locations for equipment
                    </p>
                </div>
                <Button
                    variant="primary"
                    leftIcon={<Plus size={20} />}
                    onClick={() => {
                        setEditingArea(null);
                        setFormData({ name: '', code: '', client: '', building: '', floor: '', description: '' });
                        setShowModal(true);
                    }}
                >
                    Add Area
                </Button>
            </div>

            <Card hover={false} className="mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Search areas..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            leftIcon={<Search size={20} />}
                        />
                    </div>
                    <Select
                        options={clientOptions}
                        value={clientFilter}
                        onChange={(e) => setClientFilter(e.target.value)}
                        className="w-48"
                    />
                </div>
            </Card>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="skeleton h-32 rounded-2xl" />
                    ))}
                </div>
            ) : filteredAreas.length === 0 ? (
                <Card hover={false} className="text-center py-12">
                    <MapPin className="w-16 h-16 mx-auto text-dark-300 mb-4" />
                    <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-2">
                        No Areas Found
                    </h3>
                    <p className="text-dark-500 dark:text-dark-400">
                        Add your first area to get started
                    </p>
                </Card>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                    {filteredAreas.map((area) => (
                        <Card key={area._id} className="relative group">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary-500 to-secondary-700 flex items-center justify-center text-white">
                                    <MapPin size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-dark-900 dark:text-white truncate">
                                        {area.name}
                                    </h3>
                                    <p className="text-xs font-mono text-dark-500">{area.code}</p>
                                    <p className="text-sm text-dark-500 mt-1 flex items-center gap-1">
                                        <Building2 size={12} /> {area.client?.name}
                                    </p>
                                    {(area.building || area.floor) && (
                                        <p className="text-xs text-dark-400 mt-1">
                                            {[area.building, area.floor].filter(Boolean).join(', ')}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                <button
                                    onClick={() => handleEdit(area)}
                                    className="p-1.5 rounded-lg bg-dark-100 dark:bg-dark-700 hover:bg-dark-200 transition-colors"
                                >
                                    <Edit size={14} className="text-dark-500" />
                                </button>
                                <button
                                    onClick={() => handleDelete(area._id, area.name)}
                                    className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 transition-colors"
                                >
                                    <Trash2 size={14} className="text-red-500" />
                                </button>
                            </div>
                        </Card>
                    ))}
                </motion.div>
            )}

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingArea ? 'Edit Area' : 'Add Area'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Select
                        label="Client"
                        options={clients.map(c => ({ value: c._id, label: c.name }))}
                        value={formData.client}
                        onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                        required
                        placeholder="Select client"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Area Name"
                            placeholder="e.g., Main Office"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <Input
                            label="Code"
                            placeholder="e.g., MAIN"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Building"
                            placeholder="Building name"
                            value={formData.building}
                            onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                        />
                        <Input
                            label="Floor"
                            placeholder="Floor number"
                            value={formData.floor}
                            onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                        />
                    </div>
                    <Input
                        label="Description"
                        placeholder="Area description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setShowModal(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" isLoading={submitting} className="flex-1">
                            {editingArea ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
