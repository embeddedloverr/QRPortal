import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEquipmentType extends Document {
    name: string;
    code: string;
    description?: string;
    icon?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const EquipmentTypeSchema = new Schema<IEquipmentType>(
    {
        name: {
            type: String,
            required: [true, 'Type name is required'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        code: {
            type: String,
            required: [true, 'Type code is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        icon: {
            type: String,
            default: 'wrench',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

EquipmentTypeSchema.index({ code: 1 });
EquipmentTypeSchema.index({ isActive: 1 });

const EquipmentType: Model<IEquipmentType> = mongoose.models.EquipmentType || mongoose.model<IEquipmentType>('EquipmentType', EquipmentTypeSchema);

export default EquipmentType;
