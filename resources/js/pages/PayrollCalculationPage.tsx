import DetailModal from '@/components/payroll-calculation-components/DetailModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Payroll, type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, SortingState, useReactTable } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import React, { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Perhitungan Penggajian', href: '/perhitungan-penggajian' }];

const statusMapping: Record<Payroll['status'], [string, string]> = {
    uncalculated: ['Belum Dihitung', 'p-1.5 text-natural-500 bg-neutral-500/10'],
    unpaid: ['Belum Dibayar', 'p-1.5 text-amber-500 bg-amber-500/10'],
    paid: ['Sudah Dibayar', 'p-1.5 text-emerald-500 bg-emerald-500/10'],
};

interface Props {
    payrolls: Payroll[];
}

export default function PayrollCalculationPage({ payrolls }: Props) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = React.useState(false);
    const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);

    const columns = useMemo<ColumnDef<Payroll>[]>(
        () => [
            {
                id: 'employee_name',
                accessorFn: (row) => row.employee.name,
                header: ({ column }) => {
                    return (
                        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                            Nama
                            <ArrowUpDown className="ml-2 h-3 w-3" />
                        </Button>
                    );
                },
            },
            {
                id: 'total_attendance_days',
                header: 'Jumlah Kehadiran',
                cell: ({ row }) => <div>{row.original.total_attendance_days ? `${row.original.total_attendance_days} Hari` : '-'}</div>,
            },
            {
                id: 'net_salary',
                header: 'Gaji Bersih',
                cell: ({ row }) => <div>{row.original.net_salary ? `Rp ${Number(row.original.net_salary).toLocaleString('id-ID')}` : '-'}</div>,
            },
            {
                id: 'status',
                header: 'Status',
                cell: ({ row }) => {
                    const [label, color] = statusMapping[row.original.status];
                    return <Badge className={color}>{label}</Badge>;
                },
            },
            {
                id: 'action',
                header: 'Aksi',
                cell: ({ row }) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleCalculate(row.original.id)} hidden={row.original.status === 'unpaid' || row.original.status === 'paid'}>
                                Hitung
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleCalculate(row.original.id)}
                                hidden={row.original.status !== 'unpaid' || !row.original.net_salary || !row.original.total_attendance_days}
                            >
                                Perbarui
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => {
                                    setSelectedPayroll(row.original);
                                    setIsDetailDialogOpen(true);
                                }}
                                hidden={row.original.status === 'uncalculated'}
                            >
                                Lihat Detail
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePaid(row.original.id, 'paid')} hidden={row.original.status === 'paid' || row.original.status === 'uncalculated'}>
                                Tandai Sudah Dibayar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
            },
        ],
        [],
    );

    const table = useReactTable({
        data: payrolls,
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

    const handlePaid = (id: number, status: 'paid') => {
        router.patch(
            `/perhitungan-penggajian/paid/${id}`,
            {
                status: status,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Optional: Tambahkan notifikasi
                },
            },
        );
    };

    const handleCalculate = (id: number) => {
        router.patch(
            `/perhitungan-penggajian/calculate/${id}`,
            {},
            {
                preserveScroll: true, // Pertahankan posisi scroll
                onSuccess: () => {
                    // Data akan otomatis update via props tanpa perlu state
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Perhitungan Penggajian" />
            <div className="overflow-x-auto p-4">
                <div className="flex items-center py-4">
                    <Input
                        placeholder="Cari nama karyawan..."
                        value={(table.getColumn('employee_name')?.getFilterValue() as string) ?? ''}
                        onChange={(event) => table.getColumn('employee_name')?.setFilterValue(event.target.value)}
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

            <DetailModal open={isDetailDialogOpen} onClose={() => setIsDetailDialogOpen(false)} payroll={selectedPayroll} />
        </AppLayout>
    );
}
