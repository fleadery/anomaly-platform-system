import { useEffect, useState } from "react";
import { fetchAlgoProfiles, createModelRun } from "../../hooks/useModelInfer";
import type { AlgoProfileVO } from "../../types/vo/AlgoProfileVO";
import AlgoSelect from "../ui/AlgoSelect";
import { useNavigate } from "react-router-dom";
import type { ModelRunBriefVO } from "../../types/vo/ModelRunBriefVO";
import { fromModelRunVOToBriefVO } from "../../types/mappers/runningTask.mapper";

interface CreateTaskFormProps {
  initialRunName?: string;
  selectedAlgo: number | null;
  onAlgoChange: (id: number) => void;
  selectedVehicles: number[];
  onVehiclesChange: (ids: number[]) => void;
  selectImportJobId: number | null;
  onImportJobIdChange: (id: number | null) => void;
  onCreate: (run: ModelRunBriefVO) => void;
}

export default function CreateTaskForm({
  initialRunName,
  selectedAlgo,
  onAlgoChange,
  selectedVehicles,
  selectImportJobId,
  onImportJobIdChange,
  onCreate
}: CreateTaskFormProps) {
  const [algos, setAlgos] = useState<AlgoProfileVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [runName, setRunName] = useState(initialRunName ?? "");

  const navigate = useNavigate();

  useEffect(() => {
    fetchAlgoProfiles().then((res) => setAlgos(res.data));
  }, []);

  const handleCreate = async () => {
    if (selectedAlgo == null || selectedVehicles.length === 0 || selectImportJobId == null) {
      alert("请选择算法、车辆和数据导入任务");
      return;
    }
    setLoading(true);
    try {
      const res = await createModelRun({
        run_name: runName || `Run-${Date.now()}`,
        algo_profile_id: selectedAlgo,
        vehicle_ids: selectedVehicles,
        import_job_id: selectImportJobId,
      });

      // 转成 ModelRunBriefVO
      const runBrief: ModelRunBriefVO = fromModelRunVOToBriefVO(res.data);
      onCreate(runBrief);
      setRunName(""); // 提交后清空
    } catch (err) {
      console.error("创建任务失败", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded p-4 flex flex-wrap gap-4 items-end">
      {/* 任务名称 */}
      <div className="w-full md:w-60 flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">任务名称（可选）</label>
        <input
          type="text"
          placeholder="不填将自动生成名称"
          value={runName}
          onChange={(e) => setRunName(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800
                     focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400
                     placeholder-gray-400 transition"
        />
      </div>

      {/* 数据选择 */}
      <div className="flex flex-col w-full md:w-60">
        <label className="text-sm font-medium mb-1">数据</label>

        <button
          className="w-full flex items-center justify-between px-3 py-2 border border-gray-300
                    rounded-lg text-gray-800 text-sm bg-white shadow-sm
                    hover:border-emerald-400 hover:ring-1 hover:ring-emerald-400
                    focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
          onClick={() =>
            navigate("/job-vehicle-select", {
              state: {
                importJobId: selectImportJobId,
                selectedVehicles: selectedVehicles
              }
            })
          }
        >
          <span>
            {selectImportJobId != null
              ? `Job #${selectImportJobId} · ${selectedVehicles.length} vehicles`
              : "选择数据"}
          </span>

          <svg
            className="w-4 h-4 text-gray-400 ml-2"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
      </div>

      {/* 算法选择 */}
      <AlgoSelect value={selectedAlgo} onChange={onAlgoChange} options={algos} />

      {/* 创建按钮 */}
      <div className="w-full">
        <button
          className="w-600px px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition"
          onClick={handleCreate}
          disabled={loading}
        >
          {loading ? "创建中..." : "创建任务"}
        </button>
      </div>
    </div>
  );
}
