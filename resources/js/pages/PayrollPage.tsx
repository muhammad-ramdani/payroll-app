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
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

const salaryStatus = {
    uncalculated: ['Belum Dihitung', 'bg-neutral-500/10 text-natural-500'],
    unpaid: ['Belum Dibayar', 'bg-amber-500/10 text-amber-500'],
    paid_transfer: ['Sudah Dibayar Transfer', 'bg-emerald-500/10 text-emerald-500'],
    paid_cash: ['Sudah Dibayar Tunai', 'bg-emerald-500/10 text-emerald-500'],
};

const confirmationStatus = {
    blank: ['-', 'bg-transparent dark:text-white text-black'],
    pending_confirmation: ['Menunggu Konfirmasi', 'bg-amber-500/10 text-amber-500'],
    received: ['Gaji Sudah Diterima', 'bg-emerald-500/10 text-emerald-500'],
};

export default function PayrollPage({ payrolls }: { payrolls: Payroll[] }) {
    const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const uniqueYears = [...new Set(payrolls.map((p) => p.period_year))].sort((a, b) => b - a);
    const [selectedYear, setSelectedYear] = useState(Math.max(...uniqueYears));

    const filteredData = useMemo(() => payrolls.filter((p) => p.period_year === selectedYear), [payrolls, selectedYear]);

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
                header: 'Status Gaji',
                cell: ({ row }) => {
                    const [label, style] = salaryStatus[row.original.salary_status];
                    return <Badge className={style}>{label}</Badge>;
                },
            },
            {
                header: 'Konfirmasi Terima Gaji',
                cell: ({ row }) => {
                    const [label, style] = confirmationStatus[row.original.confirmation_status];
                    return <Badge className={style}>{label}</Badge>;
                },
            },
            {
                header: 'Aksi',
                cell: ({ row }) => {
                    const { confirmation_status, id } = row.original;
                    const showActions = confirmation_status !== 'blank';

                    return (
                        showActions && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => showDetails(row.original)}>Lihat Detail Gaji</DropdownMenuItem>
                                    {confirmation_status === 'pending_confirmation' && <DropdownMenuItem onClick={() => confirmSalary(id)}>Sudah Terima Gaji</DropdownMenuItem>}
                                    <DropdownMenuItem onClick={() => window.open(`/penggajian/pdf/${id}`, '_blank')} hidden={row.original.confirmation_status !== 'received'}>
                                        Cetak Slip Gaji
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )
                    );
                },
            },
        ],
        [],
    );

    const showDetails = (payroll: Payroll) => {
        setSelectedPayroll(payroll);
        setIsDetailOpen(true);
    };

    const confirmSalary = (id: number) =>
        router.patch(
            `/penggajian/confirmation/${id}`,
            { confirmation_status: 'received' },
            { onSuccess: () => toast.success('Berhasil konfirmasi sudah terima gaji', { action: { label: 'Tutup', onClick: () => {} } }) },
        );

    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <AppLayout breadcrumbs={[{ title: 'Penggajian', href: '/' }]}>
            <Head title="Penggajian" />
            <div className="space-y-4 px-4 pt-4">
                {uniqueYears.length > 0 && (
                    <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(Number(v))}>
                        <SelectTrigger className="w-[180px]">
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
                )}

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
                            {table.getRowModel().rows.length > 0 ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={100} className="text-muted-foreground h-24 text-center">
                                        Data penggajian belum tersedia
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className="text-muted-foreground mx-4 mt-8 mb-4 space-y-2">
                <p className="text-sm font-semibold">Catatan:</p>
                <ul className="ml-5 list-disc space-y-1 text-sm">
                    <li>Anda baru bisa melihat detail gaji jika statusnya sudah 'Sudah Dibayar'.</li>
                    <li>Anda baru bisa mencetak slip gaji setelah mengonfirmasi 'Saya Sudah Terima Gaji'.</li>
                </ul>
            </div>

            <Modal open={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Detail Data Gaji">
                {selectedPayroll && (
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell>Bulan & Tahun</TableCell>
                                <TableCell>:</TableCell>
                                <TableCell>
                                    {new Date(selectedPayroll.period_year, selectedPayroll.period_month - 1).toLocaleString('id-ID', { month: 'long' })}, {selectedPayroll.period_year}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Total Gaji Pokok</TableCell>
                                <TableCell>:</TableCell>
                                <TableCell className="text-sm/7">
                                    <span className="text-red-500">(</span>
                                    Total Kehadiran
                                    <span className="text-yellow-500"> + </span>
                                    Jatah Libur
                                    <span className="text-red-500">)</span>
                                    <span className="text-yellow-500"> × </span>
                                    Gaji Pokok Harian
                                    <br />
                                    <span className="text-red-500">(</span>
                                    {selectedPayroll.total_attendance_days} hari
                                    <span className="text-yellow-500"> + </span>
                                    {selectedPayroll.paid_holidays} hari
                                    <span className="text-red-500">)</span>
                                    <span className="text-yellow-500"> × </span>
                                    Rp {selectedPayroll.basic_salary.toLocaleString('id-ID')}
                                    <br />
                                    <span className="text-blue-500">Rp {selectedPayroll.total_basic_salary.toLocaleString('id-ID')}</span>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Total Gaji Lembur</TableCell>
                                <TableCell>:</TableCell>
                                <TableCell className="text-sm/7">
                                    Total Jam Lembur
                                    <span className="text-yellow-500"> × </span>
                                    Uang Lembur Per Jam
                                    <br />
                                    {selectedPayroll.total_overtime_hours} jam
                                    <span className="text-yellow-500"> × </span>
                                    Rp {selectedPayroll.hourly_overtime_pay.toLocaleString('id-ID')}
                                    <br />
                                    <span className="text-blue-500">Rp {selectedPayroll.total_overtime_pay.toLocaleString('id-ID')}</span>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Total Bonus Tepat Waktu</TableCell>
                                <TableCell>:</TableCell>
                                <TableCell className="text-sm/7">
                                    Total Tepat Waktu
                                    <span className="text-yellow-500"> × </span>
                                    Bonus Tepat Waktu Harian
                                    <br />
                                    {selectedPayroll.total_punctual_days} hari
                                    <span className="text-yellow-500"> × </span>
                                    Rp {selectedPayroll.bonus_amount.toLocaleString('id-ID')}
                                    <br />
                                    <span className="text-blue-500">Rp {selectedPayroll.total_bonus.toLocaleString('id-ID')}</span>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Total Potongan Telat</TableCell>
                                <TableCell>:</TableCell>
                                <TableCell className="text-sm/7">
                                    Total Telat
                                    <span className="text-yellow-500"> × </span>
                                    Potongan Telat Harian
                                    <br />
                                    {selectedPayroll.total_late_days} hari
                                    <span className="text-yellow-500"> × </span>
                                    Rp {selectedPayroll.penalty_amount.toLocaleString('id-ID')}
                                    <br />
                                    <span className="text-blue-500">Rp {selectedPayroll.total_penalty.toLocaleString('id-ID')}</span>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Total Gaji Kotor</TableCell>
                                <TableCell>:</TableCell>
                                <TableCell>
                                    Total Gaji Pokok
                                    <span className="text-yellow-500"> + </span>
                                    Total Gaji Lembur
                                    <span className="text-yellow-500"> + </span>
                                    Tunjangan Transportasi
                                    <span className="text-yellow-500"> + </span>
                                    Total Bonus Tepat Waktu
                                    <span className="text-yellow-500"> - </span>
                                    Total Potongan Telat
                                    <br />
                                    Rp {selectedPayroll.total_basic_salary.toLocaleString('id-ID')}
                                    <span className="text-yellow-500"> + </span>
                                    Rp {selectedPayroll.total_overtime_pay.toLocaleString('id-ID')}
                                    <span className="text-yellow-500"> + </span>
                                    Rp {selectedPayroll.transportation_allowance.toLocaleString('id-ID')}
                                    <span className="text-yellow-500"> + </span>
                                    Rp {selectedPayroll.total_bonus.toLocaleString('id-ID')}
                                    <span className="text-yellow-500"> - </span>
                                    Rp {selectedPayroll.total_penalty.toLocaleString('id-ID')}
                                    <br />
                                    <span className="text-blue-500">Rp {selectedPayroll.gross_salary.toLocaleString('id-ID')}</span>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Total Potongan</TableCell>
                                <TableCell>:</TableCell>
                                <TableCell className="text-sm/7">
                                    BPJS Kesehatan
                                    <span className="text-yellow-500"> + </span>
                                    BPJS Ketenagakerjaan
                                    <span className="text-yellow-500"> + </span>
                                    Pajak Penghasilan
                                    <br />
                                    {selectedPayroll.bpjs_health_percent} %<span className="text-yellow-500"> + </span>
                                    {selectedPayroll.bpjs_employment_percent} %<span className="text-yellow-500"> + </span>
                                    {selectedPayroll.income_tax_percent} %
                                    <br />
                                    {selectedPayroll.total_deduction_percent} %
                                    <br />
                                    <span className="text-blue-500">Rp {selectedPayroll.total_deductions.toLocaleString('id-ID')}</span>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Total Gaji Bersih</TableCell>
                                <TableCell>:</TableCell>
                                <TableCell>
                                    Total Gaji Kotor
                                    <span className="text-yellow-500"> - </span>
                                    Total Potongan Dalam Bentuk Rupiah
                                    <br />
                                    Rp {selectedPayroll.gross_salary.toLocaleString('id-ID')}
                                    <span className="text-yellow-500"> - </span>
                                    Rp {selectedPayroll.total_deductions.toLocaleString('id-ID')}
                                    <br />
                                    <span className="text-blue-500">Rp {selectedPayroll.net_salary.toLocaleString('id-ID')}</span>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Status</TableCell>
                                <TableCell>:</TableCell>
                                <TableCell>
                                    <Badge className={salaryStatus[selectedPayroll.salary_status][1]}>{salaryStatus[selectedPayroll.salary_status][0]}</Badge>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Konfirmasi Gaji</TableCell>
                                <TableCell>:</TableCell>
                                <TableCell>
                                    <Badge className={confirmationStatus[selectedPayroll.confirmation_status][1]}>{confirmationStatus[selectedPayroll.confirmation_status][0]}</Badge>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                )}
            </Modal>
        </AppLayout>
    );
}
