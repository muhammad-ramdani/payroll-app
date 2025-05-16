'use client';

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContentRp } from '@/components/ui/chart';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Payroll } from '@/types';
import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

export default function PayrollReportPage({ payrolls }: { payrolls: Payroll[] }) {
    const [selectedSalaryType, setSelectedSalaryType] = useState<'net_salary' | 'gross_salary'>('net_salary');
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    // Get available years from payroll data
    const availableYears = useMemo(() => {
        const years = Array.from(new Set(payrolls.map((p) => p.period_year)));
        return years.sort((a, b) => b - a);
    }, [payrolls]);

    // Update selected year if not in available years
    useEffect(() => {
        if (!availableYears.includes(selectedYear) && availableYears.length > 0) {
            setSelectedYear(availableYears[0]);
        }
    }, [availableYears, selectedYear]);

    // Prepare chart data
    const chartData = useMemo(() => {
        const monthlyData = Array.from({ length: 12 }, (_, i) => ({
            month: new Date(selectedYear, i).toLocaleString('id-ID', { month: 'long' }),
            total: 0,
        }));

        payrolls
            .filter((p) => p.period_year === selectedYear)
            .forEach((p) => {
                const monthIndex = p.period_month - 1;
                monthlyData[monthIndex].total += p[selectedSalaryType];
            });

        return monthlyData;
    }, [payrolls, selectedYear, selectedSalaryType]);

    // Chart configuration
    const chartConfig = useMemo(
        () => ({
            total: {
                label: selectedSalaryType === 'net_salary' ? 'Gaji Bersih' : 'Gaji Kotor',
                color: selectedSalaryType === 'net_salary' ? '#2563eb' : '#60a5fa',
            },
        }),
        [selectedSalaryType],
    ) satisfies ChartConfig;

    return (
        <AppLayout breadcrumbs={[{ title: 'Laporan Penggajian', href: '/' }]}>
            <Head title="Laporan Penggajian" />
            <div className="space-y-4 p-4">
                <div className="flex gap-4">
                    <Select value={selectedSalaryType} onValueChange={(value) => setSelectedSalaryType(value as typeof selectedSalaryType)}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Pilih Jenis Gaji" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="net_salary">Gaji Bersih</SelectItem>
                            <SelectItem value="gross_salary">Gaji Kotor</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue>{selectedYear}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {availableYears.map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <ScrollArea className="pb-4">
                    <ChartContainer config={chartConfig} className="min-h-[80vh] sm:min-h-auto">
                        <BarChart data={chartData}>
                            <CartesianGrid vertical={false} strokeDasharray="5 5" />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} tickFormatter={(value) => value.slice(0, 3)} />
                            <YAxis axisLine={false} tickCount={7} tickFormatter={(value) => `${new Intl.NumberFormat('id-ID').format(value)}`} padding={{ top: 20 }} width={80} />
                            <ChartTooltip content={<ChartTooltipContentRp />} />
                            <Bar dataKey="total" fill="var(--color-total)" radius={[8, 8, 0, 0]} barSize={50} />
                        </BarChart>
                    </ChartContainer>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
        </AppLayout>
    );
}
