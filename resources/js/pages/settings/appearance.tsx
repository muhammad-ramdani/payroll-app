import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

export default function Appearance() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Pengaturan tampilan', href: '/settings/appearance' }]}>
            <Head title="Pengaturan tampilan" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Tampilan" description="Ubah tampilan akun kamu" />
                    <AppearanceTabs />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
