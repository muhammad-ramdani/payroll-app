import { Badge } from '@/components/ui/badge';
import Modal from '@/components/ui/modal';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { PayrollModalProps } from '@/types';

export default function DetailModal({ open, onClose, payroll }: PayrollModalProps) {
    if (!payroll) return null;

    return (
        <Modal open={open} onClose={onClose} title="Detail Data Gaji">
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell>Nama Karyawan</TableCell>
                        <TableCell>:</TableCell>
                        <TableCell>{payroll.user.name}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Bulan & Tahun</TableCell>
                        <TableCell>:</TableCell>
                        <TableCell>
                            {new Date(payroll.period_year, payroll.period_month - 1).toLocaleString('id-ID', { month: 'long' })}, {payroll.period_year}
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
                            {payroll.total_attendance_days} hari
                            <span className="text-yellow-500"> + </span>
                            {payroll.paid_holidays} hari
                            <span className="text-red-500">)</span>
                            <span className="text-yellow-500"> × </span>
                            Rp {payroll.basic_salary.toLocaleString('id-ID')}
                            <br />
                            <span className="text-blue-500">Rp {payroll.total_basic_salary.toLocaleString('id-ID')}</span>
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
                            {payroll.total_overtime_hours} jam
                            <span className="text-yellow-500"> × </span>
                            Rp {payroll.hourly_overtime_pay.toLocaleString('id-ID')}
                            <br />
                            <span className="text-blue-500">Rp {payroll.total_overtime_pay.toLocaleString('id-ID')}</span>
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
                            {payroll.total_punctual_days} hari
                            <span className="text-yellow-500"> × </span>
                            Rp {payroll.bonus_amount.toLocaleString('id-ID')}
                            <br />
                            <span className="text-blue-500">Rp {payroll.total_bonus.toLocaleString('id-ID')}</span>
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
                            {payroll.total_late_days} hari
                            <span className="text-yellow-500"> × </span>
                            Rp {payroll.penalty_amount.toLocaleString('id-ID')}
                            <br />
                            <span className="text-blue-500">Rp {payroll.total_penalty.toLocaleString('id-ID')}</span>
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
                            Rp {payroll.total_basic_salary.toLocaleString('id-ID')}
                            <span className="text-yellow-500"> + </span>
                            Rp {payroll.total_overtime_pay.toLocaleString('id-ID')}
                            <span className="text-yellow-500"> + </span>
                            Rp {payroll.transportation_allowance.toLocaleString('id-ID')}
                            <span className="text-yellow-500"> + </span>
                            Rp {payroll.total_bonus.toLocaleString('id-ID')}
                            <span className="text-yellow-500"> - </span>
                            Rp {payroll.total_penalty.toLocaleString('id-ID')}
                            <br />
                            <span className="text-blue-500">Rp {payroll.gross_salary.toLocaleString('id-ID')}</span>
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
                            <span className="text-blue-500">Rp {payroll.total_deductions.toLocaleString('id-ID')}</span>
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
                            Rp {payroll.gross_salary.toLocaleString('id-ID')}
                            <span className="text-yellow-500"> - </span>
                            Rp {payroll.total_deductions.toLocaleString('id-ID')}
                            <br />
                            <span className="text-blue-500">Rp {payroll.net_salary.toLocaleString('id-ID')}</span>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Status</TableCell>
                        <TableCell>:</TableCell>
                        <TableCell>
                            {payroll.salary_status === 'unpaid' ? (
                                <Badge className="bg-amber-500/10 p-1.5 text-amber-500">Belum Dibayar</Badge>
                            ) : payroll.salary_status === 'paid_cash' ? (
                                <Badge className="bg-emerald-500/10 p-1.5 text-emerald-500">Sudah Dibayar Tunai</Badge>
                            ) : payroll.salary_status === 'paid_transfer' ? (
                                <Badge className="bg-emerald-500/10 p-1.5 text-emerald-500">Sudah Dibayar Transfer</Badge>
                            ) : (
                                <Badge className="text-natural-500 bg-neutral-500/10 p-1.5">Belum Dihitung</Badge>
                            )}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Konfirmasi Gaji</TableCell>
                        <TableCell>:</TableCell>
                        <TableCell>
                            {payroll.confirmation_status === 'pending_confirmation' ? (
                                <Badge className="bg-amber-500/10 p-1.5 text-amber-500">Menunggu Konfirmasi</Badge>
                            ) : payroll.confirmation_status === 'received' ? (
                                <Badge className="bg-emerald-500/10 p-1.5 text-emerald-500">Gaji Sudah Diterima</Badge>
                            ) : (
                                <span>-</span>
                            )}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </Modal>
    );
}
