// resources/js/pages/ShiftForAdminPage.tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { toast } from 'sonner';

// Tipe data
import { Shift } from '@/types';

export default function ShiftForAdminPage({ shifts }: { shifts: Shift[] }) {
    const handleShiftChange = (userId: string, newShift: 'Pagi' | 'Siang') => {
        router.patch(
            `/admin-shift-karyawan/${userId}`,
            { shift_type: newShift },
            { onSuccess: () => toast.success('Shift berhasil diubah', { action: { label: 'Tutup', onClick: () => {} } }) },
        );
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Shift Kerja', href: '/' }]}>
            <Head title="Shift Kerja" />

            <div className="p-4">
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama Karyawan</TableHead>
                                <TableHead>Shift</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {shifts.map((shift) => (
                                <TableRow key={shift.user.id}>
                                    <TableCell>{shift.user.name}</TableCell>
                                    <TableCell>
                                        <Select value={shift.shift_type} onValueChange={(value: 'Pagi' | 'Siang') => handleShiftChange(shift.user.id, value)}>
                                            <SelectTrigger className="w-32">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Pagi">
                                                    <span className="text-blue-500">Pagi</span>
                                                </SelectItem>
                                                <SelectItem value="Siang">
                                                    <span className="text-yellow-500">Siang</span>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
