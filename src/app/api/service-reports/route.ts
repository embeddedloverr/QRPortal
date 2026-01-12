import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ServiceReport from '@/models/ServiceReport';
import Ticket from '@/models/Ticket';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - List service reports
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const ticketId = searchParams.get('ticketId');

        const query: any = {};
        if (status) query.verificationStatus = status;
        if (ticketId) query.ticket = ticketId;

        const reports = await ServiceReport.find(query)
            .populate('ticket', 'ticketNumber equipment')
            .populate('engineer', 'name email')
            .populate('verifiedBy', 'name email')
            .sort({ submittedAt: -1 })
            .lean();

        return NextResponse.json(reports);
    } catch (error: any) {
        console.error('Error fetching service reports:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch service reports' },
            { status: 500 }
        );
    }
}

// POST - Create service report
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== 'engineer') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const body = await req.json();
        const { ticketId, workDescription, timeSpent, beforePhotos, afterPhotos, partsReplaced } = body;

        if (!ticketId || !workDescription || !timeSpent) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check ticket exists and is assigned to this engineer
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        const userId = (session.user as any)?.id;

        const report = await ServiceReport.create({
            ticket: ticketId,
            engineer: userId,
            workDescription,
            timeSpent,
            beforePhotos: beforePhotos || [],
            afterPhotos: afterPhotos || [],
            partsReplaced: partsReplaced || [],
        });

        return NextResponse.json(report, { status: 201 });
    } catch (error: any) {
        console.error('Error creating service report:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create service report' },
            { status: 500 }
        );
    }
}
