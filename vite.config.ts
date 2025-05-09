import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }: { mode: string }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Conditionally load the tagger only in development mode
    // Comment out the componentTagger to avoid dependency conflicts
    // mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'process.env': process.env
  },
  // Improve dependency handling to fix resolution issues
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'lucide-react',
      '@hookform/resolvers',
      'zod',
      'framer-motion' // <-- Add framer-motion here
    ],
    exclude: ['lovable-tagger']
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' as const }
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase': ['@supabase/supabase-js'],
          'ui': ['@radix-ui/react-tabs', '@radix-ui/react-toast', 'lucide-react']
        }
      }
      // Do NOT add 'external: ['framer-motion']' here
    }
  }
}));
