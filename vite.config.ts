import { defineConfig } from "vite";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      'date-fns': path.resolve(__dirname, 'node_modules/date-fns/esm'),
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
    mainFields: ['module', 'jsnext:main', 'jsnext', 'main'],
  },
  build: {
    target: 'es2015',
    sourcemap: false,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'date-fns'],
    esbuildOptions: {
      target: 'es2015',
      jsx: 'automatic'
    }
  },
  esbuild: {
    jsx: 'automatic'
  }
}));
