import { CreateModalProps } from '@/types';
import { useState } from 'react';

export default function CreateModal({ open, onClose, addEmployee }: CreateModalProps) {
    const initialFormState = {
        name: '',
        phone: '',
        address: '',
        hire_date: new Date().toISOString().split('T')[0],
        bank_name: 'adad',
        account_number: '123',
        account_name: 'adad',
        basic_salary: 0,
        paid_holidays: 0,
        daily_allowance: 0,
        bpjs_health: 0,
        bpjs_employment: 0,
        income_tax: 0,
    };

    const [form, setForm] = useState(initialFormState);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/data-karyawan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                const newEmployee = await res.json();
                addEmployee(newEmployee);
                onClose(); // Reset form dan tutup modal
            } else {
                alert('Gagal menambahkan data.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Terjadi kesalahan saat mengirim data.');
        }
    };

    if (!open) return null;

    return (
        <div className="bg-opacity-50 fixed inset-0 flex items-center justify-center bg-black">
            <div className="w-80 rounded bg-white p-4 shadow">
                <h2 className="mb-4 text-lg font-bold">Tambah Karyawan</h2>
                <form onSubmit={handleSubmit}>
                    {['name', 'phone', 'address', 'hire_date', 'bank_name', 'account_number', 'account_name', 'basic_salary'].map((field) => (
                        <input
                            key={field}
                            type="text"
                            name={field}
                            placeholder={capitalize(field)}
                            value={form[field as keyof typeof form]}
                            onChange={handleInputChange}
                            className="mb-2 w-full rounded border p-2"
                            required={field === 'name'} // Hanya "name" yang wajib diisi
                        />
                    ))}
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

// Helper function untuk mengubah string menjadi huruf kapital di awal
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
