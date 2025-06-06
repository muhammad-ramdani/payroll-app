import { NavMain } from '@/components/nav-main';
import { NavReport } from '@/components/nav-report';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { NavItem, NavReportItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ArrowRightLeft, CalendarClock, CalendarCog, ChartColumnBig, ClipboardCheck, ClipboardList, DollarSign, IdCard, LayoutGrid, RefreshCw, UserSearch } from 'lucide-react';
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
            title: 'Presensi',
            href: '/presensi',
            icon: ClipboardCheck,
            role: 'karyawan',
        },
        {
            title: 'Shift Kerja',
            href: '/shift-karyawan',
            icon: RefreshCw,
            role: 'karyawan',
        },
        {
            title: 'Permintaan Tukar Shift',
            href: '/permintaan-tukar-shift',
            icon: ArrowRightLeft,
            role: 'karyawan',
        },
        {
            title: 'Monitoring Presensi',
            href: '/monitoring-presensi',
            icon: UserSearch,
            role: 'admin',
        },
        {
            title: 'Aturan Presensi',
            href: '/aturan-presensi',
            icon: CalendarCog,
            role: 'admin',
        },
        {
            title: 'Shift Kerja',
            href: '/admin-shift-karyawan',
            icon: RefreshCw,
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
        return !item.role || item.role === auth.user.role;
    });

    const reportNavItems: NavReportItem[] = [
        {
            title: 'Rekap Presensi',
            href: '/rekap-presensi',
            icon: ClipboardList,
            role: 'karyawan',
        },
        {
            title: 'Laporan Presensi',
            href: '/laporan-presensi-karyawan',
            icon: CalendarClock,
            role: 'karyawan',
        },
        {
            title: 'Laporan Presensi',
            href: '/laporan-presensi-admin',
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
