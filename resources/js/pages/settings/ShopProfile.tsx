import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { ShopProfileProps } from '@/types';
import { Head, useForm } from '@inertiajs/react';

export default function ShopProfile({ shopProfile }: ShopProfileProps) {
    const { data, setData, patch, processing, recentlySuccessful, errors } = useForm({
        shop_name: shopProfile.shop_name,
        address: shopProfile.address,
        phone: shopProfile.phone,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        patch(route('toko.update'));
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Toko settings', href: '/' }]}>
            <Head title="Toko settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Toko settings" description="Ubah nama toko, alamat toko, dan nomor handphone toko kamu" />

                    <form onSubmit={submit} className="space-y-6">
                        {/* Nama Toko */}
                        <div className="grid gap-3">
                            <Label>Nama Toko</Label>
                            <Input value={data.shop_name} onChange={(e) => setData('shop_name', e.currentTarget.value)} maxLength={255} required />
                            <InputError message={errors.shop_name} />
                        </div>

                        {/* Alamat */}
                        <div className="grid gap-3">
                            <Label>Alamat</Label>
                            <Textarea value={data.address} onChange={(e) => setData('address', e.currentTarget.value)} maxLength={255} required />
                            <InputError message={errors.address} />
                        </div>

                        {/* Nomor HP */}
                        <div className="grid gap-3">
                            <Label>Nomor Handphone</Label>
                            <Input value={data.phone} onChange={(e) => setData('phone', e.currentTarget.value.replace(/[^0-9 +-]/g, ''))} maxLength={25} required />
                            <InputError message={errors.phone} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>{processing ? 'Menyimpan...' : 'Simpan'}</Button>
                            {recentlySuccessful && <p className="text-muted-foreground text-sm">Berhasil disimpan</p>}
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
