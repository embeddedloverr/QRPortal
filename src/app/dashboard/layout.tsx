import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen">
            <Sidebar />
            <main className="lg:ml-64 min-h-screen p-4 lg:p-8 pt-16 lg:pt-8 pb-24 lg:pb-8">
                {children}
            </main>
            <MobileNav />
        </div>
    );
}

