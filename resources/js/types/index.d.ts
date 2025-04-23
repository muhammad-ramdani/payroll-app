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
    hire_date: Date;
    bank_name: string;
    account_number: string;
    account_name: string;
    basic_salary: number;
    paid_holidays: number;
    daily_allowance: number;
    bpjs_health: number;
    bpjs_employment: number;
    income_tax: number;
}

export interface ModalProps {
    open: boolean;
    onClose: () => void;
}

export interface EmployeeModalProps extends ModalProps {
    employee: Employee | null;
}

export interface CreateModalProps extends ModalProps {
    addEmployee: (employee: Employee) => void;
}

export interface EditModalProps extends EmployeeModalProps {
    onUpdate: (employee: Employee) => void;
}

export interface DeleteDialogProps extends EmployeeModalProps {
    onDelete: (id: number) => void;
}