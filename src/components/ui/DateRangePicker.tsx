// DateRangePicker.tsx
import React from "react";
import { Calendar } from "lucide-react";

interface DateRangePickerProps {
  from: string;
  to: string;
  onChangeFrom: (value: string) => void;
  onChangeTo: (value: string) => void;
}

export default function DateRangePicker({
  from,
  to,
  onChangeFrom,
  onChangeTo,
}: DateRangePickerProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700">时间:</span>
      <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500">
        <Calendar className="w-4 h-4 text-gray-400" />
        <input
          type="date"
          className="text-sm outline-none bg-transparent"
          value={from}
          onChange={(e) => onChangeFrom(e.target.value)}
        />
      </div>
      <span className="text-gray-500">—</span>
      <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500">
        <Calendar className="w-4 h-4 text-gray-400" />
        <input
          type="date"
          className="text-sm outline-none bg-transparent"
          value={to}
          onChange={(e) => onChangeTo(e.target.value)}
        />
      </div>
    </div>
  );
}