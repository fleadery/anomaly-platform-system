// src/pages/VisualizationJobPage.tsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listVisualizationJobs,
  deleteVisualizationJob,
  useVisualizationJob,
} from "../hooks/useVisualizationJobs";
import type { VisualizationJob } from "../hooks/useVisualizationJobs";

import {
  ArrowPathIcon,
  TrashIcon,
  DocumentIcon,
  InboxIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

// 小工具
const renderStatusBadge = (status?: string) => {
  if (!status) return <span className="text-gray-400">-</span>;
  const lowerStatus = status.toLowerCase();
  let colorClasses = "bg-gray-100 text-gray-800";
  if (lowerStatus === "completed" || lowerStatus === "success") {
    colorClasses = "bg-green-100 text-green-800";
  } else if (lowerStatus === "running" || lowerStatus === "active") {
    colorClasses = "bg-blue-100 text-blue-800";
  } else if (lowerStatus === "failed" || lowerStatus === "error") {
    colorClasses = "bg-red-100 text-red-800";
  } else if (lowerStatus === "pending" || lowerStatus === "waiting") {
    colorClasses = "bg-yellow-100 text-yellow-800";
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses}`}>
      {status}
    </span>
  );
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—";
  try {
    const date = new Date(dateStr);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

// 骨架行组件
const SkeletonRow: React.FC = () => (
  <tr className="animate-pulse border-t border-gray-200">
    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-12"></div></td>
    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-64"></div></td>
    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
  </tr>
);

export default function VisualizationJobPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // 选中查看的 job id（用于打开对话框）
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  // 记录正在删除的 id，仅禁用该行的删除按钮
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["visualization-jobs", page, pageSize],
    queryFn: () => listVisualizationJobs(page, pageSize),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteVisualizationJob(id),
    onSuccess: (_, id) => {
      setDeletingId(null);
      queryClient.invalidateQueries({ queryKey: ["visualization-jobs"] });
      // 如果当前对话框打开的是已删除的 job，关闭它
      if (selectedJobId === id) setSelectedJobId(null);
    },
    onError: (err) => {
      console.error(err);
      setDeletingId(null);
      window.alert("删除失败，请查看控制台错误信息");
    },
  });

  const jobs: VisualizationJob[] = data?.records ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.total_pages ?? 1;

  function handleDelete(id: number) {
    if (!window.confirm(`确定删除 job ${id} 吗？`)) return;
    setDeletingId(id);
    deleteMutation.mutate(id);
  }

  // 单条 job 详情查询（当 selectedJobId 有值时启用）
  const jobDetailQuery = useVisualizationJob(selectedJobId ?? undefined);
  const jobDetail = jobDetailQuery.data ?? null;

  function openDetail(id: number) {
    setSelectedJobId(id);
  }

  function closeDetail() {
    setSelectedJobId(null);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <DocumentIcon className="h-8 w-8 text-gray-600" />
            <h1 className="text-2xl font-semibold text-gray-900">可视化任务</h1>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            刷新
          </button>
        </div>

        {/* 表格卡片 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">状态</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">方法</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">结果路径</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">创建时间</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                ) : jobs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <InboxIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">暂无可视化任务</p>
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">{job.id}</td>
                      <td className="px-4 py-3 text-sm">{renderStatusBadge(job.status)}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{job.method ?? "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate" title={job.result_path || ""}>
                        {job.result_path || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(job.created_at)}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => openDetail(job.id)}
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            <DocumentIcon className="h-4 w-4 mr-1" />
                            详情
                          </button>
                          <button
                            onClick={() => handleDelete(job.id)}
                            disabled={deletingId === job.id}
                            className="inline-flex items-center text-red-600 hover:text-red-800 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <TrashIcon className="h-4 w-4 mr-1" />
                            {deletingId === job.id ? "删除中..." : "删除"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm text-gray-600">
              共 <span className="font-medium">{total}</span> 条 · 第 <span className="font-medium">{page}</span> / {totalPages} 页
            </div>
            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="ml-2 px-2 py-1 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10 / 页</option>
                <option value={20}>20 / 页</option>
                <option value={50}>50 / 页</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 详情模态框 */}
      {selectedJobId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={closeDetail} />
          <div className="relative z-10 w-full max-w-2xl mx-4">
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              {/* 标题栏 */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <DocumentIcon className="h-5 w-5 mr-2 text-gray-500" />
                  Job #{selectedJobId} 详情
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => jobDetailQuery.refetch()}
                    className="p-1.5 rounded-md text-gray-500 hover:bg-gray-200 transition-colors"
                    title="刷新"
                  >
                    <ArrowPathIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={closeDetail}
                    className="p-1.5 rounded-md text-gray-500 hover:bg-gray-200 transition-colors"
                    title="关闭"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* 内容区 */}
              <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
                {jobDetailQuery.isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="relative inline-flex">
                      <div className="w-8 h-8 border-4 border-blue-200 rounded-full"></div>
                      <div className="absolute top-0 left-0 w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <span className="ml-3 text-gray-600">加载详情中...</span>
                  </div>
                ) : jobDetail ? (
                  <div className="space-y-4">
                    {/* 基本信息网格 */}
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <dt className="text-xs text-gray-500 uppercase">ID</dt>
                        <dd className="mt-1 font-mono text-sm text-gray-900">{jobDetail.id}</dd>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <dt className="text-xs text-gray-500 uppercase">状态</dt>
                        <dd className="mt-1">{renderStatusBadge(jobDetail.status ?? jobDetail.data?.status)}</dd>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <dt className="text-xs text-gray-500 uppercase">方法</dt>
                        <dd className="mt-1 text-sm text-gray-900">{jobDetail.method ?? jobDetail.data?.method ?? "-"}</dd>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <dt className="text-xs text-gray-500 uppercase">创建时间</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formatDate(jobDetail.created_at ?? jobDetail.data?.created_at)}</dd>
                      </div>
                    </dl>

                    {/* 结果路径 */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <dt className="text-xs text-gray-500 uppercase mb-1">结果路径</dt>
                      <dd className="text-sm break-all">
                        {jobDetail.result_path ?? jobDetail.data?.result_path ? (
                          <a
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {jobDetail.result_path ?? jobDetail.data?.result_path}
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </dd>
                    </div>

                    {/* 进度信息（如果存在） */}
                    {("progress" in (jobDetail as any) || jobDetail.data?.progress !== undefined) && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <dt className="text-xs text-gray-500 uppercase mb-1">进度</dt>
                        <dd className="text-sm">
                          <div className="flex items-center gap-2">
                            <span>{(jobDetail as any).progress ?? jobDetail.data?.progress}%</span>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full"
                                style={{ width: `${(jobDetail as any).progress ?? jobDetail.data?.progress}%` }}
                              />
                            </div>
                          </div>
                        </dd>
                      </div>
                    )}

                    {/* 错误信息（如果存在） */}
                    {((jobDetail as any).error || jobDetail.data?.error) && (
                      <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                        <dt className="text-xs text-red-600 uppercase mb-1">错误信息</dt>
                        <dd className="text-sm text-red-700 break-words">
                          {(jobDetail as any).error ?? jobDetail.data?.error}
                        </dd>
                      </div>
                    )}

                    {/* 其他自定义字段可根据需要继续添加 */}
                  </div>
                ) : (
                  <div className="text-center py-8 text-red-500">
                    未能获取到 Job 详情。
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}