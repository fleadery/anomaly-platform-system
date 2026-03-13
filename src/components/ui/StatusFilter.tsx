// StatusFilter.tsx
import React from "react";
import { TaskStatus } from "../../constants/taskStatus";

interface StatusFilterProps {
  value: string;
  onChange: (selected: string) => void;
}

export default function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-700">状态:</span>
      <div className="flex flex-wrap gap-2">
        {TaskStatus.map((status) => {
          const selected = value === status;
          return (
            <button
              key={status}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                selected
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md hover:from-blue-700 hover:to-blue-800"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow-sm"
              }`}
              onClick={() => onChange(selected ? "" : status)}
            >
              {status}
            </button>
          );
        })}
      </div>
    </div>
  );
}