import { useAuthStore } from '@/store';
import React, { lazy, Suspense } from 'react';
import { DashboardSkeleton } from '@/components';

const AdminDashboard = lazy(() => import('./AdminDashboard'));
const CoordinatorDashboard = lazy(() => import('./CoordinatorDashboard'));
const FacultyDashboard = lazy(() => import('./FacultyDashboard'));
const StudentDashboard = lazy(() => import('./StudentDashboard'));

export default function DashboardIndex() {
  const { user } = useAuthStore();
  
  const renderDashboard = () => {
    if (user?.role === 'ADMIN') return <AdminDashboard />;
    if (user?.role === 'COORDINATOR') return <CoordinatorDashboard />;
    if (user?.role === 'FACULTY' || user?.role === 'PANEL') return <FacultyDashboard />;
    return <StudentDashboard />;
  };

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      {renderDashboard()}
    </Suspense>
  );
}
