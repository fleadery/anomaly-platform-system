export interface RunningTaskVM {
    id: number;
    run_name?: string;
    model_type: string;
    created_at?: string;
  
    // runtime（来自 WS）
    status: string;
    stage?: string;
    progress?: number;
    last_tick?: string;
  }