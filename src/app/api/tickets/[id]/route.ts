import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Ticket from '@/models/Ticket';
import Equipment from '@/models/Equipment';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Get single ticket
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
            .populate('equipment', 'name type qrCode location supplier')
            .populate('raisedBy', 'name email phone')
            .populate('assignedTo', 'name email phone')
            .populate('timeline.updatedBy', 'name role')
            .lean();

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        return NextResponse.json(ticket);
    } catch (error: any) {
        console.error('Error fetching ticket:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch ticket' },
            { status: 500 }
        );
    }
}

// PUT - Update ticket (assign, update status, etc.)
export async function PUT(
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
        const { status, assignedTo, notes } = body;
        const userId = (session.user as any)?.id;
        const userRole = (session.user as any)?.role;

        const ticket = await Ticket.findById(params.id);
        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        // Update fields
        if (assignedTo) {
            ticket.assignedTo = assignedTo;
            ticket.status = 'assigned';
            ticket.timeline.push({
                status: 'assigned',
                timestamp: new Date(),
                updatedBy: userId,
                notes: notes || 'Ticket assigned to engineer',
            });
        }

        if (status) {
            // Handle reopen action
            if (status === 'reopened') {
                if (ticket.status !== 'closed') {
                    return NextResponse.json(
                        { error: 'Only closed tickets can be reopened' },
                        { status: 400 }
                    );
                }
                ticket.reopenCount = (ticket.reopenCount || 0) + 1;
                ticket.closedAt = undefined;

                // Update equipment status back to under_service
                await Equipment.findByIdAndUpdate(ticket.equipment, {
                    status: 'under_service'
                });
            }

            ticket.status = status;
            ticket.timeline.push({
                status,
                timestamp: new Date(),
                updatedBy: userId,
                notes: notes || `Status updated to ${status}`,
            });

            // If closed, update equipment status back to active
            if (status === 'closed') {
                ticket.closedAt = new Date();
                await Equipment.findByIdAndUpdate(ticket.equipment, {
                    status: 'active',
                    lastServiceDate: new Date()
                });
            }
        }

        await ticket.save();

        const updatedTicket = await Ticket.findById(ticket._id)
            .populate('equipment', 'name type qrCode location')
            .populate('raisedBy', 'name email')
            .populate('assignedTo', 'name email')
            .lean();

        return NextResponse.json(updatedTicket);
    } catch (error: any) {
        console.error('Error updating ticket:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update ticket' },
            { status: 500 }
        );
    }
}
