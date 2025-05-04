// CreateModal.tsx
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Modal from '@/components/ui/modal';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CreateModalProps } from '@/types';
import { addDays, format, startOfDay } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { accountPattern, createKeyDownHandler, digitPattern, formatRupiah, letterPattern, phonePattern, useFormEmployee } from './FormUtils';

export default function CreateModal({ open, onClose, createEmployee }: CreateModalProps) {
    const { data, setData, post, errors, processing, reset } = useFormEmployee();
    const [usernameSuffix, setUsernameSuffix] = useState(0);
    const [isAccountNameSame, setIsAccountNameSame] = useState(false);

    useEffect(() => {
        if (isAccountNameSame) {
            setData('account_name', data.user.name);
        }
    }, [data.user.name, isAccountNameSame, setData]);

    const formatName = (rawName: string) => {
        return rawName
            .replace(/\s+/g, ' ')
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

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
                        minLength={3}
                        maxLength={250}
                        value={data.user.name}
                        onChange={(e) => {
                            const formattedName = formatName(e.target.value);
                            setData('user', { ...data.user, name: formattedName, username: generateUsername(formattedName) });
                        }}
                        onKeyDown={createKeyDownHandler(letterPattern)}
                    />
                    <InputError message={errors['user.name']} />
                </div>

                {/* Alamat */}
                <div className="grid gap-2">
                    <Label>Alamat</Label>
                    <Input
                        maxLength={250}
                        value={data.address}
                        onChange={(e) =>
                            setData(
                                'address',
                                e.target.value.replace(/\s+/g, ' ').replace(/(\b\w)(\w*)/g, (_, m1, m2) => m1.toUpperCase() + m2.toLowerCase()),
                            )
                        }
                    />
                    <InputError message={errors.address} />
                </div>

                <div className="grid items-start gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                        <Label>Nomor Handphone</Label>
                        <Input maxLength={25} value={data.phone} onChange={(e) => setData('phone', e.target.value)} onKeyDown={createKeyDownHandler(phonePattern)} />
                        <InputError message={errors.phone} />
                    </div>

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
                </div>

                {/* Bank & Rekening */}
                <div className="grid items-start gap-4 sm:grid-cols-3">
                    <div className="grid gap-2">
                        <Label>Nama Bank</Label>
                        <Input
                            minLength={3}
                            maxLength={50}
                            placeholder="Contoh: BCA"
                            value={data.bank_name}
                            onChange={(e) => setData('bank_name', e.target.value.replace(/\s+/g, ' ').toUpperCase())}
                            onKeyDown={createKeyDownHandler(/^[a-zA-Z ]$/)}
                        />
                        <InputError message={errors.bank_name} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Nomor Rekening</Label>
                        <Input
                            maxLength={100}
                            value={data.account_number}
                            onChange={(e) => setData('account_number', e.target.value)}
                            onKeyDown={createKeyDownHandler(accountPattern)}
                        />
                        <InputError message={errors.account_number} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Nama Pemilik Rekening</Label>
                        <Input
                            minLength={3}
                            maxLength={250}
                            value={data.account_name}
                            onChange={(e) => {
                                const formattedValue = e.target.value.replace(/\s+/g, ' ').replace(/(\b\w)(\w*)/g, (_, m1, m2) => m1.toUpperCase() + m2.toLowerCase());

                                setData('account_name', formattedValue);

                                if (formattedValue !== data.user.name) {
                                    setIsAccountNameSame(false);
                                }
                            }}
                            onKeyDown={createKeyDownHandler(letterPattern)}
                            disabled={isAccountNameSame} // Tambahkan disabled state
                        />
                        <InputError message={errors.account_name} />

                        <div className="mt-2 flex items-center space-x-2">
                            <Checkbox
                                id="same-as-name"
                                checked={isAccountNameSame}
                                onCheckedChange={(checked) => {
                                    setIsAccountNameSame(checked === true);
                                    if (checked) {
                                        setData('account_name', data.user.name);
                                    }
                                }}
                            />
                            <label htmlFor="same-as-name" className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Nama sama
                            </label>
                        </div>
                    </div>
                </div>

                <div className="grid items-start gap-4 sm:grid-cols-2">
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
                </div>

                <div className="grid gap-2">
                    <Label>
                        Jatah Hari Libur<span className="text-red-600">*</span>
                    </Label>
                    <Input maxLength={2} value={data.paid_holidays} onChange={(e) => setData('paid_holidays', e.target.value)} onKeyDown={createKeyDownHandler(digitPattern)} />
                    <InputError message={errors.paid_holidays} />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="grid gap-2">
                        <Label>
                            BPJS Kesehatan (%)<span className="text-red-600">*</span>
                        </Label>
                        <Input maxLength={2} value={data.bpjs_health} onChange={(e) => setData('bpjs_health', e.target.value)} onKeyDown={createKeyDownHandler(digitPattern)} />
                        <InputError message={errors.bpjs_health} />
                    </div>

                    <div className="grid gap-2">
                        <Label>
                            BPJS Ketenagakerjaan (%)<span className="text-red-600">*</span>
                        </Label>
                        <Input maxLength={2} value={data.bpjs_employment} onChange={(e) => setData('bpjs_employment', e.target.value)} onKeyDown={createKeyDownHandler(digitPattern)} />
                        <InputError message={errors.bpjs_employment} />
                    </div>

                    <div className="grid gap-2">
                        <Label>
                            PPh (%)<span className="text-red-600">*</span>
                        </Label>
                        <Input maxLength={2} value={data.income_tax} onChange={(e) => setData('income_tax', e.target.value)} onKeyDown={createKeyDownHandler(digitPattern)} />
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
