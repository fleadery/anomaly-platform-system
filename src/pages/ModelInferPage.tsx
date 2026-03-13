// ModelInferPage.tsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useLayout } from "../components/common/LayoutContext";
import CreateTaskFormProps from "../components/common/CreateTaskForm";
import RunningTasks from "../components/common/RunningTasks";
import { useRunningTasks } from "../hooks/useRunningTasks";

export default function ModelInferPage() {
  const { setTitle } = useLayout();
  const location = useLocation();

  useEffect(() => {
    setTitle("模型推理");
  }, [setTitle]);

  // 状态：算法、车辆、import job id（均以 null 表示未选）
  const [selectedAlgo, setSelectedAlgo] = useState<number | null>(null);
  const [selectedVehicles, setSelectedVehicles] = useState<number[]>([]);
  const [importJobId, setImportJobId] = useState<number | null>(null);

  // 运行中任务
  const { tasks, addTask } = useRunningTasks(3);

  // ----- 处理路由带回的 state（当从 JobVehicleSelectPage 返回时） -----
  // 使用 location.key 作为依赖，能在同一路由重复导航时触发（比如 push 相同 path 但不同 state）
  useEffect(() => {
    const state = (location.state || {}) as any;
    if (!state) return;

    // 如果没有任何我们需要的字段就跳过
    const hasImportJob = state.importJobId !== undefined || state.selectImportJobId !== undefined;
    const hasVehicles = Array.isArray(state.selectedVehicles);

    if (!hasImportJob && !hasVehicles) return;

    // 延迟执行以避免 React 严格模式 double invoke 的副作用问题（你之前也用了 setTimeout）
    setTimeout(() => {
      // 兼容旧 key 名（selectImportJobId）和新 key（importJobId）
      const returnedImportJobId = (state.importJobId ?? state.selectImportJobId) as number | undefined | null;
      if (returnedImportJobId != null) {
        setImportJobId(Number(returnedImportJobId));
      }

      if (hasVehicles) {
        // 保证传入的是 number[]，并去重
        const ids = Array.isArray(state.selectedVehicles)
          ? state.selectedVehicles.map((x: any) => Number(x)).filter((n: number) => !Number.isNaN(n))
          : [];
        // 合并已有选中（避免覆盖用户手动已选）
        setSelectedVehicles((prev) => {
          const merged = Array.from(new Set([...(prev || []), ...ids]));
          return merged;
        });
      }

      // 清空 history.state，避免用户刷新/后退时重复处理
      try {
        window.history.replaceState({}, document.title);
      } catch {
        // ignore
      }
    }, 0);
  }, [location.key]); // 关键：location.key 会在导航时变化，即使 path 相同

  // （可选）如果你希望 location.state 在其它场景也能触发，改成 [location.state] 也可以。
  // 但使用 location.key 更能捕捉到从选择页返回的导航事件。

  return (
    <div className="flex flex-col flex-1 bg-gray-100 p-4 gap-4 h-full">
      {/* 上半区：创建任务表单 */}
      <CreateTaskFormProps
        selectedAlgo={selectedAlgo}
        onAlgoChange={setSelectedAlgo}
        selectedVehicles={selectedVehicles}
        onVehiclesChange={setSelectedVehicles}
        selectImportJobId={importJobId}
        onImportJobIdChange={setImportJobId}
        onCreate={(run) => addTask(run)}
      />

      {/* 下半区：运行中任务展示 */}
      <div className="flex flex-col gap-4">
        <RunningTasks tasks={tasks} />
      </div>
    </div>
  );
}