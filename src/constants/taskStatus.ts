export const isCancelable = (status: string) => !["SUCCESS", "FAILED", "CANCELLED"].includes(status);

export const isRetryable = (status: string) => ["FAILED", "CANCELLED"].includes(status);

export const TaskStatus = ["SUCCESS", "FAILED", "CANCELLED", "RUNNING", "PENDING"];