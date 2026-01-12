import dbConnect from './db';
import Notification from '@/models/Notification';

type NotificationType = 'ticket_created' | 'ticket_assigned' | 'ticket_updated' | 'ticket_closed' | 'comment_added' | 'maintenance_due' | 'system';

interface CreateNotificationParams {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
}

export async function createNotification(params: CreateNotificationParams) {
    try {
        await dbConnect();
        const notification = await Notification.create({
            user: params.userId,
            type: params.type,
            title: params.title,
            message: params.message,
            link: params.link,
        });
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
}

export async function notifyTicketCreated(ticketNumber: string, supervisorIds: string[], equipmentName: string) {
    for (const userId of supervisorIds) {
        await createNotification({
            userId,
            type: 'ticket_created',
            title: 'New Ticket Created',
            message: `Ticket ${ticketNumber} has been created for ${equipmentName}`,
            link: `/dashboard/tickets`,
        });
    }
}

export async function notifyTicketAssigned(ticketNumber: string, engineerId: string, equipmentName: string) {
    await createNotification({
        userId: engineerId,
        type: 'ticket_assigned',
        title: 'Ticket Assigned to You',
        message: `Ticket ${ticketNumber} for ${equipmentName} has been assigned to you`,
        link: `/dashboard/tickets`,
    });
}

export async function notifyTicketClosed(ticketNumber: string, raisedById: string, equipmentName: string) {
    await createNotification({
        userId: raisedById,
        type: 'ticket_closed',
        title: 'Ticket Resolved',
        message: `Ticket ${ticketNumber} for ${equipmentName} has been closed`,
        link: `/dashboard/tickets`,
    });
}

export async function notifyCommentAdded(ticketNumber: string, userId: string, commenterName: string) {
    await createNotification({
        userId,
        type: 'comment_added',
        title: 'New Comment on Ticket',
        message: `${commenterName} commented on ticket ${ticketNumber}`,
        link: `/dashboard/tickets`,
    });
}
