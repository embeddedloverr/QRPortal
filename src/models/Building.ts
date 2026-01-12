import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFloor {
    name: string;
    level: number;
    mapImage?: string;
}

export interface IBuilding extends Document {
    name: string;
    code: string;
    address?: string;
    floors: IFloor[];
    image?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const FloorSchema = new Schema<IFloor>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        level: {
            type: Number,
            required: true,
        },
        mapImage: {
            type: String,
        },
    },
    { _id: true }
);

const BuildingSchema = new Schema<IBuilding>(
    {
        name: {
            type: String,
            required: [true, 'Building name is required'],
            trim: true,
            maxlength: 200,
        },
        code: {
            type: String,
            required: [true, 'Building code is required'],
            unique: true,
            uppercase: true,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        },
        floors: [FloorSchema],
        image: {
            type: String,
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

BuildingSchema.index({ code: 1 });
BuildingSchema.index({ name: 1 });

const Building: Model<IBuilding> = mongoose.models.Building || mongoose.model<IBuilding>('Building', BuildingSchema);

export default Building;
