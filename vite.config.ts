import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    watch: {
      ignored: ['**/dist/**', '**/.git/**', '**/.tmp*/**', '**/scratch/**'],
    },
    proxy: {
      '/games/veto': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true,
      },
      '/games/harfbaz': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  preview: {
    port: 3000,
    proxy: {},
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false,
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'],
  },
}));
