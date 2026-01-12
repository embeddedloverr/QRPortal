import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Equipment from '@/models/Equipment';
import { generateQRCode } from '@/lib/utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - List all equipment
export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        // Build query
        const query: any = {};
        if (type) query.type = type;
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { qrCode: { $regex: search, $options: 'i' } },
                { 'location.building': { $regex: search, $options: 'i' } },
            ];
        }

        const equipment = await Equipment.find(query)
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(equipment);
    } catch (error: any) {
        console.error('Error fetching equipment:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch equipment' },
            { status: 500 }
        );
    }
}

// POST - Create new equipment
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['admin', 'supervisor'].includes((session.user as any)?.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const body = await req.json();

        // Required fields validation
        if (!body.name || !body.type || !body.location?.building || !body.location?.floor || !body.location?.room || !body.supplier?.name) {
            return NextResponse.json(
                { error: 'Missing required fields: name, type, location (building, floor, room), supplier name' },
                { status: 400 }
            );
        }

        // Generate unique QR code
        let qrCode = generateQRCode();
        let exists = await Equipment.findOne({ qrCode });
        while (exists) {
            qrCode = generateQRCode();
            exists = await Equipment.findOne({ qrCode });
        }

        // Build equipment data with all optional fields
        const equipmentData: any = {
            name: body.name,
            type: body.type, // Now accepts any string (references EquipmentType.code)
            qrCode,
            location: {
                building: body.location.building,
                floor: body.location.floor,
                room: body.location.room,
                area: body.location?.area,
                coordinates: body.location?.coordinates,
            },
            supplier: {
                name: body.supplier.name,
                contact: body.supplier?.contact,
                email: body.supplier?.email,
                address: body.supplier?.address,
                website: body.supplier?.website,
            },
        };

        // Add optional fields if provided
        const optionalFields = [
            'serialNumber', 'make', 'model', 'manufacturer', 'capacity',
            'powerRating', 'voltage', 'phase', 'refrigerant', 'weight',
            'dimensions', 'color', 'purchasePrice', 'assetTag', 'barcode',
            'warrantyType', 'amcProvider', 'serviceInterval', 'description',
            'notes', 'manualUrl', 'image'
        ];

        optionalFields.forEach(field => {
            if (body[field] !== undefined && body[field] !== '') {
                equipmentData[field] = body[field];
            }
        });

        // Date fields
        if (body.purchaseDate) equipmentData.purchaseDate = new Date(body.purchaseDate);
        if (body.installDate) equipmentData.installDate = new Date(body.installDate);
        if (body.warrantyExpiry) equipmentData.warrantyExpiry = new Date(body.warrantyExpiry);
        if (body.amcExpiry) equipmentData.amcExpiry = new Date(body.amcExpiry);

        const equipment = await Equipment.create(equipmentData);

        return NextResponse.json(equipment, { status: 201 });
    } catch (error: any) {
        console.error('Error creating equipment:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create equipment' },
            { status: 500 }
        );
    }
}

