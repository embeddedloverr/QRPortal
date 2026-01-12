'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, Building2, QrCode, ArrowRight, UserCog } from 'lucide-react';
import { Button, Input, Card, Select } from '@/components/ui';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        department: '',
        role: 'user',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone,
                    department: formData.department,
                    role: formData.role,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            router.push('/login?registered=true');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const roleOptions = [
        { value: 'user', label: 'User' },
        { value: 'engineer', label: 'Service Engineer' },
        { value: 'supervisor', label: 'Supervisor' },
        { value: 'admin', label: 'Administrator' },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-secondary-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow" />
                <div className="absolute top-0 -right-4 w-72 h-72 bg-accent-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow delay-1000" />
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow delay-2000" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg"
            >
                <Card hover={false} className="p-8">
                    {/* Logo & Title */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary-500 to-secondary-700 shadow-lg shadow-secondary-500/30 mb-4"
                        >
                            <QrCode className="w-8 h-8 text-white" />
                        </motion.div>
                        <h1 className="text-2xl font-bold text-dark-900 dark:text-white mb-2">
                            Create Account
                        </h1>
                        <p className="text-dark-500 dark:text-dark-400">
                            Join QR Equipment Portal
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 p-3 rounded-xl bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800"
                        >
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </motion.div>
                    )}

                    {/* Register Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Full Name"
                                type="text"
                                name="name"
                                placeholder="Enter your name"
                                value={formData.name}
                                onChange={handleChange}
                                leftIcon={<User size={20} />}
                                required
                            />

                            <Input
                                label="Email"
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                leftIcon={<Mail size={20} />}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Phone"
                                type="tel"
                                name="phone"
                                placeholder="Enter phone number"
                                value={formData.phone}
                                onChange={handleChange}
                                leftIcon={<Phone size={20} />}
                            />

                            <Input
                                label="Department"
                                type="text"
                                name="department"
                                placeholder="Enter department"
                                value={formData.department}
                                onChange={handleChange}
                                leftIcon={<Building2 size={20} />}
                            />
                        </div>

                        <Select
                            label="Role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            options={roleOptions}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Password"
                                type="password"
                                name="password"
                                placeholder="Create password"
                                value={formData.password}
                                onChange={handleChange}
                                leftIcon={<Lock size={20} />}
                                required
                            />

                            <Input
                                label="Confirm Password"
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                leftIcon={<Lock size={20} />}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            variant="secondary"
                            size="lg"
                            className="w-full"
                            isLoading={isLoading}
                            rightIcon={<ArrowRight size={20} />}
                        >
                            Create Account
                        </Button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-dark-500 dark:text-dark-400 text-sm">
                            Already have an account?{' '}
                            <Link
                                href="/login"
                                className="font-medium text-secondary-500 hover:text-secondary-600 transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
