// src/api/runRuntimeWS.ts
import type { RunRuntimeVO } from "../types/vo/RunRuntimeVO";

export type RuntimeMessageHandler = (data: RunRuntimeVO) => void;

// 初始化 WebSocket
export const initRunWebSocket = (runId: number, callback: (data: RunRuntimeVO) => void) => {
  const ws = new WebSocket(`ws://localhost:8000/ws/runs/${runId}`);
  ws.onmessage = (event) => {
    const data: RunRuntimeVO = JSON.parse(event.data);
    callback(data);
  };
  return ws;
};

