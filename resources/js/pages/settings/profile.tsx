import { type SharedData } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

export default function Profile({ auth }: SharedData) {
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: auth.user.name,
        username: auth.user.username,
        role: auth.user.role,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Profile settings', href: '/settings/profile' }]}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Info Profile" description="Ubah nama sama username kamu" />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-3">
                            <Label>Nama</Label>
                            <Input value={data.name} onChange={(e) => setData('name', e.target.value.replace(/[^a-zA-Z .'-]/g, ''))} maxLength={255} required />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-3">
                            <Label>Username</Label>
                            <Input value={data.username} onChange={(e) => setData('username', e.target.value.toLowerCase().replace(/[^a-z0-9.]/g, ''))} maxLength={255} required />
                            <InputError message={errors.username} />
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="role">Role</Label>
                            <Badge className="bg-neutral-100 px-3 py-1 text-sm/6.5 font-normal shadow-2xs dark:bg-neutral-900" variant="outline">
                                {data.role}
                            </Badge>
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
