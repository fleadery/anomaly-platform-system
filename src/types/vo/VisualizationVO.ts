// src/hooks/VisualizationVO.ts

export interface VisualizationJobResultVO {
  exists: boolean;
  job_id?: number;
  status?: string;
  result_path?: string;
  points?: [number, number][]; // 新增字段，用于直接渲染
}

export interface VisualizationJobDetailVO {
  id: number;
  status: string;
  progress: number;
  phase?: string;
  result_path?: string;
  error_msg?: string;
  started_at?: string;
  finished_at?: string;
}

export interface ModelRunListVO {
  id: number;
  run_name?: string;
  status: string;
  created_at: string;
}