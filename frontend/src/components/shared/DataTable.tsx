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
import { Skeleton, SkeletonBadge } from '@/components/ui/skeleton';

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
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder || 'Search table...'}
            value={globalFilter}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 input-field"
          />
        </div>

        {/* Rows Count Info */}
        <div className="text-xs text-muted-foreground font-medium">
          Showing {table.getRowModel().rows.length} of {tableData.length} entries
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-border hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-foreground font-semibold text-xs uppercase tracking-wider">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-border">
                  {columns.map((_, j) => (
                    <TableCell key={j} className="py-3.5">
                      {j === 0 ? (
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-48 rounded-md" />
                          <Skeleton className="h-3 w-32 rounded-xs" />
                        </div>
                      ) : j === columns.length - 1 ? (
                        <SkeletonBadge width="w-20" className="h-7" />
                      ) : (
                        <SkeletonBadge width={j % 2 === 0 ? 'w-24' : 'w-16'} />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="border-border hover:bg-secondary/40 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-foreground text-xs">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground text-xs font-medium">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* TanStack Table Pagination Controls */}
      <div className="flex items-center justify-between text-xs text-muted-foreground font-medium pt-2">
        <div className="flex items-center space-x-2">
          <span>Rows per page:</span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="bg-card border border-border text-foreground rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring text-xs font-semibold"
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
                className="h-8 w-8 p-0 btn-outline"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span>
                Page <strong className="text-foreground">{currentPage}</strong> of <strong className="text-foreground">{totalPages}</strong>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange!(currentPage! + 1)}
                disabled={currentPage! >= totalPages! || isLoading}
                className="h-8 w-8 p-0 btn-outline"
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
                className="h-8 w-8 p-0 btn-outline"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage() || isLoading}
                className="h-8 w-8 p-0 btn-outline"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span>
                Page <strong className="text-foreground">{table.getState().pagination.pageIndex + 1}</strong> of{' '}
                <strong className="text-foreground">{table.getPageCount() || 1}</strong>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage() || isLoading}
                className="h-8 w-8 p-0 btn-outline"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(Math.max(0, table.getPageCount() - 1))}
                disabled={!table.getCanNextPage() || isLoading}
                className="h-8 w-8 p-0 btn-outline"
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
