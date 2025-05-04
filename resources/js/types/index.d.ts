/* eslint-disable @typescript-eslint/no-explicit-any */
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

export interface NavReportItem {
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
    id: string;
    name: string;
    username: string;
    role: string;
    created_at: string;
    updated_at: string;
}

export interface Employee {
    id: string;
    user: User;
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
    [key: string]: any;
}

export interface Payroll {
    id: number;
    user: User;
    period_month: number;
    period_year: number;
    total_attendance_days: number;
    paid_holidays: number;
    total_overtime_days: number;
    basic_salary: number;
    daily_overtime_pay: number;
    total_basic_salary: number;
    total_overtime_pay: number;
    gross_salary: number;
    bpjs_health_percent: number;
    bpjs_employment_percent: number;
    income_tax_percent: number;
    total_deduction_percent: number;
    total_deductions: number;
    net_salary: number;
    salary_status: 'uncalculated' | 'unpaid' | 'paid_transfer' | 'paid_cash';
    confirmation_status: 'blank' | 'pending_confirmation' | 'received';
}

export interface Attendance {
    id: number;
    user: User;
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
    createEmployee: (data: Employee) => void;
}

export interface EditModalProps extends EmployeeModalProps {
    updateEmployee: (data: Employee) => void;
}

export interface DeleteModalProps extends EmployeeModalProps {
    deleteEmployee: (id: string) => void;
}

export interface PayrollModalProps extends ModalProps {
    payroll: Payroll | null;
}