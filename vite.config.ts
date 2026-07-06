import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// R3（倪子宸）搭建的脚手架配置入口
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
})
