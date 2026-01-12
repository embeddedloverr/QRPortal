import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ITimelineEntry {
    status: string;
    timestamp: Date;
    updatedBy: Types.ObjectId;
    notes?: string;
}

export interface IComment {
    _id?: Types.ObjectId;
    user: Types.ObjectId;
    message: string;
    attachments?: string[];
    createdAt: Date;
}

export interface ITicket extends Document {
    ticketNumber: string;
    equipment: Types.ObjectId;
    raisedBy: Types.ObjectId;
    assignedTo?: Types.ObjectId;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'assigned' | 'in_progress' | 'pending_verification' | 'closed' | 'rejected' | 'reopened';
    issueType: string;
    description: string;
    photos?: string[];
    timeline: ITimelineEntry[];
    comments: IComment[];
    reopenCount: number;
    createdAt: Date;
    updatedAt: Date;
    closedAt?: Date;
}

const TimelineEntrySchema = new Schema<ITimelineEntry>(
    {
        status: {
            type: String,
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        notes: {
            type: String,
        },
    },
    { _id: false }
);

const CommentSchema = new Schema<IComment>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        message: {
            type: String,
            required: true,
            maxlength: 2000,
        },
        attachments: [{ type: String }],
        createdAt: {
            type: Date,
            default: Date.now,
        },
    }
);

const TicketSchema = new Schema<ITicket>(
    {
        ticketNumber: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
        },
        equipment: {
            type: Schema.Types.ObjectId,
            ref: 'Equipment',
            required: [true, 'Equipment is required'],
        },
        raisedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User is required'],
        },
        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'medium',
        },
        status: {
            type: String,
            enum: ['open', 'assigned', 'in_progress', 'pending_verification', 'closed', 'rejected', 'reopened'],
            default: 'open',
        },
        issueType: {
            type: String,
            required: [true, 'Issue type is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
        },
        timeline: [TimelineEntrySchema],
        comments: [CommentSchema],
        photos: [{ type: String }],
        closedAt: {
            type: Date,
        },
        reopenCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster queries
TicketSchema.index({ ticketNumber: 1 });
TicketSchema.index({ status: 1 });
TicketSchema.index({ priority: 1 });
TicketSchema.index({ assignedTo: 1 });
TicketSchema.index({ equipment: 1 });
TicketSchema.index({ createdAt: -1 });

const Ticket: Model<ITicket> = mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema);

export default Ticket;
