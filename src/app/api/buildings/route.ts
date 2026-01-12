import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Building from '@/models/Building';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - List all buildings
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const active = searchParams.get('active');

        const query: any = {};
        if (active === 'true') {
            query.isActive = true;
        }

        const buildings = await Building.find(query).sort({ name: 1 }).lean();

        return NextResponse.json(buildings);
    } catch (error: any) {
        console.error('Error fetching buildings:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch buildings' },
            { status: 500 }
        );
    }
}

// POST - Create new building
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['admin'].includes((session.user as any)?.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const body = await req.json();
        const { name, code, address, floors, image } = body;

        if (!name || !code) {
            return NextResponse.json(
                { error: 'Name and code are required' },
                { status: 400 }
            );
        }

        // Check if code already exists
        const existing = await Building.findOne({ code: code.toUpperCase() });
        if (existing) {
            return NextResponse.json(
                { error: 'Building code already exists' },
                { status: 400 }
            );
        }

        const building = await Building.create({
            name,
            code: code.toUpperCase(),
            address,
            floors: floors || [],
            image,
        });

        return NextResponse.json(building, { status: 201 });
    } catch (error: any) {
        console.error('Error creating building:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create building' },
            { status: 500 }
        );
    }
}
