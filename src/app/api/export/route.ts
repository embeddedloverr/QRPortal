import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Equipment from '@/models/Equipment';
import Ticket from '@/models/Ticket';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import * as XLSX from 'xlsx';

// GET - Export data as Excel
export async function GET(req: NextRequest) {
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

        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'equipment';

        let data: any[] = [];
        let filename = '';

        if (type === 'equipment') {
            const equipment = await Equipment.find({}).lean();
            data = equipment.map((eq: any) => ({
                'Name': eq.name,
                'Type': eq.type,
                'QR Code': eq.qrCode,
                'Serial Number': eq.serialNumber || '',
                'Make': eq.make || '',
                'Model': eq.model || '',
                'Building': eq.location?.building || '',
                'Floor': eq.location?.floor || '',
                'Room': eq.location?.room || '',
                'Supplier': eq.supplier?.name || '',
                'Status': eq.status,
                'Install Date': eq.installDate ? new Date(eq.installDate).toLocaleDateString() : '',
                'Warranty Expiry': eq.warrantyExpiry ? new Date(eq.warrantyExpiry).toLocaleDateString() : '',
                'Created At': new Date(eq.createdAt).toLocaleDateString(),
            }));
            filename = `equipment_export_${Date.now()}.xlsx`;
        } else if (type === 'tickets') {
            const tickets = await Ticket.find({})
                .populate('equipment', 'name qrCode')
                .populate('raisedBy', 'name email')
                .populate('assignedTo', 'name email')
                .lean();

            data = tickets.map((ticket: any) => ({
                'Ticket Number': ticket.ticketNumber,
                'Equipment': ticket.equipment?.name || '',
                'Issue Type': ticket.issueType,
                'Priority': ticket.priority,
                'Status': ticket.status,
                'Raised By': ticket.raisedBy?.name || '',
                'Assigned To': ticket.assignedTo?.name || '',
                'Description': ticket.description,
                'Created At': new Date(ticket.createdAt).toLocaleDateString(),
                'Closed At': ticket.closedAt ? new Date(ticket.closedAt).toLocaleDateString() : '',
                'Reopen Count': ticket.reopenCount || 0,
            }));
            filename = `tickets_export_${Date.now()}.xlsx`;
        }

        // Create workbook
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data);

        // Set column widths
        const colWidths = Object.keys(data[0] || {}).map(() => ({ wch: 20 }));
        worksheet['!cols'] = colWidths;

        XLSX.utils.book_append_sheet(workbook, worksheet, type === 'equipment' ? 'Equipment' : 'Tickets');

        // Generate buffer
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error: any) {
        console.error('Error exporting data:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to export data' },
            { status: 500 }
        );
    }
}
