import Modal from '@/components/ui/modal';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { PayrollModalProps } from '@/types';
import { Badge } from '../ui/badge';

export default function DetailModal({ open, onClose, payroll }: PayrollModalProps) {
    if (!payroll) return null;

    return (
        <Modal open={open} onClose={onClose} title="Detail Data Gaji">
            <div className="relative">
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell>Nama Karyawan</TableCell>
                            <TableCell>:</TableCell>
                            <TableCell className="capitalize">{payroll.employee.name}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Bulan & Tahun</TableCell>
                            <TableCell>:</TableCell>
                            <TableCell>
                                {new Date(Number(payroll.period_year), Number(payroll.period_month) - 0).toLocaleString('id-ID', { month: 'long' })}, {payroll.period_year}
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
                                {payroll.total_attendance_days}
                                <span className="text-yellow-500"> + </span>
                                {payroll.paid_holidays}
                                <span className="text-red-500">)</span>
                                <span className="text-yellow-500"> × </span>
                                Rp {Number(payroll.basic_salary).toLocaleString('id-ID')}
                                <br />
                                <span className="text-blue-500">Rp {Number(payroll.total_basic_salary).toLocaleString('id-ID')}</span>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Total Gaji Lembur</TableCell>
                            <TableCell>:</TableCell>
                            <TableCell className="text-sm/7">
                                Total Lembur
                                <span className="text-yellow-500"> × </span>
                                Gaji Lembur Harian
                                <br />
                                {payroll.total_overtime_days}
                                <span className="text-yellow-500"> × </span>
                                Rp {Number(payroll.daily_overtime_pay).toLocaleString('id-ID')}
                                <br />
                                <span className="text-blue-500">Rp {Number(payroll.total_overtime_pay).toLocaleString('id-ID')}</span>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Total Gaji Kotor</TableCell>
                            <TableCell>:</TableCell>
                            <TableCell>
                                Total Gaji Pokok
                                <span className="text-yellow-500"> + </span>
                                Total Gaji Lembur
                                <br />
                                Rp {Number(payroll.total_basic_salary).toLocaleString('id-ID')}
                                <span className="text-yellow-500"> + </span>
                                Rp {Number(payroll.total_overtime_pay).toLocaleString('id-ID')}
                                <br />
                                <span className="text-blue-500">Rp {Number(payroll.gross_salary).toLocaleString('id-ID')}</span>
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
                                {payroll.bpjs_health_percent} %<span className="text-yellow-500"> + </span>
                                {payroll.bpjs_employment_percent} %<span className="text-yellow-500"> + </span>
                                {payroll.income_tax_percent} %
                                <br />
                                {payroll.total_deduction_percent} %
                                <br />
                                <span className="text-blue-500">Rp {Number(payroll.total_deductions).toLocaleString('id-ID')}</span>
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
                                Rp {Number(payroll.gross_salary).toLocaleString('id-ID')}
                                <span className="text-yellow-500"> - </span>
                                Rp {Number(payroll.total_deductions).toLocaleString('id-ID')}
                                <br />
                                <span className="text-blue-500">Rp {Number(payroll.net_salary).toLocaleString('id-ID')}</span>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Status</TableCell>
                            <TableCell>:</TableCell>
                            <TableCell>
                                {payroll.status === 'unpaid' ? (
                                    <Badge className="bg-amber-500/10 p-1.5 text-amber-500">Belum Dibayar</Badge>
                                ) : payroll.status === 'paid' ? (
                                    <Badge className="bg-emerald-500/10 p-1.5 text-emerald-500">Sudah Dibayar</Badge>
                                ) : (
                                    <Badge className="text-natural-500 bg-neutral-500/10 p-1.5">Belum Dihitung</Badge>
                                )}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </Modal>
    );
}
