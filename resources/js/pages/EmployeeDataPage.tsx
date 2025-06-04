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
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);

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
                cell: ({ row }) => row.getValue('name'),
            },
            { header: 'Username', cell: ({ row }) => row.original.user.username },
            { header: 'Telepon', cell: ({ row }) => row.original.phone ?? '-' },
            {
                header: 'Aksi',
                cell: ({ row }) => (
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
                                    setEditModalOpen(true);
                                }}
                            >
                                Edit Data Karyawan
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => {
                                    setSelectedEmployee(row.original);
                                    setDetailModalOpen(true);
                                }}
                            >
                                Lihat Detail Data Karyawan
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                    setSelectedEmployee(row.original);
                                    setDeleteModalOpen(true);
                                }}
                            >
                                Hapus Data Karyawan
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
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
                        className="mr-2 max-w-sm"
                    />

                    <Button onClick={() => setCreateModalOpen(true)} className="ml-auto" variant="secondary">
                        <Plus />
                        Tambah Karyawan
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
                                        Tidak ada data karyawan.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <CreateModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} createEmployee={createEmployee} />
            <EditModal open={editModalOpen} onClose={() => setEditModalOpen(false)} employee={selectedEmployee} updateEmployee={updateEmployee} />
            <DeleteModal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} employee={selectedEmployee} deleteEmployee={deleteEmployee} />
            <DetailModal open={detailModalOpen} onClose={() => setDetailModalOpen(false)} employee={selectedEmployee} />
        </AppLayout>
    );
}
