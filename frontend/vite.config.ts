import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    chunkSizeWarningLimit: 600,
    cssMinify: 'esbuild',
    modulePreload: {
      polyfill: true,
      resolveDependencies(filename, deps, { hostType }) {
        // Critical for LCP: Only preload core initial bootstrap dependencies in index.html.
        // Prevent preloading heavy deferred bundles (like 403 kB chart-vendor, 87 kB form-vendor, etc.)
        if (hostType === 'html') {
          return deps.filter(
            (dep) =>
              dep.includes('react-vendor') ||
              dep.includes('router-vendor') ||
              dep.includes('query-vendor') ||
              dep.includes('icons-vendor')
          );
        }
        return deps;
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/')
          ) {
            return 'react-vendor';
          }
          // React Router
          if (
            id.includes('node_modules/react-router') ||
            id.includes('node_modules/@remix-run/')
          ) {
            return 'router-vendor';
          }
          // TanStack (Query + Table)
          if (id.includes('node_modules/@tanstack/')) {
            return 'query-vendor';
          }
          // Radix UI primitives
          if (id.includes('node_modules/@radix-ui/')) {
            return 'radix-vendor';
          }
          // Recharts — deferred, only loads on chart dashboards
          if (
            id.includes('node_modules/recharts') ||
            id.includes('node_modules/d3-') ||
            id.includes('node_modules/victory-')
          ) {
            return 'chart-vendor';
          }
          // Socket.IO client
          if (
            id.includes('node_modules/socket.io-client') ||
            id.includes('node_modules/engine.io-client') ||
            id.includes('node_modules/@socket.io/')
          ) {
            return 'socket-vendor';
          }
          // Forms
          if (
            id.includes('node_modules/react-hook-form') ||
            id.includes('node_modules/@hookform/') ||
            id.includes('node_modules/zod')
          ) {
            return 'form-vendor';
          }
          // Date utils
          if (id.includes('node_modules/date-fns')) {
            return 'date-vendor';
          }
          // Lucide icons
          if (id.includes('node_modules/lucide-react')) {
            return 'icons-vendor';
          }
        },
      },
    },
  },
});
