import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';

const rootDirectory = resolve(__dirname, '../..');

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDirectory, '');
  const frontendPort = Number(env.FRONTEND_PORT) || 5173;
  const backendPort = Number(env.BACKEND_PORT) || 3001;

  return {
    envDir: rootDirectory,
    plugins: [react()],
    server: {
      port: frontendPort,
      proxy: {
        '/api': {
          target: `http://localhost:${backendPort}`,
          changeOrigin: true
        }
      }
    }
  };
});
