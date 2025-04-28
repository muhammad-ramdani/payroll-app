import { Dialog as Modal, DialogBackdrop as ModalBackdrop, DialogPanel as ModalPanel, DialogTitle as ModalTitle } from '@headlessui/react';
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';

interface ModalProps {
    open: boolean;
    onClose: (open: boolean) => void;
    title: string;
    children: React.ReactNode;
}

export default function UIDialog({ open, onClose, title, children }: ModalProps) {
    return (
        <Modal open={open} onClose={() => {}} className="relative z-10">
            <ModalBackdrop
                transition
                className="fixed inset-0 bg-black/5 dark:bg-white/7 backdrop-blur-md transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
            />

            <div className="fixed inset-0 overflow-y-auto scrollbar scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-800 scrollbar-track-transparent">
                <div className="flex min-h-full justify-center items-center">
                    <ModalPanel
                        transition
                        className="rounded-lg bg-white dark:bg-neutral-950 border p-6 w-full sm:max-w-3xl m-4 transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in data-closed:sm:translate-y-0 data-closed:sm:scale-95"
                    >
                        <ModalTitle className="font-semibold text-lg flex justify-between items-center">
                            {title}
                            <Button variant="ghost" size="sm" onClick={() => onClose(false)}>
                                <X />
                            </Button>
                        </ModalTitle>
                        <div className="mt-4 text-sm">{children}</div>
                    </ModalPanel>
                </div>
            </div>
        </Modal>
    );
}