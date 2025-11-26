import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // 只要请求路径是以 /api 开头，就转发到后端 8091
      '/api': {
        target: 'http://156.225.19.144:8091', 
        changeOrigin: true, 
      }
    }    
  }
});
