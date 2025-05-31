// EditModal.tsx
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Modal from '@/components/ui/modal';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { EditModalProps } from '@/types';
import { addDays, format, startOfDay } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { formatRupiah, parseNumber, parseRupiah, useFormEmployee } from './FormUtils';

export default function EditModal({ open, onClose, employee, updateEmployee }: EditModalProps) {
    const { data, setData, patch, processing, errors, reset } = useFormEmployee();
    const [isAccountNameSame, setIsAccountNameSame] = useState(false);

    // Tambahkan useEffect untuk sinkronisasi nama
    useEffect(() => {
        if (isAccountNameSame) {
            setData('account_name', data.user.name);
        }
    }, [data.user.name, isAccountNameSame, setData]);

    useEffect(() => {
        if (employee) {
            setData({
                ...employee,
                user: {
                    ...employee.user,
                },
            });

            setIsAccountNameSame(employee.account_name === employee.user.name);
        }
    }, [employee, setData]);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(`/data-karyawan/${data.id}`, {
            onSuccess: () => {
                updateEmployee(data);
                onClose();
                reset();
                toast.success('Data karyawan berhasil disimpan', { action: { label: 'Tutup', onClick: () => {} } });
            },
        });
    };

    if (!open || !employee) return null;

    return (
        <Modal open={open} onClose={onClose} title="Edit Data Karyawan">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-2">
                    <Label>Nama</Label>
                    <Input
                        value={data.user.name}
                        onChange={(e) => setData('user', { ...data.user, name: e.target.value.replace(/[^a-zA-Z ,.'-]/g, '') })}
                        minLength={3}
                        maxLength={250}
                    />
                    <InputError message={errors['user.name']} />
                </div>

                <div className="grid items-start gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                        <Label>Tanggal Mulai Kerja</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className={cn('pl-3 text-left font-normal', !data.hire_date && 'text-muted-foreground')}>
                                    {data.hire_date ? format(data.hire_date as Date, 'PPP') : 'Pilih Tanggal'}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={data.hire_date as Date}
                                    onSelect={(date) => {
                                        if (date) setData('hire_date', date);
                                    }}
                                    disabled={(date) => date > startOfDay(addDays(new Date(), 2)) || date < new Date('2016-01-01')}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <InputError message={errors.hire_date} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Jatah Hari Libur</Label>
                        <div className="relative">
                            <Input maxLength={2} value={data.paid_holidays || 0} onChange={(e) => setData('paid_holidays', parseNumber(e.target.value))} />
                            <span className="absolute top-2 right-3">Hari</span>
                        </div>
                        <InputError message={errors.paid_holidays} />
                    </div>
                </div>

                <div className="grid items-start gap-4 sm:grid-cols-3">
                    <div className="grid gap-2">
                        <Label>Gaji Pokok Harian</Label>
                        <Input value={formatRupiah(data.basic_salary)} maxLength={11} onChange={(e) => setData('basic_salary', parseRupiah(e.target.value))} />
                        <InputError message={errors.basic_salary} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Uang Lembur Per Jam</Label>
                        <Input value={formatRupiah(data.hourly_overtime_pay)} maxLength={11} onChange={(e) => setData('hourly_overtime_pay', parseRupiah(e.target.value))} />
                        <InputError message={errors.hourly_overtime_pay} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Tunjangan Transportasi</Label>
                        <Input value={formatRupiah(data.transportation_allowance)} maxLength={11} onChange={(e) => setData('transportation_allowance', parseRupiah(e.target.value))} />
                        <InputError message={errors.transportation_allowance} />
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="grid gap-2">
                        <Label>BPJS Kesehatan</Label>
                        <div className="relative">
                            <Input maxLength={2} value={data.bpjs_health || 0} onChange={(e) => setData('bpjs_health', parseNumber(e.target.value))} />
                            <span className="absolute top-2 right-3">%</span>
                        </div>
                        <InputError message={errors.bpjs_health} />
                    </div>

                    <div className="grid gap-2">
                        <Label>BPJS Ketenagakerjaan</Label>
                        <div className="relative">
                            <Input maxLength={2} value={data.bpjs_employment || 0} onChange={(e) => setData('bpjs_employment', parseNumber(e.target.value))} />
                            <span className="absolute top-2 right-3">%</span>
                        </div>
                        <InputError message={errors.bpjs_employment} />
                    </div>

                    <div className="grid gap-2">
                        <Label>PPh</Label>
                        <div className="relative">
                            <Input maxLength={2} value={data.income_tax} onChange={(e) => setData('income_tax', parseNumber(e.target.value))} />
                            <span className="absolute top-2 right-3">%</span>
                        </div>
                        <InputError message={errors.income_tax} />
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Batal
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
