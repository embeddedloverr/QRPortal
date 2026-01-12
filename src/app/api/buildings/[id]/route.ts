import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Building from '@/models/Building';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Get single building
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

        const building = await Building.findById(params.id).lean();
        if (!building) {
            return NextResponse.json({ error: 'Building not found' }, { status: 404 });
        }

        return NextResponse.json(building);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to fetch building' },
            { status: 500 }
        );
    }
}

// PUT - Update building
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['admin'].includes((session.user as any)?.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const body = await req.json();
        const { name, code, address, floors, image, isActive } = body;

        const building = await Building.findByIdAndUpdate(
            params.id,
            { name, code, address, floors, image, isActive },
            { new: true, runValidators: true }
        );

        if (!building) {
            return NextResponse.json({ error: 'Building not found' }, { status: 404 });
        }

        return NextResponse.json(building);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to update building' },
            { status: 500 }
        );
    }
}

// DELETE - Delete building
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['admin'].includes((session.user as any)?.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const building = await Building.findByIdAndDelete(params.id);
        if (!building) {
            return NextResponse.json({ error: 'Building not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Building deleted' });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to delete building' },
            { status: 500 }
        );
    }
}
