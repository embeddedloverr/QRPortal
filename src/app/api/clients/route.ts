import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Client from '@/models/Client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - List all clients
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const active = searchParams.get('active');

        let query: any = {};
        if (active === 'true') {
            query.isActive = true;
        }

        const clients = await Client.find(query).sort({ name: 1 }).lean();
        return NextResponse.json(clients);
    } catch (error: any) {
        console.error('Error fetching clients:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch clients' },
            { status: 500 }
        );
    }
}

// POST - Create new client
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
        const { name, code, contact, email, phone, address } = body;

        if (!name || !code) {
            return NextResponse.json(
                { error: 'Name and code are required' },
                { status: 400 }
            );
        }

        const client = await Client.create({
            name,
            code: code.toUpperCase(),
            contact,
            email,
            phone,
            address,
        });

        return NextResponse.json(client, { status: 201 });
    } catch (error: any) {
        console.error('Error creating client:', error);
        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'Client code already exists' },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: error.message || 'Failed to create client' },
            { status: 500 }
        );
    }
}
