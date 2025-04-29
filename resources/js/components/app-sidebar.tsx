import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, IdCard, ClipboardCheck, CalendarClock, DollarSign } from 'lucide-react';
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
        },
        {
            title: 'Laporan Absensi',
            href: '/laporan-absensi',
            icon: CalendarClock,
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
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
