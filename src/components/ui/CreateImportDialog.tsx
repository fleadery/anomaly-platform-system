import { useState } from "react";
import { createImportJob } from "../../hooks/datasetImport";

interface CreateImportDialogProps {
  onSuccess: () => void;
}

export default function CreateImportDialog({ onSuccess }: CreateImportDialogProps) {
  const [sourcePath, setSourcePath] = useState("");
  const [vendor, setVendor] = useState("");
  const [remark, setRemark] = useState("");
   const [datasetRoot, setDatasetRoot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createImportJob({
        source_path: sourcePath,
        vendor,
        remark,
        dataset_root: datasetRoot || undefined,
      });
      onSuccess();
      setSourcePath("");
      setVendor("");
      setRemark("");
      setDatasetRoot("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full sm:w-206 rounded-xl bg-white p-6 shadow-lg ring-1 ring-gray-200">
      {/* 标题区域 */}
      <div className="mb-6 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">创建导入任务</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 源路径（必填）- 优化输入框样式 */}
        <div>
          <label htmlFor="sourcePath" className="block text-sm font-medium text-gray-700">
            原始数据路径 <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="text"
              id="sourcePath"
              value={sourcePath}
              onChange={(e) => setSourcePath(e.target.value)}
              placeholder="例如：/home/fff_leader/dataset/battery_dataset3/data"
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-gray-900 placeholder:text-gray-400
                      hover:border-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:text-sm"
              required
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500">文件或目录的完整路径</p>
        </div>

        {/* dataset_root */}
        <div>
          <label htmlFor="datasetRoot" className="block text-sm font-medium text-gray-700">
            存储根路径 (dataset_root)
          </label>
          <input
            type="text"
            id="datasetRoot"
            value={datasetRoot}
            onChange={(e) => setDatasetRoot(e.target.value)}
            placeholder="例如：/processed_data逻辑路径"
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-gray-900 placeholder:text-gray-400
                      hover:border-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">注意！！此路径必须存在且有写入权限</p>
        </div>

        {/* 供应商 - 优化输入框样式 */}
        <div>
          <label htmlFor="vendor" className="block text-sm font-medium text-gray-700">
            供应商
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="text"
              id="vendor"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              placeholder="例如：vendorA"
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-gray-900 placeholder:text-gray-400
                      hover:border-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:text-sm"
            />
          </div>
        </div>

        {/* 备注 - 优化输入框样式 */}
        <div>
          <label htmlFor="remark" className="block text-sm font-medium text-gray-700">
            备注
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="text"
              id="remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="可选"
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-gray-900 placeholder:text-gray-400
                      hover:border-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:text-sm"
            />
          </div>
        </div>

        {/* 按钮区域 */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                提交中...
              </>
            ) : (
              <>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                创建任务
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}