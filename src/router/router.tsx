// src/router/router.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RunListPage from "../pages/RunListPage";
import DashboardPage from "../pages/DashboardPage";
import ModelInferPage from "../pages/ModelInferPage";
import RunDetailPage from "../pages/RunDetailPage";
import VehicleListPage from "../pages/VehicleListPage";
import VisualizationPage from "../pages/VisualizationPage";
import AlgoProfilePage from "../pages/AlgoProfilePage";
import DatasetFilesPage from "../pages/DatasetFilesPage";
import JobVehicleSelectPage from "../pages/JobVehicleSelectPage";
import LatentManagementPage from "../pages/LatentManagementPage";
import VisualizationJobPage from "../pages/VisualizationJobPage";
import { ROUTES } from "./routes";

export default function AppRouter() {
  return (
    <Routes>
      {/* 默认首页 */}
      <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />

      <Route path={ROUTES.RUNS}>
        {/* 任务列表页 */}
        <Route index element={<RunListPage />} />
        {/* 任务详情页 */}
        <Route path=":runId" element={<RunDetailPage />} />
        {/* 车辆结果详情页 */}
        <Route path=":runId/vehicles" element={<VehicleListPage />} />
      </Route>

      {/* 模型推理页 */}
      <Route path={ROUTES.INFER} element={<ModelInferPage />} />

      {/* 数据选择页（车辆和Import Job） */}
      <Route path={ROUTES.DATASEKECT} element={<JobVehicleSelectPage />} />

      {/* 可视化分析页 */}
      <Route path={ROUTES.VISUALIZATION} element={<VisualizationPage />} />

      {/* 环境配置页 */}
      <Route path={ROUTES.ALGO_PROFILES} element={<AlgoProfilePage />} />

      {/* 数据文件页 */}
      <Route path={ROUTES.DATA_FILES} element={<DatasetFilesPage />} />

      {/* 潜在变量管理页 */}
      <Route path={ROUTES.LATENT_MANAGEMENT} element={<LatentManagementPage />} />

      {/* 可视化 Job 管理页 */}
      <Route path={ROUTES.VISUALIZATION_JOBS} element={<VisualizationJobPage />} />
    </Routes>
  );
}
