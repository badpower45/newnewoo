import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 5173,
      host: '0.0.0.0',
      hmr: {
        overlay: false
      },
      proxy: {
        '/api': {
          target: 'https://bkaa.vercel.app',
          changeOrigin: true,
        }
      }
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // React core
            'react-vendor': ['react', 'react-dom'],
            // Routing
            'router': ['react-router-dom'],
            // Real-time communication
            'socket': ['socket.io-client'],
            // UI libraries
            'ui-libs': ['lucide-react', 'framer-motion'],
          }
        }
      },
      chunkSizeWarningLimit: 1000,
      sourcemap: false,
      // Minification options
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // Remove console.logs in production
          drop_debugger: true
        }
      },
      // CSS code splitting
      cssCodeSplit: true,
      // Asset inlining threshold (4KB)
      assetsInlineLimit: 4096,
    },
    optimizeDeps: {
      exclude: ['lucide-react']
    }
  };
});
