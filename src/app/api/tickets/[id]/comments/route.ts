import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Ticket from '@/models/Ticket';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST - Add comment to ticket
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const body = await req.json();
        const { message, attachments } = body;

        if (!message || message.trim() === '') {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        const ticket = await Ticket.findById(params.id);
        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        const userId = (session.user as any)?.id;

        const comment = {
            user: userId,
            message: message.trim(),
            attachments: attachments || [],
            createdAt: new Date(),
        };

        ticket.comments.push(comment);
        await ticket.save();

        // Populate user details for response
        await ticket.populate('comments.user', 'name email role');

        const addedComment = ticket.comments[ticket.comments.length - 1];

        return NextResponse.json(addedComment, { status: 201 });
    } catch (error: any) {
        console.error('Error adding comment:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to add comment' },
            { status: 500 }
        );
    }
}

// GET - Get all comments for a ticket
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const ticket = await Ticket.findById(params.id)
            .populate('comments.user', 'name email role')
            .select('comments');

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        return NextResponse.json(ticket.comments);
    } catch (error: any) {
        console.error('Error fetching comments:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch comments' },
            { status: 500 }
        );
    }
}

// DELETE - Delete a comment (only by author or admin)
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const commentId = searchParams.get('commentId');

        if (!commentId) {
            return NextResponse.json(
                { error: 'Comment ID is required' },
                { status: 400 }
            );
        }

        const ticket = await Ticket.findById(params.id);
        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        const userId = (session.user as any)?.id;
        const userRole = (session.user as any)?.role;

        const commentIndex = ticket.comments.findIndex(
            (c: any) => c._id.toString() === commentId
        );

        if (commentIndex === -1) {
            return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
        }

        const comment = ticket.comments[commentIndex];

        // Only allow deletion by comment author or admin
        if (comment.user.toString() !== userId && userRole !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        ticket.comments.splice(commentIndex, 1);
        await ticket.save();

        return NextResponse.json({ message: 'Comment deleted' });
    } catch (error: any) {
        console.error('Error deleting comment:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete comment' },
            { status: 500 }
        );
    }
}
