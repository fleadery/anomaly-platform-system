// src/pages/DashboardPage.tsx
import { useEffect } from "react";
import { useLayout } from "../components/common/LayoutContext";
import ReactECharts from "echarts-for-react";
import {
  useRunStats,
  useDatasetStats,
  useAnomalyStats,
  useScoreDistribution,
  useRecentRuns,
  useVisualizationJobStats,
} from "../hooks/useDashboard";

// 辅助函数：格式化数字（保留指定位数）
const formatNumber = (num: number | undefined, precision = 0) => {
  if (num === undefined) return "0";
  if (precision === 0) return num.toFixed(0);
  return num.toFixed(precision);
};

// ================= 新增图标组件（用于可视化卡片） =================
function VizIcon({ type }: { type: 'total' | 'running' | 'success' | 'failed' }) {
  // 可根据 type 返回不同图标，这里简化为一个通用摄像机图标（代表可视化）
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );
}

export default function DashboardPage() {
  const { setTitle } = useLayout();

  useEffect(() => {
    setTitle("仪表盘");
  }, [setTitle]);

  // 获取数据
  const { data: runStats, isLoading: runLoading } = useRunStats();
  const { data: datasetStats, isLoading: datasetLoading } = useDatasetStats();
  const { data: anomalyStats, isLoading: anomalyLoading } = useAnomalyStats();
  const { data: scoreDistribution, isLoading: scoreLoading } = useScoreDistribution();
  const { data: recentRuns, isLoading: runsLoading } = useRecentRuns();
  const { data: vizStats, isLoading: vizLoading } = useVisualizationJobStats();

  const isLoading =
    runLoading || datasetLoading || anomalyLoading || scoreLoading || runsLoading;

  // 分数分布图表配置
  const scoreChartOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: "rgba(255,255,255,0.95)",
      borderColor: "#e2e8f0",
      borderWidth: 1,
      textStyle: { color: "#1e293b", fontSize: 12 },
      formatter: (params: any) => {
        const item = params[0];
        return `
          <div style="font-weight: 500; margin-bottom: 4px;">分数区间</div>
          <div>${item.name} : <span style="font-weight: 600;">${item.value}</span> 个片段</div>
        `;
      },
      extraCssText: "box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); border-radius: 12px;",
    },
    grid: {
      left: "8%",
      right: "5%",
      bottom: "10%",
      top: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: scoreDistribution?.map((b) => b.bucket) ?? [],
      axisLine: { lineStyle: { color: "#cbd5e1" } },
      axisTick: { show: false },
      axisLabel: { color: "#475569", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      name: "片段数量",
      nameTextStyle: { color: "#64748b", fontSize: 12, fontWeight: 500 },
      splitLine: { lineStyle: { color: "#f1f5f9", type: "dashed" } },
      axisLabel: { color: "#475569", fontSize: 11 },
    },
    series: [
      {
        data: scoreDistribution?.map((b) => b.count) ?? [],
        type: "bar",
        barWidth: "60%",
        itemStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "#3b82f6" },
              { offset: 1, color: "#10b981" },
            ],
          },
          borderRadius: [4, 4, 0, 0],
          opacity: 0.8,
        },
        emphasis: {
          itemStyle: {
            opacity: 1,
            shadowBlur: 10,
            shadowColor: "rgba(59,130,246,0.5)",
          },
        },
      },
    ],
  };

  // 最近运行表格列定义（简单表格，不使用复杂组件）
  const renderRecentRunsTable = () => {
    if (!recentRuns?.length) {
      return (
        <div className="text-center py-8 text-gray-500">
          暂无最近运行记录
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Run ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                任务名称
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                模型
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                创建时间
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {recentRuns.map((run: any) => {
              // 根据状态确定徽章样式
              const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
                PENDING: { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-500" },
                RUNNING: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
                SUCCESS: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
                FAILED: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
                CANCELLED: { bg: "bg-gray-50", text: "text-gray-700", dot: "bg-gray-500" },
              };
              const style = statusStyles[run.status] || statusStyles.PENDING;

              return (
                <tr key={run.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {run.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {run.run_name || "--"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {run.model_type || "--"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${style.bg} ${style.text} border-current/10`}
                    >
                      <span className={`w-2 h-2 rounded-full mr-1.5 ${style.dot}`}></span>
                      {run.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(run.created_at).toLocaleString("zh-CN")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative inline-flex">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">加载仪表盘数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">系统运行概览</h1>
        </div>

        {/* 统计卡片 - 运行状态 */}
        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <span className="w-1 h-5 bg-blue-500 rounded-full mr-2"></span>
            模型任务统计
          </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="总运行次数"
            value={formatNumber(runStats?.total)}
            icon={<RunIcon />}
            color="blue"
          />
          <StatCard
            title="运行中"
            value={formatNumber(runStats?.running)}
            icon={<RunningIcon />}
            color="amber"
          />
          <StatCard
            title="成功"
            value={formatNumber(runStats?.success)}
            icon={<SuccessIcon />}
            color="green"
          />
          <StatCard
            title="失败"
            value={formatNumber(runStats?.failed)}
            icon={<FailedIcon />}
            color="red"
          />
        </div>

        {/* 新增：可视化任务统计卡片 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <span className="w-1 h-5 bg-purple-500 rounded-full mr-2"></span>
            可视化任务统计
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="总任务数"
              value={formatNumber(vizStats?.total)}
              icon={<VizIcon type="total" />}
              color="purple"
            />
            <StatCard
              title="运行中"
              value={formatNumber(vizStats?.running)}
              icon={<VizIcon type="running" />}
              color="amber"
            />
            <StatCard
              title="成功"
              value={formatNumber(vizStats?.success)}
              icon={<VizIcon type="success" />}
              color="green"
            />
            <StatCard
              title="失败"
              value={formatNumber(vizStats?.failed)}
              icon={<VizIcon type="failed" />}
              color="red"
            />
          </div>
        </div>

        {/* 数据集和异常统计 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <DatasetIcon className="w-5 h-5 mr-2 text-blue-600" />
              数据集统计
            </h2>
            <div className="space-y-4">
              <StatLine label="车辆总数" value={formatNumber(datasetStats?.total_vehicles)} />
              <StatLine label="片段总数" value={formatNumber(datasetStats?.total_segments)} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <AnomalyIcon className="w-5 h-5 mr-2 text-amber-600" />
              异常统计
            </h2>
            <div className="space-y-4">
              <StatLine
                label="异常车辆数"
                value={formatNumber(anomalyStats?.vehicles_with_anomaly)}
              />
              <StatLine
                label="平均分数"
                value={formatNumber(anomalyStats?.avg_score, 6)}
              />
              <StatLine
                label="最大分数"
                value={formatNumber(anomalyStats?.max_score, 6)}
              />
            </div>
          </div>
        </div>

        {/* 分数分布柱状图 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <BarChartIcon className="w-5 h-5 mr-2 text-purple-600" />
            分数分布
          </h2>
          <div className="h-80">
            <ReactECharts
              option={scoreChartOption}
              style={{ width: "100%", height: "100%" }}
              opts={{ renderer: "canvas" }}
            />
          </div>
        </div>

        {/* 最近运行表格 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <TableIcon className="w-5 h-5 mr-2 text-indigo-600" />
            最近运行
          </h2>
          {renderRecentRunsTable()}
        </div>
      </div>
    </div>
  );
}

// ================= 辅助组件 =================

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: "blue" | "green" | "red" | "amber" | "purple";
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: "from-blue-50 to-blue-100 border-blue-200 text-blue-700",
    green: "from-green-50 to-green-100 border-green-200 text-green-700",
    red: "from-red-50 to-red-100 border-red-200 text-red-700",
    amber: "from-amber-50 to-amber-100 border-amber-200 text-amber-700",
    purple: "from-purple-50 to-purple-100 border-purple-200 text-purple-700",
  };
  const iconBg = {
    blue: "bg-blue-100",
    green: "bg-green-100",
    red: "bg-red-100",
    amber: "bg-amber-100",
    purple: "bg-purple-100",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${iconBg[color]}`}>{icon}</div>
      </div>
    </div>
  );
}

function StatLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center border-b border-gray-100 pb-2 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-lg font-semibold text-gray-900">{value}</span>
    </div>
  );
}

// 图标组件（使用 SVG，实际项目中可替换为 lucide-react）
function RunIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
      />
    </svg>
  );
}

function RunningIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function FailedIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function DatasetIcon(props: { className?: string }) {
  return (
    <svg className={props.className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
      />
    </svg>
  );
}

function AnomalyIcon(props: { className?: string }) {
  return (
    <svg className={props.className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"
      />
    </svg>
  );
}

function BarChartIcon(props: { className?: string }) {
  return (
    <svg className={props.className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  );
}

function TableIcon(props: { className?: string }) {
  return (
    <svg className={props.className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
      />
    </svg>
  );
}