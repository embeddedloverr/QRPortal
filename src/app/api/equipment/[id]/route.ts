import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Equipment from '@/models/Equipment';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Get single equipment
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();

        const equipment = await Equipment.findById(params.id).lean();

        if (!equipment) {
            return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
        }

        return NextResponse.json(equipment);
    } catch (error: any) {
        console.error('Error fetching equipment:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch equipment' },
            { status: 500 }
        );
    }
}

// PUT - Update equipment
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['admin', 'supervisor'].includes((session.user as any)?.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const body = await req.json();

        const equipment = await Equipment.findByIdAndUpdate(
            params.id,
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!equipment) {
            return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
        }

        return NextResponse.json(equipment);
    } catch (error: any) {
        console.error('Error updating equipment:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update equipment' },
            { status: 500 }
        );
    }
}

// DELETE - Delete equipment
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const equipment = await Equipment.findByIdAndDelete(params.id);

        if (!equipment) {
            return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Equipment deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting equipment:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete equipment' },
            { status: 500 }
        );
    }
}
