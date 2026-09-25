import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// Auto-reloaded with .env support
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
  ],
  optimizeDeps: {
    exclude: ['maplibre-gl'],
  },
  server: {
    proxy: {
      // Flightradar24 zone feed proxy to bypass CORS during local dev
      '/api/fr24': {
        target: 'https://data-cloud.flightradar24.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fr24/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Referer': 'https://www.flightradar24.com/',
        },
      },
      // OpenSky Network API proxy
      '/api/opensky': {
        target: 'https://opensky-network.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/opensky/, ''),
      },
    },
  },
})
