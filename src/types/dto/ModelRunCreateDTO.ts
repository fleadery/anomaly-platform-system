export interface ModelRunCreateDTO {
  run_name: string;
  algo_profile_id: number;
  vehicle_ids: number[];
  import_job_id: number;
}