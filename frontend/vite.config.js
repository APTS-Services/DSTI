
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const backend = 'http://localhost:5000';

const proxy = Object.fromEntries(
  ['/api', '/uploads', '/sitemap.xml', '/robots.txt'].map((p) => [
    p,
    { target: backend, changeOrigin: false },
  ])
);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const allowedHosts = (env.VITE_ALLOWED_HOSTS || '')
    .split(',')
    .map((host) => host.trim())
    .filter(Boolean);

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: '0.0.0.0',
      proxy,
      allowedHosts,
    },
    preview: { port: 4173, proxy },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          quietDeps: true,
          silenceDeprecations: [
            'import',
            'global-builtin',
            'color-functions',
            'if-function',
          ],
        },
      },
    },
    esbuild: {
      drop: ['console', 'debugger'],
      legalComments: 'none',
    },
    build: {
      target: 'es2019',
      sourcemap: false,
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
    },
  };
});
