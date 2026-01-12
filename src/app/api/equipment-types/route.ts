import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import EquipmentType from '@/models/EquipmentType';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - List all equipment types
export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const activeOnly = searchParams.get('active') === 'true';

        const query = activeOnly ? { isActive: true } : {};
        const types = await EquipmentType.find(query).sort({ name: 1 }).lean();

        return NextResponse.json(types);
    } catch (error: any) {
        console.error('Error fetching equipment types:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch equipment types' },
            { status: 500 }
        );
    }
}

// POST - Create new equipment type
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
        const { name, code, description, icon } = body;

        if (!name || !code) {
            return NextResponse.json(
                { error: 'Name and code are required' },
                { status: 400 }
            );
        }

        // Check for duplicate code
        const existing = await EquipmentType.findOne({ code: code.toLowerCase() });
        if (existing) {
            return NextResponse.json(
                { error: 'Equipment type code already exists' },
                { status: 400 }
            );
        }

        const equipmentType = await EquipmentType.create({
            name,
            code: code.toLowerCase(),
            description,
            icon: icon || 'wrench',
        });

        return NextResponse.json(equipmentType, { status: 201 });
    } catch (error: any) {
        console.error('Error creating equipment type:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create equipment type' },
            { status: 500 }
        );
    }
}
