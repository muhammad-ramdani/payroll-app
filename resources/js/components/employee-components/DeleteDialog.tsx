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
import { DeleteDialogProps } from '@/types';
import { router } from '@inertiajs/react';

export default function DeleteDialog({ open, onClose, deleteEmployee, employee }: DeleteDialogProps) {
    const handleDelete = () => {
        if (!employee) return;

        router.delete(route('data-karyawan.destroy', employee.id), {
            preserveScroll: true,
            onSuccess: () => {
                deleteEmployee(employee.id!);
                onClose();
            },
            onError: () => router.reload(),
        });
    };

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus data <span className="font-bold text-black dark:text-white">{employee?.name}</span>? Tindakan ini tidak dapat dibatalkan.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
