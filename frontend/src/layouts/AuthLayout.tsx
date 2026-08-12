import { ReactNode } from 'react';
import { GraduationCap } from 'lucide-react';

interface AuthLayoutProps { children: ReactNode; }

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen surface-dark font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Left Hero Column featuring UI Dashboard Mockup Image */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-950 to-indigo-900 p-12 text-white lg:flex border-r border-white/10">
        
        {/* Glow orbs */}
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-violet-500/15 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        
        {/* Brand Header */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/10 shadow-lg">
            <GraduationCap className="h-7 w-7 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">APTS</h1>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Academic Project Tracking System</p>
          </div>
        </div>

        {/* Hero Headline and Dashboard Image Container */}
        <div className="relative z-10 my-auto py-6 space-y-6 max-w-xl">
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold leading-tight">
              Manage Every Project.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-violet-200 to-indigo-400">
                Track Every Milestone.
              </span>
            </h2>
            <p className="text-xs text-gray-300/90 leading-relaxed">
              Streamline project submissions, evaluations, and milestone tracking with our modern academic governance platform.
            </p>
          </div>

          {/* Featured UI Mockup Image matching APTS dark theme */}
          <div className="relative group rounded-2xl overflow-hidden border border-white/15 shadow-[0_0_40px_rgba(99,102,241,0.2)] bg-slate-950/80 backdrop-blur-xl transition-all duration-500 hover:scale-[1.01]">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent z-10 pointer-events-none" />
            <img 
              src="/apts_dashboard_mockup.jpg" 
              alt="APTS Academic Project Tracking System Dashboard UI" 
              className="w-full h-auto object-cover rounded-2xl shadow-2xl transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between text-xs font-semibold text-white/90">
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 backdrop-blur-md text-[11px] text-indigo-200">
                System Interface Preview
              </span>
              <span className="text-[11px] text-indigo-300 font-medium">Real-Time Milestone Analytics</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-indigo-300/80 flex items-center justify-between border-t border-white/10 pt-4">
          <p>&copy; {new Date().getFullYear()} Academic Project Tracking System. All rights reserved.</p>
        </div>
      </div>

      {/* Right Form Column */}
      <div className="flex w-full flex-col items-center justify-center p-8 lg:w-1/2 bg-[#090b14]">
        <div className="w-full max-w-md space-y-8">
          <div className="flex items-center justify-center space-x-3 lg:hidden mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-subtle">
              <GraduationCap className="h-6 w-6 text-brand" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">APTS</h1>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
