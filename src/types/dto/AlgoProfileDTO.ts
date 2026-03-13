export interface AlgoProfile {
  id: number;
  vendor: string;
  model_type: string;
  model_path: string;
  mean_path: string;
  std_path: string;
  center_path?: string | null;
  score_method: string;
  score_params: Record<string, any>;
  threshold: number;
  version: number;
  is_active: boolean;
  remark?: string | null;
  created_at: string;
}

export interface PageResult<T> {
  total: number;
  total_pages: number;
  records: T[];
}

export interface Result<T> {
  code: number;
  msg: string;
  data: T;
}