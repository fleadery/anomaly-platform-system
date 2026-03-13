import type { PaginatedVehicles } from './../types/vo/PaginatedVehicles';
import { useState, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import axiosInstance from "./useAxios";
import type { VehicleSummaryVO } from "../types/vo/VehicleSummaryVO";

import type { VehicleResultQueryDTO } from "../types/dto/VehicleResultQueryDTO";
import axios from "../hooks/useAxios";

interface UseVehicleSummaryProps {
  runId: number;
  topN?: number;
}

export function useVehicleSummary({ runId, topN = 3 }: UseVehicleSummaryProps) {
  const [data, setData] = useState<VehicleSummaryVO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let canceled = false;

    async function fetchSummary() {
      setLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.get(`/runs/${runId}/vehicles/summary/general`, {
          params: { top_n: topN },
        });

        if (!canceled) {
          // axiosInstance 的响应拦截器已经返回 data，所以这里直接是 Result[VehicleSummaryVO]
          if (response.code === 1) {
            setData(response.data);
          } else {
            setError(response.msg || "获取车辆概况失败");
          }
        }
      } catch (err: any) {
        if (!canceled) setError(err.message || "请求失败");
      } finally {
        if (!canceled) setLoading(false);
      }
    }

    fetchSummary();

    return () => {
      canceled = true;
    };
  }, [runId, topN]);

  return { data, loading, error };
}

export function useVehicleResults(
  runId: number,
  dto: VehicleResultQueryDTO,
  page: number,
  pageSize: number
) {
  return useQuery({
    queryKey: ["run-vehicles", runId, dto, page, pageSize],

    queryFn: async () => {
      const res = await axios.get<PaginatedVehicles>(
        `/runs/${runId}/vehicles`,
        {
          params: {
            ...dto,
            page,
            page_size: pageSize,
          },
        }
      );

      return res.data;
    },

    placeholderData: keepPreviousData,
  });
}
