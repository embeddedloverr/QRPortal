'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
    Settings as SettingsIcon,
    User,
    Bell,
    Shield,
    Palette,
    Moon,
    Sun,
    Save,
    Mail,
    Phone,
    Building2,
} from 'lucide-react';
import { Button, Card, Input } from '@/components/ui';
import { useTheme } from '@/components/providers/ThemeProvider';

export default function SettingsPage() {
    const { data: session } = useSession();
    const { theme, toggleTheme } = useTheme();
    const user = session?.user;

    const [profile, setProfile] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        department: '',
    });

    const [notifications, setNotifications] = useState({
        emailTicketUpdates: true,
        emailServiceComplete: true,
        pushNotifications: false,
    });

    const [saving, setSaving] = useState(false);

    const handleSaveProfile = async () => {
        setSaving(true);
        // Simulate save
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSaving(false);
    };

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-dark-900 dark:text-white mb-2">
                    Settings
                </h1>
                <p className="text-dark-500 dark:text-dark-400">
                    Manage your account preferences
                </p>
            </div>

            <div className="space-y-6">
                {/* Profile Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card hover={false}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-dark-900 dark:text-white">Profile</h2>
                                <p className="text-sm text-dark-500 dark:text-dark-400">Your personal information</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Input
                                label="Full Name"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                leftIcon={<User size={18} />}
                            />
                            <Input
                                label="Email"
                                type="email"
                                value={profile.email}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                leftIcon={<Mail size={18} />}
                                disabled
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Phone"
                                    value={profile.phone}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    leftIcon={<Phone size={18} />}
                                    placeholder="Enter phone number"
                                />
                                <Input
                                    label="Department"
                                    value={profile.department}
                                    onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                                    leftIcon={<Building2 size={18} />}
                                    placeholder="Enter department"
                                />
                            </div>
                            <div className="pt-2">
                                <Button
                                    variant="primary"
                                    onClick={handleSaveProfile}
                                    isLoading={saving}
                                    leftIcon={<Save size={18} />}
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Appearance Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card hover={false}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary-500 to-secondary-700 flex items-center justify-center">
                                <Palette className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-dark-900 dark:text-white">Appearance</h2>
                                <p className="text-sm text-dark-500 dark:text-dark-400">Customize how the app looks</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-dark-50 dark:bg-dark-700/50">
                            <div className="flex items-center gap-3">
                                {theme === 'dark' ? <Moon className="w-5 h-5 text-primary-500" /> : <Sun className="w-5 h-5 text-yellow-500" />}
                                <div>
                                    <p className="font-medium text-dark-900 dark:text-white">
                                        {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                                    </p>
                                    <p className="text-sm text-dark-500 dark:text-dark-400">
                                        {theme === 'dark' ? 'Easy on the eyes' : 'Bright and clean'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className={`
                  relative w-14 h-8 rounded-full transition-colors
                  ${theme === 'dark' ? 'bg-primary-500' : 'bg-dark-300'}
                `}
                            >
                                <motion.div
                                    layout
                                    className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md"
                                    style={{ left: theme === 'dark' ? '1.75rem' : '0.25rem' }}
                                />
                            </button>
                        </div>
                    </Card>
                </motion.div>

                {/* Notifications Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card hover={false}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center">
                                <Bell className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-dark-900 dark:text-white">Notifications</h2>
                                <p className="text-sm text-dark-500 dark:text-dark-400">How you want to be notified</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[
                                { key: 'emailTicketUpdates', label: 'Ticket Updates', desc: 'Email when your tickets are updated' },
                                { key: 'emailServiceComplete', label: 'Service Complete', desc: 'Email when service is completed' },
                                { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser push notifications' },
                            ].map((item) => (
                                <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-dark-50 dark:bg-dark-700/50">
                                    <div>
                                        <p className="font-medium text-dark-900 dark:text-white">{item.label}</p>
                                        <p className="text-sm text-dark-500 dark:text-dark-400">{item.desc}</p>
                                    </div>
                                    <button
                                        onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                                        className={`
                      relative w-14 h-8 rounded-full transition-colors
                      ${notifications[item.key as keyof typeof notifications] ? 'bg-accent-500' : 'bg-dark-300'}
                    `}
                                    >
                                        <motion.div
                                            layout
                                            className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md"
                                            style={{ left: notifications[item.key as keyof typeof notifications] ? '1.75rem' : '0.25rem' }}
                                        />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
