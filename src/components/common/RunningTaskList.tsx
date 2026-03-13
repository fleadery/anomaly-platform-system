import React from "react";
import type { RunningTaskVM } from "../../types/data/RunningTaskVM";
import { cancelRun } from "../../hooks/useModelRun";
import dayjs from "dayjs";

interface RunningTaskListProps {
  task: RunningTaskVM;
  index?: number;
}

export default function RunningTaskList({ task, index }: RunningTaskListProps) {
    const progressPercent = Math.min(
        100,
        Math.max(0, Math.round((task.progress || 0) * 100))
      );      
  
  // 根据状态返回不同的样式
  const getStatusConfig = (status: string) => {
    const statusLower = status.toLowerCase();
    
    switch (statusLower) {
      case "running":
        return {
          bg: "bg-green-50",
          text: "text-green-700",
          border: "border-green-200",
          dot: "bg-green-500",
          pulse: true,
        };
      case "pending":
        return {
          bg: "bg-yellow-50",
          text: "text-yellow-700",
          border: "border-yellow-200",
          dot: "bg-yellow-500",
          pulse: false,
        };
      case "completed":
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          border: "border-blue-200",
          dot: "bg-blue-500",
          pulse: false,
        };
      case "cancelled":
      case "failed":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          border: "border-red-200",
          dot: "bg-red-500",
          pulse: false,
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-700",
          border: "border-gray-200",
          dot: "bg-gray-500",
          pulse: false,
        };
    }
  };
  
  // 根据进度返回进度条颜色
  const getProgressColor = (progress: number) => {
    if (progress >= 90) return "bg-gradient-to-r from-green-500 to-emerald-600";
    if (progress >= 70) return "bg-gradient-to-r from-blue-500 to-cyan-600";
    if (progress >= 50) return "bg-gradient-to-r from-yellow-500 to-amber-600";
    if (progress >= 30) return "bg-gradient-to-r from-orange-500 to-amber-600";
    return "bg-gradient-to-r from-gray-400 to-gray-500";
  };
  
  // 格式化状态文本
  const formatStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      "RUNNING": "运行中",
      "PENDING": "等待中",
      "COMPLETED": "已完成",
      "CANCELLED": "已取消",
      "FAILED": "失败",
    };
    return statusMap[status] || status;
  };
  
  // 格式化任务ID
  const formatTaskId = (id: number) => {
    const strId = String(id);
    if (strId.length > 10) {
      return `${strId.substring(0, 8)}...`;
    }
    return strId;
  };  
  
  const handleCancel = async () => {
    await cancelRun(task.id);
  };
  
  const statusConfig = getStatusConfig(task.status);
  const progressColor = getProgressColor(progressPercent);
  const duration = task.last_tick && task.created_at
    ? dayjs(task.last_tick).diff(dayjs(task.created_at), "second")
    : null;

  return (
    <tr className={`transition-all duration-200 hover:bg-gray-50/80 ${index !== undefined && index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
      {/* 任务ID */}
      <td className="py-4 px-6">
        <div className="flex items-center">
          <div className="shrink-0 w-8 h-8 rounded-lg bg-linear-to-br from-blue-50 to-blue-100 border border-blue-100 flex items-center justify-center mr-3">
            <svg 
              className="w-4 h-4 text-blue-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
              />
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 font-mono">
              {formatTaskId(task.id)}
            </div>
            <div className="text-xs text-gray-500">任务标识</div>
          </div>
        </div>
      </td>
      
      {/* 阶段 */}
      <td className="py-4 px-6">
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-800 px-3 py-1 bg-gray-100 rounded-md">
            {task.stage || "--"}
          </span>
        </div>
      </td>
      
      {/* 状态 */}
      <td className="py-4 px-6">
        <div className="flex items-center">
          <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}>
            {statusConfig.pulse && (
              <span className={`mr-2 w-2 h-2 rounded-full ${statusConfig.dot} ${statusConfig.pulse ? 'animate-pulse' : ''}`}></span>
            )}
            {formatStatusText(task.status)}
          </div>
        </div>
      </td>
      
      {/* 进度 */}
      <td className="py-4 px-6">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700">
              进度 {progressPercent}%
            </span>
            <span className="text-xs font-semibold text-gray-900">
              {progressPercent}/100
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-2 rounded-full transition-all duration-700 ease-out ${progressColor}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </td>
      
      {/* 运行时间 */}
      <td className="py-4 px-6">
        <div className="flex flex-col">
          {duration !== null ? (
            <>
              <div className="text-sm font-medium text-gray-900">
                {duration}s
              </div>
              <div className="flex items-center text-xs text-gray-500 mt-0.5">
                <svg 
                  className="w-3 h-3 mr-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                运行时长
              </div>
            </>
          ) : (
            <span className="text-sm text-gray-400">--</span>
          )}
        </div>
      </td>
      
      {/* 操作按钮 */}
      <td className="py-4 px-6">
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleCancel} 
            disabled={task.status !== "RUNNING"}
            className={`
              inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium
              transition-all duration-200 transform hover:scale-[1.02] active:scale-95
              ${task.status === "RUNNING" 
                ? "bg-linear-to-r from-red-500 to-rose-600 text-white shadow-sm hover:shadow hover:from-red-600 hover:to-rose-700" 
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }
            `}
          >
            <svg 
              className={`w-4 h-4 mr-2 ${task.status === "RUNNING" ? "text-white" : "text-gray-400"}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
            取消任务
          </button>
          
          {/* 可选：更多操作按钮 */}
          {/* <button 
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
          >
            <svg 
              className="w-4 h-4 mr-1.5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            详情
          </button> */}
        </div>
      </td>
    </tr>
  );
}