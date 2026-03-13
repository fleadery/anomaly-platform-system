export interface DatasetImportJobVO {
  id: number;
  source_path: string;
  vendor?: string | null;
  status: string;
  total_files?: number | null;
  imported_files?: number | null;
  failed_files?: number | null;
  created_at: string;
  started_at?: string | null;
  finished_at?: string | null;
  remark?: string | null;
}