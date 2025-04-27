import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CreateModalProps } from '@/types';
import { addDays, format, startOfDay } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { FormEventHandler } from 'react';
import Modal from '../ui/modal';
import { accountPattern, createKeyDownHandler, digitPattern, formatRupiah, letterPattern, phonePattern, useFormEmployee } from './employeeFormUtils';

export default function CreateModal({ open, onClose, createEmployee }: CreateModalProps) {
    const { data, setData, post, errors, processing } = useFormEmployee();

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        post('/data-karyawan', {
            preserveScroll: true,
            onSuccess: () => {
                createEmployee(data);
                onClose();
            },
        });
    };

    if (!open) return null;

    return (
        <Modal open={open} onClose={onClose} title="Tambah Data Karyawan">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nama */}
                <div className="grid gap-2">
                    <Label>
                        Nama<span className="text-red-600">*</span>
                    </Label>
                    <Input
                        className="capitalize"
                        placeholder="Nama"
                        minLength={3}
                        maxLength={250}
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        onKeyDown={createKeyDownHandler(letterPattern)}
                    />
                    <InputError message={errors.name} />
                </div>

                {/* Nomor Handphone */}
                <div className="grid gap-2">
                    <Label>
                        Nomor Handphone<span className="text-red-600">*</span>
                    </Label>
                    <Input
                        placeholder="Contoh: 0812-3456-7890"
                        maxLength={25}
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        onKeyDown={createKeyDownHandler(phonePattern)}
                    />
                    <InputError message={errors.phone} />
                </div>

                {/* Alamat */}
                <div className="grid gap-2">
                    <Label>Alamat</Label>
                    <Input className="capitalize" placeholder="Maksimal 250 Karakter" maxLength={250} value={data.address} onChange={(e) => setData('address', e.target.value)} />
                    <InputError message={errors.address} />
                </div>

                {/* Tanggal Mulai Kerja */}
                <div className="grid gap-2">
                    <Label>
                        Tanggal Mulai Kerja<span className="text-red-600">*</span>
                    </Label>
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

                {/* Bank & Rekening */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="grid gap-2">
                        <Label>Nama Bank</Label>
                        <Input
                            className="uppercase"
                            minLength={2}
                            maxLength={50}
                            placeholder="Contoh: BCA"
                            value={data.bank_name}
                            onChange={(e) => setData('bank_name', e.target.value)}
                            onKeyDown={createKeyDownHandler(/^[a-zA-Z ]$/)}
                        />
                        <InputError message={errors.bank_name} />
                    </div>

                    <div className="grid gap-2 sm:col-span-2">
                        <Label>Nomor Rekening</Label>
                        <Input
                            placeholder="Contoh: 1234-5678-9012"
                            maxLength={100}
                            value={data.account_number}
                            onChange={(e) => setData('account_number', e.target.value)}
                            onKeyDown={createKeyDownHandler(accountPattern)}
                        />
                        <InputError message={errors.account_number} />
                    </div>
                </div>

                {/* Nama Pemilik Rekening */}
                <div className="grid gap-2">
                    <Label>Nama Pemilik Rekening</Label>
                    <Input
                        className="capitalize"
                        placeholder="Nama"
                        minLength={3}
                        maxLength={250}
                        value={data.account_name}
                        onChange={(e) => setData('account_name', e.target.value)}
                        onKeyDown={createKeyDownHandler(letterPattern)}
                    />
                    <InputError message={errors.account_name} />
                </div>

                {/* Gaji Pokok Harian */}
                <div className="grid gap-2">
                    <Label>
                        Gaji Pokok Harian (Rp)<span className="text-red-600">*</span>
                    </Label>
                    <Input
                        value={formatRupiah(data.basic_salary)}
                        maxLength={8}
                        onChange={(e) => {
                            const numericValue = parseInt(e.target.value.replace(/\D/g, '')) || 0;
                            setData('basic_salary', numericValue);
                        }}
                        onKeyDown={createKeyDownHandler(digitPattern)}
                    />
                    <InputError message={errors.basic_salary} />
                </div>

                {/* Jatah Hari Libur */}
                <div className="grid gap-2">
                    <Label>
                        Jatah Hari Libur<span className="text-red-600">*</span>
                    </Label>
                    <Input
                        placeholder="0"
                        maxLength={2}
                        value={data.paid_holidays}
                        onChange={(e) => setData('paid_holidays', e.target.value)}
                        onKeyDown={createKeyDownHandler(digitPattern)}
                    />
                    <InputError message={errors.paid_holidays} />
                </div>

                {/* Uang Lembur Harian */}
                <div className="grid gap-2">
                    <Label>
                        Uang Lembur Harian (Rp)<span className="text-red-600">*</span>
                    </Label>
                    <Input
                        value={formatRupiah(data.daily_overtime_pay)}
                        maxLength={8}
                        onChange={(e) => {
                            const numericValue = parseInt(e.target.value.replace(/\D/g, '')) || 0;
                            setData('daily_overtime_pay', numericValue);
                        }}
                        onKeyDown={createKeyDownHandler(digitPattern)}
                    />
                    <InputError message={errors.daily_overtime_pay} />
                </div>

                {/* BPJS dan PPh */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="grid gap-2">
                        <Label>
                            BPJS Kesehatan (%)<span className="text-red-600">*</span>
                        </Label>
                        <Input
                            placeholder="0"
                            maxLength={2}
                            value={data.bpjs_health}
                            onChange={(e) => setData('bpjs_health', e.target.value)}
                            onKeyDown={createKeyDownHandler(digitPattern)}
                        />
                        <InputError message={errors.bpjs_health} />
                    </div>

                    <div className="grid gap-2">
                        <Label>
                            BPJS Ketenagakerjaan (%)<span className="text-red-600">*</span>
                        </Label>
                        <Input
                            placeholder="0"
                            maxLength={2}
                            value={data.bpjs_employment}
                            onChange={(e) => setData('bpjs_employment', e.target.value)}
                            onKeyDown={createKeyDownHandler(digitPattern)}
                        />
                        <InputError message={errors.bpjs_employment} />
                    </div>

                    <div className="grid gap-2">
                        <Label>
                            PPh (%)<span className="text-red-600">*</span>
                        </Label>
                        <Input
                            placeholder="0"
                            maxLength={2}
                            value={data.income_tax}
                            onChange={(e) => setData('income_tax', e.target.value)}
                            onKeyDown={createKeyDownHandler(digitPattern)}
                        />
                        <InputError message={errors.income_tax} />
                    </div>
                </div>

                {/* Actions */}
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
