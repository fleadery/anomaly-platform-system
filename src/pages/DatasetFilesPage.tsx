import { useState, useEffect } from "react";
import { useLayout } from "../components/common/LayoutContext";
import ImportJobTable from "../components/ui/ImportJobTable";
import CreateImportDialog from "../components/ui/CreateImportDialog";

export default function DatasetFilesPage() {
  const { setTitle } = useLayout();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    setTitle("数据集导入");
  }, [setTitle]);

  const handleCreateSuccess = () => {
    setRefreshTrigger((prev) => prev + 1); // 触发表格刷新
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8 xl:px-56">
        {/* 头部区域：标题 + 描述 + 创建卡片（紧凑布局） */}
        <div className="mb-8 sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                管理和创建数据导入任务
              </h1>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                支持自动刷新和手动触发
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                请先将原始数据文件上传到服务器指定目录
              </p>
              <p className="mt-1 text-sm text-gray-500">
                然后创建导入任务并选择对应的源路径
              </p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            {/* 将创建卡片放在头部右侧，更符合操作流 */}
            <CreateImportDialog onSuccess={handleCreateSuccess} />
          </div>
        </div>

        {/* 内容区域 */}
        <div className="space-y-6">
          {/* 分隔线（可选） */}
          <hr className="border-gray-200" />

          {/* 导入任务表格 */}
          <ImportJobTable refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
}