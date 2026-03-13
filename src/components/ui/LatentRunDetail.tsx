import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../hooks/useAxios";
import { listLatentsByRun, getLatentStats, deleteRunLatents } from "../../hooks/useLatents";
import type { LatentPageVO, LatentStatsVO } from "../../types/vo/LatentMetaVO";
import {
  ArrowPathIcon,
  ArrowLeftIcon,
  TrashIcon,
  DocumentIcon,
  ChartBarIcon,
  InboxIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

// Minimal type for run info
type ModelRunVO = {
  id: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
  name?: string;
};

async function fetchRunById(runId: number): Promise<ModelRunVO | null> {
  if (!runId) return null;

  const res = await axios.get<any>("/runs/getruns", {
    params: { page: 1, page_size: 100 },
  });

  const records: ModelRunVO[] = res.data.records ?? [];
  return records.find((r) => Number(r.id) === Number(runId)) ?? null;
}

// 状态徽章渲染函数
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

// 格式化日期
const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—";
  try {
    const date = new Date(dateStr);
    return date.toLocaleString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return dateStr;
  }
};

// 骨架屏行组件
const SkeletonRow: React.FC = () => (
  <tr className="animate-pulse border-t border-gray-200">
    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-12"></div></td>
    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-64"></div></td>
    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
  </tr>
);

export default function LatentRunDetail({ runId, onBack }: { runId: number; onBack: () => void }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const queryClient = useQueryClient();

  const {
    data: runInfo,
    isLoading: runLoading,
    refetch: refetchRun,
  } = useQuery<ModelRunVO | null>({
    queryKey: ["run", runId],
    queryFn: () => fetchRunById(runId),
    enabled: !!runId,
    staleTime: 1000 * 15,
  });

  const {
    data: latentPage,
    isLoading: latentsLoading,
    isError: latentsError,
    refetch: refetchLatents,
  } = useQuery<LatentPageVO>({
    queryKey: ["latents", runId, page, pageSize],
    queryFn: () => listLatentsByRun(runId, page, pageSize),
    enabled: !!runId,
    staleTime: 1000 * 10,
    keepPreviousData: true,
  });

  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useQuery<LatentStatsVO>({
    queryKey: ["latents", runId, "stats"],
    queryFn: () => getLatentStats(runId),
    enabled: !!runId,
    staleTime: 1000 * 30,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteRunLatents(runId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["latents", runId] });
      queryClient.invalidateQueries({ queryKey: ["run", runId] });
      queryClient.invalidateQueries({ queryKey: ["latents", runId, "stats"] });
      window.alert(`删除完成：${data.deleted_files} 个文件`);
    },
    onError: (err: any) => {
      console.error(err);
      window.alert("删除失败，请查看控制台错误信息");
    },
  });

  function handleDeleteRun() {
    const confirmed = window.confirm(
      `确定删除 run ${runId} 下的所有 latent 文件？此操作会把 run 状态设为 CANCELLED 并删除对应文件（不可恢复）。`
    );
    if (!confirmed) return;
    deleteMutation.mutate();
  }

  function handleRefresh() {
    refetchLatents();
    refetchStats();
    refetchRun();
  }

  const records = latentPage?.data.records ?? [];
  const total = latentPage?.data.total ?? 0;
  const totalPages = latentPage?.data.total_pages ?? 1;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* 头部区域 */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <DocumentIcon className="h-7 w-7 text-gray-600" />
              Latents — Run {runId}
            </h1>
            <div className="mt-2 text-sm text-gray-600">
              {runLoading ? (
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
              ) : runInfo ? (
                <div className="flex flex-wrap items-center gap-3">
                  {renderStatusBadge(runInfo.status)}
                  <span>创建于 <span className="font-mono">{formatDate(runInfo.created_at)}</span></span>
                  {runInfo.updated_at && (
                    <span>更新于 <span className="font-mono">{formatDate(runInfo.updated_at)}</span></span>
                  )}
                </div>
              ) : (
                <span className="text-red-500">未能找到指定的 Run（可能不在最近 100 条列表中）</span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              刷新
            </button>
            <button
              onClick={onBack}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              返回列表
            </button>
            <button
              onClick={handleDeleteRun}
              disabled={deleteMutation.isLoading}
              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              {deleteMutation.isLoading ? "删除中..." : "删除该 Run 的 Latents"}
            </button>
          </div>
        </div>

        {/* 主内容区：表格 + 统计卡片 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 文件列表卡片 */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <DocumentIcon className="h-5 w-5 mr-2 text-gray-500" />
                文件列表
              </h2>
              <div className="text-sm text-gray-600">
                {latentsLoading ? "加载中..." : `${total} 个文件`}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">segment_id</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">路径</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">创建时间</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {latentsLoading ? (
                    <>
                      <SkeletonRow />
                      <SkeletonRow />
                      <SkeletonRow />
                    </>
                  ) : records.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center">
                        <InboxIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">暂无文件</p>
                      </td>
                    </tr>
                  ) : (
                    records.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-mono text-gray-900">{r.id}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{r.segment_id}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate" title={r.path}>
                          {r.latent_path}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(r.created_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm text-gray-600">
                第 {page} / {totalPages} 页
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
                    setPage(1); // 切换每页条数时重置到第一页
                  }}
                  className="ml-2 px-2 py-1 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10 / 页</option>
                  <option value={20}>20 / 页</option>
                  <option value={50}>50 / 页</option>
                  <option value={100}>100 / 页</option>
                </select>
              </div>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h2 className="text-lg font-medium text-gray-900 flex items-center mb-3">
              <ChartBarIcon className="h-5 w-5 mr-2 text-gray-500" />
              统计信息
            </h2>
            {statsLoading ? (
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
            ) : stats ? (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">文件总数：</dt>
                  <dd className="font-medium text-gray-900">{stats.latent_count ?? "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">总数据片段：</dt>
                  <dd className="font-medium text-gray-900">{stats.segment_count ?? "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">涉及车辆数：</dt>
                  <dd className="font-medium text-gray-900">{stats.vehicle_count ?? "—"}</dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-gray-500">暂无统计数据</p>
            )}
          </div>
        </div>

        {/* 错误提示 */}
        {latentsError && (
          <div className="mt-4 rounded-md bg-red-50 p-4 border border-red-200">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">加载文件列表失败，请刷新重试或查看控制台错误信息。</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}