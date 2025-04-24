import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { EditModalProps, Employee } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDays, format, startOfDay } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../ui/modal';
import {
    accountPattern,
    createKeyDownHandler,
    digitPattern,
    formatRupiah,
    formSchema,
    FormValues,
    letterPattern,
    phonePattern,
} from './employeeFormHelpers';

export default function EditModal({ open, onClose, employee, onUpdate }: EditModalProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            phone: '',
            address: '',
            hire_date: new Date(),
            bank_name: '',
            account_number: '',
            account_name: '',
            basic_salary: 0,
            paid_holidays: '',
            daily_overtime_pay: 0,
            bpjs_health: '',
            bpjs_employment: '',
            income_tax: '',
        },
    });

    // Populate form when employee changes
    useEffect(() => {
        if (employee) {
            form.reset({
                name: employee.name,
                phone: employee.phone || '',
                address: employee.address || '',
                hire_date: employee.hire_date ? new Date(employee.hire_date) : new Date(),
                bank_name: employee.bank_name || '',
                account_number: employee.account_number || '',
                account_name: employee.account_name || '',
                basic_salary: employee.basic_salary,
                paid_holidays: String(employee.paid_holidays),
                daily_overtime_pay: employee.daily_overtime_pay,
                bpjs_health: String(employee.bpjs_health),
                bpjs_employment: String(employee.bpjs_employment),
                income_tax: String(employee.income_tax),
            });
        }
    }, [employee, form]);

    const onSubmit = async (data: FormValues) => {
        if (!employee) return;
        try {
            const payload = { ...data, hire_date: data.hire_date };
            const res = await fetch(`/data-karyawan/${employee.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                const updated = await res.json();
                onUpdate(updated as Employee);
                form.reset();
                onClose();
            } else {
                alert('Gagal memperbarui data.');
            }
        } catch {
            alert('Terjadi kesalahan saat mengirim data.');
        }
    };

    if (!open || !employee) return null;

    return (
        <Modal open={open} onClose={onClose} title="Edit Data Karyawan">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* Nama */}
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Nama<span className="text-red-600">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        className="capitalize"
                                        placeholder="Nama"
                                        maxLength={250}
                                        {...field}
                                        onKeyDown={createKeyDownHandler(letterPattern)}
                                        value={field.value ?? ''}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Nomor Handphone */}
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nomor Handphone</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="0812-3456-7890"
                                        maxLength={25}
                                        {...field}
                                        onKeyDown={createKeyDownHandler(phonePattern)}
                                        value={field.value ?? ''}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Alamat */}
                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Alamat</FormLabel>
                                <FormControl>
                                    <Input
                                        className="capitalize"
                                        placeholder="Maksimal 250 Karakter"
                                        maxLength={250}
                                        {...field}
                                        value={field.value ?? ''}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Tanggal Mulai Kerja */}
                    <FormField
                        control={form.control}
                        name="hire_date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>
                                    Tanggal Mulai Kerja<span className="text-red-600">*</span>
                                </FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                className={cn('pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                                            >
                                                {field.value ? format(field.value, 'PPP') : 'Pilih Tanggal'}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => date > startOfDay(addDays(new Date(), 2)) || date < new Date('2016-01-01')}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Bank & Account */}
                    <div className="grid gap-4 sm:grid-cols-3">
                        <FormField
                            control={form.control}
                            name="bank_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Bank</FormLabel>
                                    <FormControl>
                                        <Input
                                            className="uppercase"
                                            placeholder="BANK INDONESIA"
                                            maxLength={50}
                                            {...field}
                                            onKeyDown={createKeyDownHandler(/^[a-zA-Z ]$/)}
                                            value={field.value ?? ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="sm:col-span-2">
                            <FormField
                                control={form.control}
                                name="account_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nomor Rekening</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="XXXX-XXXX-XXXX-XXXX"
                                                maxLength={100}
                                                {...field}
                                                onKeyDown={createKeyDownHandler(accountPattern)}
                                                value={field.value ?? ''}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Nama Pemilik Rekening */}
                    <FormField
                        control={form.control}
                        name="account_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nama Pemilik Rekening</FormLabel>
                                <FormControl>
                                    <Input
                                        className="capitalize"
                                        placeholder="Nama"
                                        maxLength={250}
                                        {...field}
                                        onKeyDown={createKeyDownHandler(letterPattern)}
                                        value={field.value ?? ''}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Gaji Pokok Harian */}
                    <FormField
                        control={form.control}
                        name="basic_salary"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Gaji Pokok Harian (Rp)<span className="text-red-600">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        value={formatRupiah(field.value)}
                                        maxLength={8}
                                        onChange={(e) => {
                                            const numericValue = parseInt(e.target.value.replace(/\D/g, '')) || 0;
                                            field.onChange(numericValue);
                                        }}
                                        onKeyDown={createKeyDownHandler(digitPattern)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Jatah Hari Libur */}
                    <FormField
                        control={form.control}
                        name="paid_holidays"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Jatah Hari Libur<span className="text-red-600">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="0"
                                        maxLength={2}
                                        {...field}
                                        onKeyDown={createKeyDownHandler(digitPattern)}
                                        value={field.value ?? ''}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Uang Lembur Harian */}
                    <FormField
                        control={form.control}
                        name="daily_overtime_pay"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Uang Lembur Harian (Rp)<span className="text-red-600">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        value={formatRupiah(field.value)}
                                        maxLength={8}
                                        onChange={(e) => {
                                            const numericValue = parseInt(e.target.value.replace(/\D/g, '')) || 0;
                                            field.onChange(numericValue);
                                        }}
                                        onKeyDown={createKeyDownHandler(digitPattern)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Potongan BPJS Kesehatan */}
                    <FormField
                        control={form.control}
                        name="bpjs_health"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Potongan BPJS Kesehatan (%)<span className="text-red-600">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="0"
                                        maxLength={2}
                                        {...field}
                                        onKeyDown={createKeyDownHandler(digitPattern)}
                                        value={field.value ?? ''}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Potongan BPJS Ketenagakerjaan */}
                    <FormField
                        control={form.control}
                        name="bpjs_employment"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Potongan BPJS Ketenagakerjaan (%)<span className="text-red-600">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="0"
                                        maxLength={2}
                                        {...field}
                                        onKeyDown={createKeyDownHandler(digitPattern)}
                                        value={field.value ?? ''}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Potongan PPh */}
                    <FormField
                        control={form.control}
                        name="income_tax"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Potongan PPh (%)<span className="text-red-600">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="0"
                                        maxLength={2}
                                        {...field}
                                        onKeyDown={createKeyDownHandler(digitPattern)}
                                        value={field.value ?? ''}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Batal
                        </Button>
                        <Button type="submit">Simpan</Button>
                    </div>
                </form>
            </Form>
        </Modal>
    );
}
