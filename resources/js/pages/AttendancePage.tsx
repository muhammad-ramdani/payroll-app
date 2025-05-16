// AttendanceRecapPage.tsx
import { calculateDistance, getCurrentPosition } from '@/utils/geolocation';
import { Head, router, usePage } from '@inertiajs/react';
import { ClockArrowDown, ClockArrowUp } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

// Komponen UI Kustom
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';

// Tipe Data dan Konstanta
import { Attendance, AttendanceBonusPenaltySetting, AttendanceRule } from '@/types';

const formatTimeToHHMM = (timeString: string) => {
    return timeString.split(':').slice(0, 2).join(':');
};

const attendanceStatus = {
    not_started: ['Belum Hadir', 'text-amber-500 bg-amber-500/10'],
    working: ['Sedang Bekerja', 'text-emerald-500 bg-emerald-500/10'],
    finished: ['Sudah Pulang', 'text-blue-500 bg-blue-500/10'],
    leave: ['Libur Cuti', 'text-rose-500 bg-rose-500/10'],
    sick: ['Libur Sakit', 'text-fuchsia-500 bg-fuchsia-500/10'],
};

const formatTimeToHHMMSS = (timestampMs: number) => new Date(timestampMs).toLocaleTimeString('en-GB');
const formatLongDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date);
};

const calculateWorkingDuration = (clockInTime?: string | null, clockOutTime?: string | null, currentTimestamp = Date.now()): string => {
    if (!clockInTime) return '-';

    const parseTimeStringToDate = (time: string) => {
        const [hours, minutes, seconds] = time.split(':').map(Number);
        const date = new Date(currentTimestamp);
        date.setHours(hours, minutes, seconds);
        return date;
    };

    const startTime = parseTimeStringToDate(clockInTime);
    const endTime = clockOutTime ? parseTimeStringToDate(clockOutTime) : new Date(currentTimestamp);

    const durationInMilliseconds = endTime.getTime() - startTime.getTime();
    const padWithZero = (number: number) => String(number).padStart(2, '0');
    const hours = Math.floor(durationInMilliseconds / 3_600_000);
    const minutes = Math.floor((durationInMilliseconds % 3_600_000) / 60_000);
    const seconds = Math.floor((durationInMilliseconds % 60_000) / 1_000);

    return `${padWithZero(hours)}:${padWithZero(minutes)}:${padWithZero(seconds)}`;
};

const AttendanceStatusBadge = ({ status }: { status: Attendance['status'] }) => {
    const [label, className] = attendanceStatus[status];
    return <Badge className={className}>{label}</Badge>;
};

