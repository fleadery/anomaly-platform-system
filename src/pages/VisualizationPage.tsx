// src/pages/VisualizationPage.tsx
import { useEffect, useState, useMemo, useRef } from "react";
import { useDebounce } from "use-debounce";
import { useLayout } from "../components/common/LayoutContext";
import toast from 'react-hot-toast';
import {
  useCreateVisualizationJob,
  useVisualizationResult,
  useVisualizationJobDetail,
  useModelRuns,
  downloadVisualizationData
} from "../hooks/useVisualization";
import type { ModelRunListVO } from "../types/vo/VisualizationVO";
import * as echarts from 'echarts';

import {
  Search,
  Calendar,
  Filter,
  Play,
  Download,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  AlertCircle,
  ChevronDown
} from "lucide-react";

function formatRunLabel(run: ModelRunListVO) {
  const date = new Date(run.created_at).toLocaleString();
  return `${run.run_name || `Run ${run.id}`} | ${run.status} | ${date}`;
}

export default function VisualizationPage() {
  const { setTitle } = useLayout();

  useEffect(() => {
    setTitle("可视化分析");
  }, [setTitle]);

  // ===== 状态 =====
  const [runId, setRunId] = useState<number>();
  const [method, setMethod] = useState<string>("PCA");

  // ===== 筛选状态 =====
  const [datasetScope, setDatasetScope] = useState<string>();
  const [keyword, setKeyword] = useState("");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");

  // ===== 防抖搜索 =====
  const [debouncedKeyword] = useDebounce(keyword, 300);

  // ===== 查询参数（useMemo 保持引用稳定） =====
  const queryParams = useMemo(() => ({
    dataset_scope: datasetScope as any,
    keyword: debouncedKeyword || undefined,
    created_from: createdFrom || undefined,
    created_to: createdTo || undefined
  }), [datasetScope, debouncedKeyword, createdFrom, createdTo]);
  

  // ===== hooks =====
  const { data: runs, isLoading: runsLoading, refetch } = useModelRuns(queryParams, { enabled: false });
  const { data: result, isLoading: resultLoading } = useVisualizationResult(runId, method);
  const createMutation = useCreateVisualizationJob();
  const jobId = result?.job_id;
  const { data: jobDetail } = useVisualizationJobDetail(jobId);

  // ===== 处理创建任务 ===== ,
  const handleCreate = () => {
    if (!runId || !method) return;
    createMutation.mutate(
      {
        run_id: runId,
        method
      },
      {
        onSuccess: (data) => {
          toast.success("任务已提交");
          if (data.exists) {
            toast.success("已存在任务，直接复用");
          }
        },
        onError: (err: any) => {
          if (err.response?.code === 0) {
            toast.error(err.response?.message);
          } else {
            toast.error("创建失败");
          }
        }
      }
    );
  };

  const handleSearch = () => {
    refetch();  // 直接使用最新的 fetchRuns 函数
  };

  const status = (result?.status || jobDetail?.status) ?? 'PENDING';
  const progress = jobDetail?.progress ?? 0;
  
  // 在 VisualizationPage 组件内部
  const chartRef = useRef<echarts.ECharts>();
  useEffect(() => {
    if (status === 'SUCCESS' && result?.points?.length) {
      const chartDom = document.getElementById('scatterChart');
      if (!chartDom) return;

      // 如果已有实例，先销毁再重建
      if (chartRef.current) {
        chartRef.current.dispose();
      }
      
      const chart = echarts.init(chartDom);
      chartRef.current = chart;

      const blueColor = '#3b82f6';
      const redColor = '#ef4444';

      // 映射 points，每个点带 label
      const seriesData = result.points.map(p => ({
        value: [p[0], p[1]],
        itemStyle: {
          color: p[2] === 1 ? redColor : blueColor
        }
      }));

      const option = {
        backgroundColor: 'transparent',
        // 图例：显示两个类别，颜色与点对应
        legend: {
          show: true,
          orient: 'horizontal',
          right: 20,
          top: 10,
          itemWidth: 12,
          itemHeight: 12,
          borderRadius: 6,
          textStyle: {
            color: '#334155',
            fontSize: 12,
            fontWeight: 400,
            fontFamily: 'Inter, system-ui, sans-serif',
          },
          data: [
            { name: '类别 0', icon: 'circle', itemStyle: { color: '#3b82f6' } },
            { name: '类别 1', icon: 'circle', itemStyle: { color: '#ef4444' } },
          ],
        },
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(255,255,255,0.98)',
          borderColor: 'rgba(203,213,225,0.5)',
          borderWidth: 1,
          borderRadius: 12,
          padding: [10, 14],
          textStyle: {
            color: '#0f172a',
            fontSize: 12,
            fontFamily: 'Inter, system-ui, sans-serif',
            lineHeight: 20,
          },
          formatter: (params: any) => {
            const color = params.color === '#3b82f6' ? '🔵 蓝色' : '🔴 红色';
            return `
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                <span style="display: inline-block; width: 10px; height: 10px; border-radius: 10px; background-color: ${params.color};"></span>
                <span style="font-weight: 600;">${color}</span>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div><span style="color: #64748b;">X 维度</span><br><span style="font-weight: 600;">${params.value[0]?.toFixed(4)}</span></div>
                <div><span style="color: #64748b;">Y 维度</span><br><span style="font-weight: 600;">${params.value[1]?.toFixed(4)}</span></div>
              </div>
            `;
          },
          extraCssText:
            'box-shadow: 0 20px 30px -10px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.05); backdrop-filter: blur(4px);',
        },
        grid: {
          left: '12%',
          right: '8%',
          bottom: '14%',
          top: '16%',
          containLabel: false,
          borderColor: 'transparent',
        },
        xAxis: {
          type: 'value',
          name: '维度 1',
          nameLocation: 'middle',
          nameGap: 35,
          nameTextStyle: {
            color: '#1e293b',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'Inter, system-ui, sans-serif',
          },
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: '#475569',
            fontSize: 11,
            margin: 10,
            fontWeight: 400,
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#e2e8f0',
              width: 1,
              type: 'dashed',
              opacity: 0.6,
            },
          },
        },
        yAxis: {
          type: 'value',
          name: '维度 2',
          nameLocation: 'middle',
          nameGap: 50,
          nameTextStyle: {
            color: '#1e293b',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'Inter, system-ui, sans-serif',
          },
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: '#475569',
            fontSize: 11,
            margin: 10,
            fontWeight: 400,
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#e2e8f0',
              width: 1,
              type: 'dashed',
              opacity: 0.6,
            },
          },
        },
        series: [
          {
            name: '数据点',
            type: 'scatter',
            data: seriesData,  // seriesData 需要根据颜色分别构造，或直接使用原有数据
            symbol: 'circle',
            symbolSize: (value: any) => {
              // 根据数据量动态调整点大小，假设总点数超过 5000 则缩小点
              const total = seriesData.length;
              if (total > 5000) return 5;
              if (total > 2000) return 6;
              return 8;
            },
            itemStyle: {
              // 如果 seriesData 中每个点已指定 itemStyle.color，则此处可省略
              opacity: 0.7,
              borderColor: '#ffffff',
              borderWidth: 0.5,
            },
            emphasis: {
              scale: 1.5,
              itemStyle: {
                opacity: 1,
                borderColor: '#0f172a',
                borderWidth: 2,
                shadowBlur: 15,
                shadowColor: 'rgba(0,0,0,0.4)',
              },
            },
            progressive: 1000,
            progressiveThreshold: 3000,
            animation: true,
            animationDuration: 1000,
            animationEasing: 'cubicOut',
          },
        ],
        dataZoom: [
          {
            type: 'slider',
            start: 0,
            end: 100,
            backgroundColor: '#f1f5f9',
            borderColor: 'transparent',
            fillerColor: 'rgba(59,130,246,0.2)',
            handleStyle: {
              color: '#ffffff',
              borderColor: '#3b82f6',
              borderWidth: 2,
              shadowBlur: 4,
              shadowColor: 'rgba(59,130,246,0.3)',
            },
            moveHandleStyle: {
              color: '#3b82f6',
              opacity: 0.3,
            },
            textStyle: {
              color: '#1e293b',
              fontSize: 11,
              fontWeight: 500,
            },
            borderRadius: 20,
            height: 20,
          },
        ],
      };

      chart.setOption(option);

      const handleResize = () => chart.resize();
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.dispose();
        chartRef.current = undefined;
      };
    }
  }, [status, result?.points]);

  // 渲染状态徽章
  const renderStatusBadge = () => {
    if (!status) return null;

    const config: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
      PENDING: {
        color: "text-yellow-700",
        bg: "bg-yellow-50 border-yellow-200",
        icon: <Clock className="w-4 h-4" />
      },
      RUNNING: {
        color: "text-blue-700",
        bg: "bg-blue-50 border-blue-200",
        icon: <Loader2 className="w-4 h-4 animate-spin" />
      },
      SUCCESS: {
        color: "text-green-700",
        bg: "bg-green-50 border-green-200",
        icon: <CheckCircle className="w-4 h-4" />
      },
      FAILED: {
        color: "text-red-700",
        bg: "bg-red-50 border-red-200",
        icon: <XCircle className="w-4 h-4" />
      }
    };
    const { color, bg, icon } = config[status] || config.PENDING;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${bg} ${color}`}>
        {icon}
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">对运行任务进行降维可视化</h1>
          </div>
        </div>

        {/* 控制区 - 两列布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：筛选卡片 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 运行任务筛选卡片 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2 text-blue-600" />
                运行任务筛选
              </h2>

              <div className="space-y-4">
                {/* 厂商 + 时间范围 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">厂商</label>
                    <select
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                      value={datasetScope || ""}
                      onChange={(e) => setDatasetScope(e.target.value || undefined)}
                    >
                      <option value="">全部厂商</option>
                      <option value="vendorA">Vendor A</option>
                      <option value="vendorB">Vendor B</option>
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">创建时间</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center bg-white border border-gray-300 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-blue-500">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <input
                          type="date"
                          className="w-full outline-none bg-transparent text-sm"
                          value={createdFrom}
                          onChange={(e) => setCreatedFrom(e.target.value)}
                        />
                      </div>
                      <span className="text-gray-400">—</span>
                      <div className="flex-1 flex items-center bg-white border border-gray-300 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-blue-500">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <input
                          type="date"
                          className="w-full outline-none bg-transparent text-sm"
                          value={createdTo}
                          onChange={(e) => setCreatedTo(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 关键词搜索 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">任务名称</label>
                  <div className="flex items-center bg-white border border-gray-300 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-blue-500">
                    <Search className="w-4 h-4 text-gray-400 mr-2" />
                    <input
                      type="text"
                      placeholder="搜索任务名称..."
                      className="w-full outline-none bg-transparent text-sm"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>
                </div>

                {/* 运行任务下拉选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">选择运行任务</label>
                  <div className="relative">
                    <select
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white pr-10"
                      value={runId || ""}
                      onChange={(e) => setRunId(Number(e.target.value))}
                    >
                      <option value="">
                        {runsLoading ? "加载中..." : "选择运行任务"}
                      </option>
                      {runs?.map((run) => (
                        <option
                          key={run.id}
                          value={run.id}
                          disabled={run.status !== "SUCCESS"}
                          className={run.status !== "SUCCESS" ? "text-gray-400" : ""}
                        >
                          {formatRunLabel(run)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">仅显示状态为 SUCCESS 的任务</p>
                </div>
              </div>
              <button
                onClick={handleSearch}
                disabled={runsLoading}
                className="
                  w-full inline-flex items-center justify-center px-6 py-3
                  bg-gradient-to-r from-blue-600 to-blue-700
                  text-white font-medium rounded-xl
                  hover:from-blue-700 hover:to-blue-800 hover:shadow-md
                  transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                  mt-4
                "
              >
                {runsLoading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Search className="w-5 h-5 mr-2" />
                )}
                {runsLoading ? "查询中..." : "查询任务"}
              </button>
            </div>

            {/* 可视化参数卡片 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                可视化参数
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">降维方法</label>
                  <div className="relative">
                    <select
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white pr-10"
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                    >
                      <option value="PCA">PCA</option>
                      <option value="UMAP">UMAP</option>
                      <option value="TSNE">TSNE</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <button
                  onClick={handleCreate}
                  disabled={!runId || createMutation.isLoading}
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isLoading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-5 h-5 mr-2" />
                  )}
                  {createMutation.isLoading ? "创建中..." : "开始可视化"}
                </button>
              </div>
            </div>
          </div>

          {/* 右侧：任务状态卡片 */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                任务状态
              </h2>

              {!runId ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">请先选择运行任务</p>
                </div>
              ) : resultLoading ? (
                <div className="flex flex-col items-center py-8">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                  <p className="text-gray-500">加载中...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {status && (
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                      <span className="text-gray-600">当前状态</span>
                      {renderStatusBadge()}
                    </div>
                  )}

                  {/* 进度条 */}
                  {jobDetail && jobDetail.status === "RUNNING" && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">进度</span>
                        <span className="font-medium text-gray-900">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* 成功状态 */}
                  {status === "SUCCESS" && jobId && (
                    <div className="space-y-4 pt-2">
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-sm">
                        <CheckCircle className="w-5 h-5 inline mr-2" />
                        计算完成，可以下载结果文件
                      </div>
                      <button
                        onClick={() => downloadVisualizationData(jobId)}
                        className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 hover:shadow-md transition-all"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        下载结果
                      </button>
                    </div>
                  )}

                  {/* 失败状态 */}
                  {status === "FAILED" && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                      <XCircle className="w-5 h-5 inline mr-2" />
                      任务失败：{jobDetail?.error_msg || "未知错误"}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 结果展示区 */}
        {status === 'SUCCESS' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              可视化结果
            </h2>
            <div
              id="scatterChart"
              style={{ width: '100%', height: '500px' }}
              className="rounded-xl border border-gray-200"
            />
          </div>
        )}
      </div>
    </div>
  );
}