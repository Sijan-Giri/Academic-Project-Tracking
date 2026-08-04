import { useState, createContext, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/shared/Sidebar';
import Header from '@/components/shared/Header';
import { cn } from '@/lib/utils';

interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

const SidebarContext = createContext<SidebarContextType>({ isOpen: false, toggle: () => {}, close: () => {} });
export const useSidebar = () => useContext(SidebarContext);

export default function DashboardLayout() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ isOpen, toggle: () => setIsOpen(!isOpen), close: () => setIsOpen(false) }}>
      <div className="min-h-screen dark:bg-[#0f1117] dark:text-white bg-slate-50 text-slate-900 transition-colors duration-200">
        {/* Mobile Sidebar Overlay */}
        {isOpen && (
          <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden" onClick={() => setIsOpen(false)} />
        )}
        
        <Sidebar className={cn("fixed bottom-0 top-0 z-50 transition-all duration-300 lg:left-0", isOpen ? "left-0 w-64" : "-left-64 w-64 lg:left-0 lg:w-20 lg:hover:w-64 group")} />
        
        <div className={cn("flex min-h-screen flex-col transition-all duration-300", "lg:pl-20")}>
          <Header className="fixed top-0 z-30 w-full dark:border-white/10 dark:bg-[#0f1117]/80 border-b border-slate-200 bg-white/85 backdrop-blur-md lg:w-[calc(100%-5rem)] shadow-sm" />
          <main className="mt-16 flex-1 p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
