import DeleteDialog from '@/components/data-karyawan/DeleteDialog';
import DetailModal from '@/components/data-karyawan/DetailModal';
import EditModal from '@/components/data-karyawan/EditModal';
import CreateModal from '@/components/data-karyawan/create-modal';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Employee } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import {
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronDown, MoreHorizontal } from 'lucide-react';
import * as React from 'react';

export default function DataKaryawan() {
    const [employees, setEmployees] = React.useState<Employee[]>(usePage<{ employees: Employee[] }>().props.employees);
    const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = React.useState(false);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);

    const table = useReactTable({
        data: employees,
        columns: [
            {
                accessorKey: 'name',
                header: ({ column }) => (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Nama
                        <ArrowUpDown />
                    </Button>
                ),
                cell: ({ row }) => <div>{row.getValue('name')}</div>,
            },
            {
                accessorKey: 'phone',
                header: 'Telepon',
                cell: ({ row }) => <div>{row.getValue('phone')}</div>,
            },
            {
                accessorKey: 'address',
                header: 'Alamat',
                cell: ({ row }) => <div>{row.getValue('address')}</div>,
            },
            {
                id: 'actions',
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
                                        setIsEditDialogOpen(true);
                                    }}
                                >
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setSelectedEmployee(row.original);
                                        setIsDetailDialogOpen(true);
                                    }}
                                >
                                    Lihat Detail
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => {
                                        setSelectedEmployee(row.original);
                                        setIsDialogOpen(true);
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
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
        },
    });

    const updateEmployee = (updatedEmployee: Employee) =>
        setEmployees((prev) => prev.map((employee) => (employee.id === updatedEmployee.id ? updatedEmployee : employee)));

    const createEmployee = (newEmployee: Employee) => setEmployees((prev) => [...prev, newEmployee]);

    const deleteEmployee = (id: number) => setEmployees((prev) => prev.filter((employee) => employee.id !== id));

    return (
        <AppLayout>
            <Head title="Data Karyawan" />
            <div className="w-full p-4">
                <div className="flex items-center py-4">
                    <Input
                        placeholder="Cari karyawan..."
                        value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                        onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
                        className="max-w-sm"
                    />
                    <button onClick={() => setIsCreateModalOpen(true)} className="ml-auto rounded bg-blue-600 px-4 py-2 text-white">
                        Tambah Karyawan
                    </button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="ml-2">
                                Columns <ChevronDown />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
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

            <CreateModal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} addEmployee={createEmployee} />
            <DetailModal open={isDetailDialogOpen} onClose={() => setIsDetailDialogOpen(false)} employee={selectedEmployee} />
            <EditModal open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} employee={selectedEmployee} onUpdate={updateEmployee} />
            <DeleteDialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} onDelete={deleteEmployee} employee={selectedEmployee} />
        </AppLayout>
    );
}
