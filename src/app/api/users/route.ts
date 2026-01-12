import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - List users
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const role = searchParams.get('role');

        const query: any = {};
        if (role) query.role = role;

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(users);
    } catch (error: any) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch users' },
            { status: 500 }
        );
    }
}
