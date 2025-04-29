import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    username: string;
    role: string;
    avatar?: string;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Employee {
    id: number;
    name: string;
    phone: string;
    address: string;
    hire_date: Date | null;
    bank_name: string;
    account_number: string;
    account_name: string;
    basic_salary: number;
    paid_holidays: string;
    daily_overtime_pay: number;
    bpjs_health: string;
    bpjs_employment: string;
    income_tax: string;
    [key: string]: string | number | Date | Blob | File | null | undefined;
}

export interface Payroll {
    id: number;
    employee: Employee;
    period_month: string;
    period_year: string;
    total_attendance_days: string;
    paid_holidays: string;
    total_overtime_days: string;
    basic_salary: string;
    daily_overtime_pay: string;
    total_basic_salary: string;
    total_overtime_pay: string;
    gross_salary: string;
    bpjs_health_percent: string;
    bpjs_employment_percent: string;
    income_tax_percent: string;
    total_deduction_percent: string;
    total_deductions: string;
    net_salary: string;
    status: 'uncalculated' | 'paid' | 'unpaid';
}

export interface EmployeeAttendance {
    id: number;
    employee: Employee;
    date: string;
    clock_in: string | null;
    clock_out: string | null;
    status: 'not_started' | 'working' | 'finished' | 'leave';
}

export interface ModalProps {
    open: boolean;
    onClose: () => void;
}

export interface EmployeeModalProps extends ModalProps {
    employee: Employee | null;
}

export interface CreateModalProps extends ModalProps {
    createEmployee: (employee: Employee) => void;
}

export interface EditModalProps extends EmployeeModalProps {
    updateEmployee: (employee: Employee) => void;
}

export interface DeleteDialogProps extends EmployeeModalProps {
    deleteEmployee: (id: number) => void;
}

export interface PayrollModalProps extends ModalProps {
    payroll: Payroll | null;
}