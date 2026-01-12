import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Equipment from '@/models/Equipment';
import Ticket from '@/models/Ticket';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Get equipment due for maintenance
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const daysAhead = parseInt(searchParams.get('days') || '30');

        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + daysAhead);

        // Find equipment where:
        // 1. nextServiceDate is within range, OR
        // 2. No nextServiceDate but lastServiceDate + serviceInterval is within range
        const equipmentDue = await Equipment.find({
            status: 'active',
            $or: [
                {
                    nextServiceDate: { $lte: futureDate },
                },
                {
                    nextServiceDate: { $exists: false },
                    lastServiceDate: { $exists: true },
                    serviceInterval: { $exists: true, $gt: 0 },
                },
            ],
        }).lean();

        // Filter and add calculated due dates
        const result = equipmentDue
            .map((eq: any) => {
                let dueDate = eq.nextServiceDate;
                if (!dueDate && eq.lastServiceDate && eq.serviceInterval) {
                    dueDate = new Date(eq.lastServiceDate);
                    dueDate.setDate(dueDate.getDate() + eq.serviceInterval);
                }

                if (!dueDate || dueDate > futureDate) return null;

                const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                return {
                    _id: eq._id,
                    name: eq.name,
                    type: eq.type,
                    qrCode: eq.qrCode,
                    location: eq.location,
                    dueDate,
                    daysUntilDue,
                    lastServiceDate: eq.lastServiceDate,
                    serviceInterval: eq.serviceInterval,
                    isOverdue: daysUntilDue < 0,
                };
            })
            .filter(Boolean)
            .sort((a: any, b: any) => a.daysUntilDue - b.daysUntilDue);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Error fetching maintenance schedule:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch schedule' },
            { status: 500 }
        );
    }
}

// POST - Generate maintenance ticket for equipment
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = (session.user as any)?.role;
        if (!['admin', 'supervisor'].includes(userRole)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();

        const body = await req.json();
        const { equipmentId, description } = body;

        const equipment = await Equipment.findById(equipmentId);
        if (!equipment) {
            return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
        }

        // Generate ticket number
        const ticketCount = await Ticket.countDocuments();
        const ticketNumber = `TKT-${String(ticketCount + 1).padStart(6, '0')}`;

        const userId = (session.user as any)?.id;

        // Create maintenance ticket
        const ticket = await Ticket.create({
            ticketNumber,
            equipment: equipmentId,
            raisedBy: userId,
            priority: 'medium',
            status: 'open',
            issueType: 'Preventive Maintenance',
            description: description || `Scheduled preventive maintenance for ${equipment.name}`,
            timeline: [{
                status: 'open',
                timestamp: new Date(),
                updatedBy: userId,
                notes: 'Auto-generated maintenance ticket',
            }],
        });

        return NextResponse.json(ticket, { status: 201 });
    } catch (error: any) {
        console.error('Error creating maintenance ticket:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create ticket' },
            { status: 500 }
        );
    }
}
