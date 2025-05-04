import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

type ProfileForm = {
    name: string;
    username: string;
    role: string;
};

export default function Profile() {
    const { auth } = usePage<SharedData>().props;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<Required<ProfileForm>>({
        name: auth.user.name,
        username: auth.user.username,
        role: auth.user.role,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Info Profile" description="Ubah nama sama username kamu" />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nama</Label>

                            <Input
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) =>
                                    setData(
                                        'name',
                                        e.target.value
                                            .replace(/[^a-zA-Z ,.'-]/g, '')
                                            .toLowerCase()
                                            .replace(/\s+/g, ' ')
                                            .replace(/(^|[\s.-])(\w)/g, (_, prefix, char) => prefix + char.toUpperCase()),
                                    )
                                }
                                required
                            />

                            <InputError className="mt-2" message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="username">Username</Label>

                            <Input
                                id="username"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value.toLowerCase().replace(/[^a-z0-9.]/g, ''))}
                                required
                            />

                            <InputError className="mt-2" message={errors.username} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="role">Role</Label>
                            <Badge className="mt-1 block w-full bg-neutral-100 px-3 py-1 text-sm/6.5 font-normal shadow-2xs dark:bg-neutral-900" variant="outline">
                                {data.role}
                            </Badge>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Save</Button>

                            <Transition show={recentlySuccessful} enter="transition ease-in-out" enterFrom="opacity-0" leave="transition ease-in-out" leaveTo="opacity-0">
                                <p className="text-sm text-neutral-600">Saved</p>
                            </Transition>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
