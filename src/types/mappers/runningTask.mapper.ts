import type { ModelRunBriefVO } from "../vo/ModelRunBriefVO";
import type { RunningTaskVM } from "../data/RunningTaskVM";
import type { RunRuntimeVO } from "../vo/RunRuntimeVO";
import type { ModelRunVO } from "../vo/ModelRunVO";

export function fromBriefVO(run: ModelRunBriefVO): RunningTaskVM {
  return {
    ...run,
    status: "RUNNING",
    stage: undefined,
    progress: undefined,
    last_tick: undefined,
  };
}

export function mergeRuntime(
  task: RunningTaskVM,
  runtime: RunRuntimeVO
): RunningTaskVM {
  return {
    ...task,
    status: runtime.status,
    stage: runtime.stage ?? undefined,
    progress: runtime.progress ?? undefined,
    last_tick: runtime.last_tick ?? undefined,
  };
}

export function fromModelRunVOToBriefVO(run: ModelRunVO): ModelRunBriefVO {
  return {
    id: run.id,
    run_name: run.run_name,
    model_type: run.model_type,
    status: run.status,
    created_at: run.created_at ?? new Date().toISOString(), // 确保是 ISO 字符串
  };
}