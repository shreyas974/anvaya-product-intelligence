export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp?: string;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error: string;
  statusCode: number;
  details?: ApiErrorDetail[];
  timestamp?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export class HttpError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly responseData?: unknown;

  constructor(status: number, statusText: string, responseData?: unknown, message?: string) {
    super(message || `HTTP ${status}: ${statusText}`);
    this.name = 'HttpError';
    this.status = status;
    this.statusText = statusText;
    this.responseData = responseData;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}
