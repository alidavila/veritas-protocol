// vite.config.js
import { defineConfig } from "file:///C:/Users/JD%202021/Documentos/LABS-IA/Veritas/protocolo-veritas/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/JD%202021/Documentos/LABS-IA/Veritas/protocolo-veritas/node_modules/@vitejs/plugin-react/dist/index.js";
import { nodePolyfills } from "file:///C:/Users/JD%202021/Documentos/LABS-IA/Veritas/protocolo-veritas/node_modules/vite-plugin-node-polyfills/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      protocolImports: true,
      globals: {
        Buffer: true,
        global: true,
        process: true
      }
    })
  ],
  resolve: {
    alias: {
      crypto: "vite-plugin-node-polyfills/polyfills/crypto",
      stream: "vite-plugin-node-polyfills/polyfills/stream",
      buffer: "vite-plugin-node-polyfills/polyfills/buffer"
    }
  },
  // Drop console.log and debugger in production
  esbuild: {
    drop: ["console", "debugger"]
  },
  build: {
    // Target modern browsers for smaller, faster output
    target: "esnext",
    // Disable sourcemaps in production for smaller builds
    sourcemap: false,
    // Split CSS per chunk
    cssCodeSplit: true,
    // Manual chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React — rarely changes, cached long-term
          "vendor-react": ["react", "react-dom"],
          // Coinbase SDK — heavy, loaded only when needed
          "vendor-coinbase": ["@coinbase/cdp-sdk"],
          // Supabase — medium weight
          "vendor-supabase": ["@supabase/supabase-js"],
          // UI icons
          "vendor-icons": ["lucide-react"]
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxKRCAyMDIxXFxcXERvY3VtZW50b3NcXFxcTEFCUy1JQVxcXFxWZXJpdGFzXFxcXHByb3RvY29sby12ZXJpdGFzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxKRCAyMDIxXFxcXERvY3VtZW50b3NcXFxcTEFCUy1JQVxcXFxWZXJpdGFzXFxcXHByb3RvY29sby12ZXJpdGFzXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9KRCUyMDIwMjEvRG9jdW1lbnRvcy9MQUJTLUlBL1Zlcml0YXMvcHJvdG9jb2xvLXZlcml0YXMvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgeyBub2RlUG9seWZpbGxzIH0gZnJvbSAndml0ZS1wbHVnaW4tbm9kZS1wb2x5ZmlsbHMnO1xuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gICAgcGx1Z2luczogW1xuICAgICAgICByZWFjdCgpLFxuICAgICAgICBub2RlUG9seWZpbGxzKHtcbiAgICAgICAgICAgIHByb3RvY29sSW1wb3J0czogdHJ1ZSxcbiAgICAgICAgICAgIGdsb2JhbHM6IHtcbiAgICAgICAgICAgICAgICBCdWZmZXI6IHRydWUsXG4gICAgICAgICAgICAgICAgZ2xvYmFsOiB0cnVlLFxuICAgICAgICAgICAgICAgIHByb2Nlc3M6IHRydWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KSxcbiAgICBdLFxuICAgIHJlc29sdmU6IHtcbiAgICAgICAgYWxpYXM6IHtcbiAgICAgICAgICAgIGNyeXB0bzogJ3ZpdGUtcGx1Z2luLW5vZGUtcG9seWZpbGxzL3BvbHlmaWxscy9jcnlwdG8nLFxuICAgICAgICAgICAgc3RyZWFtOiAndml0ZS1wbHVnaW4tbm9kZS1wb2x5ZmlsbHMvcG9seWZpbGxzL3N0cmVhbScsXG4gICAgICAgICAgICBidWZmZXI6ICd2aXRlLXBsdWdpbi1ub2RlLXBvbHlmaWxscy9wb2x5ZmlsbHMvYnVmZmVyJyxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgIC8vIERyb3AgY29uc29sZS5sb2cgYW5kIGRlYnVnZ2VyIGluIHByb2R1Y3Rpb25cbiAgICBlc2J1aWxkOiB7XG4gICAgICAgIGRyb3A6IFsnY29uc29sZScsICdkZWJ1Z2dlciddLFxuICAgIH0sXG4gICAgYnVpbGQ6IHtcbiAgICAgICAgLy8gVGFyZ2V0IG1vZGVybiBicm93c2VycyBmb3Igc21hbGxlciwgZmFzdGVyIG91dHB1dFxuICAgICAgICB0YXJnZXQ6ICdlc25leHQnLFxuICAgICAgICAvLyBEaXNhYmxlIHNvdXJjZW1hcHMgaW4gcHJvZHVjdGlvbiBmb3Igc21hbGxlciBidWlsZHNcbiAgICAgICAgc291cmNlbWFwOiBmYWxzZSxcbiAgICAgICAgLy8gU3BsaXQgQ1NTIHBlciBjaHVua1xuICAgICAgICBjc3NDb2RlU3BsaXQ6IHRydWUsXG4gICAgICAgIC8vIE1hbnVhbCBjaHVuayBzcGxpdHRpbmcgZm9yIGJldHRlciBjYWNoaW5nXG4gICAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgICAgIG91dHB1dDoge1xuICAgICAgICAgICAgICAgIG1hbnVhbENodW5rczoge1xuICAgICAgICAgICAgICAgICAgICAvLyBDb3JlIFJlYWN0IFx1MjAxNCByYXJlbHkgY2hhbmdlcywgY2FjaGVkIGxvbmctdGVybVxuICAgICAgICAgICAgICAgICAgICAndmVuZG9yLXJlYWN0JzogWydyZWFjdCcsICdyZWFjdC1kb20nXSxcbiAgICAgICAgICAgICAgICAgICAgLy8gQ29pbmJhc2UgU0RLIFx1MjAxNCBoZWF2eSwgbG9hZGVkIG9ubHkgd2hlbiBuZWVkZWRcbiAgICAgICAgICAgICAgICAgICAgJ3ZlbmRvci1jb2luYmFzZSc6IFsnQGNvaW5iYXNlL2NkcC1zZGsnXSxcbiAgICAgICAgICAgICAgICAgICAgLy8gU3VwYWJhc2UgXHUyMDE0IG1lZGl1bSB3ZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgJ3ZlbmRvci1zdXBhYmFzZSc6IFsnQHN1cGFiYXNlL3N1cGFiYXNlLWpzJ10sXG4gICAgICAgICAgICAgICAgICAgIC8vIFVJIGljb25zXG4gICAgICAgICAgICAgICAgICAgICd2ZW5kb3ItaWNvbnMnOiBbJ2x1Y2lkZS1yZWFjdCddLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBeVgsU0FBUyxvQkFBb0I7QUFDdFosT0FBTyxXQUFXO0FBQ2xCLFNBQVMscUJBQXFCO0FBRTlCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQ3hCLFNBQVM7QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLGNBQWM7QUFBQSxNQUNWLGlCQUFpQjtBQUFBLE1BQ2pCLFNBQVM7QUFBQSxRQUNMLFFBQVE7QUFBQSxRQUNSLFFBQVE7QUFBQSxRQUNSLFNBQVM7QUFBQSxNQUNiO0FBQUEsSUFDSixDQUFDO0FBQUEsRUFDTDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ0wsT0FBTztBQUFBLE1BQ0gsUUFBUTtBQUFBLE1BQ1IsUUFBUTtBQUFBLE1BQ1IsUUFBUTtBQUFBLElBQ1o7QUFBQSxFQUNKO0FBQUE7QUFBQSxFQUVBLFNBQVM7QUFBQSxJQUNMLE1BQU0sQ0FBQyxXQUFXLFVBQVU7QUFBQSxFQUNoQztBQUFBLEVBQ0EsT0FBTztBQUFBO0FBQUEsSUFFSCxRQUFRO0FBQUE7QUFBQSxJQUVSLFdBQVc7QUFBQTtBQUFBLElBRVgsY0FBYztBQUFBO0FBQUEsSUFFZCxlQUFlO0FBQUEsTUFDWCxRQUFRO0FBQUEsUUFDSixjQUFjO0FBQUE7QUFBQSxVQUVWLGdCQUFnQixDQUFDLFNBQVMsV0FBVztBQUFBO0FBQUEsVUFFckMsbUJBQW1CLENBQUMsbUJBQW1CO0FBQUE7QUFBQSxVQUV2QyxtQkFBbUIsQ0FBQyx1QkFBdUI7QUFBQTtBQUFBLFVBRTNDLGdCQUFnQixDQUFDLGNBQWM7QUFBQSxRQUNuQztBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUNKLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
