import type { VehicleVO } from "../vo/VehicleVO";

export type ScoreBinItem = {
    score_bin: number;
    count: number;
  };
  
  export type ByScoreType = {
    p95: number;
    p99: number;
    top5: number;
  };
  
  export type RunVehicleSummary = {
    run_id: number;
  
    total_vehicles: number;
    anomaly_count: number;
    normal_count: number;
    anomaly_ratio: number;
  
    avg_score: number;
    score_std: number;
    max_score: number;
    min_score: number;
  
    score_distribution: ScoreBinItem[];
    by_score_type: ByScoreType;
  
    top_anomalies: VehicleVO[];
  };
  