import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface INotification extends Document {
    user: Types.ObjectId;
    type: 'ticket_created' | 'ticket_assigned' | 'ticket_updated' | 'ticket_closed' | 'comment_added' | 'maintenance_due' | 'system';
    title: string;
    message: string;
    link?: string;
    read: boolean;
    createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: ['ticket_created', 'ticket_assigned', 'ticket_updated', 'ticket_closed', 'comment_added', 'maintenance_due', 'system'],
            required: true,
        },
        title: {
            type: String,
            required: true,
            maxlength: 200,
        },
        message: {
            type: String,
            required: true,
            maxlength: 500,
        },
        link: {
            type: String,
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

NotificationSchema.index({ user: 1, read: 1 });
NotificationSchema.index({ createdAt: -1 });

const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
