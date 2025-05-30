import { Card } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function DashboardPage({
    attendanceStats,
}: {
    attendanceStats: {
        working: number;
        leave: number;
        sick: number;
        totalEmployees: number;
    };
}) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/' }]}>
            <Head title="Dashboard" />

            <div className="p-4">
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-0 bg-emerald-500/10 p-6">
                        <p className="text-lg font-medium">Karyawan yang Hadir Hari Ini</p>
                        <p className="text-3xl font-bold text-emerald-500">
                            {attendanceStats.working} <span className="text-muted-foreground text-sm">/ {attendanceStats.totalEmployees}</span>
                        </p>
                    </Card>

                    <Card className="border-0 bg-rose-500/10 p-6">
                        <p className="text-lg font-medium">Karyawan yang Libur Hari Ini</p>
                        <p className="text-3xl font-bold text-rose-500">{attendanceStats.leave}</p>
                    </Card>

                    <Card className="border-0 bg-fuchsia-500/10 p-6">
                        <p className="text-lg font-medium">Karyawan yang Sakit Hari Ini</p>
                        <p className="text-3xl font-bold text-fuchsia-500">{attendanceStats.sick}</p>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
