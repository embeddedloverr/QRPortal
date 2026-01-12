import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import EquipmentType from '@/models/EquipmentType';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Get single equipment type
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();

        const type = await EquipmentType.findById(params.id).lean();
        if (!type) {
            return NextResponse.json({ error: 'Equipment type not found' }, { status: 404 });
        }

        return NextResponse.json(type);
    } catch (error: any) {
        console.error('Error fetching equipment type:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch equipment type' },
            { status: 500 }
        );
    }
}

// PUT - Update equipment type
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
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
        const { name, description, icon, isActive } = body;

        const type = await EquipmentType.findByIdAndUpdate(
            params.id,
            { name, description, icon, isActive },
            { new: true, runValidators: true }
        );

        if (!type) {
            return NextResponse.json({ error: 'Equipment type not found' }, { status: 404 });
        }

        return NextResponse.json(type);
    } catch (error: any) {
        console.error('Error updating equipment type:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update equipment type' },
            { status: 500 }
        );
    }
}

// DELETE - Delete equipment type
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = (session.user as any)?.role;
        if (userRole !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();

        const type = await EquipmentType.findByIdAndDelete(params.id);
        if (!type) {
            return NextResponse.json({ error: 'Equipment type not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Equipment type deleted' });
    } catch (error: any) {
        console.error('Error deleting equipment type:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete equipment type' },
            { status: 500 }
        );
    }
}
