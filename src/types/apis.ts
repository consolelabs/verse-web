export interface Response<T> {
  data: T[];
}

export interface Pagination {
  page: number;
  size: number;
  total: number;
}

export type FullResponse<T> = Response<T> & Pagination;
