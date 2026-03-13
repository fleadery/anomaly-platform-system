export interface AlgoProfileVO {
    id: number;
    vendor: string;
    model_type: string;
    model_path: string;
    mean_path: string;
    std_path: string;
    score_method: string;
    score_params: Record<string, unknown>;
    threshold: number;
    version: number;
    is_active: boolean;
    remark?: string;
  }
  