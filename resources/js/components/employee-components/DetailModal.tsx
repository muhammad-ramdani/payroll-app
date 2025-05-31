import { Button } from '@/components/ui/button';
import Modal from '@/components/ui/modal';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { EmployeeModalProps } from '@/types';
import { Check, Copy } from 'lucide-react';
import React from 'react';

export default function DetailModal({ open, onClose, employee }: EmployeeModalProps) {
    const [copied, setCopied] = React.useState<string | null>(null);

    const handleCopy = (value: string) => {
        navigator.clipboard.writeText(value);
        setCopied(value);
        setTimeout(() => setCopied(null), 2000);
    };

    if (!employee) return null;

    return (
        <Modal open={open} onClose={onClose} title="Detail Data Karyawan">
            <div className="relative">
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell className="w-60">Nama</TableCell>
                            <TableCell className="w-7">:</TableCell>
                            <TableCell colSpan={2}>{employee.user.name}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Username</TableCell>
                            <TableCell>:</TableCell>
                            <TableCell>{employee.user.username}</TableCell>
                            <TableCell className="w-[1%]">
                                <Button variant="outline" size="icon" onClick={() => handleCopy(employee.user.username)}>
                                    {copied === employee.user.username ? <Check /> : <Copy />}
                                </Button>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Alamat</TableCell>
                            <TableCell>:</TableCell>
                            <TableCell colSpan={2}>{employee.address ? employee.address : '-'}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Nomer HP</TableCell>
                            <TableCell>:</TableCell>
                            <TableCell>{employee.phone ? employee.phone : '-'}</TableCell>
                            <TableCell>
                                <Button variant="outline" size="icon" onClick={() => handleCopy(employee.phone)} hidden={!employee.phone}>
                                    {copied === employee.phone ? <Check /> : <Copy />}
                                </Button>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Tanggal Bergabung</TableCell>
                            <TableCell>:</TableCell>
                            <TableCell colSpan={2}>
                                {new Intl.DateTimeFormat('id-ID', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                }).format(new Date(employee.hire_date!))}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Nomor Rekening</TableCell>
                            <TableCell>:</TableCell>
                            <TableCell>
                                {employee.account_number && employee.bank_name && employee.account_name ? (
                                    <>
                                        <div>{employee.account_number}</div>
                                        <div className="text-sm tracking-wide text-neutral-500 dark:text-neutral-400">
                                            {employee.bank_name} - {employee.account_name}
                                        </div>
                                    </>
                                ) : (
                                    '-'
                                )}
                            </TableCell>
                            <TableCell>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleCopy(employee.account_number)}
                                    hidden={!employee.account_number || !employee.bank_name || !employee.account_name}
                                >
                                    {copied === employee.account_number ? <Check /> : <Copy />}
                                </Button>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Gaji Pokok Harian</TableCell>
                            <TableCell>:</TableCell>
                            <TableCell colSpan={2}>
                                {new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                    maximumFractionDigits: 0,
                                }).format(employee.basic_salary)}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Jatah Hari Libur</TableCell>
                            <TableCell>:</TableCell>
                            <TableCell colSpan={2}>{employee.paid_holidays} hari</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Uang Lembur Per Jam</TableCell>
                            <TableCell>:</TableCell>
                            <TableCell>
                                {new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                    maximumFractionDigits: 0,
                                }).format(employee.hourly_overtime_pay)}
                            </TableCell>
                            <TableCell className="h-13"></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Tunjangan Transportasi</TableCell>
                            <TableCell>:</TableCell>
                            <TableCell>
                                {new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                    maximumFractionDigits: 0,
                                }).format(employee.transportation_allowance)}
                            </TableCell>
                            <TableCell className="h-13"></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Potongan BPJS Kesehatan</TableCell>
                            <TableCell>:</TableCell>
                            <TableCell colSpan={2}>{employee.bpjs_health}%</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Potongan BPJS Ketenagakerjaan</TableCell>
                            <TableCell>:</TableCell>
                            <TableCell colSpan={2}>{employee.bpjs_employment}%</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Potongan PPh</TableCell>
                            <TableCell>:</TableCell>
                            <TableCell colSpan={2}>{employee.income_tax}%</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </Modal>
    );
}
