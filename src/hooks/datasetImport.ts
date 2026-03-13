import axios from "../hooks/useAxios";

export interface ImportJob {
  id: number;
  source_path: string;
  vendor?: string;
  remark?: string;
  status: string;
  created_at: string;
  started_at?: string;
  finished_at?: string;
}

export function listImportJobs(params: any) {
  return axios.get("/files/dataset/import/", { params });
}

export function createImportJob(data: {
  source_path: string;
  vendor?: string;
  remark?: string;
  dataset_root?: string;
}) {
  return axios.post("/files/dataset/import/", null, { params: data });
}

export function runImportJob(jobId: number, data: any) {
  return axios.post(`/files/dataset/import/${jobId}/run`, data);
}

export function getImportJob(jobId: number) {
  return axios.get(`/files/dataset/import/${jobId}`);
}

/**
 * 取消导入作业
 * @param jobId 作业ID
 */
export function cancelImportJob(jobId: number) {
  return axios.post(`/files/dataset/import/${jobId}/cancel`);
}

/**
 * 删除导入作业（同时删除关联的物理文件）
 * @param jobId 作业ID
 */
export function deleteImportJob(jobId: number) {
  return axios.delete(`/files/dataset/import/${jobId}`);
}
