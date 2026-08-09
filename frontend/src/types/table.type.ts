import { ColumnDef } from "@tanstack/react-table";

export interface ICommonTableType<TData = any> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  isLoading?: boolean;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  totalItems?: number;
  searchPlaceholder?: string;
  onSearch?: (search: string) => void;
  className?: string;
}
