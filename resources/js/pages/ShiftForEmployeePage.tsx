import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { ShiftForEmployeePageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import { toast } from 'sonner';

export default function ShiftForEmployeePage({ userShifts, otherShifts, sentRequests, globalPendingShiftIds }: ShiftForEmployeePageProps) {
    const allShifts = [...userShifts, ...otherShifts];
    const userShiftTypes = new Set(userShifts.map((s) => s.shift_type));
    const pendingShiftIds = new Set(sentRequests.map((r) => r.target_shift_id));
    const globalPendingSet = new Set<number>(globalPendingShiftIds);

    const handleRequestSwap = (id: number) => {
        router.post('/swap-requests', { shift_id: id }, { onSuccess: () => toast.success('Berhasil Meminta tukar shift', { action: { label: 'Tutup', onClick: () => {} } }) });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Shift Kerja', href: '/' }]}>
            <Head title="Shift Kerja" />
            <div className="m-4 space-y-8">
                {/* Semua Shift */}
                <div className="space-y-2">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Shift</TableHead>
                                    <TableHead>Pemilik</TableHead>
                                    <TableHead>Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allShifts.map((shift) => {
                                    const isMy = userShifts.some((s) => s.id === shift.id);
                                    const isSent = pendingShiftIds.has(shift.id);
                                    const isBlue = shift.shift_type === 'Pagi';
                                    const colorClass = isBlue ? 'text-blue-500' : 'text-yellow-500';

                                    return (
                                        <TableRow key={shift.id}>
                                            <TableCell className={colorClass}>{shift.shift_type}</TableCell>
                                            <TableCell>{shift.user.name}</TableCell>
                                            <TableCell>
                                                {isMy && <span className="text-neutral-400 dark:text-neutral-500">Shift Saya</span>}

                                                {isSent ? (
                                                    <span className="text-neutral-400 dark:text-neutral-500">Menunggu Persetujuan</span>
                                                ) : (
                                                    !isMy &&
                                                    !userShiftTypes.has(shift.shift_type) && (
                                                        <Button onClick={() => handleRequestSwap(shift.id)} disabled={globalPendingSet.size > 0}>
                                                            Minta Tukar Shift
                                                        </Button>
                                                    )
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Catatan */}
                <div className="space-y-2 text-neutral-400 dark:text-neutral-500">
                    <p className="text-sm font-semibold">Catatan:</p>
                    <ul className="ml-5 list-disc space-y-1 text-sm">
                        <li>
                            Perhatian: Pertukaran shift untuk presensi hari ini tidak bisa dilakukan setelah pukul 06:30 pagi, karena data di sistem presensi tidak akan ikut berubah.
                            Silakan lakukan pertukaran sebelum pukul 06:30 atau pada hari sebelumnya. Untuk pertukaran shift hari esok, bisa dilakukan setelah pukul 06:30 hari ini.
                        </li>
                        <li>
                            Jika ingin menukar shift, harap komunikasikan terlebih dahulu dengan pemilik shift sebelum Anda menekan tombol 'Minta Tukar'. Setelah tombol 'Minta Tukar'
                            ditekan, pemilik shift perlu memberikan persetujuan dengan menekan tombol 'Boleh' agar pertukaran shift berhasil diproses.
                        </li>
                    </ul>
                </div>
            </div>
        </AppLayout>
    );
}
