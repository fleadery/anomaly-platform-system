// hooks/useAlgoProfiles.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "./useAxios"; // 用你封装好的 axios
import type { AlgoProfile, PageResult, Result } from "../types/dto/AlgoProfileDTO";

// ---------- 查询列表 ----------
export function useAlgoProfiles(
  page: number = 1,
  pageSize: number = 20,
  vendor?: string,
  modelType?: string
) {
  return useQuery<Result<PageResult<AlgoProfile>>>({
    queryKey: ["algoProfiles", page, pageSize, vendor, modelType],
    queryFn: () =>
      axiosInstance.get("/algo/", {
        params: { page, page_size: pageSize, vendor, model_type: modelType },
      }),
  });
}

// ---------- 查询激活 ----------
export function useActiveProfile(vendor?: string, modelType?: string) {
  return useQuery<Result<AlgoProfile | null>>({
    queryKey: ["algoActiveProfile", vendor, modelType],
    queryFn: () =>
      axiosInstance.get("/algo/active", {
        params: { vendor, model_type: modelType },
      }),
    staleTime: 60 * 1000,
  });
}

// ---------- 创建 ----------
export function useCreateAlgoProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<AlgoProfile>) =>
      axiosInstance.post("/algo/", payload),
    onSuccess: () => queryClient.invalidateQueries(["algoProfiles"]),
  });
}

// ---------- 更新 ----------
export function useUpdateAlgoProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<AlgoProfile> }) =>
      axiosInstance.put(`/algo/${id}`, payload),
    onSuccess: () => queryClient.invalidateQueries(["algoProfiles"]),
  });
}

// ---------- 激活 ----------
export function useActivateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => axiosInstance.post(`/algo/${id}/activate`),
    onSuccess: () => {
      queryClient.invalidateQueries(["algoProfiles"]);
      queryClient.invalidateQueries(["algoActiveProfile"]);
    },
  });
}