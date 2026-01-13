import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Area from '@/models/Area';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - List all areas
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const clientId = searchParams.get('client');
        const active = searchParams.get('active');

        let query: any = {};
        if (clientId) {
            query.client = clientId;
        }
        if (active === 'true') {
            query.isActive = true;
        }

        const areas = await Area.find(query)
            .populate('client', 'name code')
            .sort({ name: 1 })
            .lean();

        return NextResponse.json(areas);
    } catch (error: any) {
        console.error('Error fetching areas:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch areas' },
            { status: 500 }
        );
    }
}

// POST - Create new area
export async function POST(req: NextRequest) {
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
        const { name, code, client, building, floor, description } = body;

        if (!name || !code || !client) {
            return NextResponse.json(
                { error: 'Name, code, and client are required' },
                { status: 400 }
            );
        }

        const area = await Area.create({
            name,
            code: code.toUpperCase(),
            client,
            building,
            floor,
            description,
        });

        return NextResponse.json(area, { status: 201 });
    } catch (error: any) {
        console.error('Error creating area:', error);
        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'Area code already exists for this client' },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: error.message || 'Failed to create area' },
            { status: 500 }
        );
    }
}
