import { Button } from '@/components/ui/button';
import Modal from '@/components/ui/modal';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { EmployeeModalProps } from '@/types';
import { Check, Copy } from 'lucide-react';
import React from 'react';

export default function DetailModal({ open, onClose, employee }: EmployeeModalProps) {
    const [localCopiedField, setLocalCopiedField] = React.useState<string | null>(null);

    const handleCopy = (field: string, value: string) => {
        navigator.clipboard.writeText(value);
        setLocalCopiedField(field);
        setTimeout(() => setLocalCopiedField(null), 2000);
    };

    if (!employee) return null;

    return (
        <Modal open={open} onClose={onClose} title="Detail Data Karyawan">
            <div className="relative">
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell>Nama</TableCell>
                            <TableCell>:</TableCell>
                            <TableCell className="capitalize">{employee.name}</TableCell>
                            <TableCell className="h-13"></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Nomer HP</TableCell>
                            <TableCell>:</TableCell>
                            <TableCell>{employee.phone}</TableCell>
                            <TableCell>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleCopy('phone', employee.phone)} // Kirim field dan value
                                >
                                    {localCopiedField === 'phone' ? <Check /> : <Copy />}
                                </Button>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Alamat</TableCell>
                            <TableCell>:</TableCell>
                            <TableCell className="capitalize">{employee.address}</TableCell>
                            <TableCell className="h-13"></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Tanggal Bergabung</TableCell>
                            <TableCell>:</TableCell>
                            <TableCell>
                                {new Intl.DateTimeFormat('id-ID', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                }).format(new Date(employee.hire_date!))}
                            </TableCell>
                            <TableCell className="h-13"></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Nomor Rekening</TableCell>
                            <TableCell>:</TableCell>
                            <TableCell>
                                <div>{employee.account_number}</div>
                                <span className="text-sm tracking-wide text-neutral-500 dark:text-neutral-400">
                                    <span className="uppercase">{employee.bank_name}</span>
                                    <span> - </span>
                                    <span className="capitalize">{employee.account_name}</span>
                                </span>
                            </TableCell>
                            <TableCell>
                                <Button variant="outline" size="icon" onClick={() => handleCopy('account_number', employee.account_number)}>
                                    {localCopiedField === 'account_number' ? <Check /> : <Copy />}
                                </Button>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Gaji Pokok Harian</TableCell>
                            <TableCell>:</TableCell>
                            <TableCell>
                                {new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                    maximumFractionDigits: 0,
                                }).format(employee.basic_salary)}
                            </TableCell>
                            <TableCell className="h-13"></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Jatah Hari Libur (Bonus)</TableCell>
                            <TableCell>:</TableCell>
                            <TableCell>{employee.paid_holidays} hari</TableCell>
                            <TableCell className="h-13"></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Uang Lembur Harian</TableCell>
                            <TableCell>:</TableCell>
                            <TableCell>
                                {new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                    maximumFractionDigits: 0,
                                }).format(employee.daily_overtime_pay)}
                            </TableCell>
                            <TableCell className="h-13"></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Potongan BPJS Kesehatan</TableCell>
                            <TableCell>:</TableCell>
                            <TableCell>{employee.bpjs_health}%</TableCell>
                            <TableCell className="h-13"></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Potongan BPJS Ketenagakerjaan</TableCell>
                            <TableCell>:</TableCell>
                            <TableCell>{employee.bpjs_employment}%</TableCell>
                            <TableCell className="h-13"></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Potongan PPh</TableCell>
                            <TableCell>:</TableCell>
                            <TableCell>{employee.income_tax}%</TableCell>
                            <TableCell className="h-13"></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </Modal>
    );
}
