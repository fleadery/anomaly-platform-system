// RunDetailPage.tsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getModelRunStatus, updateRun } from "../hooks/useModelRun";
import type { ModelRunVO } from "../types/vo/ModelRunVO";
import type { ModelRunUpdateDTO } from "../types/dto/ModelRunUpdateDTO";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Save, Calendar, Activity, Clock } from "lucide-react";
import { useVehicleSummary } from "../hooks/useVehicleResult"; // 新 hook
import VehicleSummaryPanel from "../components/ui/VehicleSummaryPanel";
import { useLayout } from "../components/common/LayoutContext";

// 将毫秒数转成 HH:MM:SS
function formatDuration(ms: number) {
  if (ms < 0) return "--:--:--";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;
}

export default function RunDetailPage() {
  const { runId } = useParams<{ runId: string }>();
  const [run, setRun] = useState<ModelRunVO | null>(null);
  const [editName, setEditName] = useState("");
  const [remark, setRemark] = useState("");
  const [activeTab, setActiveTab] = useState<RunResultTab>("vehicles");
  const [isSaving, setIsSaving] = useState(false);

  const { setTitle } = useLayout();
  useEffect(() => {
  if (runId) {
    setTitle(`任务详情：${runId}`);
  } else {
    setTitle("任务详情");
  }
  }, [setTitle, runId]);

  useEffect(() => {
    if (runId) {
      getModelRunStatus(Number(runId)).then(res => {
        setRun(res.data);
        setEditName(res.data.run_name);
        setRemark(res.data.parameters?.remark || "");
      });
    }
  }, [runId]);

  const handleUpdate = async () => {
    if (!run) return;
    setIsSaving(true);
    try {
      const dto: ModelRunUpdateDTO = {
        run_name: editName,
        remark,
      };
      const res = await updateRun(run.id, dto);
      setRun(res);
    } finally {
      setIsSaving(false);
    }
  };

  // RunDetailPage 内部
  const { data: vehicleSummary, loading: summaryLoading, error: summaryError } = useVehicleSummary({
    runId: Number(runId),
    topN: 3,
  });


  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const fromPage = params.get("fromPage");

  const getStatusColor = (status?: string) => {
    switch(status?.toLowerCase()) {
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 头部导航 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {fromPage && (
              <button
                onClick={() => navigate(`/runs?page=${fromPage}`)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all duration-200"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                返回列表
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">运行任务详情</h1>
              <p className="text-sm text-gray-500 mt-1">ID: {runId}</p>
            </div>
          </div>
          
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(run?.status)}`}>
            <Activity className="w-4 h-4 mr-2" />
            {run?.status || '加载中...'}
          </div>
        </div>

        {/* 任务信息卡片 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">任务名称</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="请输入任务名称"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">备注</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 min-h-[100px]"
                  value={run?.remark || ''}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="添加备注..."
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">创建时间</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mt-2">
                    {run?.started_at ? new Date(run.started_at).toLocaleDateString('zh-CN') : 'N/A'}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">最近心跳</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mt-2">
                    {run?.last_heartbeat ? new Date(run.last_heartbeat).toLocaleTimeString('zh-CN') : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">详细信息</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>运行时长:</span>
                    <span className="font-medium">
                        {run?.started_at && run?.ended_at
                            ? formatDuration(new Date(run.ended_at).getTime() - new Date(run.started_at).getTime())
                            : "--:--:--"
                        }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>模型版本:</span>
                    <span className="font-medium">v1.0.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              className={`inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ${
                isSaving ? 'opacity-75 cursor-not-allowed' : ''
              }`}
              onClick={handleUpdate}
              disabled={isSaving}
            >
              <Save className="w-5 h-5 mr-2" />
              {isSaving ? '保存中...' : '保存修改'}
            </button>
          </div>
        </div>

        {/* 内容切换区 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-1 px-6">
              <button
                className={`relative px-6 py-4 text-sm font-medium transition-all duration-200 ${
                  activeTab === "vehicles"
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("vehicles")}
              >
                <span className="relative z-10">车辆结果</span>
                {activeTab === "vehicles" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t"></div>
                )}
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* 车辆结果视图 */}
            {activeTab === "vehicles" && (
              <VehicleSummaryPanel
                summaryLoading={summaryLoading}
                summaryError={summaryError}
                vehicleSummary={vehicleSummary}
                currentPage={Number(fromPage) || 1}
                runId={Number(runId)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}