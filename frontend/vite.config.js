import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    port: 5173
  },
  preview: {
    port: 3000
  }
})
