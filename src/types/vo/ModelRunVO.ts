export interface ModelRunVO {
    id: number;
    run_name: string;
    model_type: string;
    dataset_scope: string;
    status: string;
    parameters: Record<string, unknown>;
    result_summary?: Record<string, unknown> | null;
    started_at?: string | null;
    ended_at?: string | null;
    last_heartbeat?: string | null;
    error_msg?: string | null;
    created_at?: string | null;
    remark?: string;
  }
  