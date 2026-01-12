import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IPartReplaced {
    name: string;
    quantity: number;
    cost?: number;
}

export interface IServiceReport extends Document {
    ticket: Types.ObjectId;
    engineer: Types.ObjectId;
    beforePhotos: string[];
    afterPhotos: string[];
    workDescription: string;
    partsReplaced: IPartReplaced[];
    timeSpent: number; // in minutes
    verifiedBy?: Types.ObjectId;
    verificationStatus: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
    submittedAt: Date;
    verifiedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const PartReplacedSchema = new Schema<IPartReplaced>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        cost: {
            type: Number,
            min: 0,
        },
    },
    { _id: false }
);

const ServiceReportSchema = new Schema<IServiceReport>(
    {
        ticket: {
            type: Schema.Types.ObjectId,
            ref: 'Ticket',
            required: [true, 'Ticket is required'],
        },
        engineer: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Engineer is required'],
        },
        beforePhotos: [{
            type: String,
        }],
        afterPhotos: [{
            type: String,
        }],
        workDescription: {
            type: String,
            required: [true, 'Work description is required'],
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
        },
        partsReplaced: [PartReplacedSchema],
        timeSpent: {
            type: Number,
            required: [true, 'Time spent is required'],
            min: [1, 'Time spent must be at least 1 minute'],
        },
        verifiedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        verificationStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        rejectionReason: {
            type: String,
            maxlength: [500, 'Rejection reason cannot exceed 500 characters'],
        },
        submittedAt: {
            type: Date,
            default: Date.now,
        },
        verifiedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
ServiceReportSchema.index({ ticket: 1 });
ServiceReportSchema.index({ engineer: 1 });
ServiceReportSchema.index({ verificationStatus: 1 });
ServiceReportSchema.index({ submittedAt: -1 });

const ServiceReport: Model<IServiceReport> = mongoose.models.ServiceReport || mongoose.model<IServiceReport>('ServiceReport', ServiceReportSchema);

export default ServiceReport;
