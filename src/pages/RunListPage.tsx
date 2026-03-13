// RunListPage.tsx
import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, RefreshCw, Eye, XCircle, RotateCw, Trash2, Calendar, Filter } from "lucide-react";

import { useModelRuns } from "../hooks/useModelRun";
import { cancelRun, retryRun, deleteRun } from "../hooks/useModelRun";
import { isCancelable, isRetryable } from "../constants/taskStatus";
import { useLayout } from "../components/common/LayoutContext";
import StatusFilter from "../components/ui/StatusFilter";
import DateRangePicker from "../components/ui/DateRangePicker";

// 状态对应的样式
const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
  PENDING: { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-500" },
  RUNNING: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  SUCCESS: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  FAILED: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  CANCELLED: { bg: "bg-gray-50", text: "text-gray-700", dot: "bg-gray-500" },
};

export default function RunListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = Number(searchParams.get("page") || 1);
  const [page, setPage] = useState(pageFromUrl);
  const pageSize = 13;

  useEffect(() => {
    setSearchParams({ page: String(page) });
  }, [page, setSearchParams]);

  useEffect(() => {
    if (page !== pageFromUrl) {
      setPage(pageFromUrl);
    }
  }, [pageFromUrl]);

  const { setTitle } = useLayout();
  useEffect(() => {
    setTitle("任务列表");
  }, [setTitle]);

  // 筛选条件
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const queryDTO = useMemo(
    () => ({
      status: statusFilter || undefined,
      created_at_from: dateFrom || undefined,
      created_at_to: dateTo || undefined,
    }),
    [statusFilter, dateFrom, dateTo]
  );

  const { data: runs, loading, fetchRuns } = useModelRuns(page, pageSize, queryDTO);

  const handleCancel = async (run_id: number) => {
    await cancelRun(run_id);
    fetchRuns();
  };
  const handleRetry = async (run_id: number) => {
    await retryRun(run_id);
    fetchRuns();
  };
  const handleDelete = async (run_id: number) => {
    await deleteRun(run_id);
    fetchRuns();
  };

  const navigate = useNavigate();

  // 格式化日期时间
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">管理所有运行任务</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => fetchRuns()}
              className="inline-flex items-center px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:shadow-sm transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              刷新
            </button>
          </div>
        </div>

        {/* 筛选卡片 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center space-x-2 text-gray-700">
              <Filter className="w-5 h-5" />
              <span className="font-medium">筛选条件</span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <StatusFilter value={statusFilter} onChange={setStatusFilter} />
              <DateRangePicker
                from={dateFrom}
                to={dateTo}
                onChangeFrom={setDateFrom}
                onChangeTo={setDateTo}
              />
              <button
                onClick={() => fetchRuns()}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 hover:shadow-md transition-all duration-200"
              >
                查询
              </button>
            </div>
          </div>
        </div>

        {/* 表格卡片 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-200 rounded-full"></div>
                <div className="absolute w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-600 mt-4">加载任务列表中...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">任务名称</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">状态</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">创建时间</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {runs.map((run) => {
                      const style = statusStyles[run.status] || statusStyles.CANCELLED;
                      const rowBg = run.status === "FAILED" ? "bg-red-50/30" : run.status === "CANCELLED" ? "bg-gray-50/30" : "";
                      return (
                        <tr key={run.id} className={`hover:bg-gray-50/80 transition-colors ${rowBg}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{run.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{run.run_name || "--"}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text} border border-current/10`}>
                              <span className={`w-2 h-2 rounded-full mr-1.5 ${style.dot}`}></span>
                              {run.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                              {formatDateTime(run.created_at)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              {/* 取消 */}
                              <button
                                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                                  isCancelable(run.status)
                                    ? "bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200 hover:from-red-100 hover:to-red-200 hover:border-red-300"
                                    : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                                }`}
                                onClick={() => handleCancel(run.id)}
                                disabled={!isCancelable(run.status)}
                              >
                                <XCircle className="w-3.5 h-3.5 mr-1" />
                                取消
                              </button>
                              {/* 重试 */}
                              <button
                                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                                  isRetryable(run.status)
                                    ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200 hover:from-blue-100 hover:to-blue-200 hover:border-blue-300"
                                    : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                                }`}
                                onClick={() => handleRetry(run.id)}
                                disabled={!isRetryable(run.status)}
                              >
                                <RotateCw className="w-3.5 h-3.5 mr-1" />
                                重试
                              </button>
                              {/* 删除 */}
                              <button
                                className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-medium hover:from-gray-100 hover:to-gray-200 hover:border-gray-300 transition-all duration-200"
                                onClick={() => handleDelete(run.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-1" />
                                删除
                              </button>
                              {/* 详情 */}
                              <button
                                className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-medium hover:from-indigo-100 hover:to-indigo-200 hover:border-indigo-300 transition-all duration-200"
                                onClick={() => navigate(`${run.id}?fromPage=${page}`)}
                              >
                                <Eye className="w-3.5 h-3.5 mr-1" />
                                详情
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* 分页 */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-sm text-gray-700">
                  显示第 <span className="font-medium">{(page - 1) * pageSize + 1}</span> -{" "}
                  <span className="font-medium">{Math.min(page * pageSize, runs.length)}</span> 条，共{" "}
                  <span className="font-medium">{runs.length}</span> 条记录
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    上一页
                  </button>
                  <span className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-sm">{page}</span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all"
                  >
                    下一页
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}