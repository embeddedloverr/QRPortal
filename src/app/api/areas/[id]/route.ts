import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Area from '@/models/Area';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Get single area
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

        const area = await Area.findById(params.id).populate('client', 'name code').lean();
        if (!area) {
            return NextResponse.json({ error: 'Area not found' }, { status: 404 });
        }

        return NextResponse.json(area);
    } catch (error: any) {
        console.error('Error fetching area:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch area' },
            { status: 500 }
        );
    }
}

// PUT - Update area
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
        if (!['admin'].includes(userRole)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();

        const body = await req.json();
        const area = await Area.findByIdAndUpdate(
            params.id,
            { $set: body },
            { new: true, runValidators: true }
        ).populate('client', 'name code');

        if (!area) {
            return NextResponse.json({ error: 'Area not found' }, { status: 404 });
        }

        return NextResponse.json(area);
    } catch (error: any) {
        console.error('Error updating area:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update area' },
            { status: 500 }
        );
    }
}

// DELETE - Delete area
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
        if (!['admin'].includes(userRole)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();

        const area = await Area.findByIdAndDelete(params.id);
        if (!area) {
            return NextResponse.json({ error: 'Area not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Area deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting area:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete area' },
            { status: 500 }
        );
    }
}
