// src/types/common/result.ts
export interface Result<T> {
    code: number;
    msg: string;
    data: T;
  }
  