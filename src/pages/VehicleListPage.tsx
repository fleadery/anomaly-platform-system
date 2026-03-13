// src/pages/VehicleListPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft, Filter, Search, TrendingUp,
  AlertTriangle, BarChart3, PieChart,
  Download, RefreshCw, ChevronRight, ChevronDown
} from "lucide-react";
import { useLayout } from "../components/common/LayoutContext";

import { useVehicleResults } from "../hooks/useVehicleResult";
import { useRunVehicleSummary } from "../hooks/useRunVehicleSummary"
import type { VehicleResultQueryDTO } from "../types/dto/VehicleResultQueryDTO";

export default function VehicleListPage() {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();
  const runIdNum = Number(runId);

  // 分页状态
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { setTitle } = useLayout();
  useEffect(() => {
    if (runId) {
      setTitle(`车辆结结果 - 任务：${runId}`);
    } else {
      setTitle("车辆结结果");
    }
  }, [setTitle, runId]);

  // 筛选状态
  const [isAnomaly, setIsAnomaly] = useState<boolean | undefined>();
  const [minScore, setMinScore] = useState<string>("");
  const [maxScore, setMaxScore] = useState<string>("");
  const [sortBy, setSortBy] = useState<"score_value" | "vehicle_id" | "created_at">("score_value");
  const [sortDesc, setSortDesc] = useState(true);
  const [searchId, setSearchId] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [, setScoreType] = useState<string>("");

  // DTO 稳定化
  const dto: VehicleResultQueryDTO = useMemo(() => ({
    run_id: runIdNum,
    is_anomaly: isAnomaly,
    min_score: minScore ? parseFloat(minScore) : undefined,
    max_score: maxScore ? parseFloat(maxScore) : undefined,
    sort_by: sortBy,
    sort_desc: sortDesc
  }), [runIdNum, isAnomaly, minScore, maxScore, sortBy, sortDesc]);

  // 主查询
  const vehicleQuery = useVehicleResults(runIdNum, dto, page, pageSize);
  const summaryQuery = useRunVehicleSummary(runIdNum, 10);

  const vehicles = vehicleQuery.data?.records ?? [];
  const total = vehicleQuery.data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  const isFirstLoading = vehicleQuery.isLoading;
  const isPageFetching = vehicleQuery.isFetching && !vehicleQuery.isLoading;

  // 格式化分数显示
  const formatScore = (score: number) => {
    if (score === 0) return "0";
    if (Math.abs(score) < 0.001) {
      return score.toExponential(6);
    }
    return score.toFixed(6);
  };

  // 格式化日期时间
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  // 获取分数颜色和宽度
  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    
    if (percentage >= 90) return "bg-gradient-to-r from-red-500 to-rose-600";
    if (percentage >= 70) return "bg-gradient-to-r from-orange-500 to-amber-600";
    if (percentage >= 50) return "bg-gradient-to-r from-yellow-500 to-yellow-600";
    if (percentage >= 30) return "bg-gradient-to-r from-blue-500 to-cyan-600";
    return "bg-gradient-to-r from-green-500 to-emerald-600";
  };

  // 获取分数类型样式
  const getScoreTypeStyle = (type: string) => {
    const typeMap: Record<string, { bg: string; text: string }> = {
      "p95": { bg: "bg-blue-50 text-blue-700 border-blue-200", text: "P95" },
      "p99": { bg: "bg-purple-50 text-purple-700 border-purple-200", text: "P99" },
      "top5": { bg: "bg-amber-50 text-amber-700 border-amber-200", text: "Top 5%" },
      "top_20%": { bg: "bg-rose-50 text-rose-700 border-rose-200", text: "Top 20%" }
    };
    
    return typeMap[type] || { bg: "bg-gray-50 text-gray-700 border-gray-200", text: type };
  };

  // 处理搜索
  const handleSearch = () => {
    if (searchId.trim()) {
      // 这里可以添加实际的搜索逻辑
    }
    setPage(1);
  };

  // 清空筛选
  const handleClearFilters = () => {
    setIsAnomaly(undefined);
    setMinScore("");
    setMaxScore("");
    setSortBy("score_value");
    setSortDesc(true);
    setSearchId("");
    setScoreType("");
    setPage(1);
  };

  // 导出数据
  const handleExport = () => {
    // 这里添加导出逻辑
    console.log("导出数据");
  };

  // 如果数据为空
  if (isFirstLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">正在加载车辆数据</h3>
            <p className="text-gray-500">正在获取运行 {runId} 的详细结果...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 头部区域 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center w-10 h-10 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:shadow-sm transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                车辆分析结果
              </h1>
              <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                <span>运行 ID: {runId}</span>
                <span className="text-gray-300">•</span>
                <span>检测总数: {total}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:shadow-sm transition-all duration-200"
            >
              <Download className="w-4 h-4 mr-2" />
              导出报告
            </button>
            <button
              onClick={() => vehicleQuery.refetch()}
              className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 hover:shadow-md transition-all duration-200"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isPageFetching ? "animate-spin" : ""}`} />
              {isPageFetching ? "更新中..." : "刷新数据"}
            </button>
          </div>
        </div>

        {/* 统计概览卡片 */}
        {summaryQuery.data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 总车辆数 */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-blue-700">总车辆数</div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {summaryQuery.data.total_vehicles}
              </div>
              <div className="text-xs text-blue-600">
                本次运行检测的车辆总数
              </div>
            </div>

            {/* 异常车辆 */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-red-700">异常车辆</div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2 mb-2">
                <div className="text-3xl font-bold text-gray-900">
                  {summaryQuery.data.anomaly_count}
                </div>
                <div className="text-sm font-semibold text-red-600">
                  {((summaryQuery.data.anomaly_ratio || 0) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="text-xs text-red-600">
                {summaryQuery.data.anomaly_count > 0 ? "需要重点关注的车辆" : "所有车辆运行正常"}
              </div>
            </div>

            {/* 平均分数 */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-purple-700">平均异常分数</div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2 font-mono">
                {formatScore(summaryQuery.data.avg_score || 0)}
              </div>
              <div className="text-xs text-purple-600">
                标准差: {formatScore(summaryQuery.data.score_std || 0)}
              </div>
            </div>

            {/* 分数范围 */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-amber-700">分数范围</div>
                <div className="p-2 bg-amber-100 rounded-lg">
                  <PieChart className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-700">
                  最高: <span className="font-mono">{formatScore(summaryQuery.data.max_score || 0)}</span>
                </div>
                <div className="text-sm font-medium text-gray-700">
                  最低: <span className="font-mono">{formatScore(summaryQuery.data.min_score || 0)}</span>
                </div>
              </div>
              <div className="text-xs text-amber-600 mt-2">
                分数分布统计
              </div>
            </div>
          </div>
        )}

        {/* 搜索和筛选栏 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* 搜索框 */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索车辆ID..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            {/* 筛选按钮组 */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all"
              >
                <Filter className="w-4 h-4 mr-2" />
                高级筛选
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </button>
              
              {(isAnomaly !== undefined || minScore || maxScore || searchId) && (
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300 text-gray-700 font-medium rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all"
                >
                  清空筛选
                </button>
              )}
            </div>
          </div>

          {/* 高级筛选面板 */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 第一行：状态筛选和分数范围 */}
                <div className="space-y-6">
                  {/* 异常状态筛选 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      车辆状态
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setIsAnomaly(undefined);
                          setPage(1);
                        }}
                        className={`flex-1 min-w-[80px] py-2.5 px-3 text-sm font-medium rounded-xl transition-all ${
                          isAnomaly === undefined 
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md" 
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        全部
                      </button>
                      <button
                        onClick={() => {
                          setIsAnomaly(true);
                          setPage(1);
                        }}
                        className={`flex-1 min-w-[80px] py-2.5 px-3 text-sm font-medium rounded-xl transition-all ${
                          isAnomaly === true 
                            ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md" 
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        异常
                      </button>
                      <button
                        onClick={() => {
                          setIsAnomaly(false);
                          setPage(1);
                        }}
                        className={`flex-1 min-w-[80px] py-2.5 px-3 text-sm font-medium rounded-xl transition-all ${
                          isAnomaly === false 
                            ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md" 
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        正常
                      </button>
                    </div>
                  </div>

                  {/* 分数范围 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      分数范围
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-1">
                        <input
                          type="text"
                          placeholder="最小值"
                          className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          value={minScore}
                          onChange={(e) => {
                            setMinScore(e.target.value);
                            setPage(1);
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-center md:col-span-1">
                        <span className="text-gray-400 font-medium">-----</span>
                      </div>
                      <div className="md:col-span-1">
                        <input
                          type="text"
                          placeholder="最大值"
                          className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          value={maxScore}
                          onChange={(e) => {
                            setMaxScore(e.target.value);
                            setPage(1);
                          }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      支持小数格式，如 0.001 或科学计数法
                    </p>
                  </div>
                </div>

                {/* 第二行：排序字段和排序方向 */}
                <div className="space-y-6">
                  {/* 排序字段 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      排序字段
                    </label>
                    <div className="relative">
                      <select
                        className="w-full py-2.5 pl-4 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none transition-all bg-white"
                        value={sortBy}
                        onChange={(e) => {
                          setSortBy(e.target.value as any);
                          setPage(1);
                        }}
                      >
                        <option value="score_value">异常分数</option>
                        <option value="vehicle_id">车辆ID</option>
                        <option value="created_at">创建时间</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* 排序方向 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      排序方向
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          setSortDesc(true);
                          setPage(1);
                        }}
                        className={`py-2.5 px-3 text-sm font-medium rounded-lg transition-all flex items-center justify-center ${
                          sortDesc 
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md" 
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                        </svg>
                        降序
                      </button>
                      <button
                        onClick={() => {
                          setSortDesc(false);
                          setPage(1);
                        }}
                        className={`py-2.5 px-3 text-sm font-medium rounded-lg transition-all flex items-center justify-center ${
                          !sortDesc 
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md" 
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 8l-4-4m4 4l4-4m-4 4V8" />
                        </svg>
                        升序
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={handleClearFilters}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  重置筛选
                </button>
                <button
                  onClick={() => {
                    handleSearch();
                    setShowFilters(false);
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 hover:shadow-md transition-all duration-200"
                >
                  应用筛选
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 数据表格 */}
        {vehicles.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-6">
              <BarChart3 className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-3">
              {isAnomaly !== undefined || minScore || maxScore ? "未找到符合条件的车辆" : "暂无车辆数据"}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              {isAnomaly !== undefined || minScore || maxScore 
                ? "请尝试调整筛选条件或清空筛选重新搜索"
                : `运行 ${runId} 中没有找到车辆检测结果`}
            </p>
            {(isAnomaly !== undefined || minScore || maxScore) && (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all"
              >
                清空筛选条件
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-200">
              {/* 加载遮罩 */}
              {isPageFetching && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                  <div className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center">
                      <div className="w-12 h-12 border-4 border-blue-200 rounded-full"></div>
                      <div className="absolute w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-sm text-gray-600">正在加载数据...</p>
                  </div>
                </div>
              )}

              {/* 表格 */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 tracking-wider">
                        车辆ID
                      </th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 tracking-wider">
                        状态
                      </th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 tracking-wider">
                        异常分数
                      </th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 tracking-wider">
                        检测时间
                      </th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 tracking-wider">
                        分数类型
                      </th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 tracking-wider">
                        厂商
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {vehicles.map((v, index) => {
                      const maxScore = summaryQuery.data?.max_score || 1;
                      const scorePercentage = (v.score / maxScore) * 100;
                      const scoreTypeStyle = getScoreTypeStyle(v.score_type);
                      
                      return (
                        <tr key={`${v.vehicle_id}-${index}`} className="hover:bg-gray-50/80 transition-colors">
                          {/* 车辆ID */}
                          <td className="px-8 py-5">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center mr-3">
                                <span className="text-blue-600 font-bold">#{v.vehicle_id}</span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">车辆 {v.vehicle_id}</div>
                                <div className="text-xs text-gray-500">code: {v.vehicle_code}</div>
                              </div>
                            </div>
                          </td>

                          {/* 状态 */}
                          <td className="px-8 py-5">
                            <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${v.is_anomaly 
                              ? "bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200" 
                              : "bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200"
                            }`}>
                              {v.is_anomaly ? (
                                <>
                                  <div className="w-2 h-2 bg-red-500 rounded-full mr-1.5"></div>
                                  异常
                                </>
                              ) : (
                                <>
                                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></div>
                                  正常
                                </>
                              )}
                            </div>
                          </td>

                          {/* 异常分数 */}
                          <td className="px-8 py-5">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="text-sm font-mono font-bold text-gray-900">
                                  {formatScore(v.score)}
                                </div>
                                <div className="text-xs font-medium text-gray-500">
                                  {scorePercentage.toFixed(1)}%
                                </div>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-700 ${getScoreColor(v.score, maxScore)}`}
                                  style={{ width: `${Math.min(scorePercentage, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>

                          {/* 检测时间 */}
                          <td className="px-8 py-5">
                            <div className="text-sm text-gray-900">
                              {formatDateTime(v.created_at)}
                            </div>
                          </td>

                          {/* 分数类型 */}
                          <td className="px-8 py-5">
                            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium border ${scoreTypeStyle.bg}`}>
                              {scoreTypeStyle.text}
                            </span>
                          </td>

                          {/* 厂商 */}
                          <td className="px-8 py-5">
                            <div className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${v.vendor 
                              ? "bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 border border-indigo-200"
                              : "bg-gray-50 text-gray-500 border border-gray-200"
                            }`}>
                              {v.vendor || "未指定"}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 分页控件 */}
            {totalPages > 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-sm text-gray-700">
                    显示第 <span className="font-semibold">{(page - 1) * pageSize + 1}</span> -{" "}
                    <span className="font-semibold">{Math.min(page * pageSize, total)}</span> 条，
                    共 <span className="font-semibold">{total}</span> 条记录
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage(p => p - 1)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      上一页
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${page === pageNum
                              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                              : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      disabled={page >= totalPages}
                      onClick={() => setPage(p => p + 1)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      下一页
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}