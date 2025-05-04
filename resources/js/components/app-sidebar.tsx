import { NavMain } from '@/components/nav-main';
import { NavReport } from '@/components/nav-report';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { NavItem, NavReportItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { CalendarClock, ChartColumnBig, ClipboardCheck, DollarSign, IdCard, LayoutGrid, UserSearch } from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage<{ auth: { user: { role: string } } }>().props;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
            role: 'admin',
        },
        {
            title: 'Absensi Karyawan',
            href: '/absensi',
            icon: ClipboardCheck,
            role: 'karyawan',
        },
        {
            title: 'Monitoring Absensi',
            href: '/monitoring-absensi',
            icon: UserSearch,
            role: 'admin',
        },
        {
            title: 'Perhitungan Penggajian',
            href: '/perhitungan-penggajian',
            icon: DollarSign,
            role: 'admin',
        },
        {
            title: 'Data Karyawan',
            href: '/data-karyawan',
            icon: IdCard,
            role: 'admin',
        },
        {
            title: 'Penggajian',
            href: '/penggajian',
            icon: DollarSign,
            role: 'karyawan',
        },
    ].filter((item) => {
        // Tampilkan item jika tidak ada role atau jika role sesuai dengan pengguna
        return !item.role || item.role === auth.user.role;
    });

    const reportNavItems: NavReportItem[] = [
        {
            title: 'Laporan Absensi',
            href: '/laporan-absensi-karyawan',
            icon: CalendarClock,
            role: 'karyawan',
        },
        {
            title: 'Laporan Absensi',
            href: '/laporan-absensi-admin',
            icon: CalendarClock,
            role: 'admin',
        },
        {
            title: 'Laporan Penggajian',
            href: '/laporan-penggajian',
            icon: ChartColumnBig,
            role: 'admin',
        },
    ].filter((item) => {
        // Tampilkan item jika tidak ada role atau jika role sesuai dengan pengguna
        return !item.role || item.role === auth.user.role;
    });

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
                <NavReport items={reportNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
