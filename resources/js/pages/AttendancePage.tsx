// AttendancePage.tsx
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { calculateDistance, getCurrentPosition } from '@/utils/geolocation';
import { Head, router } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

// Komponen UI Kustom
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';

// Tipe Data dan Konstanta
import { Attendance, AttendanceBonusPenaltySetting, AttendanceRule } from '@/types';
import { ClockArrowDown, ClockArrowUp } from 'lucide-react';

const calculateWorkingDuration = (clockInTime?: string | null, clockOutTime?: string | null, now = Date.now()): string => {
    if (!clockInTime) return '-';

    const parse = (timeString: string) => {
        const [hour, minute, second = '0'] = timeString.split(':');
        const date = new Date(now);
        date.setHours(+hour, +minute, +second);
        return date;
    };

    const start = parse(clockInTime);
    const end = clockOutTime ? parse(clockOutTime) : new Date();

    const ms = Math.max(0, end.getTime() - start.getTime());
    const hh = String(Math.floor(ms / 3600000)).padStart(2, '0');
    const mm = String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0');
    const ss = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');

    return `${hh}:${mm}:${ss}`;
};

const AttendanceStatusBadge = ({ status }: { status: Attendance['status'] }) => {
    const [label, className] = {
        not_started: ['Belum Hadir', 'text-amber-500 bg-amber-500/10'],
        working: ['Sedang Bekerja', 'text-emerald-500 bg-emerald-500/10'],
        finished: ['Sudah Pulang', 'text-blue-500 bg-blue-500/10'],
        leave: ['Libur Cuti', 'text-rose-500 bg-rose-500/10'],
        sick: ['Libur Sakit', 'text-fuchsia-500 bg-fuchsia-500/10'],
    }[status];

    return <Badge className={className}>{label}</Badge>;
};

