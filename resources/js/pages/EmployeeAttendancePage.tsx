import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { EmployeeAttendance, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';
import axios from 'axios';
import { ArrowUpDown, ClockArrowDown, ClockArrowUp } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

const pageBreadcrumbs: BreadcrumbItem[] = [{ title: 'Absensi Karyawan', href: '/absensi' }];

const statusMapping: Record<EmployeeAttendance['status'], [label: string, colorClass: string]> = {
    not_started: ['Belum Hadir', 'p-1.5 text-amber-500 bg-amber-500/10'],
    working: ['Sedang Bekerja', 'p-1.5 text-emerald-500 bg-emerald-500/10'],
    finished: ['Sudah Pulang', 'p-1.5 text-blue-500 bg-blue-500/10'],
    leave: ['Tidak Masuk', 'p-1.5 text-rose-500 bg-rose-500/10'],
};

function formatTimeFromTimestamp(timestampMs: number): string {
    return new Date(timestampMs).toLocaleTimeString('en-GB');
}

function calculateWorkingDuration(clockInTime?: string | null, clockOutTime?: string | null, referenceTimestampMs: number = Date.now()): string {
    if (!clockInTime) return '-';

    const timeStringToDate = (timeString: string) => {
        const [hours, minutes, seconds] = timeString.split(':').map(Number);
        const dateObject = new Date(referenceTimestampMs);
        dateObject.setHours(hours, minutes, seconds);
        return dateObject;
    };

    const startDate = timeStringToDate(clockInTime);
    const endDate = clockOutTime ? timeStringToDate(clockOutTime) : new Date(referenceTimestampMs);

    const differenceMs = endDate.getTime() - startDate.getTime();
    const padNumber = (n: number) => n.toString().padStart(2, '0');
    const hoursWorked = Math.floor(differenceMs / 3_600_000);
    const minutesWorked = Math.floor((differenceMs % 3_600_000) / 60_000);
    const secondsWorked = Math.floor((differenceMs % 60_000) / 1_000);

    return `${padNumber(hoursWorked)}:${padNumber(minutesWorked)}:${padNumber(secondsWorked)}`;
}

export default function EmployeeAttendancePage() {
    const { employee_attendances } = usePage<{ employee_attendances: EmployeeAttendance[] }>().props;
    const [attendanceList, setAttendanceList] = useState(employee_attendances);
    const [currentTimestamp, setCurrentTimestamp] = useState(() => Date.now());
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    useEffect(() => {
        const timeInterval = setInterval(() => setCurrentTimestamp(Date.now()), 1000);
        const pollingInterval = setInterval(() => router.reload({ only: ['employee_attendances'] }), 10000);
        return () => {
            clearInterval(timeInterval);
            clearInterval(pollingInterval);
        };
    }, []);

    useEffect(() => {
        setAttendanceList(employee_attendances);
    }, [employee_attendances]);

    // Perubahan pada pembuatan todayString
    const today = new Date(currentTimestamp);
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;

    const todaysAttendances = useMemo(() => attendanceList.filter((record) => record.date?.startsWith(todayString)), [attendanceList, todayString]);

    type AttendanceUpdateData = Partial<Pick<EmployeeAttendance, 'clock_in' | 'clock_out'>> & { status: EmployeeAttendance['status'] };

    const handleAttendanceUpdate = useCallback(async (attendanceId: number, updateData: AttendanceUpdateData) => {
        setAttendanceList((prev) => prev.map((record) => (record.id === attendanceId ? { ...record, ...updateData } : record)));
        try {
            await axios.patch(route('absensi.update', attendanceId), updateData);
        } catch (error) {
            console.error(error);
            router.reload({ only: ['employee_attendances'] });
        }
    }, []);

    const columns = useMemo<ColumnDef<EmployeeAttendance>[]>(
        () => [
            {
                id: 'employeeName', // ID eksplisit
                accessorFn: (row) => row.employee?.name, // Menggunakan accessor function
                header: ({ column }) => {
                    return (
                        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                            Nama
                            <ArrowUpDown className="ml-2 h-3 w-3" />
                        </Button>
                    );
                },
                cell: ({ row }) => <span className="text-sm">{row.original.employee?.name ?? '-'}</span>,
                enableSorting: true,
                enableColumnFilter: true,
            },
            {
                id: 'clock_in',
                header: 'Jam Masuk',
                cell: ({ row }) => {
                    const attendance = row.original;
                    if (attendance.status === 'leave') return '-';
                    return attendance.clock_in ? (
                        attendance.clock_in
                    ) : (
                        <Button
                            variant="secondary"
                            onClick={() =>
                                handleAttendanceUpdate(attendance.id, {
                                    clock_in: formatTimeFromTimestamp(currentTimestamp),
                                    status: 'working',
                                })
                            }
                        >
                            <ClockArrowDown />
                        </Button>
                    );
                },
            },
            {
                id: 'clock_out',
                header: 'Jam Pulang',
                cell: ({ row }) => {
                    const attendance = row.original;
                    if (attendance.status === 'leave') return '-';
                    return attendance.clock_out ? (
                        attendance.clock_out
                    ) : (
                        <Button
                            variant="secondary"
                            disabled={!attendance.clock_in}
                            onClick={() =>
                                handleAttendanceUpdate(attendance.id, {
                                    clock_out: formatTimeFromTimestamp(currentTimestamp),
                                    status: 'finished',
                                })
                            }
                        >
                            <ClockArrowUp />
                        </Button>
                    );
                },
            },
            {
                id: 'working_duration',
                header: 'Waktu Kerja',
                cell: ({ row }) => calculateWorkingDuration(row.original.clock_in, row.original.clock_out, currentTimestamp),
            },
            {
                id: 'status',
                header: 'Status',
                cell: ({ row }) => {
                    const [label, color] = statusMapping[row.original.status];
                    return <Badge className={color}>{label}</Badge>;
                },
            },
        ],
        [handleAttendanceUpdate, currentTimestamp],
    );

    const table = useReactTable({
        data: todaysAttendances,
        columns,
        state: {
            sorting,
            columnFilters,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    return (
        <AppLayout breadcrumbs={pageBreadcrumbs}>
            <Head title="Absensi Karyawan" />
            <div className="overflow-x-auto p-4">
                {/* Tambahkan Input untuk filtering */}
                <div className="flex items-center py-4">
                    <Input
                        placeholder="Cari nama karyawan..."
                        value={(table.getColumn('employeeName')?.getFilterValue() as string) ?? ''} // Gunakan ID yang benar
                        onChange={(event) => table.getColumn('employeeName')?.setFilterValue(event.target.value)}
                        className="max-w-md text-sm"
                    />
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                                        Tidak ada data yang ditemukan.
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
