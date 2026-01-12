import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Ticket from '@/models/Ticket';
import Equipment from '@/models/Equipment';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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
        const days = parseInt(searchParams.get('days') || '30');

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Total counts
        const totalTickets = await Ticket.countDocuments();
        const totalEquipment = await Equipment.countDocuments();
        const totalUsers = await User.countDocuments();

        // Ticket status breakdown
        const ticketsByStatus = await Ticket.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $project: { status: '$_id', count: 1, _id: 0 } },
        ]);

        // Tickets by priority
        const ticketsByPriority = await Ticket.aggregate([
            { $group: { _id: '$priority', count: { $sum: 1 } } },
            { $project: { priority: '$_id', count: 1, _id: 0 } },
        ]);

        // Equipment by status
        const equipmentByStatus = await Equipment.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $project: { status: '$_id', count: 1, _id: 0 } },
        ]);

        // Daily ticket trends for the period
        const dailyTrends = await Ticket.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    created: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
            { $project: { date: '$_id', created: 1, _id: 0 } },
        ]);

        // Closed tickets for trends
        const closedTrends = await Ticket.aggregate([
            { $match: { closedAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$closedAt' } },
                    closed: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
            { $project: { date: '$_id', closed: 1, _id: 0 } },
        ]);

        // Merge daily trends
        const trendsMap = new Map();
        dailyTrends.forEach((t: any) => trendsMap.set(t.date, { date: t.date, created: t.created, closed: 0 }));
        closedTrends.forEach((t: any) => {
            if (trendsMap.has(t.date)) {
                trendsMap.get(t.date).closed = t.closed;
            } else {
                trendsMap.set(t.date, { date: t.date, created: 0, closed: t.closed });
            }
        });
        const combinedTrends = Array.from(trendsMap.values()).sort((a, b) => a.date.localeCompare(b.date));

        // Engineer performance (tickets closed by engineer)
        const engineerPerformance = await Ticket.aggregate([
            { $match: { status: 'closed', assignedTo: { $exists: true } } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'assignedTo',
                    foreignField: '_id',
                    as: 'engineer',
                },
            },
            { $unwind: '$engineer' },
            {
                $group: {
                    _id: '$assignedTo',
                    name: { $first: '$engineer.name' },
                    ticketsClosed: { $sum: 1 },
                },
            },
            { $sort: { ticketsClosed: -1 } },
            { $limit: 5 },
            { $project: { name: 1, ticketsClosed: 1, _id: 0 } },
        ]);

        // Average resolution time (in hours)
        const resolutionTimeData = await Ticket.aggregate([
            { $match: { status: 'closed', closedAt: { $exists: true } } },
            {
                $project: {
                    resolutionTime: {
                        $divide: [{ $subtract: ['$closedAt', '$createdAt'] }, 1000 * 60 * 60],
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    avgTime: { $avg: '$resolutionTime' },
                },
            },
        ]);
        const avgResolutionTime = resolutionTimeData[0]?.avgTime || 0;

        // Open vs closed ratio
        const openTickets = await Ticket.countDocuments({ status: { $in: ['open', 'assigned', 'in_progress', 'pending_verification', 'reopened'] } });
        const closedTickets = await Ticket.countDocuments({ status: 'closed' });

        // Monthly comparison
        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);
        const lastMonth = new Date(thisMonth);
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const ticketsThisMonth = await Ticket.countDocuments({ createdAt: { $gte: thisMonth } });
        const ticketsLastMonth = await Ticket.countDocuments({
            createdAt: { $gte: lastMonth, $lt: thisMonth },
        });

        const monthlyChange = ticketsLastMonth > 0
            ? Math.round(((ticketsThisMonth - ticketsLastMonth) / ticketsLastMonth) * 100)
            : 100;

        return NextResponse.json({
            totalTickets,
            totalEquipment,
            totalUsers,
            openTickets,
            closedTickets,
            avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
            ticketsByStatus,
            ticketsByPriority,
            equipmentByStatus,
            dailyTrends: combinedTrends,
            engineerPerformance,
            monthlyChange,
            ticketsThisMonth,
            ticketsLastMonth,
        });
    } catch (error: any) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
