export interface RunStatsVO {
  total_runs: number
  running_runs: number
  success_runs: number
  failed_runs: number
}

export interface DatasetStatsVO {
  total_vehicles: number
  total_segments: number
}

export interface AnomalyStatsVO {
  vehicles_with_anomaly: number
  avg_score: number
  max_score: number
}

export interface ScoreBucketVO {
  bucket: string
  count: number
}

export interface RecentRunVO {
  id: number
  run_name: string
  model_type: string
  status: string
  created_at: string
}