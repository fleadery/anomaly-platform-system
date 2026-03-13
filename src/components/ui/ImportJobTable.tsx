import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { formatDistanceToNow, format } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  listImportJobs,
  runImportJob,
  cancelImportJob,
  deleteImportJob,
  getImportJob,
} from "../../hooks/datasetImport";
import JobDetailModal, { StatusBadge } from "./JobDetailModalDialog";

// ---------- 图标组件 ----------
const PlayIcon = () => (
  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const StopIcon = () => (
  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const RefreshIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

const SpinnerIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);


interface ImportJobTableProps {
  refreshTrigger?: number;
}

export default function ImportJobTable({ refreshTrigger }: ImportJobTableProps) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  // 详情弹窗状态
  const [detailJob, setDetailJob] = useState<any>(null);

  // ---------- 辅助函数 ----------
  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return formatDistanceToNow(date, { addSuffix: true, locale: zhCN });
    }
    return format(date, "yyyy-MM-dd HH:mm");
  };

  const calculateProgress = (imported: number | null, total: number | null) => {
    if (imported === null || total === null || total === 0) return null;
    return Math.round((imported / total) * 100);
  };

  const getDuration = (start: string | null, finish: string | null) => {
    if (!start || !finish) return "-";
    const diff = new Date(finish).getTime() - new Date(start).getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return minutes > 0 ? `${minutes}分${seconds}秒` : `${seconds}秒`;
  };

  // ---------- 数据获取 ----------
  async function fetchJobs() {
    setLoading(true);
    try {
      const res = await listImportJobs({ page: 1, page_size: 20 });
      setJobs(res.list);
    } catch (error: any) {
      toast.error("获取任务列表失败：" + error.message);
    } finally {
      setLoading(false);
    }
  }

  // ---------- 操作处理 ----------
  async function handleRun(jobId: number) {
    try {
      await runImportJob(jobId, {});
      toast.success("任务已启动");
      fetchJobs();
    } catch (error: any) {
      toast.error("运行失败：" + error.message);
    }
  }

  async function handleCancel(jobId: number) {
    if (!confirm("确定取消该任务吗？")) return;
    try {
      await cancelImportJob(jobId);
      toast.success("任务已取消");
      fetchJobs();
    } catch (error: any) {
      toast.error("取消失败：" + error.message);
    }
  }

  async function handleDelete(jobId: number) {
    if (!confirm("确定删除该作业及其文件吗？")) return;
    try {
      await deleteImportJob(jobId);
      toast.success("任务已删除");
      fetchJobs();
    } catch (error: any) {
      toast.error("删除失败：" + error.message);
    }
  }

  // 查看详情：获取完整数据并打开弹窗
  async function handleView(jobId: number) {
    try {
      const res = await getImportJob(jobId);
      setDetailJob(res);
    } catch (error: any) {
      toast.error("获取任务详情失败：" + error.message);
    }
  }

  function handleManualRefresh() {
    fetchJobs();
  }

  // ---------- 副作用 ----------
  useEffect(() => {
    fetchJobs();
  }, [refreshTrigger]);

  useEffect(() => {
    fetchJobs();
    const timer = setInterval(fetchJobs, 5000);
    return () => clearInterval(timer);
  }, []);

  // ---------- 渲染 ----------
  return (
    <>
      <div className="rounded-xl bg-white p-6 shadow-lg ring-1 ring-gray-200">
        {/* 头部区域 */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold leading-6 text-gray-900">导入任务列表</h2>
            <p className="mt-1 text-sm text-gray-500">
              每 5 秒自动刷新，可手动触发运行等待中的任务。
            </p>
          </div>
          <div className="mt-4 flex items-center gap-3 sm:mt-0">
            <button
              onClick={handleManualRefresh}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "刷新中..." : "刷新"}
            </button>
            {loading && (
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <SpinnerIcon className="h-4 w-4 animate-spin text-indigo-600" />
                自动刷新中
              </span>
            )}
          </div>
        </div>

        {/* 表格区域 */}
        <div className="mt-6 flow-root overflow-x-auto">
          <div className="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle">
              <table className="min-w-full table-auto divide-y divide-gray-200">
                <thead className="sticky top-0 z-10 bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 lg:pl-8">
                      ID
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      源路径
                    </th>
                    <th scope="col" className="hidden lg:table-cell px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      供应商
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      状态
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      进度
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      开始时间
                    </th>
                    <th scope="col" className="hidden xl:table-cell px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      完成时间
                    </th>
                    <th scope="col" className="hidden lg:table-cell px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      耗时
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 lg:pr-8">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {loading && jobs.length === 0 ? (
                    // 骨架屏
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="py-4 pl-4 pr-3 sm:pl-6 lg:pl-8"><div className="h-4 w-8 rounded bg-gray-200"></div></td>
                        <td className="px-3 py-4"><div className="h-4 w-32 rounded bg-gray-200"></div></td>
                        <td className="hidden lg:table-cell px-3 py-4"><div className="h-4 w-16 rounded bg-gray-200"></div></td>
                        <td className="px-3 py-4"><div className="h-4 w-20 rounded bg-gray-200"></div></td>
                        <td className="px-3 py-4"><div className="h-4 w-24 rounded bg-gray-200"></div></td>
                        <td className="px-3 py-4"><div className="h-4 w-28 rounded bg-gray-200"></div></td>
                        <td className="hidden xl:table-cell px-3 py-4"><div className="h-4 w-28 rounded bg-gray-200"></div></td>
                        <td className="hidden lg:table-cell px-3 py-4"><div className="h-4 w-16 rounded bg-gray-200"></div></td>
                        <td className="py-4 pl-3 pr-4 sm:pr-6 lg:pr-8"><div className="h-4 w-20 rounded bg-gray-200"></div></td>
                      </tr>
                    ))
                  ) : jobs.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-16 text-center">
                        <div className="flex flex-col items-center">
                          <svg className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          </svg>
                          <p className="mt-2 text-sm text-gray-500">暂无导入任务</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    jobs.map((job: any) => {
                      const progress = calculateProgress(job.imported_files, job.total_files);
                      const progressColor = {
                        RUNNING: "bg-blue-600",
                        SUCCESS: "bg-green-600",
                        FAILED: "bg-red-600",
                      }[job.status] || "bg-indigo-600";

                      return (
                        <tr key={job.id} className="transition-colors hover:bg-gray-50">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8">
                            {job.id}
                          </td>
                          <td className="max-w-xs truncate whitespace-nowrap px-3 py-4 text-sm text-gray-500" title={job.source_path}>
                            {job.source_path}
                          </td>
                          <td className="hidden whitespace-nowrap px-3 py-4 text-sm text-gray-500 lg:table-cell">
                            {job.vendor || "-"}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <StatusBadge status={job.status} failedCount={job.failed_files} />
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {progress !== null ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-700">{progress}%</span>
                                <div className="h-1.5 w-16 rounded-full bg-gray-200">
                                  <div
                                    className={`h-1.5 rounded-full ${progressColor}`}
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-500">
                                  ({job.imported_files}/{job.total_files})
                                </span>
                              </div>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500" title={job.started_at || ""}>
                            {formatTime(job.started_at)}
                          </td>
                          <td className="hidden whitespace-nowrap px-3 py-4 text-sm text-gray-500 xl:table-cell" title={job.finished_at || ""}>
                            {formatTime(job.finished_at)}
                          </td>
                          <td className="hidden whitespace-nowrap px-3 py-4 text-sm text-gray-500 lg:table-cell">
                            {getDuration(job.started_at, job.finished_at)}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 lg:pr-8">
                            <div className="flex justify-end gap-2">
                              {job.status === "PENDING" && (
                                <button
                                  onClick={() => handleRun(job.id)}
                                  className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-600 shadow-sm transition-all hover:bg-indigo-100"
                                >
                                  <PlayIcon />
                                  运行
                                </button>
                              )}
                              {job.status === "RUNNING" && (
                                <button
                                  onClick={() => handleCancel(job.id)}
                                  className="inline-flex items-center gap-1 rounded-md bg-yellow-50 px-2.5 py-1.5 text-xs font-semibold text-yellow-600 shadow-sm transition-all hover:bg-yellow-100"
                                >
                                  <StopIcon />
                                  取消
                                </button>
                              )}
                              <button
                                onClick={() => handleView(job.id)}
                                className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-600 shadow-sm transition-all hover:bg-blue-100"
                              >
                                <EyeIcon />
                                详情
                              </button>
                              <button
                                onClick={() => handleDelete(job.id)}
                                className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 shadow-sm transition-all hover:bg-red-100"
                              >
                                <TrashIcon />
                                删除
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 详情弹窗 */}
      {detailJob && <JobDetailModal job={detailJob} onClose={() => setDetailJob(null)} />}
    </>
  );
}