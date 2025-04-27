import { Employee } from '@/types';
import { useForm } from '@inertiajs/react';
import React from 'react';

export const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete', 'Shift', 'PageUp', 'PageDown', 'Fn', 'Enter'];

export const letterPattern = /^[a-zA-Z .'-]$/;
export const digitPattern = /^[0-9]$/;
export const phonePattern = /^[0-9 ()+-]$/;
export const accountPattern = /^[0-9 -]$/;

export function createKeyDownHandler(pattern: RegExp) {
    return (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!pattern.test(e.key) && !allowedKeys.includes(e.key)) {
            e.preventDefault();
        }
    };
}

export function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID').format(value);
}

export const useFormEmployee = () => {
    return useForm<Employee>({
        id: 0,
        name: '',
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
