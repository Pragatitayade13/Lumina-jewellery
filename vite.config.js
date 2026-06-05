import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/goldapi': {
        target: 'https://www.goldapi.io/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/goldapi/, ''),
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 3000,
  },
})
