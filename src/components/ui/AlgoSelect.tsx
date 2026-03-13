import React from "react";
import type { AlgoProfileVO } from "../../types/vo/AlgoProfileVO";

interface AlgoSelectProps {
  value: number | null;
  onChange: (id: number) => void;
  options: AlgoProfileVO[]; // 直接用 VO
}

export default function AlgoSelect({ value, onChange, options }: AlgoSelectProps) {
  return (
    <div className="w-full md:w-64">
      <label className="block text-sm font-semibold text-gray-700 mb-1">算法选择</label>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(Number(e.target.value))}
        className="
          w-full
          border border-gray-300
          rounded-lg
          px-3 py-2
          text-sm text-gray-800
          bg-white
          shadow-sm
          focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400
          hover:border-gray-400
          transition
          appearance-none
        "
      >
        <option value="" disabled>
          请选择算法
        </option>
        {options.map((algo) => (
          <option key={algo.id} value={algo.id}>
            {algo.model_type} {algo.vendor} (v{algo.version})
          </option>
        ))}
      </select>
    </div>
  );
}
