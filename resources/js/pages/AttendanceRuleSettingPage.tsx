import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type AttendanceRuleSettingPageProps } from '@/types';
import { Head, useForm } from '@inertiajs/react';

// Fungsi untuk format Rupiah
const formatRupiah = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

// Fungsi untuk mengubah string Rupiah ke angka
const parseRupiah = (value: string) => parseInt(value.replace(/\D/g, '')) || 0;

export default function AttendanceRuleSettingPage({ attendanceRuleSettings }: AttendanceRuleSettingPageProps) {
    const { data, setData, patch, processing, recentlySuccessful } = useForm({
        attendanceRules: attendanceRuleSettings.map((rule) => ({
            id: rule.id,
            punctual_end: rule.punctual_end,
            late_threshold: rule.late_threshold,
        })),
        bonus_penalty: {
            id: attendanceRuleSettings[0].attendance_bonus_penalty_setting.id,
            bonus_amount: attendanceRuleSettings[0].attendance_bonus_penalty_setting.bonus_amount,
            penalty_amount: attendanceRuleSettings[0].attendance_bonus_penalty_setting.penalty_amount,
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('aturan-absensi.update'));
    };

    const updateRule = (index: number, field: 'punctual_end' | 'late_threshold', value: string) => {
        const newRules = [...data.attendanceRules];
        newRules[index] = { ...newRules[index], [field]: value };
        setData('attendanceRules', newRules);
    };

    const updateBonusPenalty = (field: 'bonus_amount' | 'penalty_amount', value: string) => {
        setData('bonus_penalty', {
            ...data.bonus_penalty,
            [field]: parseRupiah(value),
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Aturan Absensi', href: '/' }]}>
            <Head title="Aturan Absensi" />

            <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {data.attendanceRules.map((rule, idx) => (
                        <div key={rule.id}>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Batas Tepat Waktu shift {attendanceRuleSettings[idx].shift_type}</Label>
                                    <Input type="time" value={rule.punctual_end} onChange={(e) => updateRule(idx, 'punctual_end', e.target.value)} className="block" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Batas Terlambat shift {attendanceRuleSettings[idx].shift_type}</Label>
                                    <Input type="time" value={rule.late_threshold} onChange={(e) => updateRule(idx, 'late_threshold', e.target.value)} className="block" />
                                </div>
                            </div>
                        </div>
                    ))}

                    <div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Bonus Tepat Waktu</Label>
                                <Input value={formatRupiah(data.bonus_penalty.bonus_amount)} onChange={(e) => updateBonusPenalty('bonus_amount', e.target.value)} inputMode="numeric" />
                            </div>
                            <div className="space-y-2">
                                <Label>Denda Terlambat</Label>
                                <Input
                                    value={formatRupiah(data.bonus_penalty.penalty_amount)}
                                    onChange={(e) => updateBonusPenalty('penalty_amount', e.target.value)}
                                    inputMode="numeric"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                        {recentlySuccessful && <div className="text-muted-foreground">Tersimpan</div>}
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
