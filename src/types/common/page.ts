// src/types/common/page.ts
export interface PageResult<T> {
    total: number;
    total_pages: number;
    records: T[];
  }
  