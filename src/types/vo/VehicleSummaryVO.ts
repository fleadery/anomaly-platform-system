// app/types/vo/VehicleSummaryVO.ts

export interface TopVehicleVO {
    vehicle_id: number;
    score: number;
  }
  
export interface VehicleSummaryVO {
    total: number;
    abnormal: number;
    normal: number;
    abnormal_ratio: number;
    top_abnormal: TopVehicleVO[];
}
  