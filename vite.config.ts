import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import { fileURLToPath } from 'node:url'
import { componentTagger } from "lovable-tagger"

// ESM compatible __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime'],
    exclude: [],
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    sourcemap: mode !== 'production',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/scheduler/')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/@radix-ui/react-dialog') ||
              id.includes('node_modules/@radix-ui/react-dropdown-menu') ||
              id.includes('node_modules/@radix-ui/react-popover')) {
            return 'ui-vendor';
          }
          if (id.includes('node_modules/@radix-ui')) {
            return 'ui-vendor-extra';
          }
          if (id.includes('node_modules/recharts')) {
            return 'chart-vendor';
          }
          if (id.includes('node_modules/@tanstack/react-query')) {
            return 'query-vendor';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'icon-vendor';
          }
          if (id.includes('node_modules/wouter')) {
            return 'router-vendor';
          }
          if (id.includes('node_modules/zod')) {
            return 'validation-vendor';
          }
          if (id.includes('node_modules/date-fns')) {
            return 'date-vendor';
          }
          if (id.includes('node_modules/')) {
            return 'vendor';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 800,
  },
  server: {
    host: "::",
    port: 8080,
    strictPort: false,
    hmr: false,
    watch: {
      usePolling: true,
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    allowedHosts: true,
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(
      process.env.VITE_API_URL || ''
    ),
  },
}))
