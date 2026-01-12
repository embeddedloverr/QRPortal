'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui';

interface QRGeneratorProps {
    value: string;
    size?: number;
    showActions?: boolean;
}

export default function QRGenerator({ value, size = 200, showActions = true }: QRGeneratorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (canvasRef.current && value) {
            QRCode.toCanvas(canvasRef.current, value, {
                width: size,
                margin: 2,
                color: {
                    dark: '#0f172a',
                    light: '#ffffff',
                },
            });
        }
    }, [value, size]);

    const handleDownload = () => {
        if (!canvasRef.current) return;

        const link = document.createElement('a');
        link.download = `qr-${value}.png`;
        link.href = canvasRef.current.toDataURL('image/png');
        link.click();
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="flex flex-col items-center">
            <div className="p-4 bg-white rounded-xl shadow-lg">
                <canvas ref={canvasRef} />
            </div>

            <p className="mt-3 text-sm font-mono text-dark-500 dark:text-dark-400">{value}</p>

            {showActions && (
                <div className="flex gap-2 mt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                        leftIcon={<Download size={16} />}
                    >
                        Download
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        leftIcon={copied ? <Check size={16} /> : <Copy size={16} />}
                    >
                        {copied ? 'Copied!' : 'Copy Code'}
                    </Button>
                </div>
            )}
        </div>
    );
}
