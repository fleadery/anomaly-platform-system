// src/types/vo/RunRuntimeVO.ts
export interface RunRuntimeVO {
    run_id: number;
    status: string;     // RUNNING / SUCCESS / FAILED / STALE 
    stage: string | null;
    progress: number | null; // 0 ~ 100
    last_tick: string | null;
    message?: string;
  }
  