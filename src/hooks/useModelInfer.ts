// src/api/modelInfer.ts
import axios from "./useAxios";
import type { Result } from "../types/common/result";
import type { PageResult } from "../types/common/page";
import type { AlgoProfileVO } from "../types/vo/AlgoProfileVO";
import type { ModelRunVO } from "../types/vo/ModelRunVO";
import type { VehicleSelectVO } from "../types/vo/VehicleSelectVO";
import type { ModelRunCreateDTO } from "../types/dto/ModelRunCreateDTO";
import type { VehicleSelectDTO } from "../types/dto/VehicleSelectDTO";
import type { ModelRunBriefVO } from "../types/vo/ModelRunBriefVO";
import type { ModelRunPendingfVO } from "../types/vo/ModelRunPendingfVO";
import type { DatasetImportJobVO } from "../types/vo/DatasetImportJobVO";
import type { ImportJobQueryDTO } from "../types/dto/ImportJobQueryDTO";

/**
 * 获取已激活算法配置
 */
export const fetchAlgoProfiles = () =>
  axios.get<Result<AlgoProfileVO[]>>(
    "/model-run/algo_profiles"
  );

/**
 * 创建模型推理任务
 */
export const createModelRun = (dto: ModelRunCreateDTO) =>
  axios.post<Result<ModelRunVO>>(
    "/model-run/infer",
    dto
  );

/**
 * 车辆分页选择（用于数据集选择）
 */
export const fetchVehicles = (
  dto: VehicleSelectDTO,
  page = 1,
  pageSize = 20
) =>
  axios.get<Result<PageResult<VehicleSelectVO>>>(
    "/model-run/car",
    {
      params: {
        ...dto,
        page,
        page_size: pageSize,
      },
    }
  );

/**
 * 运行时任务回显（用于WS接口）
 */
export interface GetRunsParams {
  limit?: number; // 默认 3
  status?: "RUNNING" | "PENDING";
}

export const fetchRunningRuns = async (params: GetRunsParams = { limit: 3, status: "RUNNING" }) => {
  const res = await axios.get<Result<ModelRunBriefVO[]>>(
    "/model-run/running",
    { params }
  );

  if (res.code !== 1) {
    throw new Error(res.message || "获取任务失败");
  }
  return res.data || [];
};

/**
 * 排队时任务回显
 */
export const fetchPendingRuns = async (limit = 10): Promise<ModelRunPendingfVO[]> => {
  const res = await axios.get<Result<ModelRunPendingfVO[]>>("/model-run/pending", {
    params: { limit },
  });

  if (res.data === undefined || res.data === null) {
    throw new Error("获取等待任务失败");
  }

  return res.data;
};

/**
 * 获取数据导入任务列表
 */
export const fetchImportJobs = (
  query: ImportJobQueryDTO = {},
  page = 1,
  pageSize = 20
) =>
  axios.get<Result<DatasetImportJobVO[]>>(
    "/model-run/import_jobs",
    {
      params: {
        ...query,
        page,
        page_size: pageSize,
      },
    }
  );