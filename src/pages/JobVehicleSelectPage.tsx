// JobVehicleSelectPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchImportJobs, fetchVehicles } from "../hooks/useModelInfer";

// JobVehicleSelectPage
// - 左侧：Import Job 列表（分页）
// - 右侧：所选 Job 的车辆列表（分页 + 多选 + 全选）
// - 确认时 navigate 回 /model-infer 并传回 { importJobId, selectedVehicles }

type ImportJob = {
  id: number;
  job_name?: string;
  status?: string;
  created_at?: string;
};

type Vehicle = {
  id: number;
  vehicle_no?: string;
  alias?: string;
  vendor?: string;
};

function safeExtractRecords(payload: any) {
  if (!payload) return [];
  if (payload.data && payload.data.records) return payload.data.records;
  if (payload.records) return payload.records;
  if (payload.data && Array.isArray(payload.data)) return payload.data;
  return payload;
}

export default function JobVehicleSelectPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();

  const incomingState = (location.state || {}) as any;
  const initialJobId = incomingState.importJobId ?? null;
  const initialSelectedVehicles = Array.isArray(incomingState.selectedVehicles)
    ? incomingState.selectedVehicles.slice()
    : [];

  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [jobsPage, setJobsPage] = useState(1);
  const [jobsTotal, setJobsTotal] = useState<number | null>(null);
  const jobsPageSize = 10;
  const [jobsLoading, setJobsLoading] = useState(false);

  const [jobId, setJobId] = useState<number | null>(initialJobId);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehiclesPage, setVehiclesPage] = useState(1);
  const vehiclesPageSize = 50;
  const [vehiclesTotal, setVehiclesTotal] = useState<number | null>(null);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);

  const [selectedVehicles, setSelectedVehicles] = useState<number[]>(initialSelectedVehicles);
  const [error, setError] = useState<string | null>(null);

  // 加载 import jobs
  useEffect(() => {
    let cancelled = false;
    setJobsLoading(true);
    setError(null);

    fetchImportJobs({}, jobsPage, jobsPageSize)
      .then((resp) => {
        if (cancelled) return;
        const payload = resp.data;
        const records = safeExtractRecords(payload);
        setJobs(records || []);
        const total = payload?.data?.total ?? payload?.total ?? null;
        setJobsTotal(total);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(String(e?.message ?? e));
      })
      .finally(() => {
        if (!cancelled) setJobsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [jobsPage]);

  // 加载车辆
  useEffect(() => {
    if (jobId == null) {
      setVehicles([]);
      setVehiclesTotal(null);
      return;
    }

    let cancelled = false;
    setVehiclesLoading(true);
    setError(null);

    fetchVehicles({ import_job_id: jobId }, vehiclesPage, vehiclesPageSize)
      .then((resp) => {
        if (cancelled) return;
        const payload = resp.data;
        const records = safeExtractRecords(payload);
        setVehicles(records || []);
        const total = payload?.data?.total ?? payload?.total ?? null;
        setVehiclesTotal(total);

        if (initialSelectedVehicles && initialSelectedVehicles.length > 0) {
          const availableIds = new Set((records || []).map((v: any) => v.id));
          const filtered = initialSelectedVehicles.filter((id: number) => availableIds.has(id));
          setSelectedVehicles((prev) => {
            const merged = Array.from(new Set([...(prev || []), ...filtered]));
            return merged;
          });
        }
      })
      .catch((e) => {
        if (cancelled) return;
        setError(String(e?.message ?? e));
      })
      .finally(() => {
        if (!cancelled) setVehiclesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [jobId, vehiclesPage]);

  function toggleVehicle(id: number) {
    setSelectedVehicles((prev) => {
      const s = new Set(prev || []);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return Array.from(s);
    });
  }

  function selectAllVisible() {
    setSelectedVehicles((prev) => {
      const s = new Set(prev || []);
      vehicles.forEach((v) => s.add(v.id));
      return Array.from(s);
    });
  }

  function deselectAllVisible() {
    setSelectedVehicles((prev) => {
      const s = new Set(prev || []);
      vehicles.forEach((v) => s.delete(v.id));
      return Array.from(s);
    });
  }

  const allVisibleSelected = useMemo(() => {
    if (!vehicles || vehicles.length === 0) return false;
    return vehicles.every((v) => selectedVehicles.includes(v.id));
  }, [vehicles, selectedVehicles]);

  function confirmSelection() {
    if (jobId == null) {
      alert("请先选择一个导入任务");
      return;
    }

    navigate("/model-infer", {
      state: {
        importJobId: jobId,
        selectedVehicles: selectedVehicles,
      },
    });
  }

  // 加载动画（纯 CSS）
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-700 p-2 rounded-lg">📦</span>
            选择数据（导入任务 + 车辆）
          </h1>
          <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
            已选车辆 <span className="font-bold text-emerald-600">{selectedVehicles.length}</span>
          </div>
        </div>

        {/* 双栏布局 */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 左侧：导入任务列表 */}
          <div className="lg:w-1/3 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col">
            <div className="bg-gray-50 px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-medium text-gray-700 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-emerald-400 rounded-full"></span>
                导入任务
              </h2>
              <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                第 {jobsPage} 页
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {jobsLoading ? (
                <LoadingSpinner />
              ) : jobs.length === 0 ? (
                <div className="text-center py-12 text-gray-400">暂无导入任务</div>
              ) : (
                <ul className="space-y-2">
                  {jobs.map((job) => (
                    <li
                      key={job.id}
                      onClick={() => {
                        setJobId(job.id);
                        setVehiclesPage(1);
                        setError(null);
                      }}
                      className={`group p-4 rounded-xl border transition-all cursor-pointer ${
                        jobId === job.id
                          ? "border-emerald-300 bg-emerald-50 shadow-md"
                          : "border-gray-200 hover:border-emerald-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800 group-hover:text-emerald-700 transition-colors">
                            {job.job_name ?? `任务 #${job.id}`}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-xs">
                            <span className={`px-2 py-0.5 rounded-full ${
                              job.status === 'completed' ? 'bg-green-100 text-green-700' :
                              job.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {job.status ?? '未知'}
                            </span>
                            <span className="text-gray-400">
                              {job.created_at ? new Date(job.created_at).toLocaleDateString() : ''}
                            </span>
                          </div>
                        </div>
                        {jobId === job.id && (
                          <span className="text-emerald-500 text-lg leading-none">✓</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 分页控件 */}
            <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-600">共 {jobsTotal ?? '-'} 条</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setJobsPage(p => Math.max(1, p - 1))}
                  disabled={jobsPage <= 1}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  上一页
                </button>
                <button
                  onClick={() => setJobsPage(p => p + 1)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-100 transition"
                >
                  下一页
                </button>
              </div>
            </div>
          </div>

          {/* 右侧：车辆列表 */}
          <div className="lg:flex-1 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col">
            <div className="bg-gray-50 px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-medium text-gray-700 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-blue-400 rounded-full"></span>
                车辆列表
                {jobId && <span className="text-xs text-gray-500 ml-2">(任务已选)</span>}
              </h2>
              {jobId && (
                <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                  第 {vehiclesPage} 页 / 共 {Math.ceil((vehiclesTotal || 0) / vehiclesPageSize)} 页
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {!jobId ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                  <span className="text-4xl mb-2">👈</span>
                  <p className="text-sm">请在左侧选择一个导入任务</p>
                </div>
              ) : vehiclesLoading ? (
                <LoadingSpinner />
              ) : vehicles.length === 0 ? (
                <div className="text-center py-12 text-gray-400">该任务下暂无车辆</div>
              ) : (
                <>
                  {/* 工具栏 */}
                  <div className="mb-4 flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-200"
                        checked={allVisibleSelected}
                        onChange={() => allVisibleSelected ? deselectAllVisible() : selectAllVisible()}
                      />
                      <span className="text-sm text-gray-700">本页全选</span>
                    </label>
                    <span className="text-sm text-gray-500">当前页 {vehicles.length} 条</span>
                    <div className="ml-auto flex gap-2">
                      <button
                        onClick={() => setVehiclesPage(p => Math.max(1, p - 1))}
                        disabled={vehiclesPage <= 1}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-40 transition"
                      >
                        上一页
                      </button>
                      <button
                        onClick={() => setVehiclesPage(p => p + 1)}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-100 transition"
                      >
                        下一页
                      </button>
                    </div>
                  </div>

                  {/* 表格 */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            选择
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            车辆 ID
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            车辆编号
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            厂商
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {vehicles.map((v) => (
                          <tr key={v.id} className="hover:bg-gray-50 transition">
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-200"
                                checked={selectedVehicles.includes(v.id)}
                                onChange={() => toggleVehicle(v.id)}
                              />
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">{v.id}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {v.vehicle_code ?? v.alias ?? <span className="text-gray-400">-</span>}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {v.vendor ?? <span className="text-gray-400">-</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* 底部操作栏 */}
            {jobId && (
              <div className="bg-gray-50 px-5 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  总计 <span className="font-medium">{vehiclesTotal ?? '-'}</span> 辆
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedVehicles([])}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-100 transition"
                  >
                    清空全部
                  </button>
                  <button
                    onClick={confirmSelection}
                    disabled={selectedVehicles.length === 0}
                    className="px-5 py-2 text-sm bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg shadow-md hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-2"
                  >
                    <span>确认选择</span>
                    {selectedVehicles.length > 0 && (
                      <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
                        {selectedVehicles.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="mx-4 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                ⚠️ {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}