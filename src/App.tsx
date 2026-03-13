// src/App.tsx
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import ContentLayout from "./components/layout/ContentLayout";
import AppRouter from "./router/router";
import { LayoutProvider } from "./components/common/LayoutContext";
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <Router>
      <LayoutProvider>
        <Toaster position="top-right" />
        <div className="flex h-screen">
          <Sidebar />
          <ContentLayout>
            <AppRouter /> {/* 路由直接放进去 */}
          </ContentLayout>
        </div>
      </LayoutProvider>
    </Router>
  );
}

