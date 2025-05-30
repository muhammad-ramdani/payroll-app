import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { PersonalDataProps } from '@/types';
import { Head, useForm } from '@inertiajs/react';

export default function PersonalData({ employee }: PersonalDataProps) {
    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        phone: employee.phone || '',
        address: employee.address || '',
        bank_name: employee.bank_name || '',
        account_number: employee.account_number || '',
        account_name: employee.account_name || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('data-diri.update'));
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Pengaturan data diri', href: '/' }]}>
            <Head title="Pengaturan data diri" />
            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Data diri" description="Ubah nomor handphone, alamat, dan rekening bank kamu" />

                    <form onSubmit={submit} className="space-y-6">
                        {/* Phone Input */}
                        <div className="grid gap-3">
                            <Label>Nomor Handphone</Label>
                            <Input value={data.phone} onChange={(e) => setData('phone', e.target.value.replace(/[^0-9 +-]/g, ''))} maxLength={25} />
                            <InputError message={errors.phone} />
                        </div>

                        {/* Address Input */}
                        <div className="grid gap-3">
                            <Label>Alamat</Label>
                            <Textarea value={data.address} onChange={(e) => setData('address', e.target.value)} maxLength={255} />
                            <InputError message={errors.address} />
                        </div>

                        <div className="grid gap-6 sm:grid-cols-3">
                            {/* Bank Name Input */}
                            <div className="grid gap-3">
                                <Label>Nama Bank</Label>
                                <Input value={data.bank_name} onChange={(e) => setData('bank_name', e.target.value.toUpperCase().replace(/[^A-Z ]/g, ''))} maxLength={50} />
                                <InputError message={errors.bank_name} />
                            </div>

                            {/* Account Number Input */}
                            <div className="grid gap-3 sm:col-span-2">
                                <Label>Nomor Rekening</Label>
                                <Input value={data.account_number} onChange={(e) => setData('account_number', e.target.value.replace(/[^0-9 -]/g, ''))} maxLength={100} />
                                <InputError message={errors.account_number} />
                            </div>
                        </div>

                        {/* Account Name Input */}
                        <div className="grid gap-3">
                            <Label>Nama Pemilik Rekening</Label>
                            <Input value={data.account_name} onChange={(e) => setData('account_name', e.target.value.replace(/[^a-zA-Z .'-]/g, ''))} maxLength={255} />
                            <InputError message={errors.account_name} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>{processing ? 'Menyimpan...' : 'Simpan'}</Button>
                            {recentlySuccessful && <p className="text-sm text-gray-600">Berhasil disimpan</p>}
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
