import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: false,
    allowedHosts: ['localhost', '127.0.0.1'],
    hmr: {
      overlay: true,
    },
  },
  publicDir: 'public',
});
