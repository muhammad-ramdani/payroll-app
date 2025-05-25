import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DeleteModalProps } from '@/types';
import { router } from '@inertiajs/react';

export default function DeleteModal({ open, onClose, deleteEmployee, employee }: DeleteModalProps) {
    const handleDelete = () => {
        if (!employee?.id) return;
        router.delete(`/data-karyawan/${employee.id}`, {
            onSuccess: () => (deleteEmployee(employee.id), onClose()),
        });
    };

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus data
                        <strong> {employee?.user.name}</strong>? Tindakan tidak dapat dibatalkan.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700">
                        Hapus
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
