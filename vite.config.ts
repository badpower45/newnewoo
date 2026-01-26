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
            
            // Framer Motion (large library)
            if (id.includes('node_modules/framer-motion')) {
              return 'framer-motion';
            }
            
            // Lucide icons
            if (id.includes('node_modules/lucide-react')) {
              return 'lucide-icons';
            }
            
            // Excel/XLSX (very large)
            if (id.includes('node_modules/xlsx')) {
              return 'xlsx';
            }
            
            // Barcode scanner
            if (id.includes('node_modules/html5-qrcode')) {
              return 'qrcode';
            }
            
            // Helmet (SEO)
            if (id.includes('node_modules/react-helmet-async')) {
              return 'seo';
            }
            
            // Other UI libs
            if (id.includes('node_modules') && 
                (id.includes('bcryptjs') || id.includes('jsonwebtoken'))) {
              return 'crypto';
            }
            
            // Other node_modules - split into smaller chunks
            if (id.includes('node_modules')) {
              // Get the package name
              const parts = id.split('node_modules/')[1].split('/');
              const packageName = parts[0].startsWith('@') 
                ? `${parts[0]}/${parts[1]}` 
                : parts[0];
              
              // Group small packages together
              return 'vendor-libs';
            }
          },
          // Optimize chunk names
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        }
      },
      chunkSizeWarningLimit: 300, // Lower threshold to warn about large chunks
      sourcemap: false,
      // Use terser for better minification (smaller size)
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // Remove console.logs in production
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
          passes: 3, // Multiple passes for better compression
          unsafe: true,
          unsafe_comps: true,
          unsafe_math: true,
          unsafe_proto: true,
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
      // Inline small assets for better performance
      assetsInlineLimit: 4096,
      // Target modern browsers
      target: 'es2020',
      // Enable module preload for faster loads
      modulePreload: {
        polyfill: false,
      },
    },
    optimizeDeps: {
      exclude: ['html5-qrcode', 'xlsx'], // Don't pre-bundle heavy libraries
      include: ['react', 'react-dom', 'react-router-dom']
    }
  };
});
