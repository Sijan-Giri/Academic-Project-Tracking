import { ReactNode } from 'react';
import { GraduationCap, CheckCircle2 } from 'lucide-react';

interface AuthLayoutProps { children: ReactNode; }

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen surface-dark">
      {/* Left Panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-900 via-violet-900 to-slate-900 p-12 text-white lg:flex">
        {/* Floating shapes */}
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-brand-subtle blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-purple-subtle blur-3xl" />
        
        <div className="relative z-10 flex items-center space-x-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
            <GraduationCap className="h-7 w-7 text-brand" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">APTS</h1>
            <p className="text-sm font-medium text-brand">Academic Project Tracking System</p>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-extrabold leading-tight">
            Manage Every Project.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-violet-300">Track Every Milestone.</span>
          </h2>
          <div className="space-y-4 pt-4">
            {[
              'Streamline project submissions and reviews',
              'Track milestones and deadlines efficiently',
              'Collaborate seamlessly with your team and guide'
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center space-x-3 text-brand">
                <CheckCircle2 className="h-5 w-5 text-brand" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-sm text-brand">
          &copy; {new Date().getFullYear()} Academic Project Tracking System. All rights reserved.
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex w-full flex-col items-center justify-center p-8 lg:w-1/2">
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
