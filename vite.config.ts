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
  
  // Define global constants to replace in the code
  const define = {
    __APP_ENV__: JSON.stringify(env.APP_ENV || 'development'),
    __DEFINES__: JSON.stringify({
      'process.env.NODE_ENV': JSON.stringify(mode),
      'import.meta.env.MODE': JSON.stringify(mode),
      'import.meta.env.DEV': JSON.stringify(mode === 'development'),
      'import.meta.env.PROD': JSON.stringify(mode === 'production'),
      'import.meta.env.SSR': JSON.stringify(false)
    }),
    'process.env.NODE_ENV': JSON.stringify(mode),
    'process.env': {},
    'import.meta.env': {},
    'import.meta.env.MODE': JSON.stringify(mode),
    'import.meta.env.DEV': JSON.stringify(mode === 'development'),
    'import.meta.env.PROD': JSON.stringify(mode === 'production'),
    'import.meta.env.SSR': JSON.stringify(false),
    'global': 'globalThis',
    'globalThis.__vite_process_env_NODE_ENV': JSON.stringify(mode)
  };

  return {
    define: {
      ...define,
      // Add HMR configuration
      __HMR_CONFIG_NAME__: JSON.stringify('vite-hmr'),
      'import.meta.hot': 'import.meta.hot',
      'process.env.HMR': 'true',
    },
    // Base public path when served in production
    base: '/',
    
    // Development server configuration
    server: {
      host: "::",
      port: 3000,
      strictPort: true,
      open: !isProduction,
      hmr: {
        host: 'localhost',
        protocol: 'ws',
        port: 3000
      },
    },
    
    // Build configuration
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: isProduction ? 'hidden' : false,
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
              if (id.includes('@tanstack/query')) {
                return 'vendor-query';
              }
              return 'vendor';
            }
          },
        },
      },
      chunkSizeWarningLimit: 1000,
      target: 'es2020',
    },
    
    // Plugins
    plugins: [
      react({
        // Enable Fast Refresh
        jsxImportSource: '@emotion/react',
        babel: {
          plugins: [
            ['@babel/plugin-proposal-decorators', { legacy: true }],
          ],
        },
      })
    ],
    
    // Module resolution
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
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
