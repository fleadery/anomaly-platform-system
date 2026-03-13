import React from "react";
import { Bell, Search, User } from "lucide-react";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200/80 shadow-sm flex items-center justify-between px-6">
      {/* 左侧：标题区域 */}
      <div className="flex items-center space-x-3">
        {/* 装饰竖条 */}
        <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-emerald-400 rounded-full"></div>
        <h1 className="text-xl font-bold text-gray-800">{title}</h1>
      </div>

      {/* 右侧：功能图标 */}
      <div className="flex items-center space-x-4">
        {/* 搜索框（可折叠/简约） */}
        {/* <div className="hidden md:flex items-center bg-gray-100 rounded-full px-3 py-1.5">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="搜索..."
            className="bg-transparent border-none outline-none text-sm ml-2 w-40 placeholder-gray-400"
          />
        </div> */}

        {/* 通知图标 */}
        <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* 用户头像 */}
        <button className="flex items-center space-x-2 p-1 pr-2 hover:bg-gray-100 rounded-full transition-colors">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-400 rounded-full flex items-center justify-center text-white">
            <User className="w-4 h-4" />
          </div>
          <span className="hidden md:inline text-sm font-medium text-gray-700">Admin</span>
        </button>
      </div>
    </header>
  );
}