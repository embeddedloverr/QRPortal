import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Equipment from '@/models/Equipment';

// GET - Public equipment details by QR code (no auth required)
export async function GET(
    req: NextRequest,
    { params }: { params: { qrCode: string } }
) {
    try {
        await dbConnect();

        const equipment = await Equipment.findOne({ qrCode: params.qrCode })
            .select('name type qrCode status serialNumber make modelNumber manufacturer capacity powerRating description location supplier installDate warrantyExpiry lastServiceDate nextServiceDate')
            .lean();

        if (!equipment) {
            return NextResponse.json(
                { error: 'Equipment not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(equipment);
    } catch (error: any) {
        console.error('Error fetching public equipment:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch equipment' },
            { status: 500 }
        );
    }
}
