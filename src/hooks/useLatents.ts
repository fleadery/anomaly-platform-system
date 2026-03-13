import axios from "./useAxios"
import type { Result } from "../types/common/result"
import type { LatentPageVO, LatentStatsVO } from "../types/vo/LatentMetaVO"

export async function listLatentsByRun(
  runId: number,
  page = 1,
  pageSize = 20
): Promise<LatentPageVO> {

  const res: Result<LatentPageVO> = await axios.get(
    `/files/latents/run/${runId}`,
    {
      params: {
        page,
        page_size: pageSize
      }
    }
  )

  return res.data
}

export async function getLatentStats(
  runId: number
): Promise<LatentStatsVO> {

  const res: Result<LatentStatsVO> = await axios.get(
    `/files/latents/run/${runId}/stats`
  )

  return res.data
}

export async function deleteRunLatents(
  runId: number
): Promise<{ deleted_files: number }> {

  const res: Result<{ deleted_files: number }> = await axios.delete(
    `/files/latents/run/${runId}`
  )

  return res.data
}

export async function checkLatentExists(
  runId: number
): Promise<boolean> {

  const res: Result<{ exists: boolean }> = await axios.get(
    `/files/latents/run/${runId}/exists`
  )

  return res.data.exists
}