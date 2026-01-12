'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
    Users,
    Search,
    UserPlus,
    Shield,
    Wrench,
    Eye,
    MoreVertical,
    Edit,
    Trash2,
    Mail,
    Phone,
    Building2,
} from 'lucide-react';
import { Button, Card, Input, Select, Badge, Modal } from '@/components/ui';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
    department?: string;
    isActive: boolean;
    createdAt: string;
}

const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'user', label: 'User' },
    { value: 'engineer', label: 'Engineer' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'admin', label: 'Admin' },
];

const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
        user: 'from-blue-400 to-blue-600',
        engineer: 'from-green-400 to-green-600',
        supervisor: 'from-purple-400 to-purple-600',
        admin: 'from-red-400 to-red-600',
    };
    return colors[role] || colors.user;
};

const getRoleIcon = (role: string) => {
    const icons: Record<string, React.ReactNode> = {
        user: <Users className="w-4 h-4" />,
        engineer: <Wrench className="w-4 h-4" />,
        supervisor: <Eye className="w-4 h-4" />,
        admin: <Shield className="w-4 h-4" />,
    };
    return icons[role] || icons.user;
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export default function UsersPage() {
    const { data: session } = useSession();
    const userRole = (session?.user as any)?.role;

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    useEffect(() => {
        fetchUsers();
    }, [roleFilter]);

    const fetchUsers = async () => {
        try {
            const params = new URLSearchParams();
            if (roleFilter) params.append('role', roleFilter);

            const res = await fetch(`/api/users?${params}`);
            const data = await res.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );

    // Group users by role
    const groupedUsers = {
        admin: filteredUsers.filter(u => u.role === 'admin'),
        supervisor: filteredUsers.filter(u => u.role === 'supervisor'),
        engineer: filteredUsers.filter(u => u.role === 'engineer'),
        user: filteredUsers.filter(u => u.role === 'user'),
    };

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-dark-900 dark:text-white">
                        Users
                    </h1>
                    <p className="text-dark-500 dark:text-dark-400">
                        Manage user accounts and roles
                    </p>
                </div>
                {userRole === 'admin' && (
                    <Button variant="primary" leftIcon={<UserPlus size={20} />}>
                        Add User
                    </Button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {Object.entries(groupedUsers).map(([role, roleUsers]) => (
                    <Card key={role} className="text-center py-4">
                        <div className={`w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br ${getRoleColor(role)} flex items-center justify-center text-white`}>
                            {getRoleIcon(role)}
                        </div>
                        <p className="text-2xl font-bold text-dark-900 dark:text-white">{roleUsers.length}</p>
                        <p className="text-sm text-dark-500 dark:text-dark-400 capitalize">{role}s</p>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <Card hover={false} className="mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            leftIcon={<Search size={20} />}
                        />
                    </div>
                    <Select
                        options={roleOptions}
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="w-40"
                    />
                </div>
            </Card>

            {/* Users List */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="skeleton h-32 rounded-2xl" />
                    ))}
                </div>
            ) : filteredUsers.length === 0 ? (
                <Card hover={false} className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto text-dark-300 mb-4" />
                    <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-2">
                        No Users Found
                    </h3>
                    <p className="text-dark-500 dark:text-dark-400">
                        Try adjusting your search or filters
                    </p>
                </Card>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                    {filteredUsers.map((user) => (
                        <motion.div key={user._id} variants={itemVariants}>
                            <Card className="relative group">
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getRoleColor(user.role)} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-dark-900 dark:text-white truncate">
                                                {user.name}
                                            </h3>
                                            <Badge variant={user.isActive ? 'closed' : 'rejected'}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <p className="flex items-center gap-2 text-dark-500 dark:text-dark-400">
                                                <Mail size={14} />
                                                <span className="truncate">{user.email}</span>
                                            </p>
                                            {user.phone && (
                                                <p className="flex items-center gap-2 text-dark-500 dark:text-dark-400">
                                                    <Phone size={14} />
                                                    {user.phone}
                                                </p>
                                            )}
                                            {user.department && (
                                                <p className="flex items-center gap-2 text-dark-500 dark:text-dark-400">
                                                    <Building2 size={14} />
                                                    {user.department}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <Badge variant="default" className="capitalize">
                                        {user.role}
                                    </Badge>
                                </div>

                                {/* Actions */}
                                {userRole === 'admin' && (
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="flex gap-1">
                                            <button className="p-2 rounded-lg bg-dark-100 dark:bg-dark-700 hover:bg-dark-200 dark:hover:bg-dark-600 transition-colors">
                                                <Edit size={16} className="text-dark-500" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}
