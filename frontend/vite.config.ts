import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Opens the browser at whatever port Vite ends up on (5173, or 5174 if 5173 is busy).
    open: true,
  },
})
