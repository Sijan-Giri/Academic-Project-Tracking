import React from 'react';
import { Outlet } from 'react-router-dom';
import { CommonHeader } from '@/components/layout';

export default function LayoutWithNoSidebar({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen dark:bg-[#0f1117] dark:text-white bg-slate-50 text-slate-900 transition-colors duration-200">
      <CommonHeader className="sticky top-0 z-30 w-full header-border header-bg border-b backdrop-blur-md shadow-sm" />
      <main className="p-6 lg:p-8 max-w-7xl mx-auto">
        {children ?? <Outlet />}
      </main>
    </div>
  );
}

export { LayoutWithNoSidebar };
