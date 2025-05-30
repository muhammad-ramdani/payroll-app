import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            onSuccess: () => (reset(), toast.success('Password berhasil diubah', { action: { label: 'Tutup', onClick: () => {} } })),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Pengaturan password', href: '/settings/password' }]}>
            <Head title="Pengaturan password" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Ganti password" description="Pastikan akunmu pake password yang panjang sama acak biar aman" />

                    <form onSubmit={updatePassword} className="space-y-6">
                        <div className="grid gap-3">
                            <Label>Password saat ini</Label>
                            <Input ref={currentPasswordInput} value={data.current_password} onChange={(e) => setData('current_password', e.target.value)} type="password" required />
                            <InputError message={errors.current_password} />
                        </div>

                        <div className="grid gap-3">
                            <Label>Password baru</Label>
                            <Input ref={passwordInput} value={data.password} onChange={(e) => setData('password', e.target.value)} type="password" required />
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-3">
                            <Label>Konfirmasi password baru</Label>
                            <Input value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} type="password" required />
                            <InputError message={errors.password_confirmation} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>{processing ? 'Menyimpan...' : 'Simpan password'}</Button>
                            {recentlySuccessful && <p className="text-sm text-gray-600">Berhasil disimpan</p>}
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
