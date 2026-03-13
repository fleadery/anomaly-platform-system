import { format } from "date-fns";

const XMarkIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// ---------- 状态徽章组件 ----------
export function StatusBadge({ status, failedCount }: { status: string; failedCount?: number }) {
  const config: Record<string, { dot: string; bg: string; text: string }> = {
    PENDING: { dot: "bg-yellow-400", bg: "bg-yellow-50", text: "text-yellow-700" },
    RUNNING: { dot: "bg-blue-400", bg: "bg-blue-50", text: "text-blue-700" },
    SUCCESS: { dot: "bg-green-400", bg: "bg-green-50", text: "text-green-700" },
    FAILED: { dot: "bg-red-400", bg: "bg-red-50", text: "text-red-700" },
  };
  const defaultConfig = { dot: "bg-gray-400", bg: "bg-gray-50", text: "text-gray-700" };
  const { dot, bg, text } = config[status] || defaultConfig;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${bg} ${text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {status}
      {status === "FAILED" && failedCount !== undefined && failedCount > 0 && (
        <span className="ml-1 rounded-full bg-red-200 px-1.5 py-0.5 text-xs text-red-800">
          {failedCount}
        </span>
      )}
    </span>
  );
}

// ---------- 详情弹窗组件 ----------
interface JobDetailModalProps {
  job: any;
  onClose: () => void;
}

export default function JobDetailModal({ job, onClose }: JobDetailModalProps) {
  // 格式化完整时间
  const formatFullTime = (timestamp: string | null) => {
    if (!timestamp) return "-";
    return format(new Date(timestamp), "yyyy-MM-dd HH:mm:ss");
  };

  // 字段定义：label, value
  const fields = [
    { label: "ID", value: job.id },
    { label: "源路径", value: job.source_path },
    { label: "供应商", value: job.vendor || "-" },
    {
      label: "状态",
      value: <StatusBadge status={job.status} failedCount={job.failed_files} />,
    },
    { label: "导入文件数", value: job.imported_files ?? "-" },
    { label: "失败文件数", value: job.failed_files ?? "-" },
    { label: "总文件数", value: job.total_files ?? "-" },
    { label: "创建时间", value: formatFullTime(job.created_at) },
    { label: "开始时间", value: formatFullTime(job.started_at) },
    { label: "完成时间", value: formatFullTime(job.finished_at) },
    { label: "备注", value: job.remark || "-" },
    { label: "数据集根目录", value: job.dataset_root || "-" },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
        {/* 背景遮罩 */}
        <div className="fixed inset-0 bg-gray-500/50 transition-opacity z-40 " onClick={onClose} />

        {/* 弹窗内容 */}
        <div className="relative z-50 inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 w-full text-center sm:ml-4 sm:mt-0 sm:text-left">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold leading-6 text-gray-900" id="modal-title">
                    任务详情
                  </h3>
                  <button
                    onClick={onClose}
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <XMarkIcon />
                  </button>
                </div>
                <div className="mt-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {fields.map((field, idx) => (
                      <div key={idx} className="border-b border-gray-100 pb-2 last:border-0">
                        <dt className="text-xs font-medium text-gray-500">{field.label}</dt>
                        <dd className="mt-1 text-sm text-gray-900 break-words">
                          {field.value}
                        </dd>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:ml-3 sm:w-auto"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}