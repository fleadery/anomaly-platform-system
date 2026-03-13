import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "../hooks/useAxios";
import LatentRunDetail from "../components/ui/LatentRunDetail";
// 假设已安装 @heroicons/react，若未安装可移除或替换为其他图标
import { CubeIcon, ArrowPathIcon, InboxIcon } from "@heroicons/react/24/outline";

// --- types & helper ---
type ModelRunVO = {
  id: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
  name?: string;
  run_name?: string; // 兼容可能返回的字段
};

// 状态徽章渲染函数
const renderStatusBadge = (status?: string) => {
  if (!status) return <span className="text-gray-400">-</span>;
  const lowerStatus = status.toLowerCase();
  let colorClasses = "bg-gray-100 text-gray-800"; // 默认
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

export default function LatentManagementPage(): JSX.Element {
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  // read runId preferentially from query param 'runId' (we keep compatibility with path param if any)
  const runIdParam = searchParams.get("runId") ?? params.runId ?? undefined;
  const runIdFromParams = runIdParam ? Number(runIdParam) : NaN;

  // --- runs-list pagination state (restorable from query) ---
  const initialRunsPage = Number(searchParams.get("runsPage") ?? 1);
  const initialRunsPageSize = Number(searchParams.get("runsPageSize") ?? 20);
  const [runsPage, setRunsPage] = useState<number>(initialRunsPage || 1);
  const [runsPageSize, setRunsPageSize] = useState<number>(initialRunsPageSize || 20);

  // selectedRunId local fallback (when no runId in URL)
  const [selectedRunId, setSelectedRunId] = useState<number | null>(null);

  // effectiveRunId: query param > path param > local selection
  const effectiveRunId = !Number.isNaN(runIdFromParams) ? runIdFromParams : selectedRunId;

  // --- Run 列表（用于选择 run） ---
  const [runs, setRuns] = useState<ModelRunVO[]>([]);
  const [runsLoading, setRunsLoading] = useState(false);
  const [runsTotal, setRunsTotal] = useState(0);

  // 提取 fetchRuns，不依赖 page/size 状态，而是从参数获取
  const fetchRuns = useCallback(async (page: number, pageSize: number) => {
    setRunsLoading(true);
    try {
      const res = await axios.get<any>("/runs/getruns", {
        params: {
          page,
          page_size: pageSize,
        },
      });
      setRuns(res.data.records ?? []);
      setRunsTotal(res.data.total ?? 0);
    } catch (err) {
      console.error("fetchRuns error", err);
      setRuns([]);
      setRunsTotal(0);
    } finally {
      setRunsLoading(false);
    }
  }, []);

  useEffect(() => {
    // fetch runs only when there's no runId in the URL (i.e., user is on list view)
    if (Number.isNaN(runIdFromParams)) {
      fetchRuns(runsPage, runsPageSize);
    }
  }, [runIdFromParams, runsPage, runsPageSize, fetchRuns]);

  // When runsPage or runsPageSize changes, persist to URL so we can restore when returning
  useEffect(() => {
    if (Number.isNaN(runIdFromParams)) {
      const next = new URLSearchParams(searchParams.toString());
      next.set("runsPage", String(runsPage));
      next.set("runsPageSize", String(runsPageSize));
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runsPage, runsPageSize]);

  function handleSelectRun(id: number) {
    const next = new URLSearchParams(searchParams.toString());
    next.set("runId", String(id));
    next.set("runsPage", String(runsPage));
    next.set("runsPageSize", String(runsPageSize));
    setSearchParams(next);
    setSelectedRunId(id);
  }

  function goBackToRunsList() {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("runId");
    next.set("runsPage", String(runsPage));
    next.set("runsPageSize", String(runsPageSize));
    setSearchParams(next);
    setSelectedRunId(null);
  }

  // 骨架屏组件
  const SkeletonRow = () => (
    <tr className="border-t animate-pulse">
      <td className="p-2"><div className="h-4 bg-gray-200 rounded w-12"></div></td>
      <td className="p-2"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
      <td className="p-2"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
      <td className="p-2"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
      <td className="p-2"><div className="h-8 bg-gray-200 rounded w-16"></div></td>
    </tr>
  );

  // ---- render: list selector when no effectiveRunId ----
  if (!effectiveRunId) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* 头部 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <CubeIcon className="h-8 w-8 text-gray-600" />
              <h1 className="text-2xl font-semibold text-gray-900">Latents 管理</h1>
            </div>
          </div>

          {/* 说明卡片 */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  请从下方选择一个 Run 来查看其 Latents。你也可以通过 URL 参数直接访问，例如：
                  <code className="ml-1 px-2 py-1 bg-blue-100 rounded text-xs">?runId=123&runsPage=3</code>
                </p>
              </div>
            </div>
          </div>

          {/* 表格卡片 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* 工具栏 */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm text-gray-600">
                共 <span className="font-medium">{runsTotal}</span> 条记录
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => fetchRuns(runsPage, runsPageSize)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-1" />
                  刷新
                </button>
              </div>
            </div>

            {/* 表格 */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Run ID</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">名称</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">状态</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">创建时间</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {runsLoading ? (
                    // 骨架屏
                    <>
                      <SkeletonRow />
                      <SkeletonRow />
                      <SkeletonRow />
                    </>
                  ) : runs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center">
                        <InboxIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">暂无 Run 数据</p>
                      </td>
                    </tr>
                  ) : (
                    runs.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-mono text-gray-900">{r.id}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{r.name ?? r.run_name ?? "-"}</td>
                        <td className="px-4 py-3 text-sm">{renderStatusBadge(r.status)}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{r.created_at ?? "-"}</td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={() => handleSelectRun(r.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            选择
                          </button>
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
                第 <span className="font-medium">{runsPage}</span> 页
              </div>
              <div className="flex items-center space-x-2">
                <button
                  disabled={runsPage <= 1}
                  onClick={() => setRunsPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <button
                  disabled={runsPage * runsPageSize >= runsTotal}
                  onClick={() => setRunsPage((p) => p + 1)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
                <select
                  value={runsPageSize}
                  onChange={(e) => setRunsPageSize(Number(e.target.value))}
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
        </div>
      </div>
    );
  }

  // ---- render: details (has effectiveRunId) ----
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <LatentRunDetail runId={effectiveRunId} onBack={goBackToRunsList} />
      </div>
    </div>
  );
}