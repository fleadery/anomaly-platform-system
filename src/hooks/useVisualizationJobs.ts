// src/hooks/useVisualizationJobs.ts
import axios from "./useAxios";
import { useQuery } from "@tanstack/react-query";

export interface VisualizationJob {
  id: number;
  status?: string;
  result_path?: string;
  created_at?: string;
  updated_at?: string;
  progress?: number; // 进度百分比，0-100；如果后端没有这个字段，可以先不传，前端也能正常使用（显示为 undefined 或者不显示）。如果后端有这个字段，也可以加上：progress?: number;
  // 如果后端有 progress 字段，也可以加上：progress?: number;
}

export interface VisualizationJobStats {
  total: number;
  running: number;
  success: number;
  failed: number;
}

export interface VisualizationJobPage {
  total: number;
  total_pages: number;
  records: VisualizationJob[];
}

// 列表（你已有的）
export async function listVisualizationJobs(
  page: number,
  pageSize: number
): Promise<VisualizationJobPage> {
  const res = await axios.get("/visualization-jobs", {
    params: {
      page,
      page_size: pageSize,
    },
  });
  // 注意：你的 axios 拦截器可能已返回 res.data，这里沿用你之前的约定
  return res.data;
}

// 删除（你已有的）
export async function deleteVisualizationJob(jobId: number) {
  const res = await axios.delete(`/visualization-jobs/${jobId}`);
  return res;
}

// ----------------- 新增：单条查询 -----------------
export async function getVisualizationJob(jobId: number) {
  const res = await axios.get(`/visualization-jobs/${jobId}`);
  return res.data;
}

/**
 * Hook: 查询单个 job 并在运行时自动轮询
 * @param jobId job id，传 undefined 或 null 将禁用查询
 */
export function useVisualizationJob(jobId?: number) {
  return useQuery({
    queryKey: ["visualization-job", jobId],
    queryFn: async () => {
      if (!jobId) return null;
      return getVisualizationJob(jobId);
    },
    enabled: !!jobId,
    // 当 job 返回且处于 running/active（不区分大小写）时，每 5s 自动轮询；否则不轮询
    refetchInterval: (data) => {
      const status = data?.status;
      if (!status) return false;
      const s = String(status).toLowerCase();
      return s === "running" || s === "active" ? 5000 : false;
    },
    staleTime: 1000 * 10,
  });
}

// 获取统计数据
export async function getVisualizationJobStats(): Promise<VisualizationJobStats> {
  const res = await axios.get("/visualization-jobs/stats");
  return res.data;
}