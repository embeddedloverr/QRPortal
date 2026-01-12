import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Equipment from '@/models/Equipment';

// GET - Get equipment by QR code
export async function GET(
    req: NextRequest,
    { params }: { params: { code: string } }
) {
    try {
        await dbConnect();

        const equipment = await Equipment.findOne({
            qrCode: params.code.toUpperCase()
        }).lean();

        if (!equipment) {
            return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
        }

        return NextResponse.json(equipment);
    } catch (error: any) {
        console.error('Error fetching equipment by QR:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch equipment' },
            { status: 500 }
        );
    }
}
