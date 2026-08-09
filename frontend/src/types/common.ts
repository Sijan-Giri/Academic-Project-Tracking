export interface IApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
}

export interface IPaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ISelectOption {
  label: string;
  value: string | number;
}

export interface IQueryFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: any;
}
