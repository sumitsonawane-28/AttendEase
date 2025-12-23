import { defineConfig, loadEnv, type ConfigEnv, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';

// Get the directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  // Load env file based on `mode` in the current directory and its parent directories
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';

  return {
    // Base public path when served in production
    base: isProduction ? '/' : '/',
    
    // Development server configuration
    server: {
      host: "::",
      port: 8080,
      strictPort: true,
      open: !isProduction,
    },
    
    // Build configuration
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: !isProduction,
      minify: isProduction ? 'esbuild' : false,
      cssMinify: isProduction,
      emptyOutDir: true,
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash][extname]',
          manualChunks: (id: string) => {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
                return 'vendor-react';
              }
              if (id.includes('@radix-ui')) {
                return 'vendor-radix';
              }
              return 'vendor';
            }
          },
        },
      },
      chunkSizeWarningLimit: 1000,
      target: 'es2020',
      modulePreload: {
        polyfill: true,
      },
    },
    
    // Plugins
    plugins: [
      react({
        // Enable Fast Refresh
        jsxImportSource: '@emotion/react',
        tsDecorators: true,
      })
    ],
    
    // Module resolution
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    
    // Environment variables
    define: {
      'process.env': {}
    },
    
    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@radix-ui/react-dialog',
        '@radix-ui/react-dropdown-menu',
        '@tanstack/react-query'
      ],
      esbuildOptions: {
        target: 'es2020',
        // Node.js global to browser globalThis
        define: {
          global: 'globalThis',
        },
        // Enable esbuild tree shaking
        treeShaking: true,
        // Keep names for better debugging
        keepNames: !isProduction,
      },
      // Enable dependency optimization
      force: isProduction,
    },
    
    // CSS configuration
    css: {
      devSourcemap: !isProduction,
      modules: {
        localsConvention: 'camelCaseOnly',
      },
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables";`
        }
      }
    },
    
    // Handle Vercel rewrites for SPA routing
    preview: {
      port: 8080,
      strictPort: true,
    },
  };
});
