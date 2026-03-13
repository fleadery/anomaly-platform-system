import type { RunningTaskVM } from "../types/data/RunningTaskVM";
import { useEffect, useState } from "react";
import { fetchRunningRuns } from "./useModelInfer";
import { initRunWebSocket } from "./runRuntimeWS";
import type { ModelRunBriefVO } from "../types/vo/ModelRunBriefVO";
import { fromBriefVO, mergeRuntime } from "../types/mappers/runningTask.mapper";

export function useRunningTasks(limit = 3) {
    const [tasks, setTasks] = useState<RunningTaskVM[]>([]);
  
    // 首次进入：HTTP 拉 RUNNING
    useEffect(() => {
      let cancelled = false;
    
      fetchRunningRuns({ limit, status: "RUNNING" })
        .then(runs => {
          if (cancelled) return;
          setTasks(prev => {
            const map = new Map(prev.map(t => [t.id, t]));
            runs.forEach(run => {
              const t = fromBriefVO(run);
              map.set(t.id, t); // 更新或新增
            });
            // 只过滤掉完成的任务，不直接 slice
            return Array.from(map.values()).filter(t => t.status !== "SUCCESS" && t.status !== "FAILED" && t.status !== "STALE");
          });
        });
    
      return () => {
        cancelled = true;
      };
    }, [limit]);    
  
    // 为每个任务建立 WS
    useEffect(() => {
        const sockets = tasks.map((task) =>
          initRunWebSocket(task.id, (runtime) => {
            setTasks((prev) =>
              prev
                .map((t) => (t.id === task.id ? mergeRuntime(t, runtime) : t))
                .filter(
                  (t) => !["SUCCESS", "FAILED", "STALE"].includes(t.status)
                )
            );
          })
        );
        return () => sockets.forEach((ws) => ws.close());
      }, [tasks.map((t) => t.id).join(",")]);
  
    // 创建任务后加入列表，受 limit 控制
    const addTask = (run: ModelRunBriefVO) => {
      setTasks(prev => {
        const map = new Map(prev.map(t => [t.id, t]));
        const newTask = fromBriefVO(run);

        // 先判断 limit
        if (map.size < limit) {
          map.set(newTask.id, newTask);
        }
        return Array.from(map.values());
      });
    };
   
    return { tasks, addTask };
  }
  