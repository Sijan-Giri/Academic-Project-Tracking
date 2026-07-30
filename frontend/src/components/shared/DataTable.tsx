import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  searchPlaceholder?: string;
  onSearch?: (term: string) => void;
}

export default function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  totalPages = 1,
  currentPage = 1,
  onPageChange,
  searchPlaceholder,
  onSearch,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      {onSearch && (
        <div className="flex items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder={searchPlaceholder || 'Search...'}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      )}
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
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
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-gray-400">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {onPageChange && totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1 || isLoading}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Previous
          </Button>
          <span className="text-sm text-gray-400">Page {currentPage} of {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages || isLoading}>
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
