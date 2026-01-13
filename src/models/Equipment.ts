import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEquipment extends Document {
    name: string;
    type: string; // Now references EquipmentType code or custom string
    qrCode: string;
    serialNumber?: string;
    // Extended optional fields
    make?: string;
    modelNumber?: string;
    manufacturer?: string;
    capacity?: string;
    powerRating?: string;
    voltage?: string;
    phase?: string;
    refrigerant?: string;
    weight?: string;
    dimensions?: string;
    color?: string;
    purchaseDate?: Date;
    purchasePrice?: number;
    assetTag?: string;
    barcode?: string;
    // Location
    location: {
        client?: Schema.Types.ObjectId;
        areaRef?: Schema.Types.ObjectId;
        building: string;
        floor: string;
        room: string;
        area?: string; // Specific zone/wing (text)
        coordinates?: string;
    };
    // Supplier
    supplier: {
        name: string;
        contact?: string;
        email?: string;
        address?: string;
        website?: string;
    };
    // Service info
    installDate?: Date;
    warrantyExpiry?: Date;
    warrantyType?: string;
    amcProvider?: string;
    amcExpiry?: Date;
    serviceInterval?: number; // days
    status: 'active' | 'under_service' | 'inactive' | 'retired';
    lastServiceDate?: Date;
    nextServiceDate?: Date;
    // Documentation
    description?: string;
    notes?: string;
    manualUrl?: string;
    image?: string;
    documents?: string[];
    createdAt: Date;
    updatedAt: Date;
}

const EquipmentSchema = new Schema<IEquipment>(
    {
        name: {
            type: String,
            required: [true, 'Equipment name is required'],
            trim: true,
            maxlength: [200, 'Name cannot exceed 200 characters'],
        },
        type: {
            type: String,
            required: [true, 'Equipment type is required'],
            trim: true,
        },
        qrCode: {
            type: String,
            required: [true, 'QR Code is required'],
            unique: true,
            uppercase: true,
        },
        serialNumber: { type: String, trim: true },
        // Extended fields
        make: { type: String, trim: true },
        modelNumber: { type: String, trim: true },
        manufacturer: { type: String, trim: true },
        capacity: { type: String, trim: true },
        powerRating: { type: String, trim: true },
        voltage: { type: String, trim: true },
        phase: { type: String, trim: true },
        refrigerant: { type: String, trim: true },
        weight: { type: String, trim: true },
        dimensions: { type: String, trim: true },
        color: { type: String, trim: true },
        purchaseDate: { type: Date },
        purchasePrice: { type: Number },
        assetTag: { type: String, trim: true },
        barcode: { type: String, trim: true },
        // Location
        location: {
            client: { type: Schema.Types.ObjectId, ref: 'Client' },
            areaRef: { type: Schema.Types.ObjectId, ref: 'Area' },
            building: { type: String, required: [true, 'Building is required'], trim: true },
            floor: { type: String, required: [true, 'Floor is required'], trim: true },
            room: { type: String, required: [true, 'Room is required'], trim: true },
            area: { type: String, trim: true }, // Specific zone/wing
            coordinates: { type: String, trim: true },
        },
        // Supplier
        supplier: {
            name: { type: String, required: [true, 'Supplier name is required'], trim: true },
            contact: { type: String, trim: true },
            email: { type: String, trim: true, lowercase: true },
            address: { type: String, trim: true },
            website: { type: String, trim: true },
        },
        // Service info
        installDate: { type: Date },
        warrantyExpiry: { type: Date },
        warrantyType: { type: String, trim: true },
        amcProvider: { type: String, trim: true },
        amcExpiry: { type: Date },
        serviceInterval: { type: Number },
        status: {
            type: String,
            enum: ['active', 'under_service', 'inactive', 'retired'],
            default: 'active',
        },
        lastServiceDate: { type: Date },
        nextServiceDate: { type: Date },
        // Documentation
        description: { type: String, maxlength: [2000, 'Description cannot exceed 2000 characters'] },
        notes: { type: String, maxlength: [2000, 'Notes cannot exceed 2000 characters'] },
        manualUrl: { type: String, trim: true },
        image: { type: String },
        documents: [{ type: String }],
    },
    {
        timestamps: true,
    }
);

// Indexes
EquipmentSchema.index({ qrCode: 1 });
EquipmentSchema.index({ status: 1 });
EquipmentSchema.index({ type: 1 });
EquipmentSchema.index({ 'location.building': 1 });

const Equipment: Model<IEquipment> = mongoose.models.Equipment || mongoose.model<IEquipment>('Equipment', EquipmentSchema);

export default Equipment;

