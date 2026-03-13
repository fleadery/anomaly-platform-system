// src/components/layout/Sidebar.tsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  AlertTriangle,
  FileText,
  Settings,
  ChevronDown,
  Database,
  Eye,
  BarChart3,
  Home,
  FileCode,
  FolderOpen,
} from "lucide-react";

interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  subItems?: { label: string; path: string; icon?: React.ReactNode }[];
}

const menuItems: MenuItem[] = [
  {
    label: "仪表板",
    icon: <Home className="w-5 h-5" />,
    subItems: [{ label: "首页", path: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> }],
  },
  {
    label: "异常检测",
    icon: <AlertTriangle className="w-5 h-5" />,
    subItems: [
      { label: "模型推理", path: "/model-infer", icon: <BarChart3 className="w-4 h-4" /> },
      { label: "任务列表", path: "/runs", icon: <FileCode className="w-4 h-4" /> },
      { label: "可视化任务/文件", path: "/visualization", icon: <Eye className="w-4 h-4" /> },
    ],
  },
  {
    label: "文件系统",
    icon: <FolderOpen className="w-5 h-5" />,
    subItems: [
      { label: "数据文件管理", path: "/data-files", icon: <Database className="w-4 h-4" /> },
      { label: "latent文件管理", path: "/latent-files", icon: <FileText className="w-4 h-4" /> },
      { label: "可视化任务/文件", path: "/visual-files", icon: <Eye className="w-4 h-4" /> },
    ],
  },
  {
    label: "系统设置",
    icon: <Settings className="w-5 h-5" />,
    subItems: [{ label: "算法设置", path: "/settings", icon: <Settings className="w-4 h-4" /> }],
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);

  useEffect(() => {
    menuItems.forEach((menu) => {
      if (menu.subItems) {
        menu.subItems.forEach((sub) => {
          if (location.pathname === sub.path) {
            setActiveMenu(menu.label);
            setExpandedMenu(menu.label);
            setActiveSubMenu(sub.label);
          }
        });
      }
    });
  }, [location.pathname]);

  const handleMenuClick = (label: string, hasSub: boolean) => {
    if (hasSub) {
      setExpandedMenu(expandedMenu === label ? null : label);
    }
    setActiveMenu(label);
    setActiveSubMenu(null);
  };

  const handleSubMenuClick = (parentLabel: string, subLabel: string, path: string) => {
    setActiveMenu(parentLabel);
    setActiveSubMenu(subLabel);
    navigate(path);
  };

  return (
    <aside className="w-64 h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-200 flex flex-col shadow-2xl">
      {/* Logo区域 */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-gray-700/50">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-emerald-400 rounded-lg blur opacity-50"></div>
          <img src="/favicon.ico" className="relative w-8 h-8 rounded-lg" alt="logo" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white">新能源汽车</h1>
          <p className="text text-gray-400">异常检测平台</p>
        </div>
      </div>

      {/* 导航菜单 - 可滚动区域 */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map(({ label, icon, subItems }) => {
          const isActive = activeMenu === label;
          const isExpanded = expandedMenu === label;

          return (
            <div key={label} className="space-y-1">
              {/* 一级菜单 */}
              <button
                onClick={() => handleMenuClick(label, !!subItems)}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-xl
                  transition-all duration-200 group
                  ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg"
                      : "text-gray-300 hover:bg-gray-800/60 hover:text-white"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? "text-white" : "text-gray-400 group-hover:text-white"}>
                    {icon}
                  </span>
                  <span className="text-sm font-medium">{label}</span>
                </div>
                {subItems && (
                  <ChevronDown
                    className={`
                      w-4 h-4 transition-transform duration-200
                      ${isExpanded ? "rotate-180" : ""}
                      ${isActive ? "text-white" : "text-gray-400 group-hover:text-white"}
                    `}
                  />
                )}
              </button>

              {/* 子菜单 */}
              {subItems && isExpanded && (
                <div className="ml-4 pl-3 border-l border-gray-700 space-y-1">
                  {subItems.map((sub) => {
                    const isSubActive = activeSubMenu === sub.label;
                    return (
                      <button
                        key={sub.label}
                        onClick={() => handleSubMenuClick(label, sub.label, sub.path)}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                          transition-all duration-200
                          ${
                            isSubActive
                              ? "bg-gradient-to-r from-emerald-500 to-emerald-400 text-white shadow-md"
                              : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                          }
                        `}
                      >
                        <span className={isSubActive ? "text-white" : "text-gray-500"}>{sub.icon}</span>
                        <span>{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* 底部用户/版本信息 */}
      <div className="border-t border-gray-700/50 p-4">
        <div className="flex items-center gap-3 text-sm">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-emerald-400 flex items-center justify-center text-white font-bold">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate">Admin</p>
            <p className="text-gray-400 text-xs truncate">v1.0.0</p>
          </div>
        </div>
      </div>
    </aside>
  );
}