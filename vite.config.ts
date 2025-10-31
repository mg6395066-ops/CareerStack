import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";
import { fileURLToPath } from "url";
import viteImagemin from 'vite-plugin-imagemin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === 'production';
// Some versions of vite-plugin-imagemin export default differently; normalize it safely
const imageminFactory: any = (viteImagemin as any)?.default ?? (viteImagemin as any);

export default defineConfig({
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    'process.env': '{}',
    global: 'globalThis'
  },
  envPrefix: ['VITE_'],
  
  optimizeDeps: {
    include: [
      '@ckeditor/ckeditor5-react', 
      '@ckeditor/ckeditor5-build-classic',
      '@harbour-enterprises/superdoc'
    ],
  },
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
    // Only enable heavy image optimization in production builds (if plugin factory exists)
    isProd && typeof imageminFactory === 'function' && imageminFactory({
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false,
      },
      optipng: {
        optimizationLevel: 7,
      },
      mozjpeg: {
        quality: 80,
      },
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4,
      },
      webp: {
        quality: 75,
      },
    })
  ].filter(Boolean) as any,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    target: 'es2020',
    sourcemap: false,
    cssCodeSplit: true,
    cssMinify: 'esbuild',
    reportCompressedSize: false,
    assetsInlineLimit: 8192, // 8kb - increased for better performance
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 3,
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        inline: 3,
      },
      mangle: {
        safari10: true,
        properties: {
          regex: '^_private_', // Only mangle private properties
        },
      },
      format: {
        comments: false,
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      external: (id: string) => {
        // Don't bundle puppeteer in production
        if (process.env.NODE_ENV === 'production' && id.includes('puppeteer-core')) return true;
        return false;
      },
      output: {
        globals: {},
        manualChunks: (id) => {
          // Make editor lazy by not including it in vendor chunks unless explicitly used
          if (id.includes('@harbour-enterprises/superdoc')) {
            return 'vendor-editor-lazy';
          }
          
          // React core
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          
          // Radix UI components - split to reduce initial load
          if (id.includes('@radix-ui')) {
            return 'vendor-ui';
          }
          
          // Document processing
          if (id.includes('html2canvas') || id.includes('jspdf')) {
            return 'vendor-docs';
          }
          
          // Query
          if (id.includes('@tanstack/react-query')) {
            return 'vendor-query';
          }
          
          // Forms and validation
          if (id.includes('react-hook-form') || id.includes('@hookform/resolvers') || id.includes('zod')) {
            return 'vendor-forms';
          }
          
          // Motion and animations
          if (id.includes('framer-motion')) {
            return 'vendor-motion';
          }
          
          // Icons
          if (id.includes('lucide-react')) {
            return 'vendor-icons';
          }
          
          // Utils
          if (id.includes('date-fns') || id.includes('clsx') || id.includes('tailwind-merge') || id.includes('nanoid')) {
            return 'vendor-utils';
          }
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return `assets/[name]-[hash][extname]`;
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `img/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
  worker: {
    format: 'es',
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    hmr: {
      port: 24678, // Different port for HMR to avoid conflicts
      clientPort: 24678, // Ensure client connects to the correct port
    },
    host: 'localhost',
    strictPort: false,
    headers: {
      'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: ws: wss:; connect-src 'self' data: blob: ws: wss: http: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; style-src 'self' 'unsafe-inline' data: blob:;"
    }
  },
});
