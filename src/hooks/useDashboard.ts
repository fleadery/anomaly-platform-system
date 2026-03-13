// hooks/useDashboard.ts

import { useQuery } from "@tanstack/react-query";
import axios from "../hooks/useAxios";
import { getVisualizationJobStats } from "./useVisualizationJobs";

import type {
  RunStatsVO,
  DatasetStatsVO,
  AnomalyStatsVO,
  ScoreBucketVO,
  RecentRunVO
} from "../types/vo/DashboardVO";

import type { Result } from "../types/common/result";


// ==============================
// Run Statistics
// ==============================

export function useRunStats() {
  return useQuery({
    queryKey: ["dashboard", "run-stats"],
    queryFn: async () => {
      const res = await axios.get<Result<RunStatsVO>>("/dashboard/run-stats");
      return res.data;
    },
  });
}


// ==============================
// Dataset Statistics
// ==============================

export function useDatasetStats() {
  return useQuery({
    queryKey: ["dashboard", "dataset-stats"],
    queryFn: async () => {
      const res = await axios.get<Result<DatasetStatsVO>>("/dashboard/dataset-stats");
      return res.data;
    },
  });
}


// ==============================
// Anomaly Statistics
// ==============================

export function useAnomalyStats() {
  return useQuery({
    queryKey: ["dashboard", "anomaly-stats"],
    queryFn: async () => {
      const res = await axios.get<Result<AnomalyStatsVO>>("/dashboard/anomaly-stats");
      return res.data;
    },
  });
}


// ==============================
// Score Distribution
// ==============================

export function useScoreDistribution() {
  return useQuery({
    queryKey: ["dashboard", "score-distribution"],
    queryFn: async () => {
      const res = await axios.get<Result<ScoreBucketVO[]>>("/dashboard/score-distribution");
      return res.data;
    },
  });
}

// ==============================
// Recent Runs
// ==============================

export function useRecentRuns() {
  return useQuery({
    queryKey: ["dashboard", "recent-runs"],
    queryFn: async () => {
      const res = await axios.get<Result<RecentRunVO[]>>("/dashboard/recent-runs");
      return res.data;
    },
  });
}

export const useVisualizationJobStats = () => {
  return useQuery({
    queryKey: ["visualization-job-stats"],
    queryFn: getVisualizationJobStats,
    staleTime: 1000 * 60 * 5, // 5分钟缓存
    refetchOnWindowFocus: true,
  });
};