<template>
  <v-app>
    <!-- Show loading screen during auth initialization -->
    <div v-if="authStore.loading && !authStore.initialized" class="loading-screen">
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="auto">
            <div class="text-center">
              <v-progress-circular
                :size="60"
                :width="4"
                color="primary"
                indeterminate
                class="mb-4"
              />
              <h3 class="text-h6 text-medium-emphasis">
                Initializing PetSmart Admin...
              </h3>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Main app content -->
    <div v-else>
      <!-- Enhanced router-view with component optimization (transitions removed) -->
      <router-view v-slot="{ Component, route }">
        <!-- Wrap authenticated routes with AppLayout for persistent sidebar -->
        <AppLayout v-if="shouldUseLayout(route)">
          <keep-alive
            :include="keepAliveComponents"
            :max="maxCachedComponents"
          >
            <component
              :is="Component"
              :key="getComponentKey(route)"
            />
          </keep-alive>
        </AppLayout>
        <!-- Render standalone components (like LoginView) without layout -->
        <component
          v-else
          :is="Component"
          :key="getComponentKey(route)"
        />
      </router-view>
    </div>
  </v-app>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { connectionMonitor } from '@/services/connectionMonitor'
import AppLayout from '@/components/layout/AppLayout.vue'

const route = useRoute()
const authStore = useAuthStore()

// Optimized keep-alive configuration - only cache essential components
const keepAliveComponents = ref([
  'DashboardView',
  'UsersView',
  'PetsView',
  'AppointmentsView',
  'ProductsView'
])

// Maximum number of cached components to prevent memory leaks
const maxCachedComponents = 3

// Determine if route should use AppLayout (all routes except login and standalone pages)
const shouldUseLayout = (route: any) => {
  const standaloneRoutes = ['Login', 'NotFound']
  return !standaloneRoutes.includes(route.name)
}

// Optimize component key to prevent unnecessary re-renders
const getComponentKey = (route: any) => {
  // For detail pages, include the ID to ensure proper re-rendering
  if (route.params?.id) {
    return `${route.name}-${route.params.id}`
  }

  // For list pages, use the route name to preserve state
  return route.name || route.path
}

onMounted(async () => {
  // Initialize auth first
  await authStore.initialize()

  // Temporarily disable connection monitoring for performance testing
  // if (authStore.isAuthenticated) {
  //   connectionMonitor.startMonitoring()
  // }
})

// Temporarily disable connection monitoring watcher
// watch(() => authStore.isAuthenticated, (isAuthenticated) => {
//   if (isAuthenticated) {
//     console.log('🔍 User authenticated, starting connection monitoring')
//     connectionMonitor.startMonitoring()
//   } else {
//     console.log('🛑 User not authenticated, stopping connection monitoring')
//     connectionMonitor.stopMonitoring()
//   }
// })

onUnmounted(() => {
  // connectionMonitor.stopMonitoring()
  authStore.cleanup()
})
</script>

<style>
html {
  overflow-y: auto !important;
  scroll-behavior: smooth;
}

.v-application {
  font-family: 'Inter', 'Roboto', sans-serif !important;
  line-height: 1.6;
}

/* Enhanced scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.3);
  border-radius: 3px;
  transition: background 0.2s ease;
}

/* Page Transition Animations - REMOVED for immediate navigation */

::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.5);
}

/* Enhanced animations */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from {
  transform: translateX(-100%);
}

.slide-leave-to {
  transform: translateX(100%);
}

/* Optimized card styles - single definition */
.v-card {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06) !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
  transform: translateY(-1px);
}

/* Enhanced button styles */
.v-btn {
  font-weight: 500 !important;
  letter-spacing: 0.025em;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.v-btn:hover {
  transform: translateY(-1px);
}

/* Modern input styles */
.v-field {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-field:hover {
  box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.2);
}

.v-field--focused {
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2) !important;
}

/* Typography improvements */
.text-h1, .text-h2, .text-h3, .text-h4, .text-h5, .text-h6 {
  font-weight: 600 !important;
  letter-spacing: -0.025em;
}

.text-subtitle-1, .text-subtitle-2 {
  font-weight: 500 !important;
}

/* Responsive utilities */
@media (max-width: 768px) {
  .v-container {
    padding: 12px !important;
  }

  .v-card {
    margin-bottom: 16px;
  }
}

/* Loading states */
.skeleton-loader {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Status indicators */
.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-success {
  background-color: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.status-warning {
  background-color: rgba(245, 158, 11, 0.1);
  color: #D97706;
}

.status-error {
  background-color: rgba(239, 68, 68, 0.1);
  color: #DC2626;
}

.status-info {
  background-color: rgba(59, 130, 246, 0.1);
  color: #2563EB;
}

/* Removed duplicate card and button styles - consolidated above */

/* Data table styling */
.v-data-table {
  border-radius: 8px !important;
}

.v-data-table-header {
  background-color: #f5f5f5 !important;
}

/* Form styling */
.v-text-field .v-field {
  border-radius: 8px !important;
}

.v-select .v-field {
  border-radius: 8px !important;
}

/* Chip styling */
.v-chip {
  border-radius: 16px !important;
}

/* Alert styling */
.v-alert {
  border-radius: 8px !important;
}

/* Loading screen */
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #6366F1 0%, #4F46E5 50%, #3B82F6 100%);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-screen .v-progress-circular {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.loading-screen h3 {
  color: white;
  font-weight: 500;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>
