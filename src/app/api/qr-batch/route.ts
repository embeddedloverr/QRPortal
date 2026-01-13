import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Equipment from '@/models/Equipment';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import QRCode from 'qrcode';

// POST - Generate batch QR codes for printing
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
        const { equipmentIds } = body;

        let query = {};
        if (equipmentIds && equipmentIds.length > 0) {
            query = { _id: { $in: equipmentIds } };
        }

        const equipment = await Equipment.find(query)
            .select('name type qrCode location')
            .limit(50)
            .lean();

        // Generate QR codes as data URLs
        const qrCodes = await Promise.all(
            equipment.map(async (eq: any) => {
                // Get base URL - use env or hardcoded production domain
                const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://service.smartdwell.in';
                const qrUrl = `${baseUrl}/equipment/${eq.qrCode}`;
                const qrDataUrl = await QRCode.toDataURL(qrUrl, {
                    width: 200,
                    margin: 2,
                    color: { dark: '#1a1a2e', light: '#ffffff' },
                });

                return {
                    _id: eq._id,
                    name: eq.name,
                    type: eq.type,
                    qrCode: eq.qrCode,
                    location: eq.location,
                    qrDataUrl,
                };
            })
        );

        return NextResponse.json(qrCodes);
    } catch (error: any) {
        console.error('Error generating QR codes:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate QR codes' },
            { status: 500 }
        );
    }
}
