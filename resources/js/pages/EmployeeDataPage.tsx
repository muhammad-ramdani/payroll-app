// EmployeeDataPage.tsx
import CreateModal from '@/components/employee-components/CreateModal';
import DeleteModal from '@/components/employee-components/DeleteModal';
import DetailModal from '@/components/employee-components/DetailModal';
import EditModal from '@/components/employee-components/EditModal';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Employee } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal, Plus } from 'lucide-react';
import { useState } from 'react';

export default function DataKaryawan() {
    const [employees, setEmployees] = useState<Employee[]>(usePage<{ employees: Employee[] }>().props.employees);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const table = useReactTable({
        data: employees,
        columns: [
            {
                accessorKey: 'name',
                accessorFn: (row) => row.user.name,
                header: ({ column }) => (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Nama
                        <ArrowUpDown />
                    </Button>
                ),
                cell: ({ row }) => <div>{row.getValue('name')}</div>,
            },
            {
                header: 'Username',
                cell: ({ row }) => <div>{row.original.user.username}</div>,
            },
            {
                header: 'Telepon',
                cell: ({ row }) => <div>{row.original.phone ?? '-'}</div>,
            },
            {
                header: 'Aksi',
                cell: ({ row }) => {
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => {
                                        setSelectedEmployee(row.original);
                                        setIsEditModalOpen(true);
                                    }}
                                >
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setSelectedEmployee(row.original);
                                        setIsDetailModalOpen(true);
                                    }}
                                >
                                    Lihat Detail
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => {
                                        setSelectedEmployee(row.original);
                                        setIsDeleteModalOpen(true);
                                    }}
                                >
                                    Hapus
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
            },
        ],
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    const updateEmployee = (updatedEmployee: Employee) => setEmployees((prev) => prev.map((emp) => (emp.id === updatedEmployee.id ? updatedEmployee : emp)));

    const createEmployee = (newEmployee: Employee) => setEmployees((prev) => [...prev, newEmployee]);

    const deleteEmployee = (id: string) => setEmployees((prev) => prev.filter((emp) => emp.id !== id));

    return (
        <AppLayout breadcrumbs={[{ title: 'Data Karyawan', href: '/' }]}>
            <Head title="Data Karyawan" />
            <div className="w-full p-4">
                <div className="flex items-center py-4">
                    <Input
                        placeholder="Cari nama karyawan..."
                        value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                        onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
                        className="max-w-sm"
                    />

                    <Button onClick={() => setIsCreateModalOpen(true)} className="mx-2" variant="secondary">
                        <Plus />
                        Tambah
                    </Button>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                                        Tidak ada data.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <CreateModal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} createEmployee={createEmployee} />
            <EditModal open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} employee={selectedEmployee} updateEmployee={updateEmployee} />
            <DeleteModal open={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} employee={selectedEmployee} deleteEmployee={deleteEmployee} />
            <DetailModal open={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} employee={selectedEmployee} />
        </AppLayout>
    );
}
