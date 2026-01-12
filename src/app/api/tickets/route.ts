import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Ticket from '@/models/Ticket';
import Equipment from '@/models/Equipment';
import { generateTicketNumber } from '@/lib/utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - List tickets
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const assignedTo = searchParams.get('assignedTo');

        // Build query based on role
        const userRole = (session.user as any)?.role;
        const userId = (session.user as any)?.id;

        const query: any = {};

        // Role-based filtering
        if (userRole === 'user') {
            query.raisedBy = userId;
        } else if (userRole === 'engineer') {
            if (assignedTo === 'me') {
                query.assignedTo = userId;
            }
        }
        // Supervisors and admins can see all

        if (status) query.status = status;
        if (priority) query.priority = priority;

        const tickets = await Ticket.find(query)
            .populate('equipment', 'name type qrCode location')
            .populate('raisedBy', 'name email')
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(tickets);
    } catch (error: any) {
        console.error('Error fetching tickets:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch tickets' },
            { status: 500 }
        );
    }
}

// POST - Create new ticket
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const body = await req.json();
        const { equipmentId, issueType, description, priority } = body;

        // Validation
        if (!equipmentId || !issueType || !description) {
            return NextResponse.json(
                { error: 'Equipment, issue type, and description are required' },
                { status: 400 }
            );
        }

        // Check equipment exists
        const equipment = await Equipment.findById(equipmentId);
        if (!equipment) {
            return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
        }

        // Generate unique ticket number
        let ticketNumber = generateTicketNumber();
        let exists = await Ticket.findOne({ ticketNumber });
        while (exists) {
            ticketNumber = generateTicketNumber();
            exists = await Ticket.findOne({ ticketNumber });
        }

        const userId = (session.user as any)?.id;

        const ticket = await Ticket.create({
            ticketNumber,
            equipment: equipmentId,
            raisedBy: userId,
            issueType,
            description,
            priority: priority || 'medium',
            timeline: [
                {
                    status: 'open',
                    timestamp: new Date(),
                    updatedBy: userId,
                    notes: 'Ticket created',
                },
            ],
        });

        // Update equipment status
        await Equipment.findByIdAndUpdate(equipmentId, { status: 'under_service' });

        // Populate and return
        const populatedTicket = await Ticket.findById(ticket._id)
            .populate('equipment', 'name type qrCode location')
            .populate('raisedBy', 'name email')
            .lean();

        return NextResponse.json(populatedTicket, { status: 201 });
    } catch (error: any) {
        console.error('Error creating ticket:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create ticket' },
            { status: 500 }
        );
    }
}
