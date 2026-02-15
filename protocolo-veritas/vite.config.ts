import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    // Drop console.log and debugger in production
    esbuild: {
        drop: ['console', 'debugger'],
    },
    build: {
        // Target modern browsers for smaller, faster output
        target: 'esnext',
        // Disable sourcemaps in production for smaller builds
        sourcemap: false,
        // Split CSS per chunk
        cssCodeSplit: true,
        // Manual chunk splitting for better caching
        rollupOptions: {
            output: {
                manualChunks: {
                    // Core React — rarely changes, cached long-term
                    'vendor-react': ['react', 'react-dom'],
                    // Coinbase SDK — heavy, loaded only when needed
                    'vendor-coinbase': ['@coinbase/cdp-sdk'],
                    // Supabase — medium weight
                    'vendor-supabase': ['@supabase/supabase-js'],
                    // UI icons
                    'vendor-icons': ['lucide-react'],
                },
            },
        },
    },
})
