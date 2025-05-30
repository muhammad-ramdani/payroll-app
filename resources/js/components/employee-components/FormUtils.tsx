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
        paid_holidays: 0,
        transportation_allowance: 0,
        daily_overtime_pay: 0,
        bpjs_health: 0,
        bpjs_employment: 0,
        income_tax: 0,
    });
};

export function formatRupiah(value: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
}

export function parseRupiah(value: string) {
    return parseInt(value.replace(/\D/g, '')) || 0;
}

export function parseNumber(value: string) {
    return parseInt(value.replace(/\D/g, '')) || 0;
}