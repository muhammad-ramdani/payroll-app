// Imports: Dikelompokkan berdasarkan sumber (Eksternal, Komponen, Utilitas, dll)
// -----------------------------------------------------------------------------
import { Head, usePage } from '@inertiajs/react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

// Komponen UI Kustom
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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

// Komponen Utilitas
// -----------------------------------------------------------------------------
/**
 * Komponen badge untuk menampilkan status kehadiran
 * @param status - Status kehadiran dari Attendance
 */
const AttendanceStatusBadge = ({ status }: { status: Attendance['status'] }) => {
    const [label, className] = attendanceStatus[status];
    return <Badge className={className}>{label}</Badge>;
};

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

// Komponen Utama
// -----------------------------------------------------------------------------
export default function AttendanceMonitoringPage() {
    // State Management
    // -------------------------------------------------------------------------
    const {
        props: { monitoring_attendances },
    } = usePage<{ monitoring_attendances: Attendance[] }>();
    const [currentTimestamp, setCurrentTimestamp] = useState(Date.now());
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();

    // Data Processing
    // -------------------------------------------------------------------------
    // Ekstrak tanggal yang tersedia dari data kehadiran
    const availableDates = useMemo(() => {
        const dates = new Set<number>();
        monitoring_attendances.forEach((record) => {
            const date = new Date(record.date);
            date.setHours(0, 0, 0, 0);
            dates.add(date.getTime());
        });
        return dates;
    }, [monitoring_attendances]);

    // Filter data berdasarkan tanggal terpilih
    const filteredData = useMemo(() => {
        if (!selectedDate) return [];
        const selectedTime = selectedDate.getTime();

        return monitoring_attendances.filter((record) => {
            const recordDate = new Date(record.date);
            recordDate.setHours(0, 0, 0, 0);
            return recordDate.getTime() === selectedTime;
        });
    }, [monitoring_attendances, selectedDate]);

    // Tabel Configuration
    // -------------------------------------------------------------------------
    const tableColumns = useMemo<ColumnDef<Attendance>[]>(
        () => [
            { header: 'Nama', cell: ({ row }) => <span>{row.original.user.name}</span> },
            {
                header: 'Shift',
                cell: ({ row }) => <span className={`${row.original.shift_type === 'Pagi' ? 'text-blue-500' : 'text-yellow-500'}`}>{row.original.shift_type}</span>,
            },
            { header: 'Jam Masuk', cell: ({ row }) => <span>{row.original.clock_in ?? '-'}</span> },
            { header: 'Jam Pulang', cell: ({ row }) => <span>{row.original.clock_out ?? '-'}</span> },
            {
                header: 'Waktu Kerja',
                cell: ({ row }) => calculateWorkingDuration(row.original.clock_in, row.original.clock_out, currentTimestamp),
            },
            { header: 'Status', cell: ({ row }) => <AttendanceStatusBadge status={row.original.status} /> },
        ],
        [currentTimestamp],
    );

    const attendanceTable = useReactTable({
        data: filteredData,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    // Effects & Handlers
    // -------------------------------------------------------------------------
    // Set tanggal default saat pertama load
    useEffect(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        setSelectedDate(today);
    }, []);

    // Update waktu setiap detik untuk durasi real-time
    useEffect(() => {
        const intervalId = setInterval(() => setCurrentTimestamp(Date.now()), 1000);
        return () => clearInterval(intervalId);
    }, []);

    // UI Rendering
    // -------------------------------------------------------------------------
    return (
        <AppLayout breadcrumbs={[{ title: 'Monitoring Presensi', href: '/' }]}>
            <Head title="Monitoring Presensi" />

            {/* Konten Utama */}
            <div className="overflow-x-auto p-4">
                {/* Header dengan Kontrol Tanggal dan Reload */}
                <div className="mb-4 flex">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="mr-auto w-auto font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate && format(selectedDate, 'EEEE, dd MMMM yyyy', { locale: id })}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                disabled={(date) => {
                                    const time = new Date(date).setHours(0, 0, 0, 0);
                                    const isToday = time === new Date().setHours(0, 0, 0, 0);
                                    return !isToday && !availableDates.has(time);
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Tabel Data Kehadiran */}
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
                            {attendanceTable.getRowModel().rows.length > 0 ? (
                                attendanceTable.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={tableColumns.length} className="text-muted-foreground h-24 text-center">
                                        Presensi baru akan tersedia pukul 06:30 pagi.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
