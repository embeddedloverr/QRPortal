'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui';

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
    const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then((reg) => {
                console.log('Service Worker registered:', reg);
            }).catch((err) => {
                console.error('Service Worker registration failed:', err);
            });
        }

        // Listen for install prompt
        const handleBeforeInstall = (e: Event) => {
            e.preventDefault();
            setInstallPrompt(e as BeforeInstallPromptEvent);

            // Check if user hasn't dismissed before
            const dismissed = localStorage.getItem('pwa-dismissed');
            if (!dismissed) {
                setShowPrompt(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
        };
    }, []);

    const handleInstall = async () => {
        if (!installPrompt) return;

        await installPrompt.prompt();
        const result = await installPrompt.userChoice;

        if (result.outcome === 'accepted') {
            console.log('PWA installed');
        }

        setShowPrompt(false);
        setInstallPrompt(null);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa-dismissed', 'true');
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50">
            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl border border-dark-200 dark:border-dark-700 p-4">
                <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shrink-0">
                        <Download size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-dark-900 dark:text-white">
                            Install QR Portal
                        </h3>
                        <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
                            Install the app for quick access and offline support
                        </p>
                        <div className="flex gap-2 mt-3">
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleInstall}
                            >
                                Install
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDismiss}
                            >
                                Not now
                            </Button>
                        </div>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="text-dark-400 hover:text-dark-600"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
