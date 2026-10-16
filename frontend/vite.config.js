import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backend = process.env.VITE_BACKEND_URL || 'http://localhost:5000';
const proxy = Object.fromEntries(['/api', '/uploads', '/sitemap.xml', '/robots.txt'].map((p) => [p, { target: backend, changeOrigin: false }]));

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy },
  preview: { port: 4173, proxy },
  css: { preprocessorOptions: { scss: { api: 'modern-compiler', quietDeps: true, silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function'] } } },
  esbuild: { drop: ['console', 'debugger'], legalComments: 'none' },
  build: {
    target: 'es2019',
    sourcemap: false,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: { react: ['react', 'react-dom', 'react-router-dom'] },
      },
    },
  },
});
