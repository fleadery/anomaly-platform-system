// src/types/vo/LatentMetaVO.ts
import type { PageResult } from "../common/page"


export interface LatentMetaVO {
  id: number
  run_id: number
  segment_id: number
  path: string
  created_at: string
}

export interface LatentPageVO {
  run_id: number
  page: number
  page_size: number
  data: PageResult<LatentMetaVO>
}

export interface LatentStatsVO {
  total_files: number
  total_size: number
}