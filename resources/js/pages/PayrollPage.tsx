import DetailModal from '@/components/payroll-calculation-components/DetailModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Payroll, type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Penggajian', href: '/' }];

const salaryStatusMapping: Record<Payroll['salary_status'], [string, string]> = {
    uncalculated: ['Belum Dihitung', 'p-1.5 text-natural-500 bg-neutral-500/10'],
    unpaid: ['Belum Dibayar', 'p-1.5 text-amber-500 bg-amber-500/10'],
    paid_transfer: ['Sudah Dibayar Transfer', 'p-1.5 text-emerald-500 bg-emerald-500/10'],
    paid_cash: ['Sudah Dibayar Tunai', 'p-1.5 text-emerald-500 bg-emerald-500/10'],
};

const confirmationStatusMapping: Record<Payroll['confirmation_status'], [string, string]> = {
    blank: ['-', 'border-0 p-0 bg-transparent dark:text-white text-black'],
    pending_confirmation: ['Menunggu Konfirmasi', 'p-1.5 text-amber-500 bg-amber-500/10'],
    received: ['Gaji Sudah Diterima', 'p-1.5 text-emerald-500 bg-emerald-500/10'],
};

interface Props {
    payrolls: Payroll[];
}

export default function PayrollPage({ payrolls }: Props) {
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);

    const initialSelection = useMemo(() => {
        const currentDate = new Date();
        let targetYear = currentDate.getFullYear();

        const currentYearExists = payrolls.some((p) => p.period_year === targetYear);

        if (!currentYearExists) {
            const sortedYears = [...new Set(payrolls.map((p) => p.period_year))].sort((a, b) => b - a);
            if (sortedYears.length > 0) {
                targetYear = sortedYears[0];
            }
        }

        return { year: targetYear };
    }, [payrolls]);

    const [selectedYear, setSelectedYear] = useState<number>(initialSelection.year);

    const uniqueYears = useMemo(() => {
        return [...new Set(payrolls.map((p) => p.period_year))].sort((a, b) => b - a);
    }, [payrolls]);

    useEffect(() => {
        if (uniqueYears.length > 0 && !uniqueYears.includes(selectedYear)) {
            setSelectedYear(Math.max(...uniqueYears));
        }
    }, [uniqueYears, selectedYear]);

    const filteredPayrolls = useMemo(() => payrolls.filter((p) => p.period_year === selectedYear), [payrolls, selectedYear]);

    const columns = useMemo<ColumnDef<Payroll>[]>(
        () => [
            {
                header: 'Bulan',
                cell: ({ row }) => new Date(0, row.original.period_month - 1).toLocaleDateString('id-ID', { month: 'long' }),
            },
            {
                header: 'Gaji Bersih',
                cell: ({ row }) => (row.original.net_salary ? <span className="text-nowrap">Rp {row.original.net_salary.toLocaleString('id-ID')}</span> : '-'),
            },
            {
                header: 'Status',
                cell: ({ row }) => {
                    const [label, color] = salaryStatusMapping[row.original.salary_status];
                    return <Badge className={color}>{label}</Badge>;
                },
            },
            {
                header: 'Konfirmasi Gaji',
                cell: ({ row }) => {
                    const [label, color] = confirmationStatusMapping[row.original.confirmation_status];
                    return <Badge className={color}>{label}</Badge>;
                },
            },
            {
                header: 'Aksi',
                cell: ({ row }) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild hidden={row.original.confirmation_status === 'blank'}>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => {
                                    setSelectedPayroll(row.original);
                                    setIsDetailDialogOpen(true);
                                }}
                                hidden={row.original.confirmation_status === 'blank'}
                            >
                                Lihat Detail
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleConfirmation(row.original.id)} hidden={row.original.confirmation_status !== 'pending_confirmation'}>
                                Tandai Gaji Sudah Diterima
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
            },
        ],
        [],
    );

    const handleConfirmation = (id: number) => {
        router.patch(`/penggajian/confirmation/${id}`, {
            confirmation_status: 'received',
        });
    };

    const table = useReactTable({
        data: filteredPayrolls,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Penggajian" />
            <div className="overflow-x-auto p-4">
                <div className="mb-4 flex gap-4">
                    <div className="w-auto">
                        <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                            <SelectTrigger>
                                <SelectValue />
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
                            {table.getRowModel().rows.map((row) => (
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

            <DetailModal open={isDetailDialogOpen} onClose={() => setIsDetailDialogOpen(false)} payroll={selectedPayroll} />
        </AppLayout>
    );
}
