// src/hooks/useVisualization.ts

import { useMutation, useQuery } from '@tanstack/react-query';
import axiosInstance from './useAxios';
import type { UseQueryOptions } from '@tanstack/react-query';

import type { VisualizationJobCreateDTO } from '../types/dto/VisualizationJobCreateDTO';
import type {
  VisualizationJobResultVO,
  VisualizationJobDetailVO,
  ModelRunListVO
} from '../types/vo/VisualizationVO';

/**
 * 创建可视化任务
 */
export function useCreateVisualizationJob() {
  return useMutation({
    mutationFn: async (data: VisualizationJobCreateDTO) => {
      const res = await axiosInstance.post('/visualzation/jobs', data);

      // 统一解包 Result
      if (res.data.code !== 0) {
        throw new Error(res.data.message);
      }

      return res.data.data;
    }
  });
}

/**
 * 查询是否已有可视化结果（或任务状态）
 */
export function useVisualizationResult(run_id?: number, method?: string) {
  return useQuery({
    queryKey: ['visualizationResult', run_id, method],
    queryFn: async (): Promise<VisualizationJobResultVO> => {
      const res = await axiosInstance.get('/visualzation/result', {
        params: { run_id, method }
      });

      return res.data;
    },
    enabled: !!run_id && !!method,
    refetchInterval: (query) => {
      const data = query.state.data;

      if (!data) return 3000;

      if (data.status === 'SUCCESS' || data.status === 'FAILED') {
        return false;
      }

      return 3000;
    }
  });
}

/**
 * 查询任务详情（进度条）
 */
export function useVisualizationJobDetail(job_id?: number) {
  return useQuery<VisualizationJobDetailVO>({
    queryKey: ['visualizationJobDetail', job_id],
    queryFn: async () => {
      if (!job_id) throw new Error('job_id is required');
      const res = await axiosInstance.get(`/visualzation/jobs/${job_id}`);
      return res.data; // 确保返回 VO
    },
    enabled: !!job_id, // 仅当 job_id 有值才启用
    keepPreviousData: true, // 保留上次数据，避免进度条消失
    refetchInterval: (query) => {
      if (!job_id) return false;
      const data = query.data;
      if (!data) return 2000; // 初始轮询
      if (data.status === 'SUCCESS' || data.status === 'FAILED') return false; // 停止轮询
      return 2000; // 否则每 2 秒轮询
    },
  });
}

/**
 * 获取推理任务列表
 */
export function useModelRuns(
  params?: {
    dataset_scope?: "vendorA" | "vendorB";
    keyword?: string;
    created_from?: string;
    created_to?: string;
  },
  queryOptions?: UseQueryOptions<ModelRunListVO[], Error>
) {
  return useQuery<ModelRunListVO[]>({
    queryKey: ['modelRuns', params],
    queryFn: async (): Promise<ModelRunListVO[]> => {
      const res = await axiosInstance.get('/visualzation/model_runs', {
        params: {
          dataset_scope: params?.dataset_scope || undefined,
          keyword: params?.keyword || undefined,
          created_from: params?.created_from || undefined,
          created_to: params?.created_to || undefined
        }
      });

      // 视后端返回结构而定，这里按你其他 hook 的做法直接返回 res.data
      return res.data;
    },
    // 将传入的 queryOptions 展开（例如 enabled）
    ...(queryOptions as any)
  });
}

/**
 * 下载可视化结果（npy）
 */
export async function downloadVisualizationData(job_id: number) {
  const res = await axiosInstance.get(
    `/visualzation/jobs/${job_id}/data`,
    { responseType: 'blob' }
  );

  // 关键修复：res.data
  const url = window.URL.createObjectURL(new Blob([res.data]));

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'result.npy');

  document.body.appendChild(link);
  link.click();
  link.remove();
}