'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Wrench,
    Building2,
    User,
    Settings,
    FileText,
    Save,
    Loader2,
} from 'lucide-react';
import { Button, Card, Input, Select } from '@/components/ui';

interface EquipmentTypeOption {
    value: string;
    label: string;
}

interface Client {
    _id: string;
    name: string;
    code: string;
}

interface Area {
    _id: string;
    name: string;
    code: string;
    building?: string;
    floor?: string;
}

const defaultTypes = [
    { value: 'ac_unit', label: 'AC Unit' },
    { value: 'pump', label: 'Pump' },
    { value: 'generator', label: 'Generator' },
    { value: 'elevator', label: 'Elevator' },
    { value: 'other', label: 'Other' },
];

export default function NewEquipmentPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const userRole = (session?.user as any)?.role;

    const [customTypes, setCustomTypes] = useState<EquipmentTypeOption[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [areas, setAreas] = useState<Area[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        // Basic Info
        name: '',
        type: '',
        serialNumber: '',
        // Specifications
        make: '',
        model: '',
        manufacturer: '',
        capacity: '',
        powerRating: '',
        voltage: '',
        phase: '',
        refrigerant: '',
        weight: '',
        dimensions: '',
        color: '',
        // Purchase Info
        purchaseDate: '',
        purchasePrice: '',
        assetTag: '',
        barcode: '',
        // Location
        client: '',
        areaId: '',
        building: '',
        floor: '',
        room: '',
        area: '',
        // Supplier
        supplierName: '',
        supplierContact: '',
        supplierEmail: '',
        supplierAddress: '',
        supplierWebsite: '',
        // Warranty & Service
        installDate: '',
        warrantyExpiry: '',
        warrantyType: '',
        amcProvider: '',
        amcExpiry: '',
        serviceInterval: '',
        // Documentation
        description: '',
        notes: '',
        manualUrl: '',
    });

    useEffect(() => {
        fetchEquipmentTypes();
        fetchClients();
    }, []);

    const fetchEquipmentTypes = async () => {
        try {
            const res = await fetch('/api/equipment-types?active=true');
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                setCustomTypes(data.map((t: any) => ({ value: t.code, label: t.name })));
            }
        } catch (error) {
            console.error('Error fetching equipment types:', error);
        }
    };

    const fetchClients = async () => {
        try {
            const res = await fetch('/api/clients?active=true');
            const data = await res.json();
            setClients(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    const fetchAreas = async (clientId: string) => {
        if (!clientId) {
            setAreas([]);
            return;
        }
        try {
            const res = await fetch(`/api/areas?client=${clientId}&active=true`);
            const data = await res.json();
            setAreas(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching areas:', error);
        }
    };

    const handleClientChange = (clientId: string) => {
        setFormData(prev => ({ ...prev, client: clientId, areaId: '', building: '', floor: '' }));
        fetchAreas(clientId);
    };

    const handleAreaChange = (areaId: string) => {
        const area = areas.find(a => a._id === areaId);
        setFormData(prev => ({
            ...prev,
            areaId,
            building: area?.building || prev.building,
            floor: area?.floor || prev.floor,
        }));
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/equipment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    type: formData.type,
                    serialNumber: formData.serialNumber || undefined,
                    make: formData.make || undefined,
                    model: formData.model || undefined,
                    manufacturer: formData.manufacturer || undefined,
                    capacity: formData.capacity || undefined,
                    powerRating: formData.powerRating || undefined,
                    voltage: formData.voltage || undefined,
                    phase: formData.phase || undefined,
                    refrigerant: formData.refrigerant || undefined,
                    weight: formData.weight || undefined,
                    dimensions: formData.dimensions || undefined,
                    color: formData.color || undefined,
                    purchaseDate: formData.purchaseDate || undefined,
                    purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
                    assetTag: formData.assetTag || undefined,
                    barcode: formData.barcode || undefined,
                    location: {
                        client: formData.client || undefined,
                        areaRef: formData.areaId || undefined,
                        building: formData.building,
                        floor: formData.floor,
                        room: formData.room,
                        area: formData.area || undefined,
                    },
                    supplier: {
                        name: formData.supplierName,
                        contact: formData.supplierContact || undefined,
                        email: formData.supplierEmail || undefined,
                        address: formData.supplierAddress || undefined,
                        website: formData.supplierWebsite || undefined,
                    },
                    installDate: formData.installDate || undefined,
                    warrantyExpiry: formData.warrantyExpiry || undefined,
                    warrantyType: formData.warrantyType || undefined,
                    amcProvider: formData.amcProvider || undefined,
                    amcExpiry: formData.amcExpiry || undefined,
                    serviceInterval: formData.serviceInterval ? parseInt(formData.serviceInterval) : undefined,
                    description: formData.description || undefined,
                    notes: formData.notes || undefined,
                    manualUrl: formData.manualUrl || undefined,
                }),
            });

            if (res.ok) {
                router.push('/dashboard/equipment');
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to create equipment');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const typeOptions = customTypes.length > 0 ? customTypes : defaultTypes;

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-dark-500" />
                </button>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-dark-900 dark:text-white">
                        Add New Equipment
                    </h1>
                    <p className="text-dark-500 dark:text-dark-400">
                        Fill in the equipment details. Fields marked with * are required.
                    </p>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <Card hover={false}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white">
                            <Wrench size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-dark-900 dark:text-white">Basic Information</h2>
                            <p className="text-sm text-dark-500">Core equipment details</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Input
                            label="Equipment Name *"
                            placeholder="e.g., Split AC Unit - Conference Room"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            required
                        />
                        <Select
                            label="Type *"
                            options={typeOptions}
                            value={formData.type}
                            onChange={(e) => handleChange('type', e.target.value)}
                            placeholder="Select type"
                            required
                        />
                        <Input
                            label="Serial Number"
                            placeholder="e.g., SN-2024-001234"
                            value={formData.serialNumber}
                            onChange={(e) => handleChange('serialNumber', e.target.value)}
                        />
                    </div>
                </Card>

                {/* Specifications */}
                <Card hover={false}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                            <Settings size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-dark-900 dark:text-white">Specifications</h2>
                            <p className="text-sm text-dark-500">Technical details (all optional)</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Input
                            label="Make"
                            placeholder="e.g., Daikin"
                            value={formData.make}
                            onChange={(e) => handleChange('make', e.target.value)}
                        />
                        <Input
                            label="Model"
                            placeholder="e.g., FTKF35TV16U"
                            value={formData.model}
                            onChange={(e) => handleChange('model', e.target.value)}
                        />
                        <Input
                            label="Manufacturer"
                            placeholder="e.g., Daikin Industries Ltd"
                            value={formData.manufacturer}
                            onChange={(e) => handleChange('manufacturer', e.target.value)}
                        />
                        <Input
                            label="Capacity"
                            placeholder="e.g., 1.5 Ton, 5 HP"
                            value={formData.capacity}
                            onChange={(e) => handleChange('capacity', e.target.value)}
                        />
                        <Input
                            label="Power Rating"
                            placeholder="e.g., 1200W, 3 kVA"
                            value={formData.powerRating}
                            onChange={(e) => handleChange('powerRating', e.target.value)}
                        />
                        <Input
                            label="Voltage"
                            placeholder="e.g., 230V, 415V"
                            value={formData.voltage}
                            onChange={(e) => handleChange('voltage', e.target.value)}
                        />
                        <Input
                            label="Phase"
                            placeholder="e.g., Single, Three"
                            value={formData.phase}
                            onChange={(e) => handleChange('phase', e.target.value)}
                        />
                        <Input
                            label="Refrigerant (for AC)"
                            placeholder="e.g., R-32, R-410A"
                            value={formData.refrigerant}
                            onChange={(e) => handleChange('refrigerant', e.target.value)}
                        />
                        <Input
                            label="Weight"
                            placeholder="e.g., 35 kg"
                            value={formData.weight}
                            onChange={(e) => handleChange('weight', e.target.value)}
                        />
                        <Input
                            label="Dimensions"
                            placeholder="e.g., 800x300x200 mm"
                            value={formData.dimensions}
                            onChange={(e) => handleChange('dimensions', e.target.value)}
                        />
                        <Input
                            label="Color"
                            placeholder="e.g., White, Grey"
                            value={formData.color}
                            onChange={(e) => handleChange('color', e.target.value)}
                        />
                    </div>
                </Card>

                {/* Location */}
                <Card hover={false}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white">
                            <Building2 size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-dark-900 dark:text-white">Location</h2>
                            <p className="text-sm text-dark-500">Where the equipment is installed</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Select
                            label="Client *"
                            options={clients.map(c => ({ value: c._id, label: c.name }))}
                            value={formData.client}
                            onChange={(e) => handleClientChange(e.target.value)}
                            placeholder="Select client"
                            required
                        />
                        <Select
                            label="Area/Location"
                            options={areas.map(a => ({ value: a._id, label: `${a.name} (${a.code})` }))}
                            value={formData.areaId}
                            onChange={(e) => handleAreaChange(e.target.value)}
                            placeholder={formData.client ? 'Select area' : 'Select client first'}
                            disabled={!formData.client}
                        />
                        <Input
                            label="Building *"
                            placeholder="e.g., Building A"
                            value={formData.building}
                            onChange={(e) => handleChange('building', e.target.value)}
                            required
                        />
                        <Input
                            label="Floor *"
                            placeholder="e.g., 3rd Floor"
                            value={formData.floor}
                            onChange={(e) => handleChange('floor', e.target.value)}
                            required
                        />
                        <Input
                            label="Room *"
                            placeholder="e.g., Room 301"
                            value={formData.room}
                            onChange={(e) => handleChange('room', e.target.value)}
                            required
                        />
                        <Input
                            label="Zone/Wing"
                            placeholder="e.g., East Wing"
                            value={formData.area}
                            onChange={(e) => handleChange('area', e.target.value)}
                        />
                    </div>
                </Card>

                {/* Supplier */}
                <Card hover={false}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white">
                            <User size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-dark-900 dark:text-white">Supplier Information</h2>
                            <p className="text-sm text-dark-500">Vendor and contact details</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Input
                            label="Supplier Name *"
                            placeholder="e.g., ABC Cooling Solutions"
                            value={formData.supplierName}
                            onChange={(e) => handleChange('supplierName', e.target.value)}
                            required
                        />
                        <Input
                            label="Contact Number"
                            placeholder="e.g., +91 9876543210"
                            value={formData.supplierContact}
                            onChange={(e) => handleChange('supplierContact', e.target.value)}
                        />
                        <Input
                            label="Email"
                            type="email"
                            placeholder="e.g., support@supplier.com"
                            value={formData.supplierEmail}
                            onChange={(e) => handleChange('supplierEmail', e.target.value)}
                        />
                        <Input
                            label="Address"
                            placeholder="e.g., 123 Industrial Area, City"
                            value={formData.supplierAddress}
                            onChange={(e) => handleChange('supplierAddress', e.target.value)}
                            className="md:col-span-2"
                        />
                        <Input
                            label="Website"
                            placeholder="e.g., https://supplier.com"
                            value={formData.supplierWebsite}
                            onChange={(e) => handleChange('supplierWebsite', e.target.value)}
                        />
                    </div>
                </Card>

                {/* Warranty & Service */}
                <Card hover={false}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-dark-900 dark:text-white">Warranty & Service</h2>
                            <p className="text-sm text-dark-500">Dates and service contract details</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Input
                            label="Purchase Date"
                            type="date"
                            value={formData.purchaseDate}
                            onChange={(e) => handleChange('purchaseDate', e.target.value)}
                        />
                        <Input
                            label="Purchase Price (₹)"
                            type="number"
                            placeholder="e.g., 45000"
                            value={formData.purchasePrice}
                            onChange={(e) => handleChange('purchasePrice', e.target.value)}
                        />
                        <Input
                            label="Asset Tag"
                            placeholder="e.g., AST-2024-001"
                            value={formData.assetTag}
                            onChange={(e) => handleChange('assetTag', e.target.value)}
                        />
                        <Input
                            label="Installation Date"
                            type="date"
                            value={formData.installDate}
                            onChange={(e) => handleChange('installDate', e.target.value)}
                        />
                        <Input
                            label="Warranty Expiry"
                            type="date"
                            value={formData.warrantyExpiry}
                            onChange={(e) => handleChange('warrantyExpiry', e.target.value)}
                        />
                        <Input
                            label="Warranty Type"
                            placeholder="e.g., Comprehensive, Standard"
                            value={formData.warrantyType}
                            onChange={(e) => handleChange('warrantyType', e.target.value)}
                        />
                        <Input
                            label="AMC Provider"
                            placeholder="e.g., ServiceMax"
                            value={formData.amcProvider}
                            onChange={(e) => handleChange('amcProvider', e.target.value)}
                        />
                        <Input
                            label="AMC Expiry"
                            type="date"
                            value={formData.amcExpiry}
                            onChange={(e) => handleChange('amcExpiry', e.target.value)}
                        />
                        <Input
                            label="Service Interval (days)"
                            type="number"
                            placeholder="e.g., 90"
                            value={formData.serviceInterval}
                            onChange={(e) => handleChange('serviceInterval', e.target.value)}
                        />
                    </div>
                </Card>

                {/* Notes */}
                <Card hover={false}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                placeholder="Brief description of the equipment..."
                                className="w-full px-4 py-3 rounded-xl border border-dark-200 dark:border-dark-700 bg-white/50 dark:bg-dark-800/50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                                rows={3}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                                Additional Notes
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => handleChange('notes', e.target.value)}
                                placeholder="Any additional notes, special instructions, or maintenance tips..."
                                className="w-full px-4 py-3 rounded-xl border border-dark-200 dark:border-dark-700 bg-white/50 dark:bg-dark-800/50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                                rows={3}
                            />
                        </div>
                        <Input
                            label="Manual/Documentation URL"
                            placeholder="e.g., https://docs.example.com/manual.pdf"
                            value={formData.manualUrl}
                            onChange={(e) => handleChange('manualUrl', e.target.value)}
                        />
                    </div>
                </Card>

                {/* Submit */}
                <div className="flex justify-end gap-4 pb-8">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.back()}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        isLoading={submitting}
                        leftIcon={<Save size={20} />}
                    >
                        Save Equipment
                    </Button>
                </div>
            </form>
        </div>
    );
}
