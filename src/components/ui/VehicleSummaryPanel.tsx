// src/components/VehicleSummaryPanel.tsx
import React from "react";
import type { VehicleSummaryVO, TopVehicleVO } from "../../types/vo/VehicleSummaryVO";
import { useNavigate } from "react-router-dom";

interface VehicleSummaryPanelProps {
  vehicleSummary: VehicleSummaryVO | null;
  summaryLoading: boolean;
  summaryError: string | null;
  currentPage?: number;
  runId: number;
}

export default function VehicleSummaryPanel({
  vehicleSummary,
  summaryLoading,
  summaryError,
  currentPage,
  runId,
}: VehicleSummaryPanelProps) {
  const navigate = useNavigate();

  if (summaryLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">加载车辆数据中...</p>
      </div>
    );
  }

  if (summaryError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">数据加载失败</h3>
        <p className="text-gray-600 mb-4">{summaryError}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          重新加载
        </button>
      </div>
    );
  }

  if (!vehicleSummary) {
    return (
      <div className="text-center py-12">
        <div className="inline-block p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
          <div className="text-4xl mb-4">🚗</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">车辆结果</h3>
          <p className="text-gray-500">暂无车辆数据</p>
        </div>
      </div>
    );
  }

  // 渲染统计卡片和 top 异常车辆
  return (
    <div className="space-y-6 py-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* 总车辆数 */}
        <StatCard
          title="总车辆数"
          value={vehicleSummary.total}
          iconColor="blue"
          icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          label="所有参与车辆"
        />
        {/* 异常车辆数 */}
        <StatCard
          title="异常车辆数"
          value={vehicleSummary.abnormal}
          iconColor="red"
          icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.272 16.5c-.77.833.192 2.5 1.732 2.5z"
          label="需要关注"
          statusIcon={vehicleSummary.abnormal > 0 ? "⚠️" : "✅"}
        />
        {/* 正常车辆数 */}
        <StatCard
          title="正常车辆数"
          value={vehicleSummary.normal}
          iconColor="green"
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          label="运行正常"
          statusIcon="✓"
        />
        {/* 异常比例 */}
        <StatCard
          title="异常比例"
          value={`${(vehicleSummary.abnormal_ratio * 100).toFixed(2)}%`}
          iconColor="amber"
          icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          label="异常占比"
        />
      </div>

      {/* Top 异常车辆 */}
      {vehicleSummary.top_abnormal?.length > 0 && (
        <TopAbnormalTable topAbnormal={vehicleSummary.top_abnormal} />
      )}

      {/* 无异常车辆 */}
      {vehicleSummary.abnormal === 0 && (
        <NoAbnormalPanel />
      )}

      {/* 新增：悬浮详情按钮 */}
      <div className="fixed bottom-6 right-6 z-10">
        <button 
          className="group inline-flex items-center px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:-translate-y-1 active:translate-y-0"
            onClick={() =>
              navigate(
                `/runs/${runId}/vehicles?fromPage=${currentPage ?? 1}`
              )
            }          
          >
          <div className="mr-3 relative">
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-75"></span>
          </div>
          查看全部详情
          <svg 
            className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M17 8l4 4m0 0l-4 4m4-4H3" 
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

// =========================
// 可复用小组件
// =========================
interface StatCardProps {
  title: string;
  value: string | number;
  iconColor: "blue" | "red" | "green" | "amber";
  icon: string;
  label: string;
  statusIcon?: string;
}
function StatCard({ title, value, iconColor, icon, label, statusIcon }: StatCardProps) {
  const colors = {
    blue: ["from-blue-50", "to-blue-100", "border-blue-200", "text-blue-600", "text-blue-700", "bg-blue-200"],
    red: ["from-red-50", "to-red-100", "border-red-200", "text-red-600", "text-red-700", "bg-red-200"],
    green: ["from-green-50", "to-green-100", "border-green-200", "text-green-600", "text-green-700", "bg-green-200"],
    amber: ["from-amber-50", "to-amber-100", "border-amber-200", "text-amber-600", "text-amber-700", "bg-amber-200"],
  };
  const [from, to, border, textIcon, textTitle, bgLabel] = colors[iconColor];

  return (
    <div className={`bg-gradient-to-br ${from} ${to} border ${border} rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`p-3 rounded-xl mr-4 ${textIcon} bg-opacity-20`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
            </svg>
          </div>
          <div>
            <p className={`text-sm font-medium ${textTitle}`}>{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
        </div>
        {statusIcon && <div className={`text-sm ${textIcon} font-medium`}>{statusIcon}</div>}
      </div>
      <div className={`text-xs ${textTitle} font-medium`}>
        <span className={`bg-opacity-30 ${bgLabel} px-2 py-1 rounded-full`}>{label}</span>
      </div>
    </div>
  );
}

interface TopAbnormalTableProps {
  topAbnormal: TopVehicleVO[];
}
function TopAbnormalTable({ topAbnormal }: TopAbnormalTableProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <h3 className="text-lg font-semibold text-gray-900">Top 异常车辆</h3>
        <p className="text-sm text-gray-500">异常分数最高的前 {topAbnormal.length} 辆车</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">排名</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">车辆ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">车架号</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">异常分数</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {topAbnormal.map((v, i) => (
              <tr key={v.vehicle_id}>
                <td className="px-6 py-4">{i + 1}</td>
                <td className="px-6 py-4">{v.vehicle_id}</td>
                <td className="px-6 py-4">{v.vehicle_code}</td>
                <td className="px-6 py-4">{v.score.toExponential(6)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NoAbnormalPanel() {
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">🎉 运行状况良好！</h3>
      <p className="text-gray-600 mb-6">本次运行未发现异常车辆，所有车辆均正常运行</p>
      <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        运行成功率 100%
      </div>
    </div>
  );
}
