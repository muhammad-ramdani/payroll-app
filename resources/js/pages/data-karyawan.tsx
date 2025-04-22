import DeleteDialog from '@/components/data-karyawan/DeleteDialog';
import DetailModal from '@/components/data-karyawan/DetailModal';
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

    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = React.useState(false);
    const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);
    const [copiedField, setCopiedField] = React.useState<string | null>(null); // State untuk melacak tombol yang diklik

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
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setSelectedEmployee(row.original); // Simpan data karyawan yang dipilih
                                        setIsDetailDialogOpen(true); // Buka dialog
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

    const handleDelete = async () => {
        if (selectedEmployee) {
            try {
                const response = await fetch(`/employees/${selectedEmployee.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                });
                if (response.ok) {
                    setEmployees((prevEmployees) => prevEmployees.filter((employee) => employee.id !== selectedEmployee.id));
                    setIsDialogOpen(false);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Terjadi kesalahan saat menghapus data.');
            }
        }
    };

    const handleCopy = (field: string, value: string) => {
        navigator.clipboard.writeText(value);
        setCopiedField(field); // Tandai field yang telah disalin
        setTimeout(() => setCopiedField(null), 2000); // Reset setelah 2 detik
    };

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
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="ml-auto">
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

            <DetailModal
                open={isDetailDialogOpen}
                onClose={setIsDetailDialogOpen}
                selectedEmployee={selectedEmployee}
                handleCopy={handleCopy}
                copiedField={copiedField}
            />

            <DeleteDialog open={isDialogOpen} onClose={setIsDialogOpen} onDelete={handleDelete} />
        </AppLayout>
    );
}