export default function AttendanceRecapPage() {
    const {
        props: { attendances, attendanceRules, bonusPenaltySettings },
    } = usePage<{
        attendances: Attendance[];
        attendanceRules: Record<number, AttendanceRule>;
        bonusPenaltySettings: AttendanceBonusPenaltySetting;
    }>();
    const [attendanceRecords, setAttendanceRecords] = useState(attendances);
    const [currentTimestamp, setCurrentTimestamp] = useState(Date.now());

    useEffect(() => {
        const intervalId = setInterval(() => setCurrentTimestamp(Date.now()), 1000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        setAttendanceRecords(attendances);
    }, [attendances]);

    const handleUpdateAttendance = useCallback(async (id: number, data: { clock_in?: string; clock_out?: string; status: Attendance['status'] }) => {
        setAttendanceRecords((prev) => prev.map((record) => (record.id === id ? { ...record, ...data } : record)));
        await router.patch(route('absensi.update', id), data);
    }, []);

    const handleAttendanceAction = useCallback(
        async (actionType: 'clock_in' | 'clock_out', recordId: number) => {
            try {
                const { latitude, longitude } = await getCurrentPosition();
                const stores = [];
                let storeCount = 1;

                while (import.meta.env[`VITE_STORE_${storeCount}_LAT`]) {
                    stores.push({
                        name: import.meta.env[`VITE_STORE_${storeCount}_NAME`] || `Store ${storeCount}`,
                        lat: parseFloat(import.meta.env[`VITE_STORE_${storeCount}_LAT`]),
                        lng: parseFloat(import.meta.env[`VITE_STORE_${storeCount}_LNG`]),
                        radius: parseFloat(import.meta.env[`VITE_STORE_${storeCount}_RADIUS`]) || 100,
                    });
                    storeCount++;
                }

                const isWithinRadius = stores.some((store) => {
                    const distance = calculateDistance(latitude, longitude, store.lat, store.lng);
                    return distance <= store.radius;
                });

                if (!isWithinRadius) {
                    const storeList = stores.map((store) => `${store.name} (${store.radius}m)`).join(', ');
                    alert(`Anda harus berada di salah satu lokasi: ${storeList}`);
                    return;
                }

                const currentTime = formatTimeToHHMMSS(Date.now());
                await handleUpdateAttendance(recordId, {
                    [actionType]: currentTime,
                    status: actionType === 'clock_in' ? 'working' : 'finished',
                });
            } catch (error) {
                alert(`Gagal mendapatkan lokasi: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
        [handleUpdateAttendance],
    );

    return (
        <AppLayout breadcrumbs={[{ title: 'Absensi Karyawan', href: '/' }]}>
            <Head title="Absensi Karyawan" />
            {attendanceRecords.length === 0 ? (
                // Tampilan ketika tidak ada data
                <div className="flex h-9/10 items-center justify-center">
                    <p className="text-muted-foreground text-sm">Absensi baru akan tersedia pukul 06:30 pagi.</p>
                </div>
            ) : (
                <>
                    <div className="mx-4 mt-16 flex justify-center">
                        {attendanceRecords.map((record) => (
                            // rounded-lg border p-15
                            <div key={record.id} className="space-y-8 text-center">
                                {/* Tanggal */}
                                <p className="text-sm">{formatLongDate(new Date(record.date))}</p>

                                {/* Shift */}
                                <div className="text-sm">
                                    Shift
                                    <span className={`${record.shift_type === 'Pagi' ? 'text-blue-500' : 'text-yellow-500'}`}> {record.shift_type}</span>
                                </div>

                                {/* Jam Masuk */}
                                <div className="space-y-4">
                                    <p className="text-muted-foreground text-sm">Jam Masuk</p>
                                    {record.status === 'leave' ? (
                                        <p className="text-sm font-medium">-</p>
                                    ) : record.clock_in ? (
                                        <p className="text-sm font-medium">{record.clock_in}</p>
                                    ) : (
                                        <Button variant="secondary" onClick={() => handleAttendanceAction('clock_in', record.id)}>
                                            <ClockArrowDown className="mx-11" />
                                        </Button>
                                    )}
                                </div>

                                {/* Jam Pulang */}
                                <div className="space-y-4">
                                    <p className="text-muted-foreground text-sm">Jam Pulang</p>
                                    {record.status === 'leave' ? (
                                        <p className="text-sm font-medium">-</p>
                                    ) : record.clock_out ? (
                                        <p className="text-sm font-medium">{record.clock_out}</p>
                                    ) : (
                                        <Button variant="secondary" disabled={!record.clock_in} onClick={() => handleAttendanceAction('clock_out', record.id)}>
                                            <ClockArrowUp className="mx-11" />
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
                                    <div>
                                        <AttendanceStatusBadge status={record.status} />
                                    </div>
                                </div>

                                {/* tombol tidak masuk */}
                                {/* <p>Tidak Masuk Kerja</p> */}
                                <div className="space-x-4">
                                    {record.status === 'not_started' && (
                                        <Button
                                            className="mt-8 border border-fuchsia-500 bg-transparent text-fuchsia-500 hover:bg-fuchsia-500/15"
                                            onClick={() => handleUpdateAttendance(record.id, { status: 'sick' })}
                                        >
                                            Libur Sakit
                                        </Button>
                                    )}

                                    {record.status === 'not_started' && (
                                        <Button
                                            className="mt-8 border border-rose-500 bg-transparent text-rose-500 hover:bg-rose-500/15"
                                            onClick={() => handleUpdateAttendance(record.id, { status: 'leave' })}
                                        >
                                            Libur Cuti
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-muted-foreground mx-4 mt-32 mb-4 space-y-2">
                        <p className="text-sm font-semibold">Catatan:</p>
                        <ul className="ml-5 list-disc space-y-1 text-sm">
                            <li>absensi Kehadiran "Jam Masuk" dan "Jam Pulang" hanya bisa dilakukan di toko saja, kecuali tombol "Tidak Masuk Kerja" bisa dilakukan dimana saja.</li>
                            <li>Jika sampai jam 14:00 tidak menekan tombol "Jam Masuk", maka status kehadiran akan otomatis menjadi "Tidak Masuk".</li>
                            <li>
                                Bagi karyawan shift Pagi, jika masuk sebelum pukul {formatTimeToHHMM(attendanceRules[1].punctual_end)}, akan mendapatkan bonus sebesar Rp{' '}
                                {bonusPenaltySettings.bonus_amount.toLocaleString('id-ID')} per hari. Sebaliknya, jika masuk setelah pukul{' '}
                                {formatTimeToHHMM(attendanceRules[1].late_threshold)}, akan dikenakan potongan gaji sebesar Rp{' '}
                                {bonusPenaltySettings.penalty_amount.toLocaleString('id-ID')} per hari.
                            </li>
                            <li>
                                Bagi karyawan shift Siang, jika masuk sebelum pukul {formatTimeToHHMM(attendanceRules[2].punctual_end)}, akan mendapatkan bonus sebesar Rp{' '}
                                {bonusPenaltySettings.bonus_amount.toLocaleString('id-ID')} per hari. Sebaliknya, jika masuk setelah pukul{' '}
                                {formatTimeToHHMM(attendanceRules[2].late_threshold)}, akan dikenakan potongan gaji sebesar Rp{' '}
                                {bonusPenaltySettings.penalty_amount.toLocaleString('id-ID')} per hari.
                            </li>
                            <li>Waktu kerja yang melebihi 8.5 jam akan dianggap sebagai kerja lembur dan akan diberikan gaji lembur harian.</li>
                        </ul>
                    </div>
                </>
            )}
        </AppLayout>
    );
}
