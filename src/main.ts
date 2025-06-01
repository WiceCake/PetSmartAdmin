import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import Toast from 'vue-toastification'

// Vuetify
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Toast notifications
import 'vue-toastification/dist/index.css'

import App from './App.vue'
import router from './router'

// Vuetify theme configuration with Material Design 3 inspired colors
const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  defaults: {
    VCard: {
      elevation: 2,
      rounded: 'lg',
    },
    VBtn: {
      rounded: 'lg',
      style: 'text-transform: none; font-weight: 500;',
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
    },
    VTextarea: {
      variant: 'outlined',
      rounded: 'lg',
    },
    VDataTable: {
      density: 'comfortable',
    },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#6366F1', // Modern indigo
          'primary-lighten-1': '#818CF8',
          'primary-darken-1': '#4F46E5',
          secondary: '#64748B', // Slate gray
          'secondary-lighten-1': '#94A3B8',
          'secondary-darken-1': '#475569',
          accent: '#06B6D4', // Cyan
          error: '#EF4444', // Modern red
          'error-lighten-1': '#F87171',
          info: '#3B82F6', // Blue
          'info-lighten-1': '#60A5FA',
          success: '#10B981', // Emerald
          'success-lighten-1': '#34D399',
          warning: '#F59E0B', // Amber
          'warning-lighten-1': '#FBBF24',
          background: '#F8FAFC', // Very light gray
          surface: '#FFFFFF',
          'surface-variant': '#F1F5F9',
          'on-surface': '#1E293B',
          'on-surface-variant': '#64748B',
        },
      },
      dark: {
        colors: {
          primary: '#818CF8',
          'primary-lighten-1': '#A5B4FC',
          'primary-darken-1': '#6366F1',
          secondary: '#94A3B8',
          'secondary-lighten-1': '#CBD5E1',
          'secondary-darken-1': '#64748B',
          accent: '#22D3EE',
          error: '#F87171',
          'error-lighten-1': '#FCA5A5',
          info: '#60A5FA',
          'info-lighten-1': '#93C5FD',
          success: '#34D399',
          'success-lighten-1': '#6EE7B7',
          warning: '#FBBF24',
          'warning-lighten-1': '#FCD34D',
          background: '#0F172A', // Dark slate
          surface: '#1E293B',
          'surface-variant': '#334155',
          'on-surface': '#F1F5F9',
          'on-surface-variant': '#CBD5E1',
        },
      },
    },
  },
})

// Toast configuration
const toastOptions = {
  position: 'top-right' as const,
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false,
}

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)
app.use(Toast, toastOptions)

// Global error handler for session expiration
app.config.errorHandler = (error, instance, info) => {
  console.error('Global error:', error, info)

  // Handle authentication errors globally
  if (error && typeof error === 'object' && 'message' in error) {
    const errorMessage = (error as Error).message.toLowerCase()
    if (errorMessage.includes('session') || errorMessage.includes('unauthorized') || errorMessage.includes('jwt')) {
      // Navigate to login page - auth store will handle session expiration in router guard
      router.push('/login')
    }
  }
}

app.mount('#app')
