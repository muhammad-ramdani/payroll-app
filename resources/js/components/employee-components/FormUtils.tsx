// FormUtils.tsx
import { Employee } from '@/types';
import { useForm } from '@inertiajs/react';

export const useFormEmployee = () => {
    return useForm<Employee>({
        id: '',
        user: {
            id: '',
            name: '',
            username: '',
            role: '',
        },
        phone: '',
        address: '',
        hire_date: null,
        bank_name: '',
        account_number: '',
        account_name: '',
        basic_salary: 0,
        paid_holidays: '',
        daily_overtime_pay: 0,
        bpjs_health: '',
        bpjs_employment: '',
        income_tax: '',
    });
};

export function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID').format(value);
}

export function parseRupiah(rupiahString: string): number {
    return parseInt(rupiahString.replace(/[^0-9]/g, '')) || 0;
}