import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/providers/AuthProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import PWAInstallPrompt from '@/components/features/PWAInstallPrompt';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'QR Equipment Portal',
    description: 'QR-based Equipment Complaint Management System',
    keywords: ['QR', 'Equipment', 'Maintenance', 'Service', 'Complaint'],
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'QR Portal',
    },
    formatDetection: {
        telephone: false,
    },
};

export const viewport: Viewport = {
    themeColor: '#6366f1',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="mobile-web-app-capable" content="yes" />
            </head>
            <body className={inter.className}>
                <AuthProvider>
                    <ThemeProvider>
                        <ToastProvider>
                            {children}
                            <PWAInstallPrompt />
                        </ToastProvider>
                    </ThemeProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
