import React from 'react';
import { z } from 'zod';

// 1. Keyboard helpers
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

// 2. Rupiah formatter
export function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID').format(value);
}

// 3. Zod schema + types
export const formSchema = z.object({
    name: z.string({ required_error: 'Wajib di isi, minimal 3 karakter.' }).min(3, { message: 'Wajib di isi, minimal 3 karakter.' }),
    phone: z.string().optional(),
    address: z.string().optional(),
    hire_date: z.date({ required_error: 'Wajib di isi.' }),
    bank_name: z.string().optional(),
    account_number: z.string().optional(),
    account_name: z.string().optional(),
    basic_salary: z.number({ required_error: 'Wajib di isi, minimal 1.' }).min(1, { message: 'Wajib di isi, minimal 1.' }),
    paid_holidays: z
        .string({ required_error: 'Wajib di isi, minimal 0 & maksimal 99.' })
        .min(1, { message: 'Wajib di isi, minimal 0 & maksimal 99.' }),
    daily_overtime_pay: z.number({ required_error: 'Wajib di isi, minimal 1.' }).min(1, { message: 'Wajib di isi, minimal 1.' }),
    bpjs_health: z.string({ required_error: 'Wajib di isi, minimal 0 & maksimal 99.' }).min(1, { message: 'Wajib di isi, minimal 0 & maksimal 99.' }),
    bpjs_employment: z
        .string({ required_error: 'Wajib di isi, minimal 0 & maksimal 99.' })
        .min(1, { message: 'Wajib di isi, minimal 0 & maksimal 99.' }),
    income_tax: z.string({ required_error: 'Wajib di isi, minimal 0 & maksimal 99.' }).min(1, { message: 'Wajib di isi, minimal 0 & maksimal 99.' }),
});

export type FormValues = z.infer<typeof formSchema>;
