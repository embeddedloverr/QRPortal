import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function generateTicketNumber(): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TKT-${year}${month}-${random}`;
}

export function generateQRCode(): string {
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `EQ-${random}`;
}

export function formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export function formatDateTime(date: Date | string): string {
    return new Date(date).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function getTimeAgo(date: Date | string): string {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(date);
}

export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        open: 'badge-open',
        assigned: 'badge-in-progress',
        in_progress: 'badge-in-progress',
        pending_verification: 'badge-pending',
        closed: 'badge-closed',
        rejected: 'badge-rejected',
    };
    return colors[status] || 'badge';
}

export function getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
        low: 'priority-low',
        medium: 'priority-medium',
        high: 'priority-high',
        critical: 'priority-critical',
    };
    return colors[priority] || '';
}

export function getEquipmentTypeClass(type: string): string {
    const classes: Record<string, string> = {
        ac_unit: 'equipment-ac',
        pump: 'equipment-pump',
        generator: 'equipment-generator',
        elevator: 'equipment-elevator',
        other: 'equipment-other',
    };
    return classes[type] || 'equipment-other';
}

export function getRoleDisplayName(role: string): string {
    const names: Record<string, string> = {
        user: 'User',
        engineer: 'Service Engineer',
        supervisor: 'Supervisor',
        admin: 'Administrator',
    };
    return names[role] || role;
}

export function truncate(str: string, length: number): string {
    if (str.length <= length) return str;
    return str.slice(0, length) + '...';
}
