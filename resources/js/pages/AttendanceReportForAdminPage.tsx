// AttendanceReportForAdminPage.tsx
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { User, type BreadcrumbItem, type Attendance } from '@/types';
import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

interface Props {
    attendances: Attendance[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Laporan Absensi', href: '/laporan-absensi-admin' }];

export default function AttendanceReportForAdminPage({ attendances }: Props) {
    // Memo: Daftar unik karyawan dari data absensi
    const employees = useMemo(() => {
        const uniqueEmployees = new Map<string, User>();
        attendances.forEach((attendance) => {
            uniqueEmployees.set(attendance.user.id, attendance.user);
        });
        return Array.from(uniqueEmployees.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [attendances]);

    // Memo: Daftar tahun unik dari data absensi (diurutkan descending)
    const availableYears = useMemo(() => {
        const years = new Set<number>();
        attendances.forEach((attendance) => {
            years.add(new Date(attendance.date).getFullYear());
        });
        return Array.from(years).sort((a, b) => b - a);
    }, [attendances]);

    // State: Tahun dan karyawan yang dipilih
    const [selectedYear, setSelectedYear] = useState<number>(() => {
        const currentYear = new Date().getFullYear();
        return availableYears.includes(currentYear) ? currentYear : availableYears[0] || currentYear;
    });

    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(employees[0]?.id || '');

    // Memo: Membuat data chart berdasarkan filter
    const monthlyAttendanceData = useMemo(() => {
        // Inisialisasi data bulanan dengan nilai default 0
        const monthlyData = Array.from({ length: 12 }, (_, monthIndex) => ({
            month: new Date(selectedYear, monthIndex).toLocaleString('id-ID', { month: 'long' }),
            finished: 0,
            overtime: 0, // Jumlah hari lembur
            leave: 0,
        }));

        // Filter data absensi sesuai kriteria
        const filteredAttendances = attendances.filter((attendance) => {
            const attendanceYear = new Date(attendance.date).getFullYear();
            return attendance.user.id === selectedEmployeeId && attendanceYear === selectedYear;
        });

        // Hitung jumlah kehadiran per bulan
        filteredAttendances.forEach((attendance) => {
            const monthIndex = new Date(attendance.date).getMonth();
            if (attendance.status === 'finished') {
                monthlyData[monthIndex].finished += 1;

                // Hitung lembur jika ada clock_in dan clock_out
                if (attendance.clock_in && attendance.clock_out) {
                    // Gabungkan tanggal absensi dengan jam clock-in/out
                    const clockIn = new Date(`${attendance.date}T${attendance.clock_in}`);
                    const clockOut = new Date(`${attendance.date}T${attendance.clock_out}`);

                    // Hitung selisih jam (dalam desimal)
                    const diffHours = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);

                    if (diffHours > 8.5) {
                        monthlyData[monthIndex].overtime += 1;
                    }
                }
            } else if (attendance.status === 'leave') {
                monthlyData[monthIndex].leave += 1;
            }
        });

        return monthlyData;
    }, [selectedEmployeeId, selectedYear, attendances]);

    // Konfigurasi visual chart
    const chartConfig = {
        finished: { label: 'Hadir', color: '#3B82F6' },
        overtime: { label: 'Lembur', color: '#10B981' },
        leave: { label: 'Tidak Masuk', color: '#F43F5E' },
    } satisfies ChartConfig;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Absensi" />

            <div className="m-4 space-y-4">
                {/* Section: Filter Kontrol */}
                <div className="flex flex-wrap gap-4">
                    {/* Dropdown Pilih Karyawan */}
                    <div className="w-full md:w-auto">
                        <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {employees.map((employee) => (
                                    <SelectItem key={employee.id} value={employee.id}>
                                        {employee.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Dropdown Pilih Tahun */}
                    <div className="w-full md:w-auto">
                        <Select value={String(selectedYear)} onValueChange={(value) => setSelectedYear(Number(value))}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {availableYears.map((year) => (
                                    <SelectItem key={year} value={String(year)}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Section: Grafik Laporan */}
                {selectedEmployeeId && (
                    <ChartContainer config={chartConfig} className="w-full">
                        <BarChart data={monthlyAttendanceData}>
                            <CartesianGrid vertical={false} strokeDasharray="5 5" />

                            {/* Sumbu X - Nama Bulan (3 huruf pertama) */}
                            <XAxis dataKey="month" axisLine={false} tickFormatter={(month) => month.slice(0, 3)} />

                            {/* Sumbu Y - Jumlah Hari */}
                            <YAxis axisLine={false} tickCount={7} tickFormatter={(value) => `${value} hari`} padding={{ top: 20 }} />

                            {/* Tooltip Interaktif */}
                            <ChartTooltip content={<ChartTooltipContent />} />

                            {/* Legenda Warna */}
                            <ChartLegend content={<ChartLegendContent />} />

                            {/* Bar Chart Kehadiran */}
                            <Bar dataKey="finished" fill="var(--color-finished)" radius={[8, 8, 0, 0]} />

                            {/* Bar chart untuk hari lembur */}
                            <Bar dataKey="overtime" fill="var(--color-overtime)" radius={[8, 8, 0, 0]} />

                            {/* Bar Chart Ketidakhadiran */}
                            <Bar dataKey="leave" fill="var(--color-leave)" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ChartContainer>
                )}
            </div>
        </AppLayout>
    );
}
