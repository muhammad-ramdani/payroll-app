// Imports: Dikelompokkan berdasarkan jenis dan sumber
// -----------------------------------------------------------------------------
import { Head, router, usePage } from '@inertiajs/react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { ClockArrowDown, ClockArrowUp } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { calculateDistance, getCurrentPosition } from '@/utils/geolocation';

// Komponen UI Kustom
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';

// Tipe Data dan Konstanta
import { Attendance, type BreadcrumbItem } from '@/types';

// Konfigurasi Konstanta
// -----------------------------------------------------------------------------
const PAGE_BREADCRUMBS: BreadcrumbItem[] = [{ title: 'Absensi Karyawan', href: '/absensi' }];

const ATTENDANCE_STATUS_CONFIG: Record<Attendance['status'], [string, string]> = {
    not_started: ['Belum Hadir', 'p-1.5 text-amber-500 bg-amber-500/10'],
    working: ['Sedang Bekerja', 'p-1.5 text-emerald-500 bg-emerald-500/10'],
    finished: ['Sudah Pulang', 'p-1.5 text-blue-500 bg-blue-500/10'],
    leave: ['Tidak Masuk', 'p-1.5 text-rose-500 bg-rose-500/10'],
};

// Fungsi Utilitas
// -----------------------------------------------------------------------------
/**
 * Format timestamp ke format waktu HH:MM:SS
 * @param timestampMs - Timestamp dalam milidetik
 */
const formatTimeToHHMMSS = (timestampMs: number) => new Date(timestampMs).toLocaleTimeString('en-GB');

/**
 * Format tanggal ke format 'Hari, Tanggal' (Contoh: Senin, 1)
 * @param date - Objek Date yang akan diformat
 */
const formatLongDate = (date: Date) => new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric' }).format(date);

/**
 * Menghitung durasi kerja berdasarkan jam masuk dan keluar
 * @param clockInTime - Waktu masuk (format HH:mm:ss)
 * @param clockOutTime - Waktu keluar (format HH:mm:ss)
 * @param currentTimestamp - Timestamp saat ini untuk kalkulasi real-time
 */
const calculateWorkingDuration = (clockInTime?: string | null, clockOutTime?: string | null, currentTimestamp = Date.now()): string => {
    if (!clockInTime) return '-';

    // Konversi string waktu ke objek Date
    const parseTimeStringToDate = (time: string) => {
        const [hours, minutes, seconds] = time.split(':').map(Number);
        const date = new Date(currentTimestamp);
        date.setHours(hours, minutes, seconds);
        return date;
    };

    const startTime = parseTimeStringToDate(clockInTime);
    const endTime = clockOutTime ? parseTimeStringToDate(clockOutTime) : new Date(currentTimestamp);

    // Hitung selisih waktu dalam milidetik
    const durationInMilliseconds = endTime.getTime() - startTime.getTime();

    // Format durasi ke HH:mm:ss
    const padWithZero = (number: number) => String(number).padStart(2, '0');
    const hours = Math.floor(durationInMilliseconds / 3_600_000);
    const minutes = Math.floor((durationInMilliseconds % 3_600_000) / 60_000);
    const seconds = Math.floor((durationInMilliseconds % 60_000) / 1_000);

    return `${padWithZero(hours)}:${padWithZero(minutes)}:${padWithZero(seconds)}`;
};

// Komponen Status Badge
// -----------------------------------------------------------------------------
const AttendanceStatusBadge = ({ status }: { status: Attendance['status'] }) => {
    const [label, className] = ATTENDANCE_STATUS_CONFIG[status];
    return <Badge className={className}>{label}</Badge>;
};

