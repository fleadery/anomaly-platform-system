import { useQuery } from "@tanstack/react-query";

import type { RunVehicleSummary } from "../types/vo/RunVehicleSummary";
import axios from "../hooks/useAxios";

export function useRunVehicleSummary(
  runId: number,
  topN = 10
) {
  return useQuery({
    queryKey: ["run-vehicle-summary", runId, topN],

    queryFn: async () => {
      const res = await axios.get<RunVehicleSummary>(
        `/runs/${runId}/vehicles/summary/run`,
        {
          params: { top_n: topN },
        }
      );

      return res.data;
    },
  });
}
