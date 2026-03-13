import type { VehicleVO } from "./VehicleVO";

export type PaginatedVehicles = {
    total: number;
    total_pages: number;
    records: VehicleVO[];
  };
  