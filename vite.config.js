import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    optimizeDeps: {
      include: [
        'use-sync-external-store/shim/with-selector',
        'use-sync-external-store/shim/with-selector.js',
        'scheduler'
      ],
      exclude: ['lucide-react', 'three', '@react-three/fiber', '@react-three/drei', 'framer-motion', 'gsap']
    },
    resolve: {
      alias: {
        ...(process.env.VITEST ? {
          'lucide-react': path.resolve('src/mockLucide.js')
        } : {}),
        'use-sync-external-store/shim/with-selector.js': 'use-sync-external-store/shim/with-selector'
      }
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.includes('/api/goldapi')) {
          const parts = req.url.split('?')[0].split('/');
          const symbol = parts[parts.length - 2];
          const currency = parts[parts.length - 1];
          const apiKey = env.GOLD_API_KEY;

          const getMock = () => {
            if (symbol === 'XAU') {
              return { price: 7250, price_gram_24k: 7250, price_gram_22k: 6650, price_gram_18k: 5450, timestamp: Date.now() / 1000, metal: 'XAU' };
            } else if (symbol === 'XAG') {
              return { price: 92, price_gram_24k: 92, price_gram_22k: 85, price_gram_18k: 70, timestamp: Date.now() / 1000, metal: 'XAG' };
            }
            return { price: 100, price_gram_24k: 100, timestamp: Date.now() / 1000 };
          };

          if (!apiKey || apiKey === 'your_gold_api_key_here') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(getMock()));
            return;
          }

          try {
            const apiRes = await fetch(`https://www.goldapi.io/api/${symbol}/${currency}`, {
              headers: {
                'x-access-token': apiKey,
                'Content-Type': 'application/json'
              }
            });

            if (apiRes.ok) {
              const data = await apiRes.json();
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(data));
            } else {
              console.warn(`GoldAPI returned ${apiRes.status} in dev. Serving mock fallback.`);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(getMock()));
            }
          } catch (err) {
            console.warn(`GoldAPI fetch failed in dev: ${err.message}. Serving mock fallback.`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(getMock()));
          }
          return;
        }

        next();
      });
    },
    server: {
      proxy: {
        '^/api/(?!goldapi)': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        }
      },
    },
    build: {
      chunkSizeWarningLimit: 3000,
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.js',
      css: false,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
      },
    },
  }
})
