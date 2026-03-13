import { useState, useEffect, useRef } from "react";
import type { FormEvent } from "react";
import toast from "react-hot-toast";
import {
  useAlgoProfiles,
  useActivateProfile,
  useCreateAlgoProfile,
  useUpdateAlgoProfile,
} from "../hooks/useAlgoProfiles";
import type { AlgoProfile } from "../types/dto/AlgoProfileDTO";
import { useLayout } from "../components/common/LayoutContext";
import {
  Plus,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Edit2,
} from "lucide-react";

// 辅助函数：从错误对象中提取后端返回的错误消息
const getErrorMessage = (error: any): string => {
  // 假设使用 axios，错误响应结构为 { response: { data: { message: string } } }
  const message = error?.response?.data?.message;
  if (message) return message;
  // 如果 hooks 已经将错误转换为字符串
  if (typeof error === 'string') return error;
  return error?.message || "操作失败，请稍后重试";
};

export default function AlgoProfilePage() {
  const { setTitle } = useLayout();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AlgoProfile | null>(null);
  const isEditMode = !!editingRecord;

  // ========== 数据 ==========
  const { data, isLoading, refetch } = useAlgoProfiles(page, pageSize); // 新增 refetch
  const activateMutation = useActivateProfile();
  const createMutation = useCreateAlgoProfile();
  const updateMutation = useUpdateAlgoProfile();

  // ========== 动态标题 ==========
  useEffect(() => {
    setTitle("环境配置管理");
  }, [setTitle]);

  // ========== 新建/编辑表单提交 ==========
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    // 构建 values 对象（只包含 DTO 所需字段，后端会自动生成 version/parent_version/is_active）
    const values: any = {
      vendor: formData.get("vendor") as string,
      model_type: formData.get("model_type") as string,
      model_path: formData.get("model_path") as string,
      mean_path: formData.get("mean_path") as string,
      std_path: formData.get("std_path") as string,
      center_path: (formData.get("center_path") as string) || undefined,
      score_method: formData.get("score_method") as string,
      threshold: parseFloat(formData.get("threshold") as string),
      remark: (formData.get("remark") as string) || undefined,
    };

    // 处理 score_params (JSON 字符串)
    const scoreParamsStr = formData.get("score_params") as string;
    try {
      values.score_params = JSON.parse(scoreParamsStr);
    } catch (err) {
      toast.error("score_params 必须是合法的 JSON 字符串");
      return;
    }

    // 基础非空校验
    if (
      !values.vendor ||
      !values.model_type ||
      !values.model_path ||
      !values.mean_path ||
      !values.std_path ||
      !values.score_method ||
      isNaN(values.threshold)
    ) {
      toast.error("请填写所有必填字段");
      return;
    }

    if (isEditMode) {
      // 编辑模式：调用更新接口（后端会复制记录生成新版本）
      updateMutation.mutate(
        { id: editingRecord!.id, payload: values },
        {
          onSuccess: () => {
            toast.success("更新成功");
            setModalOpen(false);
            setEditingRecord(null);
            refetch(); // 刷新列表
          },
          onError: (error) => {
            const msg = getErrorMessage(error);
            toast.error(msg);
          },
        }
      );
    } else {
      // 新建模式
      createMutation.mutate(values, {
        onSuccess: () => {
          toast.success("新建成功");
          setModalOpen(false);
          refetch(); // 刷新列表
        },
        onError: (error) => {
          const msg = getErrorMessage(error);
          toast.error(msg);
        },
      });
    }
  };

  // 打开新建模态框
  const handleNew = () => {
    setEditingRecord(null);
    setModalOpen(true);
  };

  // 打开编辑模态框
  const handleEdit = (record: AlgoProfile) => {
    setEditingRecord(record);
    setModalOpen(true);
  };

  // 填充表单（当 editingRecord 变化且模态框打开时）
  useEffect(() => {
    if (!isModalOpen || !formRef.current) return;

    if (isEditMode && editingRecord) {
      const elements = formRef.current.elements as any;
      elements.vendor.value = editingRecord.vendor || "";
      elements.model_type.value = editingRecord.model_type || "";
      elements.model_path.value = editingRecord.model_path || "";
      elements.mean_path.value = editingRecord.mean_path || "";
      elements.std_path.value = editingRecord.std_path || "";
      elements.center_path.value = editingRecord.center_path || "";
      elements.score_method.value = editingRecord.score_method || "";
      elements.score_params.value = editingRecord.score_params
        ? JSON.stringify(editingRecord.score_params)
        : "";
      elements.threshold.value = editingRecord.threshold || "";
      elements.remark.value = editingRecord.remark || "";
    } else {
      formRef.current.reset();
    }
  }, [isModalOpen, editingRecord]);

  // 关闭模态框
  const closeModal = () => {
    setModalOpen(false);
    setEditingRecord(null);
  };

    // 处理激活/禁用操作
    const handleActivate = (id: number) => {
    activateMutation.mutate(id, {
        onSuccess: (data) => {
        // 从返回数据中获取新的状态，显示对应提示
        const newStatus = data?.data?.is_active;
        toast.success(newStatus ? "已启用" : "已禁用");
        refetch(); // 刷新列表
        },
        onError: (error) => {
        const msg = getErrorMessage(error);
        toast.error(msg);
        },
    });
    };

  // 总页数计算
  const total = data?.data.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">管理算法运行环境配置</h1>
          </div>
        </div>

        {/* 主体卡片 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {/* 新建按钮 */}
          <div className="flex justify-end mb-6">
            <button
              onClick={handleNew}
              className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 hover:shadow-md transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              新建配置
            </button>
          </div>

          {/* 表格区域 */}
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">厂商</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">版本</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">激活</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                      加载中...
                    </td>
                  </tr>
                ) : data?.data.records.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  data?.data.records.map((record: AlgoProfile) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.vendor}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.model_type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.version}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {record.is_active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            已激活
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            <XCircle className="w-3 h-3 mr-1" />
                            未激活
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        {/* 编辑按钮 */}
                        <button
                          onClick={() => handleEdit(record)}
                          className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-xs font-medium rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-sm"
                        >
                          <Edit2 className="w-3 h-3 mr-1" />
                          编辑
                        </button>

                        {/* 激活/禁用按钮 - 始终显示 */}
                        <button
                            onClick={() => handleActivate(record.id)}
                            disabled={activateMutation.isLoading}
                            className={`inline-flex items-center px-3 py-1.5 text-white text-xs font-medium rounded-lg transition-all shadow-sm ${
                            record.is_active
                                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                            }`}
                        >
                            {activateMutation.isLoading && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                            {record.is_active ? "禁用" : "激活"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {total > 0 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                共 {total} 条，第 {page} / {totalPages} 页
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  上一页
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  下一页
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 新建/编辑模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* 背景遮罩 - 添加 z-40 确保在卡片下方 */}
            <div
              className="fixed inset-0 bg-black/60 transition-opacity backdrop-blur-sm z-40"
              onClick={closeModal}
            />

            {/* 模态框卡片 - 添加 relative z-50 确保在遮罩上方 */}
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full relative z-50">
              <form ref={formRef} onSubmit={handleSubmit}>
                <div className="bg-white px-6 py-5 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isEditMode ? "编辑环境配置" : "新建环境配置"}
                  </h3>
                </div>

                <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 厂商 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        厂商 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="vendor"
                        required
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                      />
                    </div>

                    {/* 类型 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        类型 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="model_type"
                        required
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                      />
                    </div>

                    {/* 模型路径 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        模型路径 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="model_path"
                        required
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                      />
                    </div>

                    {/* 均值文件路径 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        均值文件路径 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="mean_path"
                        required
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                      />
                    </div>

                    {/* 标准差文件路径 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        标准差文件路径 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="std_path"
                        required
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                      />
                    </div>

                    {/* 中心文件路径（可选） */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        中心文件路径
                      </label>
                      <input
                        type="text"
                        name="center_path"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                      />
                    </div>

                    {/* 评分方法 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        评分方法 <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="score_method"
                        required
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white appearance-none"
                      >
                        <option value="">请选择</option>
                        <option value="robust_p">robust_p</option>
                        <option value="robust_top_p">robust_top_p</option>
                      </select>
                    </div>

                    {/* 评分参数 (JSON) */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        评分参数 (JSON) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="score_params"
                        required
                        placeholder='{"p": 0.05}'
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                      />
                    </div>

                    {/* 阈值 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        阈值 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="threshold"
                        required
                        step="0.0001"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                      />
                    </div>

                    {/* 备注 */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        备注
                      </label>
                      <input
                        type="text"
                        name="remark"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isLoading || updateMutation.isLoading}
                    className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {(createMutation.isLoading || updateMutation.isLoading) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    确定
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}