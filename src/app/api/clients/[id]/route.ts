import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Client from '@/models/Client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Get single client
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

        const client = await Client.findById(params.id).lean();
        if (!client) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        return NextResponse.json(client);
    } catch (error: any) {
        console.error('Error fetching client:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch client' },
            { status: 500 }
        );
    }
}

// PUT - Update client
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
        const client = await Client.findByIdAndUpdate(
            params.id,
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!client) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        return NextResponse.json(client);
    } catch (error: any) {
        console.error('Error updating client:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update client' },
            { status: 500 }
        );
    }
}

// DELETE - Delete client
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

        const client = await Client.findByIdAndDelete(params.id);
        if (!client) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Client deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting client:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete client' },
            { status: 500 }
        );
    }
}
