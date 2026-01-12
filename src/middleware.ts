import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // Role-based route protection
        if (path.startsWith('/dashboard/verification') && token?.role !== 'supervisor' && token?.role !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }

        if (path.startsWith('/dashboard/admin') && token?.role !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: ['/dashboard/:path*'],
};