// Komponen Utama: Absensi Karyawan
// -----------------------------------------------------------------------------
export default function AttendancePage() {
    // Inisialisasi Data dan State Dasar
    // -------------------------------------------------------------------------
    const {
        props: { attendances },
    } = usePage<{ attendances: Attendance[] }>();
    const [attendanceRecords, setAttendanceRecords] = useState(attendances);
    const [currentTimestamp, setCurrentTimestamp] = useState(Date.now());

    // Efek Samping: Update waktu real-time dan sinkronisasi data
    // -------------------------------------------------------------------------
    useEffect(() => {
        const intervalId = setInterval(() => setCurrentTimestamp(Date.now()), 1000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        setAttendanceRecords(attendances);
    }, [attendances]);

    // Ekstraksi Data Unik untuk Filter
    // -------------------------------------------------------------------------
    const { uniqueMonths, uniqueYears } = useMemo(() => {
        const months = new Set<number>();
        const years = new Set<number>();

        attendanceRecords.forEach((record) => {
            const date = new Date(record.date);
            months.add(date.getMonth());
            years.add(date.getFullYear());
        });

        return {
            uniqueMonths: Array.from(months).sort((a, b) => a - b),
            uniqueYears: Array.from(years).sort((a, b) => a - b),
        };
    }, [attendanceRecords]);

    // State dan Validasi Filter
    // -------------------------------------------------------------------------
    const [selectedMonth, setSelectedMonth] = useState<number>(() => {
        // Logika inisialisasi bulan default
        const currentMonth = new Date().getMonth();
        const initialMonths = attendances.map((record) => new Date(record.date).getMonth());
        const uniqueInitialMonths = [...new Set(initialMonths)].sort((a, b) => a - b);
        return uniqueInitialMonths.includes(currentMonth) ? currentMonth : (uniqueInitialMonths[0] ?? currentMonth);
    });

    const [selectedYear, setSelectedYear] = useState<number>(() => {
        // Logika inisialisasi tahun default
        const currentYear = new Date().getFullYear();
        const initialYears = attendances.map((record) => new Date(record.date).getFullYear());
        const uniqueInitialYears = [...new Set(initialYears)].sort((a, b) => a - b);
        return uniqueInitialYears.includes(currentYear) ? currentYear : (uniqueInitialYears[0] ?? currentYear);
    });

    // Validasi nilai filter saat data berubah
    useEffect(() => {
        if (uniqueMonths.length > 0 && !uniqueMonths.includes(selectedMonth)) {
            setSelectedMonth(uniqueMonths[0]);
        }
    }, [uniqueMonths, selectedMonth]);

    useEffect(() => {
        if (uniqueYears.length > 0 && !uniqueYears.includes(selectedYear)) {
            setSelectedYear(uniqueYears[0]);
        }
    }, [uniqueYears, selectedYear]);

    // Filter Data Berdasarkan Bulan dan Tahun
    // -------------------------------------------------------------------------
    const filteredData = useMemo(() => {
        return attendanceRecords.filter((record) => {
            const date = new Date(record.date);
            return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
        });
    }, [attendanceRecords, selectedMonth, selectedYear]);

    // Handler Update Absensi
    // -------------------------------------------------------------------------
    const handleUpdateAttendance = useCallback(async (id: number, data: { clock_in?: string; clock_out?: string; status: Attendance['status'] }) => {
        setAttendanceRecords((prev) => prev.map((record) => (record.id === id ? { ...record, ...data } : record)));
        await router.patch(route('absensi.update', id), data);
    }, []);

    const handleAttendanceAction = useCallback(
        async (actionType: 'clock_in' | 'clock_out', recordId: number) => {
            try {
                const { latitude, longitude } = await getCurrentPosition();

                // Ambil semua store yang terdaftar
                const stores = [];
                let storeCount = 1;

                while (import.meta.env[`VITE_STORE_${storeCount}_LAT`]) {
                    stores.push({
                        name: import.meta.env[`VITE_STORE_${storeCount}_NAME`] || `Store ${storeCount}`,
                        lat: parseFloat(import.meta.env[`VITE_STORE_${storeCount}_LAT`]),
                        lng: parseFloat(import.meta.env[`VITE_STORE_${storeCount}_LNG`]),
                        radius: parseFloat(import.meta.env[`VITE_STORE_${storeCount}_RADIUS`]) || 100,
                    });
                    storeCount++;
                }

                // Cek jarak ke semua store
                const isWithinRadius = stores.some((store) => {
                    const distance = calculateDistance(latitude, longitude, store.lat, store.lng);
                    return distance <= store.radius;
                });

                if (!isWithinRadius) {
                    const storeList = stores.map((store) => `${store.name} (${store.radius}m)`).join(', ');
                    alert(`Anda harus berada di salah satu lokasi: ${storeList}`);
                    return;
                }

                const currentTime = formatTimeToHHMMSS(Date.now());
                await handleUpdateAttendance(recordId, {
                    [actionType]: currentTime,
                    status: actionType === 'clock_in' ? 'working' : 'finished',
                });
            } catch (error) {
                alert(`Gagal mendapatkan lokasi: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
        [handleUpdateAttendance],
    );

    // Konfigurasi Tabel
    // -------------------------------------------------------------------------
    const tableColumns = useMemo<ColumnDef<Attendance>[]>(
        () => [
            {
                header: 'Tanggal',
                cell: ({ row }) => formatLongDate(new Date(row.original.date)),
            },
            {
                header: 'Jam Masuk',
                cell: ({ row }) => {
                    const record = row.original;
                    if (record.status === 'leave') return '-';

                    return record.clock_in ? (
                        record.clock_in
                    ) : (
                        <Button variant="secondary" onClick={() => handleAttendanceAction('clock_in', record.id)}>
                            <ClockArrowDown />
                        </Button>
                    );
                },
            },
            {
                header: 'Jam Pulang',
                cell: ({ row }) => {
                    const record = row.original;
                    if (record.status === 'leave') return '-';

                    return record.clock_out ? (
                        record.clock_out
                    ) : (
                        <Button variant="secondary" disabled={!record.clock_in} onClick={() => handleAttendanceAction('clock_out', record.id)}>
                            <ClockArrowUp />
                        </Button>
                    );
                },
            },
            {
                header: 'Waktu Kerja',
                cell: ({ row }) => calculateWorkingDuration(row.original.clock_in, row.original.clock_out, currentTimestamp),
            },
            {
                header: 'Status',
                cell: ({ row }) => <AttendanceStatusBadge status={row.original.status} />,
            },
        ],
        [currentTimestamp, handleAttendanceAction],
    );

    const attendanceTable = useReactTable({
        data: filteredData,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    // Render UI
    // -------------------------------------------------------------------------
    return (
        <AppLayout breadcrumbs={PAGE_BREADCRUMBS}>
            <Head title="Absensi Karyawan" />

            {/* Konten Utama */}
            <div className="overflow-x-auto p-4">
                {/* Kontrol Filter Bulan dan Tahun */}
                <div className="mb-4 flex gap-4">
                    <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                        <SelectTrigger className="sm:w-40">
                            <SelectValue placeholder="Pilih Bulan" />
                        </SelectTrigger>
                        <SelectContent>
                            {uniqueMonths.map((month) => (
                                <SelectItem key={month} value={month.toString()}>
                                    {new Date(0, month).toLocaleDateString('id-ID', { month: 'long' })}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                        <SelectTrigger className="sm:w-40">
                            <SelectValue placeholder="Pilih Tahun" />
                        </SelectTrigger>
                        <SelectContent>
                            {uniqueYears.map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Tabel Data Absensi */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {attendanceTable.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>

                        <TableBody>
                            {attendanceTable.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
