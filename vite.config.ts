import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    define: {
      'process.env': {},
      // Ensure environment variables are available at build time
      __VITE_SUPABASE_URL__: JSON.stringify(env.VITE_SUPABASE_URL),
      __VITE_SUPABASE_ANON_KEY__: JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      __VITE_SUPABASE_SERVICE_ROLE_KEY__: JSON.stringify(env.VITE_SUPABASE_SERVICE_ROLE_KEY)
    },
    optimizeDeps: {
      include: ['uri-js', '@supabase/supabase-js'],
      exclude: []
    },
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('pinia') || id.includes('@vue')) {
              return 'vue-vendor'
            }
            if (id.includes('vuetify')) {
              return 'vuetify-vendor'
            }
            if (id.includes('@supabase')) {
              return 'supabase-vendor'
            }
            if (id.includes('vue-toastification') || id.includes('date-fns') || id.includes('lodash')) {
              return 'ui-vendor'
            }
            // Other node_modules
            return 'vendor'
          }

          // Application chunks based on route groups
          if (id.includes('/views/users/')) {
            return 'users'
          }
          if (id.includes('/views/auth/')) {
            return 'auth'
          }
          if (id.includes('/views/analytics/') || id.includes('/views/settings/') || id.includes('DashboardView')) {
            return 'admin'
          }
          if (id.includes('/views/pets/') || id.includes('/views/appointments/') ||
              id.includes('/views/products/') || id.includes('/views/orders/')) {
            return 'content'
          }
          if (id.includes('/views/messages/') || id.includes('/views/notifications/')) {
            return 'communication'
          }
          if (id.includes('/stores/')) {
            return 'stores'
          }
          if (id.includes('/services/')) {
            return 'services'
          }
          if (id.includes('/components/')) {
            return 'components'
          }
        }
      }
    }
  }
  }
})
