'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    Building2,
    Search,
    Edit,
    Trash2,
    Phone,
    Mail,
} from 'lucide-react';
import { Button, Card, Input, Modal, Badge } from '@/components/ui';

interface Client {
    _id: string;
    name: string;
    code: string;
    contact?: string;
    email?: string;
    phone?: string;
    address?: string;
    isActive: boolean;
}

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [search, setSearch] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        contact: '',
        email: '',
        phone: '',
        address: '',
    });

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const res = await fetch('/api/clients');
            const data = await res.json();
            setClients(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const url = editingClient ? `/api/clients/${editingClient._id}` : '/api/clients';
            const method = editingClient ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setShowModal(false);
                setEditingClient(null);
                setFormData({ name: '', code: '', contact: '', email: '', phone: '', address: '' });
                fetchClients();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to save client');
            }
        } catch (error) {
            console.error('Error saving client:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (client: Client) => {
        setEditingClient(client);
        setFormData({
            name: client.name,
            code: client.code,
            contact: client.contact || '',
            email: client.email || '',
            phone: client.phone || '',
            address: client.address || '',
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete client "${name}"?`)) return;
        try {
            const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
            if (res.ok) fetchClients();
        } catch (error) {
            console.error('Error deleting client:', error);
        }
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-dark-900 dark:text-white">
                        Clients
                    </h1>
                    <p className="text-dark-500 dark:text-dark-400">
                        Manage client organizations
                    </p>
                </div>
                <Button
                    variant="primary"
                    leftIcon={<Plus size={20} />}
                    onClick={() => {
                        setEditingClient(null);
                        setFormData({ name: '', code: '', contact: '', email: '', phone: '', address: '' });
                        setShowModal(true);
                    }}
                >
                    Add Client
                </Button>
            </div>

            <Card hover={false} className="mb-6">
                <Input
                    placeholder="Search clients..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    leftIcon={<Search size={20} />}
                />
            </Card>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="skeleton h-32 rounded-2xl" />
                    ))}
                </div>
            ) : filteredClients.length === 0 ? (
                <Card hover={false} className="text-center py-12">
                    <Building2 className="w-16 h-16 mx-auto text-dark-300 mb-4" />
                    <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-2">
                        No Clients Found
                    </h3>
                    <p className="text-dark-500 dark:text-dark-400">
                        Add your first client to get started
                    </p>
                </Card>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                    {filteredClients.map((client) => (
                        <Card key={client._id} className="relative group">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg">
                                    {client.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-dark-900 dark:text-white">
                                            {client.name}
                                        </h3>
                                        <Badge variant={client.isActive ? 'closed' : 'rejected'}>
                                            {client.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                    <p className="text-sm font-mono text-dark-500">{client.code}</p>
                                    {client.phone && (
                                        <p className="text-sm text-dark-500 flex items-center gap-1 mt-1">
                                            <Phone size={12} /> {client.phone}
                                        </p>
                                    )}
                                    {client.email && (
                                        <p className="text-sm text-dark-500 flex items-center gap-1">
                                            <Mail size={12} /> {client.email}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                <button
                                    onClick={() => handleEdit(client)}
                                    className="p-2 rounded-lg bg-dark-100 dark:bg-dark-700 hover:bg-dark-200 transition-colors"
                                >
                                    <Edit size={16} className="text-dark-500" />
                                </button>
                                <button
                                    onClick={() => handleDelete(client._id, client.name)}
                                    className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 transition-colors"
                                >
                                    <Trash2 size={16} className="text-red-500" />
                                </button>
                            </div>
                        </Card>
                    ))}
                </motion.div>
            )}

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingClient ? 'Edit Client' : 'Add Client'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Client Name"
                            placeholder="Company name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <Input
                            label="Code"
                            placeholder="e.g., ACME"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            required
                            disabled={!!editingClient}
                        />
                    </div>
                    <Input
                        label="Contact Person"
                        placeholder="Contact name"
                        value={formData.contact}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Email"
                            type="email"
                            placeholder="email@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <Input
                            label="Phone"
                            placeholder="Phone number"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <Input
                        label="Address"
                        placeholder="Full address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setShowModal(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" isLoading={submitting} className="flex-1">
                            {editingClient ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
