import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { ShiftSwapPageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import { toast } from 'sonner';

export default function ShiftSwapPage({ receivedRequests }: ShiftSwapPageProps) {
    const handleApprove = (requestId: number) =>
        router.post(`/permintaan-tukar-shift/${requestId}/approve`, {}, { onSuccess: () => toast.success('Shift berhasil ditukar', { action: { label: 'Tutup', onClick: () => {} } }) });

    const handleReject = (requestId: number) =>
        router.post(`/permintaan-tukar-shift/${requestId}/reject`, {}, { onSuccess: () => toast.info('Shift tidak ditukar', { action: { label: 'Tutup', onClick: () => {} } }) });

    return (
        <AppLayout breadcrumbs={[{ title: 'Permintaan Tukar Shift', href: '/' }]}>
            <Head title="Permintaan Tukar Shift" />
            {/* Permintaan Masuk */}
            <div className="space-y-2 p-4">
                {receivedRequests.length === 0 ? (
                    <div className="rounded-md border px-2 py-4 text-center text-sm text-neutral-400 dark:text-neutral-500">Tidak ada permintaan tukar shift</div>
                ) : (
                    <div className="space-y-2">
                        {receivedRequests.map((req) => (
                            <div key={req.id} className="flex flex-col justify-between rounded-md border px-2 py-4 sm:flex-row sm:items-center">
                                <p className="text-sm sm:mr-4">
                                    Shift anda akan diganti menjadi<strong> {req.requester_shift.shift_type}, </strong>
                                    dan shift milik<strong> {req.requester.name} </strong>
                                    akan diganti menjadi <strong>{req.target_shift.shift_type}, </strong>
                                    apakah boleh?
                                </p>
                                <div className="mt-4 flex gap-2 sm:mt-0">
                                    <Button variant="outline" onClick={() => handleReject(req.id)}>
                                        Tidak
                                    </Button>
                                    <Button onClick={() => handleApprove(req.id)}>Boleh</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
