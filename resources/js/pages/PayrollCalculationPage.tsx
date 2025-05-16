// PayrollCalculationPage.php
import DetailModal from '@/components/payroll-calculation-components/DetailModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Modal from '@/components/ui/modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Payroll } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const salaryStatus = {
    uncalculated: ['Belum Dihitung', 'p-1.5 text-natural-500 bg-neutral-500/10'],
    unpaid: ['Belum Dibayar', 'p-1.5 text-amber-500 bg-amber-500/10'],
    paid_transfer: ['Sudah Dibayar Transfer', 'p-1.5 text-emerald-500 bg-emerald-500/10'],
    paid_cash: ['Sudah Dibayar Tunai', 'p-1.5 text-emerald-500 bg-emerald-500/10'],
};

const confirmationStatus = {
    blank: ['-', 'border-0 p-0 bg-transparent dark:text-white text-black'],
    pending_confirmation: ['Menunggu Konfirmasi', 'p-1.5 text-amber-500 bg-amber-500/10'],
    received: ['Gaji Sudah Diterima', 'p-1.5 text-emerald-500 bg-emerald-500/10'],
};

interface Props {
    payrolls: Payroll[];
}

export default function PayrollCalculationPage({ payrolls }: Props) {
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
    const [markAsPaidDialogOpen, setMarkAsPaidDialogOpen] = useState(false);
    const [selectedPayrollId, setSelectedPayrollId] = useState<number | null>(null);

    // Inisialisasi bulan dan tahun dengan logika khusus
    const initialSelection = useMemo(() => {
        const currentDate = new Date();
        let targetMonth = currentDate.getMonth() + 1;
        let targetYear = currentDate.getFullYear();

        const currentDataExists = payrolls.some((p) => p.period_month === targetMonth && p.period_year === targetYear);

        if (!currentDataExists) {
            // Coba bulan sebelumnya di tahun yang sama
            let prevMonth = targetMonth - 1;
            let prevYear = targetYear;

            if (prevMonth < 1) {
                prevMonth = 12;
                prevYear = targetYear - 1;
            }

            const prevDataExists = payrolls.some((p) => p.period_month === prevMonth && p.period_year === prevYear);

            if (prevDataExists) {
                targetMonth = prevMonth;
                targetYear = prevYear;
            } else {
                // Cari data terbaru yang ada
                const sortedPayrolls = [...payrolls].sort((a, b) => {
                    const yearDiff = b.period_year - a.period_year;
                    if (yearDiff !== 0) return yearDiff;
                    return b.period_month - a.period_month;
                });

                if (sortedPayrolls.length > 0) {
                    targetMonth = sortedPayrolls[0].period_month;
                    targetYear = sortedPayrolls[0].period_year;
                }
            }
        }

        return { month: targetMonth, year: targetYear };
    }, [payrolls]);

    // State Management untuk Filter
    const [selectedMonth, setSelectedMonth] = useState<number>(initialSelection.month);
    const [selectedYear, setSelectedYear] = useState<number>(initialSelection.year);

    // Ekstraksi Data Unik untuk Filter
    const uniqueYears = useMemo(() => {
        return [...new Set(payrolls.map((p) => p.period_year))].sort((a, b) => b - a);
    }, [payrolls]);

    const uniqueMonths = useMemo(() => {
        return [...new Set(payrolls.filter((p) => p.period_year === selectedYear).map((p) => p.period_month))].sort((a, b) => a - b);
    }, [payrolls, selectedYear]);

    // Validasi Filter saat Data Berubah
    useEffect(() => {
        if (uniqueMonths.length > 0 && !uniqueMonths.includes(selectedMonth)) {
            setSelectedMonth(Math.max(...uniqueMonths));
        }
    }, [uniqueMonths, selectedMonth]);

    useEffect(() => {
        if (uniqueYears.length > 0 && !uniqueYears.includes(selectedYear)) {
            setSelectedYear(Math.max(...uniqueYears));
        }
    }, [uniqueYears, selectedYear]);

    // Filter Data
    const filteredPayrolls = useMemo(() => payrolls.filter((p) => p.period_month === selectedMonth && p.period_year === selectedYear), [payrolls, selectedMonth, selectedYear]);

    // Kolom Tabel
    const columns = useMemo<ColumnDef<Payroll>[]>(
        () => [
            { header: 'Nama', cell: ({ row }) => row.original.user.name },
            {
                header: 'Gaji Bersih',
                cell: ({ row }) => (row.original.net_salary ? <span className="text-nowrap">Rp {row.original.net_salary.toLocaleString('id-ID')}</span> : '-'),
            },
            {
                header: 'Status',
                cell: ({ row }) => {
                    const [label, color] = salaryStatus[row.original.salary_status];
                    return <Badge className={color}>{label}</Badge>;
                },
            },
            {
                header: 'Konfirmasi Gaji',
                cell: ({ row }) => {
                    const [label, color] = confirmationStatus[row.original.confirmation_status];
                    return <Badge className={color}>{label}</Badge>;
                },
            },
            {
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
                            <DropdownMenuItem onClick={() => handleCalculate(row.original.id)} hidden={row.original.salary_status !== 'uncalculated'}>
                                Hitung
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCalculate(row.original.id)} hidden={row.original.salary_status !== 'unpaid'}>
                                Perbarui
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => {
                                    setSelectedPayroll(row.original);
                                    setIsDetailDialogOpen(true);
                                }}
                                hidden={row.original.salary_status === 'uncalculated'}
                            >
                                Lihat Detail
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => {
                                    setSelectedPayrollId(row.original.id);
                                    setMarkAsPaidDialogOpen(true);
                                }}
                                hidden={row.original.salary_status !== 'unpaid'}
                            >
                                Tandai Sudah Dibayar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(`/penggajian/pdf/${row.original.id}`, '_blank')} hidden={row.original.confirmation_status !== 'received'}>
                                Slip Gaji
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
            },
        ],
        [],
    );

    const table = useReactTable({
        data: filteredPayrolls,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    // Handlers
    const handlePaid = (id: number, salary_status: 'paid_transfer' | 'paid_cash') => {
        router.patch(`/perhitungan-penggajian/paid/${id}`, {
            salary_status,
            confirmation_status: 'pending_confirmation', // Tambahkan ini
        });
    };

    const handleCalculate = (id: number) => {
        router.patch(`/perhitungan-penggajian/calculate/${id}`);
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Perhitungan Penggajian', href: '/' }]}>
            <Head title="Perhitungan Penggajian" />

            <div className="overflow-x-auto p-4">
                {/* Filter Controls */}
                <div className="mb-4 flex gap-4">
                    <div className="w-[200px]">
                        <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(Number(v))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Bulan" />
                            </SelectTrigger>
                            <SelectContent>
                                {uniqueMonths.map((month) => (
                                    <SelectItem key={month} value={month.toString()}>
                                        {new Date(2000, month - 1).toLocaleDateString('id-ID', { month: 'long' })}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-[200px]">
                        <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                            <SelectTrigger>
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
                </div>

                {/* Tabel Data */}
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

            <Modal open={markAsPaidDialogOpen} onClose={() => setMarkAsPaidDialogOpen(false)} title="Pilih Pembayaran Gaji">
                <div className="grid gap-3 pt-4 sm:grid-cols-2 sm:px-25">
                    <Button
                        variant="secondary"
                        onClick={() => {
                            if (selectedPayrollId) {
                                handlePaid(selectedPayrollId, 'paid_transfer');
                            }
                            setMarkAsPaidDialogOpen(false);
                        }}
                    >
                        Sudah Dibayar Transfer
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            if (selectedPayrollId) {
                                handlePaid(selectedPayrollId, 'paid_cash');
                            }
                            setMarkAsPaidDialogOpen(false);
                        }}
                    >
                        Sudah Dibayar Tunai
                    </Button>
                </div>
            </Modal>

            <DetailModal open={isDetailDialogOpen} onClose={() => setIsDetailDialogOpen(false)} payroll={selectedPayroll} />
        </AppLayout>
    );
}
