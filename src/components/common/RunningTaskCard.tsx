// RunningTaskCard.tsx
import React, { useEffect, useState } from "react";
import { initRunWebSocket } from "../../hooks/runRuntimeWS";
import { cancelRun } from "../../hooks/useModelRun";
import type { RunRuntimeVO } from "../../types/vo/RunRuntimeVO";

interface RunningTaskCardProps {
  runId: number;
  onFinished: () => void;
}

export default function RunningTaskCard({ runId, onFinished }: RunningTaskCardProps) {
  const [runtime, setRuntime] = useState<RunRuntimeVO | null>(null);

  useEffect(() => {
    const ws = initRunWebSocket(runId, (data: RunRuntimeVO) => {
      setRuntime(data);
      if (["SUCCESS", "FAILED", "STALE"].includes(data.status)) {
        onFinished();
        ws.close();
      }
    });

    return () => ws.close();
  }, [runId, onFinished]);

  if (!runtime)
    return (
      <div className="bg-white shadow rounded p-4 w-80 flex flex-col gap-2 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        <div className="h-2 bg-gray-200 rounded w-full mt-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
        <div className="h-8 bg-gray-200 rounded w-full mt-2"></div>
      </div>
    );

  const progressPercent = Math.min(100, Math.max(0, runtime.progress || 0));

  const handleCancel = async () => {
    await cancelRun(runId);
  };

  return (
    <div className="bg-white shadow rounded p-4 w-80 flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <div className="font-semibold text-gray-800">任务 #{runtime.run_id}</div>
        <div
          className={`px-2 py-0.5 text-xs rounded ${
            runtime.status === "SUCCESS"
              ? "bg-green-100 text-green-800"
              : runtime.status === "FAILED"
              ? "bg-red-100 text-red-800"
              : runtime.status === "CANCELLED"
              ? "bg-gray-100 text-gray-700"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {runtime.status}
        </div>
      </div>

      <div className="text-sm text-gray-600">{runtime.stage || "--"}</div>

      <div className="w-full bg-gray-200 h-3 rounded">
        <div
          className="bg-blue-500 h-3 rounded transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex justify-between text-sm text-gray-500">
        <span>进度: {progressPercent}%</span>
        {runtime.last_tick && <span>{new Date(runtime.last_tick).toLocaleTimeString()}</span>}
      </div>

      <button
        className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        onClick={handleCancel}
        disabled={runtime.status !== "RUNNING"}
      >
        取消
      </button>
    </div>
  );
}
