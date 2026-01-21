'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import {
    QrCode,
    Printer,
    Download,
    CheckSquare,
    Square,
    RefreshCw,
} from 'lucide-react';
import { Button, Card, Input } from '@/components/ui';

interface QRItem {
    _id: string;
    name: string;
    type: string;
    qrCode: string;
    location: { building: string; floor: string; room: string };
    serialNumber?: string;
    qrDataUrl: string;
}

export default function QRPrintPage() {
    const [items, setItems] = useState<QRItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());

    const fetchQRCodes = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/qr-batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ equipmentIds: [] }), // Empty = all
            });

            if (res.ok) {
                const data = await res.json();
                setItems(data);
                setSelected(new Set(data.map((d: QRItem) => d._id)));
            }
        } catch (error) {
            console.error('Error fetching QR codes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQRCodes();
    }, []);

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selected);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelected(newSelected);
    };

    const selectAll = () => {
        setSelected(new Set(items.map(i => i._id)));
    };

    const deselectAll = () => {
        setSelected(new Set());
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const selectedItems = items.filter(i => selected.has(i._id));

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>QR Code Labels</title>
                <style>
                    @page { size: A4; margin: 10mm; }
                    body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
                    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10mm; }
                    .label {
                        border: 1px solid #ddd;
                        padding: 10px;
                        text-align: center;
                        page-break-inside: avoid;
                        border-radius: 8px;
                    }
                    .label img { width: 120px; height: 120px; }
                    .label h3 { font-size: 12px; margin: 8px 0 4px; }
                    .label p { font-size: 10px; color: #666; margin: 2px 0; }
                    .label .code { font-family: monospace; font-size: 11px; color: #333; }
                    @media print {
                        body { -webkit-print-color-adjust: exact; }
                    }
                </style>
            </head>
            <body>
                <div class="grid">
                    ${selectedItems.map(item => `
                        <div class="label">
                            <img src="${item.qrDataUrl}" alt="QR Code" />
                            <h3>${item.name}</h3>
                            <p><strong>Type:</strong> ${item.type || 'N/A'}</p>
                            <p><strong>Floor:</strong> ${item.location?.floor || 'N/A'}</p>
                            <p><strong>S/N:</strong> ${item.serialNumber || 'N/A'}</p>
                            <p class="code">${item.qrCode}</p>
                        </div>
                    `).join('')}
                </div>
                <script>
                    window.onload = function() { window.print(); window.close(); }
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-dark-900 dark:text-white">
                        QR Code Printing
                    </h1>
                    <p className="text-dark-500 dark:text-dark-400">
                        Generate and print QR code labels for equipment
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        leftIcon={<RefreshCw size={20} />}
                        onClick={fetchQRCodes}
                        isLoading={loading}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="primary"
                        leftIcon={<Printer size={20} />}
                        onClick={handlePrint}
                        disabled={selected.size === 0}
                    >
                        Print Selected ({selected.size})
                    </Button>
                </div>
            </div>

            {/* Selection Controls */}
            <Card hover={false} className="mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={selectAll}
                        >
                            Select All
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={deselectAll}
                        >
                            Deselect All
                        </Button>
                    </div>
                    <p className="text-sm text-dark-500">
                        {selected.size} of {items.length} selected
                    </p>
                </div>
            </Card>

            {/* QR Grid */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="skeleton h-48 rounded-2xl" />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <Card hover={false} className="text-center py-12">
                    <QrCode className="w-16 h-16 mx-auto text-dark-300 mb-4" />
                    <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-2">
                        No Equipment Found
                    </h3>
                    <p className="text-dark-500 dark:text-dark-400">
                        Add equipment to generate QR codes
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {items.map((item, index) => (
                        <motion.div
                            key={item._id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.02 }}
                        >
                            <Card
                                className={`cursor-pointer transition-all ${selected.has(item._id)
                                    ? 'ring-2 ring-primary-500 bg-primary-50/50 dark:bg-primary-900/20'
                                    : ''
                                    }`}
                                onClick={() => toggleSelect(item._id)}
                            >
                                <div className="flex justify-end mb-2">
                                    {selected.has(item._id) ? (
                                        <CheckSquare className="w-5 h-5 text-primary-500" />
                                    ) : (
                                        <Square className="w-5 h-5 text-dark-300" />
                                    )}
                                </div>
                                <div className="flex justify-center mb-3">
                                    <img
                                        src={item.qrDataUrl}
                                        alt={item.qrCode}
                                        className="w-24 h-24"
                                    />
                                </div>
                                <h3 className="font-medium text-dark-900 dark:text-white text-sm text-center truncate">
                                    {item.name}
                                </h3>
                                <p className="text-xs text-dark-500 text-center truncate">
                                    <span className="font-semibold">Type:</span> {item.type || 'N/A'}
                                </p>
                                <p className="text-xs text-dark-500 text-center truncate">
                                    <span className="font-semibold">Floor:</span> {item.location?.floor || 'N/A'}
                                </p>
                                <p className="text-xs text-dark-500 text-center truncate">
                                    <span className="font-semibold">S/N:</span> {item.serialNumber || 'N/A'}
                                </p>
                                <p className="text-xs font-mono text-primary-500 text-center mt-1">
                                    {item.qrCode}
                                </p>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
