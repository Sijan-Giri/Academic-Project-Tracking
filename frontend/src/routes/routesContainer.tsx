import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardAppLayout } from '@/layout';
import { PageSkeleton } from '@/components';
import { allAppRoutes } from './routesList';
import ProtectedRoute from './protectedRoute';
import NotFoundPage from '@/features/NotFoundPage';

export default function RoutesContainer() {
  return (
    <Routes>
      <Route
        element={
          <ProtectedRoute>
            <DashboardAppLayout />
          </ProtectedRoute>
        }
      >
        {allAppRoutes.map(({ path, component: Component, roles }) => (
          <Route
            key={path}
            path={path}
            element={
              <ProtectedRoute allowedRoles={roles}>
                <Suspense fallback={<PageSkeleton />}>
                  <Component />
                </Suspense>
              </ProtectedRoute>
            }
          />
        ))}
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export { RoutesContainer };
