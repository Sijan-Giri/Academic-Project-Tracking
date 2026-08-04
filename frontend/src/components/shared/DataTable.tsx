import { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data?: TData[];
  isLoading?: boolean;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  searchPlaceholder?: string;
  onSearch?: (term: string) => void;
  pageSize?: number;
}

export default function DataTable<TData, TValue>({
  columns,
  data = [],
  isLoading = false,
  totalPages,
  currentPage,
  onPageChange,
  searchPlaceholder,
  onSearch,
  pageSize = 10,
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: pageSize,
  });

  const isServerPagination = typeof onPageChange === 'function' && typeof totalPages === 'number';
  const tableData = Array.isArray(data) ? data : [];

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: isServerPagination,
    pageCount: isServerPagination ? totalPages : undefined,
    state: {
      globalFilter,
      pagination: isServerPagination
        ? { pageIndex: Math.max(0, (currentPage || 1) - 1), pageSize }
        : pagination,
    },
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
  });

  const handleSearchChange = (value: string) => {
    setGlobalFilter(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 dark:text-gray-400 text-slate-400" />
          <Input
            placeholder={searchPlaceholder || 'Search table...'}
            value={globalFilter}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 dark:bg-white/5 dark:border-white/10 dark:text-white bg-white border-slate-200 text-slate-900 dark:placeholder:text-gray-500 placeholder:text-slate-400"
          />
        </div>

        {/* Rows Count Info */}
        <div className="text-xs dark:text-gray-400 text-slate-500">
          Showing {table.getRowModel().rows.length} of {tableData.length} entries
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl dark:border-white/10 dark:bg-white/5 border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="dark:bg-white/5 bg-slate-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="dark:border-white/10 border-slate-200 hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="dark:text-gray-300 text-slate-700 font-semibold">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="dark:border-white/10 border-slate-200">
                  {columns.map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-6 w-full dark:bg-white/10 bg-slate-200" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="dark:border-white/5 border-slate-100 dark:hover:bg-white/5 hover:bg-slate-50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="dark:text-gray-300 text-slate-700">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center dark:text-gray-400 text-slate-500">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* TanStack Table Pagination Controls */}
      <div className="flex items-center justify-between text-xs dark:text-gray-400 text-slate-500 pt-2">
        <div className="flex items-center space-x-2">
          <span>Rows per page:</span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="dark:bg-[#1e1e2e] dark:border-white/10 dark:text-white bg-white border-slate-300 text-slate-900 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {[5, 10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          {isServerPagination ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange!(currentPage! - 1)}
                disabled={currentPage! <= 1 || isLoading}
                className="h-8 w-8 p-0 dark:border-white/10 border-slate-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span>
                Page <strong className="dark:text-white text-slate-900">{currentPage}</strong> of <strong className="dark:text-white text-slate-900">{totalPages}</strong>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange!(currentPage! + 1)}
                disabled={currentPage! >= totalPages! || isLoading}
                className="h-8 w-8 p-0 dark:border-white/10 border-slate-300"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage() || isLoading}
                className="h-8 w-8 p-0 dark:border-white/10 border-slate-300"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage() || isLoading}
                className="h-8 w-8 p-0 dark:border-white/10 border-slate-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span>
                Page <strong className="dark:text-white text-slate-900">{table.getState().pagination.pageIndex + 1}</strong> of{' '}
                <strong className="dark:text-white text-slate-900">{table.getPageCount() || 1}</strong>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage() || isLoading}
                className="h-8 w-8 p-0 dark:border-white/10 border-slate-300"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(Math.max(0, table.getPageCount() - 1))}
                disabled={!table.getCanNextPage() || isLoading}
                className="h-8 w-8 p-0 dark:border-white/10 border-slate-300"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
