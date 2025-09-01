import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'configure-server',
      configureServer(server) {
        return () => {
          server.middlewares.use((req, res, next) => {
            if (req.url && !req.url.startsWith('/@') && !req.url.startsWith('/node_modules') && !req.url.match(/\.[a-zA-Z]+$/)) {
              req.url = '/';
            }
            next();
          });
        };
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    open: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          vendor: ['framer-motion', 'react-icons'],
        },
      },
    },
  },
  // For SPA routing - this ensures the base path is set correctly
  base: './',
  // This will be used to handle 404s in production
  // The actual SPA fallback is handled by the _redirects file
  publicDir: 'public',
  css: {
    devSourcemap: true,
  },
});