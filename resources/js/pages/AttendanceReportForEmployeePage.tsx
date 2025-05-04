// AttendanceReportForAdminPage.tsx
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Attendance } from '@/types';
import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

interface Props {
    attendances: Attendance[];
}

// Konfigurasi breadcrumb untuk navigasi
const breadcrumbs: BreadcrumbItem[] = [{ title: 'Laporan Absensi', href: '/laporan-absensi-karyawan' }];

export default function AttendanceReportForAdminPage({ attendances }: Props) {
    // ==================== LOGIKA FILTER TAHUN ====================
    // Mendapatkan daftar tahun unik dari data absensi
    const availableYears = useMemo(() => {
        const years = new Set<number>();

        // Ekstrak tahun dari setiap data absensi
        attendances.forEach((attendance) => {
            const year = new Date(attendance.date).getFullYear();
            years.add(year);
        });

        // Urutkan tahun dari terbaru ke terlama
        return Array.from(years).sort((a, b) => b - a);
    }, [attendances]);

    // State untuk menyimpan tahun yang dipilih
    const [selectedYear, setSelectedYear] = useState<number>(() => {
        // Default: tahun sekarang jika tersedia, jika tidak ambil tahun pertama
        const currentYear = new Date().getFullYear();
        return availableYears.includes(currentYear) ? currentYear : availableYears[0] || currentYear;
    });

    // ==================== LOGIKA PEMBUATAN DATA CHART ====================
    const monthlyAttendanceData = useMemo(() => {
        // 1. Inisialisasi data bulanan default
        const monthlyData = Array.from({ length: 12 }, (_, monthIndex) => ({
            month: new Date(selectedYear, monthIndex).toLocaleString('id-ID', { month: 'long' }),
            finished: 0, // Jumlah hari hadir
            overtime: 0, // Jumlah hari lembur
            leave: 0, // Jumlah hari tidak masuk
        }));

        // 2. Filter data absensi berdasarkan tahun yang dipilih
        const filteredAttendances = attendances.filter((attendance) => {
            const attendanceYear = new Date(attendance.date).getFullYear();
            return attendanceYear === selectedYear;
        });

        // 3. Akumulasi data per bulan
        filteredAttendances.forEach((attendance) => {
            const monthIndex = new Date(attendance.date).getMonth();

            // Update counter berdasarkan status absensi
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
    }, [selectedYear, attendances]);

    // ==================== KONFIGURASI VISUAL CHART ====================
    const chartConfig = {
        finished: { label: 'Hadir', color: '#3B82F6' },
        overtime: { label: 'Lembur', color: '#10B981' },
        leave: { label: 'Tidak Masuk', color: '#F43F5E' },
    } satisfies ChartConfig;

    // ==================== TAMPILAN KOMPONEN ====================
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Absensi" />

            <div className="m-4 space-y-4">
                {/* SECTION: FILTER TAHUN */}
                <div className="flex flex-wrap gap-4">
                    {/* Dropdown untuk memilih tahun */}
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

                {/* SECTION: GRAFIK LAPORAN */}
                <ChartContainer config={chartConfig} className="w-full">
                    <BarChart data={monthlyAttendanceData}>
                        {/* Grid garis vertikal */}
                        <CartesianGrid vertical={false} strokeDasharray="5 5" />

                        {/* Sumbu X - Nama bulan (3 karakter pertama) */}
                        <XAxis dataKey="month" axisLine={false} tickFormatter={(month) => month.slice(0, 3)} />

                        {/* Sumbu Y - Jumlah hari */}
                        <YAxis axisLine={false} tickCount={7} tickFormatter={(value) => `${value} hari`} padding={{ top: 20 }} />

                        {/* Tooltip interaktif saat hover */}
                        <ChartTooltip content={<ChartTooltipContent />} />

                        {/* Legenda warna chart */}
                        <ChartLegend content={<ChartLegendContent />} />

                        {/* Bar chart untuk hari hadir */}
                        <Bar dataKey="finished" fill="var(--color-finished)" radius={[8, 8, 0, 0]} />

                        {/* Bar chart untuk hari lembur */}
                        <Bar dataKey="overtime" fill="var(--color-overtime)" radius={[8, 8, 0, 0]} />

                        {/* Bar chart untuk hari tidak masuk */}
                        <Bar dataKey="leave" fill="var(--color-leave)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ChartContainer>
            </div>
        </AppLayout>
    );
}
