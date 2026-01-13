import mongoose, { Schema, Document } from 'mongoose';

export interface IClient extends Document {
    name: string;
    code: string;
    contact?: string;
    email?: string;
    phone?: string;
    address?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ClientSchema = new Schema<IClient>(
    {
        name: {
            type: String,
            required: [true, 'Client name is required'],
            trim: true,
        },
        code: {
            type: String,
            required: [true, 'Client code is required'],
            unique: true,
            uppercase: true,
            trim: true,
        },
        contact: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
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

export default mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema);
