export type VehicleResultQueryDTO = {
    is_anomaly?: boolean;
  
    min_score?: number;
    max_score?: number;
  
    sort_by?: "score_value" | "vehicle_id" | "created_at";
    sort_desc?: boolean;
  };
  