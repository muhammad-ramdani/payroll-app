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
}

export interface Shift {
    id: number;
    user: User;
    shift_type: 'Pagi' | 'Siang';
}

export interface ShiftSwapPageProps {
    receivedRequests: RawShiftSwap[];
    // sentRequests: RawShiftSwap[];
}

export interface ShiftForEmployeePageProps {
    userShifts: Shift[];
    otherShifts: Shift[];
    sentRequests: RawShiftSwap[];
    globalPendingShiftIds: number[];
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
    paid_holidays: number;
    daily_overtime_pay: number;
    bpjs_health: number;
    bpjs_employment: number;
    income_tax: number;
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
    bonus_amount: number;
    penalty_amount: number;
    total_punctual_days: number;
    total_late_days: number;
    total_bonus: number;
    total_penalty: number;
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
    shift_type: 'Pagi' | 'Siang';
    date: string;
    clock_in: string | null;
    clock_out: string | null;
    status: 'not_started' | 'working' | 'finished' | 'leave' | 'sick';
}

export interface ModalProps {
    open: boolean;
    onClose: () => void;
}

export interface PersonalDataProps {
    employee: Employee;
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

export interface AttendanceBonusPenaltySetting {
    id: number;
    bonus_amount: number;
    penalty_amount: number;
}

export interface AttendanceRule {
    id: number;
    shift_type: 'Pagi' | 'Siang';
    punctual_end: string;
    late_threshold: string;
    attendance_bonus_penalty_setting: AttendanceBonusPenaltySetting;
}

export interface AttendanceRuleSettingPageProps {
    attendanceRuleSettings: AttendanceRule[];
}

export interface ShopProfile {
    shop_name: string;
    address: string;
    phone: string;
}

export interface ShopProfileProps {
    shopProfile: ShopProfile;
}