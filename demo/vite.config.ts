import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const SERVER_PORT = process.env.SERVER_PORT || '8787'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: `http://localhost:${SERVER_PORT}`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
