export type VehicleVO = {
    id: number;
    vehicle_id: number;
    vehicle_code: string;
    score: number;
    score_type: string;
    is_anomaly: boolean;
    created_at: string;
    vendor?: string | null;
  };
  