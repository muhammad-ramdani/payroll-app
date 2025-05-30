// CreateModal.tsx
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Modal from '@/components/ui/modal';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CreateModalProps } from '@/types';
import { addDays, format, startOfDay } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { formatRupiah, parseNumber, parseRupiah, useFormEmployee } from './FormUtils';

export default function CreateModal({ open, onClose, createEmployee }: CreateModalProps) {
    const { data, setData, post, errors, processing, reset } = useFormEmployee();
    const [usernameSuffix, setUsernameSuffix] = useState(0);
    const [isAccountNameSame, setIsAccountNameSame] = useState(false);

    useEffect(() => {
        if (isAccountNameSame) {
            setData('account_name', data.user.name);
        }
    }, [data.user.name, isAccountNameSame, setData]);

    const generateUsername = (formattedName: string) => {
        return `${formattedName.replace(/\s+/g, '').toLowerCase()}${usernameSuffix}`;
    };

    useEffect(() => {
        if (open) {
            // generate new suffix whenever form dibuka
            setUsernameSuffix(Math.floor(1000 + Math.random() * 9000));
            setData((prev) => ({ ...prev, id: uuidv4() }));
        }
    }, [open, setData]);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/data-karyawan', {
            onSuccess: () => {
                createEmployee(data);
                onClose();
                reset();
                setIsAccountNameSame(false);
                toast.success('Data karyawan berhasil disimpan', { action: { label: 'Tutup', onClick: () => {} } });
            },
        });
    };

    if (!open) return null;

    return (
        <Modal open={open} onClose={onClose} title="Tambah Data Karyawan">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-2">
                    <Label>Nama</Label>
                    <Input
                        maxLength={250}
                        value={data.user.name}
                        onChange={(e) => {
                            const formattedName = e.target.value.replace(/[^a-zA-Z ,.'-]/g, '');
                            setData('user', { ...data.user, name: formattedName, username: generateUsername(formattedName) });
                        }}
                    />
                    <InputError message={errors['user.name']} />
                </div>

                <div className="grid items-start gap-4 sm:grid-cols-3">
                    <div className="grid gap-2">
                        <Label>Shift Kerja</Label>
                        <Select value={data.shift_type} onValueChange={(value) => setData('shift_type', value as 'Pagi' | 'Siang')}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih shift" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Pagi">Shift Pagi</SelectItem>
                                <SelectItem value="Siang">Shift Siang</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.shift_type} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Tanggal Mulai Kerja</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className={cn('pl-3 text-left font-normal', !data.hire_date && 'text-muted-foreground')}>
                                    {data.hire_date ? format(data.hire_date, 'PPP') : 'Pilih Tanggal'}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={data.hire_date ?? undefined}
                                    onSelect={(date) => date && setData('hire_date', date)}
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
                        <Label>Uang Lembur Harian</Label>
                        <Input value={formatRupiah(data.daily_overtime_pay)} maxLength={11} onChange={(e) => setData('daily_overtime_pay', parseRupiah(e.target.value))} />
                        <InputError message={errors.daily_overtime_pay} />
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
