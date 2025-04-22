import { Button } from '@/components/ui/button';
import Modal from '@/components/ui/modal';
import { Table, TableBody, TableCell, TableRowNonBorder } from '@/components/ui/table';
import { Employee } from '@/types';
import { Check, Copy } from 'lucide-react';

interface DetailModalProps {
    open: boolean;
    onClose: (open: boolean) => void;
    selectedEmployee: Employee | null;
    handleCopy: (field: string, value: string) => void;
    copiedField: string | null;
}

export default function DetailModal({ open, onClose, selectedEmployee, handleCopy, copiedField }: DetailModalProps) {
    if (!selectedEmployee) return null;

    return (
        <Modal open={open} onClose={onClose} title="Detail Data Karyawan">
            <div className="relative">
                <Table>
                    <TableBody>
                        <TableRowNonBorder>
                            <TableCell>Nama</TableCell>
                            <TableCell>:</TableCell>
                            <TableCell>{selectedEmployee.name}</TableCell>
                            <TableCell className="h-13"></TableCell>
                        </TableRowNonBorder>
                        <TableRowNonBorder>
                            <TableCell>Nomer HP</TableCell>
                            <TableCell>:</TableCell>
                            <TableCell>{selectedEmployee.phone}</TableCell>
                            <TableCell>
                                <Button variant="outline" size="icon" onClick={() => handleCopy('phone', selectedEmployee.phone)}>
                                    {copiedField === 'phone' ? <Check /> : <Copy />}
                                </Button>
                            </TableCell>
                        </TableRowNonBorder>
                        <TableRowNonBorder>
                            <TableCell>Alamat</TableCell>
                            <TableCell>:</TableCell>
                            <TableCell>{selectedEmployee.address}</TableCell>
                            <TableCell className="h-13"></TableCell>
                        </TableRowNonBorder>
                        <TableRowNonBorder>
                            <TableCell>Tanggal Bergabung</TableCell>
                            <TableCell>:</TableCell>
                            <TableCell>
                                {new Intl.DateTimeFormat('id-ID', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                }).format(new Date(selectedEmployee.hire_date))}
                            </TableCell>
                            <TableCell className="h-13"></TableCell>
                        </TableRowNonBorder>
                        <TableRowNonBorder>
                            <TableCell>Nomor Rekening</TableCell>
                            <TableCell>:</TableCell>
                            <TableCell>
                                <div className="mb-2">{selectedEmployee.account_number}</div>
                                <span className="text-sm tracking-wide text-neutral-500 dark:text-neutral-400">
                                    {selectedEmployee.bank_name} - {selectedEmployee.account_name}
                                </span>
                            </TableCell>
                            <TableCell>
                                <Button variant="outline" size="icon" onClick={() => handleCopy('account_number', selectedEmployee.account_number)}>
                                    {copiedField === 'account_number' ? <Check /> : <Copy />}
                                </Button>
                            </TableCell>
                        </TableRowNonBorder>
                        <TableRowNonBorder>
                            <TableCell>Gaji Pokok Harian</TableCell>
                            <TableCell>:</TableCell>
                            <TableCell>
                                {new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                    maximumFractionDigits: 0,
                                }).format(selectedEmployee.basic_salary)}
                            </TableCell>
                            <TableCell className="h-13"></TableCell>
                        </TableRowNonBorder>
                        <TableRowNonBorder>
                            <TableCell>Jatah Hari Libur (Bonus)</TableCell>
                            <TableCell>:</TableCell>
                            <TableCell>{selectedEmployee.paid_holidays} hari</TableCell>
                            <TableCell className="h-13"></TableCell>
                        </TableRowNonBorder>
                        <TableRowNonBorder>
                            <TableCell>Uang Lembur Harian</TableCell>
                            <TableCell>:</TableCell>
                            <TableCell>
                                {new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                    maximumFractionDigits: 0,
                                }).format(selectedEmployee.daily_allowance)}
                            </TableCell>
                            <TableCell className="h-13"></TableCell>
                        </TableRowNonBorder>
                        <TableRowNonBorder>
                            <TableCell>Potongan BPJS Kesehatan</TableCell>
                            <TableCell>:</TableCell>
                            <TableCell>{selectedEmployee.bpjs_health}%</TableCell>
                            <TableCell className="h-13"></TableCell>
                        </TableRowNonBorder>
                        <TableRowNonBorder>
                            <TableCell>Potongan BPJS Ketenagakerjaan</TableCell>
                            <TableCell>:</TableCell>
                            <TableCell>{selectedEmployee.bpjs_employment}%</TableCell>
                            <TableCell className="h-13"></TableCell>
                        </TableRowNonBorder>
                        <TableRowNonBorder>
                            <TableCell>Potongan PPh</TableCell>
                            <TableCell>:</TableCell>
                            <TableCell>{selectedEmployee.income_tax}%</TableCell>
                            <TableCell className="h-13"></TableCell>
                        </TableRowNonBorder>
                    </TableBody>
                </Table>
            </div>
        </Modal>
    );
}
