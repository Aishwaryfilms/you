import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const PROD_BASE = process.env.VITE_BASE_PATH || '/You_website/'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? PROD_BASE : '/',
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
}))
