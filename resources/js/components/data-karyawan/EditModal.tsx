import React, { useEffect, useState } from 'react';

interface EditModalProps {
    open: boolean;
    onClose: () => void;
    employee: { id: number; name: string } | null;
    onUpdate: (id: number, name: string) => void;
}

export default function EditModal({ open, onClose, employee, onUpdate }: EditModalProps) {
    const [name, setName] = useState('');

    useEffect(() => {
        if (employee) setName(employee.name);
    }, [employee]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!employee) return;

        const response = await fetch(`/data-karyawan/${employee.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({ name }),
        });

        if (response.ok) {
            onUpdate(employee.id, name);
            onClose();
        } else {
            alert('Gagal memperbarui data.');
        }
    };

    if (!open || !employee) return null;

    return (
        <div className="bg-opacity-50 fixed inset-0 flex items-center justify-center bg-black">
            <div className="w-96 rounded bg-white p-4 shadow">
                <h2 className="mb-4 text-lg font-bold">Edit Nama Karyawan</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mb-4 w-full rounded border p-2"
                        placeholder="Nama Karyawan"
                        required
                    />
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="rounded bg-gray-300 px-4 py-2">
                            Batal
                        </button>
                        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
