import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/goldapi': {
          target: 'https://www.goldapi.io/api',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/goldapi/, ''),
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              if (env.GOLD_API_KEY) {
                proxyReq.setHeader('x-access-token', env.GOLD_API_KEY);
              }
            });
          }
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 3000,
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.js',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
      },
    },
  }
})
