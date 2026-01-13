import mongoose, { Schema, Document } from 'mongoose';

export interface IArea extends Document {
    name: string;
    code: string;
    client: mongoose.Types.ObjectId;
    building?: string;
    floor?: string;
    description?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const AreaSchema = new Schema<IArea>(
    {
        name: {
            type: String,
            required: [true, 'Area name is required'],
            trim: true,
        },
        code: {
            type: String,
            required: [true, 'Area code is required'],
            uppercase: true,
            trim: true,
        },
        client: {
            type: Schema.Types.ObjectId,
            ref: 'Client',
            required: [true, 'Client is required'],
        },
        building: {
            type: String,
            trim: true,
        },
        floor: {
            type: String,
            trim: true,
        },
        description: {
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

// Compound index for unique area code within a client
AreaSchema.index({ client: 1, code: 1 }, { unique: true });

export default mongoose.models.Area || mongoose.model<IArea>('Area', AreaSchema);
