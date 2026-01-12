import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Get user's notifications
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const userId = (session.user as any)?.id;
        const { searchParams } = new URL(req.url);
        const unreadOnly = searchParams.get('unread') === 'true';
        const limit = parseInt(searchParams.get('limit') || '20');

        const query: any = { user: userId };
        if (unreadOnly) {
            query.read = false;
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        const unreadCount = await Notification.countDocuments({ user: userId, read: false });

        return NextResponse.json({ notifications, unreadCount });
    } catch (error: any) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch notifications' },
            { status: 500 }
        );
    }
}

// POST - Create notification (internal use)
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const body = await req.json();
        const { userId, type, title, message, link } = body;

        const notification = await Notification.create({
            user: userId,
            type,
            title,
            message,
            link,
        });

        return NextResponse.json(notification, { status: 201 });
    } catch (error: any) {
        console.error('Error creating notification:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create notification' },
            { status: 500 }
        );
    }
}

// PUT - Mark notifications as read
export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const userId = (session.user as any)?.id;
        const body = await req.json();
        const { notificationIds, markAll } = body;

        if (markAll) {
            await Notification.updateMany(
                { user: userId, read: false },
                { read: true }
            );
        } else if (notificationIds && notificationIds.length > 0) {
            await Notification.updateMany(
                { _id: { $in: notificationIds }, user: userId },
                { read: true }
            );
        }

        return NextResponse.json({ message: 'Notifications marked as read' });
    } catch (error: any) {
        console.error('Error updating notifications:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update notifications' },
            { status: 500 }
        );
    }
}