export default function AttendancePage({
    attendances,
    attendanceRules,
    bonusPenaltySettings,
}: {
    attendances: Attendance[];
    attendanceRules: Record<number, AttendanceRule>;
    bonusPenaltySettings: AttendanceBonusPenaltySetting;
}) {
    const [attendanceRecords, setAttendanceRecords] = useState(attendances);
    const [currentTimestamp, setCurrentTimestamp] = useState(Date.now());
    const [showLocationAlert, setShowLocationAlert] = useState(false);
    const [storesList, setStoresList] = useState<Array<{ name: string; radius: number }>>([]);

    useEffect(() => {
        const intervalId = setInterval(() => setCurrentTimestamp(Date.now()), 1000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        setAttendanceRecords(attendances);
    }, [attendances]);

    const handleUpdateAttendance = useCallback((id: number, action: 'clock_in' | 'clock_out' | 'leave' | 'sick') => {
        router.patch(`/presensi/${id}`, { action });
    }, []);

    const handleAttendanceAction = useCallback(
        async (actionType: 'clock_in' | 'clock_out', recordId: number) => {
            const { latitude, longitude } = await getCurrentPosition();

            const stores = [];
            for (let i = 1; i <= 100; i++) {
                const lat = import.meta.env[`VITE_STORE_${i}_LAT`];
                const lng = import.meta.env[`VITE_STORE_${i}_LNG`];
                if (!lat || !lng) break;

                stores.push({
                    name: import.meta.env[`VITE_STORE_${i}_NAME`] || `Store ${i}`,
                    lat: parseFloat(lat),
                    lng: parseFloat(lng),
                    radius: parseFloat(import.meta.env[`VITE_STORE_${i}_RADIUS`]) || 100,
                });
            }

            const nearby = stores.find((s) => calculateDistance(latitude, longitude, s.lat, s.lng) <= s.radius);

            if (!nearby) {
                setStoresList(stores);
                setShowLocationAlert(true);
                return;
            }

            return handleUpdateAttendance(recordId, actionType);
        },
        [handleUpdateAttendance],
    );

    return (
        <AppLayout breadcrumbs={[{ title: 'Presensi', href: '/' }]}>
            <Head title="Presensi" />
            {attendanceRecords.length === 0 ? (
                // Tampilan ketika tidak ada data
                <div className="flex h-9/10 items-center justify-center">
                    <p className="text-muted-foreground text-sm">Presensi baru akan tersedia pukul 06:30 pagi.</p>
                </div>
            ) : (
                <>
                    <div className="mx-4 mt-16 flex justify-center">
                        {attendanceRecords.map((record) => (
                            <div key={record.id} className="space-y-8 text-center">
                                {/* Tanggal */}
                                <p className="text-sm">{new Date(record.date).toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>

                                {/* Shift */}
                                <div className="text-sm">
                                    Shift kamu hari ini
                                    <span className={`${record.shift_type === 'Pagi' ? 'text-blue-500' : 'text-yellow-500'}`}> {record.shift_type}</span>
                                </div>

                                {/* Jam Masuk */}
                                <div className="space-y-4">
                                    <p className="text-muted-foreground text-sm">Jam Masuk</p>
                                    {record.status === 'leave' || record.status === 'sick' ? (
                                        <p className="text-sm font-medium">-</p>
                                    ) : record.clock_in ? (
                                        <p className="text-sm font-medium">{record.clock_in}</p>
                                    ) : (
                                        <Button variant="secondary" onClick={() => handleAttendanceAction('clock_in', record.id)}>
                                            <ClockArrowDown /> Masuk Kerja
                                        </Button>
                                    )}
                                </div>

                                {/* Jam Pulang */}
                                <div className="space-y-4">
                                    <p className="text-muted-foreground text-sm">Jam Pulang</p>
                                    {record.status === 'leave' || record.status === 'sick' ? (
                                        <p className="text-sm font-medium">-</p>
                                    ) : record.clock_out ? (
                                        <p className="text-sm font-medium">{record.clock_out}</p>
                                    ) : (
                                        <Button variant="secondary" disabled={!record.clock_in} onClick={() => handleAttendanceAction('clock_out', record.id)}>
                                            <ClockArrowUp /> Pulang Kerja
                                        </Button>
                                    )}
                                </div>

                                {/* Waktu Kerja */}
                                <div className="space-y-4">
                                    <p className="text-muted-foreground text-sm">Waktu Kerja</p>
                                    <p className="text-sm font-medium">{calculateWorkingDuration(record.clock_in, record.clock_out, currentTimestamp)}</p>
                                </div>

                                {/* Status */}
                                <div className="space-y-4">
                                    <p className="text-muted-foreground text-sm">Status Kehadiran</p>
                                    <AttendanceStatusBadge status={record.status} />
                                </div>

                                {/* tombol tidak masuk */}
                                {record.status === 'not_started' && (
                                    <div className="space-y-4 pt-8">
                                        <p className="text-muted-foreground text-sm">Tombol Libur Kerja</p>
                                        <div className="space-x-4">
                                            <Button
                                                className="border border-fuchsia-500 bg-transparent text-fuchsia-500 hover:bg-fuchsia-500/15"
                                                onClick={() => handleUpdateAttendance(record.id, 'sick')}
                                            >
                                                Libur Sakit
                                            </Button>

                                            <Button
                                                className="border border-rose-500 bg-transparent text-rose-500 hover:bg-rose-500/15"
                                                onClick={() => handleUpdateAttendance(record.id, 'leave')}
                                            >
                                                Libur Cuti
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="text-muted-foreground mx-4 mt-32 mb-4 space-y-2">
                        <p className="text-sm font-semibold">Catatan:</p>
                        <ul className="ml-5 list-disc space-y-1 text-sm">
                            <li>Presensi Kehadiran "Jam Masuk" dan "Jam Pulang" hanya bisa dilakukan di toko saja, kecuali "Tombol Libur Kerja" bisa dilakukan dimana saja.</li>
                            <li>Jika sampai jam 14:00 tidak menekan tombol "Jam Masuk", maka status kehadiran akan otomatis menjadi "Tidak Masuk".</li>
                            <li>
                                Bagi karyawan shift Pagi, jika masuk sebelum pukul {attendanceRules[1].punctual_end}, akan mendapatkan bonus sebesar Rp{' '}
                                {bonusPenaltySettings.bonus_amount.toLocaleString('id-ID')} per hari. Sebaliknya, jika masuk setelah pukul {attendanceRules[1].late_threshold}, akan
                                dikenakan potongan gaji sebesar Rp {bonusPenaltySettings.penalty_amount.toLocaleString('id-ID')} per hari.
                            </li>
                            <li>
                                Bagi karyawan shift Siang, jika masuk sebelum pukul {attendanceRules[2].punctual_end}, akan mendapatkan bonus sebesar Rp{' '}
                                {bonusPenaltySettings.bonus_amount.toLocaleString('id-ID')} per hari. Sebaliknya, jika masuk setelah pukul {attendanceRules[2].late_threshold}, akan
                                dikenakan potongan gaji sebesar Rp {bonusPenaltySettings.penalty_amount.toLocaleString('id-ID')} per hari.
                            </li>
                            <li>Waktu kerja yang melebihi 8.5 jam akan dianggap sebagai kerja lembur dan akan diberikan gaji lembur harian.</li>
                        </ul>
                    </div>
                </>
            )}

            <AlertDialog open={showLocationAlert} onOpenChange={setShowLocationAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Lokasi Tidak Valid</AlertDialogTitle>
                        <AlertDialogDescription>
                            Anda harus berada di salah satu lokasi berikut:
                            {storesList.map((store, index) => (
                                <li key={index}>
                                    {store.name} (radius {store.radius}m)
                                </li>
                            ))}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setShowLocationAlert(false)}>OK</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
