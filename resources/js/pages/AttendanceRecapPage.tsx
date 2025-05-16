// AttendanceRecapPage.tsx
// Imports: Dikelompokkan berdasarkan jenis dan sumber
// -----------------------------------------------------------------------------
import { Head, usePage } from '@inertiajs/react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';

// Komponen UI Kustom
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';

// Tipe Data dan Konstanta
import { Attendance } from '@/types';

const attendanceStatus = {
    not_started: ['Belum Hadir', 'text-amber-500 bg-amber-500/10'],
    working: ['Sedang Bekerja', 'text-emerald-500 bg-emerald-500/10'],
    finished: ['Sudah Pulang', 'text-blue-500 bg-blue-500/10'],
    leave: ['Libur Cuti', 'text-rose-500 bg-rose-500/10'],
    sick: ['Libur Sakit', 'text-fuchsia-500 bg-fuchsia-500/10'],
};

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
    const [label, className] = attendanceStatus[status];
    return <Badge className={className}>{label}</Badge>;
};

// Komponen Utama: Absensi Karyawan
// -----------------------------------------------------------------------------
export default function AttendanceRecapPage() {
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

    // State dan Validasi Filter
    // -------------------------------------------------------------------------
    const [selectedYear, setSelectedYear] = useState<number>(() => {
        // Logika inisialisasi tahun default
        const currentYear = new Date().getFullYear();
        const initialYears = attendances.map((record) => new Date(record.date).getFullYear());
        const uniqueInitialYears = [...new Set(initialYears)].sort((a, b) => a - b);
        return uniqueInitialYears.includes(currentYear) ? currentYear : (uniqueInitialYears[0] ?? currentYear);
    });

    const [selectedMonth, setSelectedMonth] = useState<number>(() => {
        // Ambil bulan dari data di tahun yang dipilih
        const currentMonth = new Date().getMonth();
        const initialMonths = attendances.filter((record) => new Date(record.date).getFullYear() === selectedYear).map((record) => new Date(record.date).getMonth());
        const uniqueInitialMonths = [...new Set(initialMonths)].sort((a, b) => a - b);
        return uniqueInitialMonths.includes(currentMonth) ? currentMonth : (uniqueInitialMonths[0] ?? currentMonth);
    });

    // Ekstraksi Data Unik untuk Filter
    // -------------------------------------------------------------------------
    const uniqueYears = useMemo(() => {
        const years = new Set<number>();
        attendanceRecords.forEach((record) => {
            years.add(new Date(record.date).getFullYear());
        });
        return Array.from(years).sort((a, b) => a - b);
    }, [attendanceRecords]);

    const uniqueMonths = useMemo(() => {
        const months = new Set<number>();
        attendanceRecords.forEach((record) => {
            const date = new Date(record.date);
            if (date.getFullYear() === selectedYear) {
                months.add(date.getMonth());
            }
        });
        return Array.from(months).sort((a, b) => a - b);
    }, [attendanceRecords, selectedYear]);

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

    // Konfigurasi Tabel
    // -------------------------------------------------------------------------
    const tableColumns = useMemo<ColumnDef<Attendance>[]>(
        () => [
            {
                header: 'Tanggal',
                cell: ({ row }) => formatLongDate(new Date(row.original.date)),
            },
            {
                header: 'Shift',
                cell: ({ row }) => <span className={`${row.original.shift_type === 'Pagi' ? 'text-blue-500' : 'text-yellow-500'}`}>{row.original.shift_type}</span>,
            },
            { header: 'Jam Masuk', cell: ({ row }) => row.original.clock_in ?? '-' },
            { header: 'Jam Pulang', cell: ({ row }) => row.original.clock_out ?? '-' },
            {
                header: 'Waktu Kerja',
                cell: ({ row }) => calculateWorkingDuration(row.original.clock_in, row.original.clock_out, currentTimestamp),
            },
            {
                header: 'Status',
                cell: ({ row }) => <AttendanceStatusBadge status={row.original.status} />,
            },
        ],
        [currentTimestamp],
    );

    const attendanceTable = useReactTable({
        data: filteredData,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    // Render UI
    // -------------------------------------------------------------------------
    return (
        <AppLayout breadcrumbs={[{ title: 'Rekap Absensi', href: '/' }]}>
            <Head title="Rekap Absensi" />

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
