import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Ticket from '@/models/Ticket';
import Equipment from '@/models/Equipment';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Dashboard statistics
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const userId = (session.user as any)?.id;
        const userRole = (session.user as any)?.role;

        // Base stats
        const totalEquipment = await Equipment.countDocuments();
        const activeEquipment = await Equipment.countDocuments({ status: 'active' });
        const underServiceEquipment = await Equipment.countDocuments({ status: 'under_service' });

        // Ticket stats based on role
        let ticketQuery: any = {};
        if (userRole === 'user') {
            ticketQuery.raisedBy = userId;
        } else if (userRole === 'engineer') {
            ticketQuery.assignedTo = userId;
        }

        const totalTickets = await Ticket.countDocuments(ticketQuery);
        const openTickets = await Ticket.countDocuments({ ...ticketQuery, status: { $in: ['open', 'assigned'] } });
        const inProgressTickets = await Ticket.countDocuments({ ...ticketQuery, status: 'in_progress' });
        const pendingVerification = await Ticket.countDocuments({ ...ticketQuery, status: 'pending_verification' });
        const closedTickets = await Ticket.countDocuments({ ...ticketQuery, status: 'closed' });

        // User stats (admin only)
        let userStats = null;
        if (userRole === 'admin') {
            userStats = {
                total: await User.countDocuments(),
                users: await User.countDocuments({ role: 'user' }),
                engineers: await User.countDocuments({ role: 'engineer' }),
                supervisors: await User.countDocuments({ role: 'supervisor' }),
                admins: await User.countDocuments({ role: 'admin' }),
            };
        }

        // Recent tickets
        const recentTickets = await Ticket.find(ticketQuery)
            .populate('equipment', 'name type')
            .populate('raisedBy', 'name')
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        // Tickets by priority
        const ticketsByPriority = await Ticket.aggregate([
            { $match: ticketQuery },
            { $group: { _id: '$priority', count: { $sum: 1 } } },
        ]);

        // Tickets by status
        const ticketsByStatus = await Ticket.aggregate([
            { $match: ticketQuery },
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        return NextResponse.json({
            equipment: {
                total: totalEquipment,
                active: activeEquipment,
                underService: underServiceEquipment,
            },
            tickets: {
                total: totalTickets,
                open: openTickets,
                inProgress: inProgressTickets,
                pendingVerification,
                closed: closedTickets,
                byPriority: ticketsByPriority,
                byStatus: ticketsByStatus,
            },
            users: userStats,
            recentTickets,
        });
    } catch (error: any) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch dashboard stats' },
            { status: 500 }
        );
    }
}
