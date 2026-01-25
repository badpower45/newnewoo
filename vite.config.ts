import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { compression } from 'vite-plugin-compression2';

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
    plugins: [
      react(),
      // Gzip compression
      compression({
        algorithm: 'gzip',
        exclude: [/\.(br)$/, /\.(gz)$/],
        threshold: 1024, // Only compress files > 1KB
      }),
      // Brotli compression (better than gzip)
      compression({
        algorithm: 'brotliCompress',
        exclude: [/\.(br)$/, /\.(gz)$/],
        threshold: 1024,
      }),
    ],
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
          manualChunks: (id) => {
            // React core - smallest chunk
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'react-vendor';
            }
            
            // Routing
            if (id.includes('node_modules/react-router-dom')) {
              return 'router';
            }
            
            // Real-time communication
            if (id.includes('node_modules/socket.io-client')) {
              return 'socket';
            }
            
            // Data fetching
            if (id.includes('node_modules/@tanstack/react-query') || id.includes('node_modules/axios')) {
              return 'data-fetching';
            }
            
            // Supabase
            if (id.includes('node_modules/@supabase')) {
              return 'supabase';
            }
            
            // UI/Animation libraries
            if (id.includes('node_modules/lucide-react') || 
                id.includes('node_modules/framer-motion') ||
                id.includes('node_modules/lottie-react')) {
              return 'ui-libs';
            }
            
            // Utilities (barcode, excel, etc)
            if (id.includes('node_modules/html5-qrcode') || 
                id.includes('node_modules/xlsx')) {
              return 'utilities';
            }
            
            // Other node_modules
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
          // Optimize chunk names
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        }
      },
      chunkSizeWarningLimit: 500, // Lower threshold to warn about large chunks
      sourcemap: false,
      // Use terser for better minification (smaller size)
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // Remove console.logs in production
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
          passes: 2, // Multiple passes for better compression
        },
        mangle: {
          safari10: true,
        },
        format: {
          comments: false, // Remove all comments
        },
      },
      // CSS code splitting
      cssCodeSplit: true,
      // Don't inline any assets (better caching)
      assetsInlineLimit: 0,
      // Target modern browsers
      target: 'es2020',
      // Module preload optimization
      modulePreload: {
        polyfill: false, // Don't polyfill if targeting modern browsers
      },
    },
    optimizeDeps: {
      exclude: ['lucide-react']
    }
  };
});
