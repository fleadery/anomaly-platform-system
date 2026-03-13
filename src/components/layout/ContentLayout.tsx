import React from "react";
import Header from "./Header";
import { useLayout } from "../common/LayoutContext";

interface ContentLayoutProps {
  children: React.ReactNode;
}

export default function ContentLayout({ children }: ContentLayoutProps) {
  const { title } = useLayout(); // 从 Context 中获取标题

  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-50">
      <Header title={title} /> {/* 使用 Context 中的标题 */}
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}