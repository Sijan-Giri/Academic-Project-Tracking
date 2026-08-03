import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { queryClient } from '@/lib/queryClient';
import { router } from '@/router';
import SocketProvider from '@/components/shared/SocketProvider';
import '@/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1e1e2e', color: '#cdd6f4', border: '1px solid rgba(255,255,255,0.1)' },
            success: { iconTheme: { primary: '#a6e3a1', secondary: '#1e1e2e' } },
            error: { iconTheme: { primary: '#f38ba8', secondary: '#1e1e2e' } },
          }}
        />
      </SocketProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
