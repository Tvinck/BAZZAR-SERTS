import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { port: 5174, host: true },
  build: {
    rollupOptions: {
      output: {
        // Code splitting: разбиваем бандл на мелкие чанки (~150KB каждый)
        // чтобы избежать ERR_HTTP2_PING_FAILED на медленных соединениях
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-icons': ['lucide-react'],
        }
      }
    }
  }
})
