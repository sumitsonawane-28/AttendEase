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
  const isHMR = !isProduction && !process.env.VITE_TEST;
  const define = {
    __APP_ENV__: JSON.stringify(env.APP_ENV || 'development'),
    __BASE__: JSON.stringify('/'),
    __SERVER_HOST__: JSON.stringify(env.VITE_SERVER_HOST || 'http://localhost:3000'),
    __HMR_PROTOCOL__: JSON.stringify('ws'),
    __HMR_HOSTNAME__: JSON.stringify('localhost'),
    __HMR_PORT__: JSON.stringify(24678),
    __HMR_TIMEOUT__: JSON.stringify(30000),
    __HMR_CONFIG_NAME__: JSON.stringify('vite-hmr'),
    __HMR_ENABLE_OVERLAY__: JSON.stringify(true),
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
      // HMR configuration
      __HMR_PROTOCOL__: JSON.stringify('ws'),
      __HMR_HOSTNAME__: JSON.stringify('localhost'),
      __HMR_PORT__: JSON.stringify(24678),
      __HMR_ENABLE_OVERLAY__: JSON.stringify(true),
      __HMR_TIMEOUT__: JSON.stringify(30000),
      'import.meta.hot': isHMR ? 'import.meta.hot' : 'undefined',
      'process.env.HMR': JSON.stringify(isHMR)
    },
    // Base public path when served in production
    base: '/',
    
    // Development server configuration
    server: {
      host: isProduction ? '::' : 'localhost',
      port: isProduction ? 3000 : 5173,
      strictPort: true,
      open: !isProduction,
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: isProduction ? 3000 : 24678,
        clientPort: isProduction ? 3000 : 24678
      }
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
