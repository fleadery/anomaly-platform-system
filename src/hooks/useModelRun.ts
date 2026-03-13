import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../hooks/useAxios";
import type { Result } from "../types/common/result";
import type { PageResult } from "../types/common/page";
import type { ModelRunListVO } from "../types/vo/ModelRunListVO";
import type { ModelRunVO } from "../types/vo/ModelRunVO";
import type { CancelRunVO } from "../types/vo/CancelRunVO";
import type { RetryRunVO } from "../types/vo/RetryRunVO";
import type { ModelRunQueryDTO } from "../types/dto/ModelRunQueryDTO";
import type { ModelRunUpdateDTO } from "../types/dto/ModelRunUpdateDTO";

export interface ModelRun {
  run_id: number;
  status: string;
  // 根据 ModelRunVO 补充字段
}

interface RunQueryParams {
  page: number;
  page_size: number;
  status?: string;
  created_at_from?: string;
  created_at_to?: string;
}

// 查询 Run 列表
export const useModelRuns = (
  page = 1,
  pageSize = 20,
  queryDTO: ModelRunQueryDTO = {}
) => {
  const [data, setData] = useState<ModelRunListVO[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRuns = useCallback(async () => {
    setLoading(true);
    try {
      // 将 queryDTO 的时间字段转成 ISO
      const fromISO = queryDTO.created_at_from ? new Date(queryDTO.created_at_from).toISOString() : undefined;
      const toISO = queryDTO.created_at_to ? new Date(queryDTO.created_at_to).toISOString() : undefined;
      const params: RunQueryParams = {
        page,
        page_size: pageSize,
        ...(queryDTO.status ? { status: queryDTO.status } : {}),
        ...(fromISO ? { created_at_from: fromISO } : {}),
        ...(toISO ? { created_at_to: toISO } : {}),
      };

      const res = await axios.get<Result<PageResult<ModelRunListVO>>>(
        "/runs/getruns",
        { params }
      );
      setData(res.data.records ?? []);
    } catch (error) {
      console.error("fetchRuns error:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, queryDTO.status, queryDTO.created_at_from, queryDTO.created_at_to]);

  // 初次加载或页码变化触发
  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  return { data, loading, fetchRuns };
};

export const useModelRunById = (runId: number) =>
  useQuery({
    queryKey: ['run', runId],
    queryFn: async () => {
      const res = await axios.get<Result<ModelRunListVO>>(`/runs/getruns/${runId}`);
      return res.data;
    },
    enabled: !!runId,
  });

// 获取单个 Run 状态
export const getModelRunStatus = async (run_id: number) => {
  return axios.get<Result<ModelRunVO>>(`/runs/runstatus/${run_id}`);
};

// 取消任务
export const cancelRun = (run_id: number) =>
  axios.post<Result<CancelRunVO>>(`/runs/${run_id}/cancel`);

// 重试任务
export const retryRun = (run_id: number) =>
  axios.post<Result<RetryRunVO>>(`/runs/${run_id}/retry`);

// 删除任务
export const deleteRun = async (run_id: number) => {
  return axios.delete(`/runs/${run_id}`);
};

// 修改任务信息
export const updateRun = (run_id: number, dto: ModelRunUpdateDTO) =>
  axios.put<Result<ModelRunVO>>(`/runs/${run_id}`, dto);
