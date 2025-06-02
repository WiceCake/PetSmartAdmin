import { defineAsyncComponent, type AsyncComponentLoader, type Component } from 'vue'
import { useThemeStore } from '@/stores/theme'

export interface LazyComponentOptions {
  isCritical?: boolean
  delay?: number
  timeout?: number
  loadingComponent?: Component
  errorComponent?: Component
  suspendDuringThemeChange?: boolean
}

export function createThemeAwareLazyComponent(
  loader: AsyncComponentLoader,
  options: LazyComponentOptions = {}
) {
  const {
    isCritical = false,
    delay = 200,
    timeout = 10000,
    suspendDuringThemeChange = true,
    loadingComponent,
    errorComponent
  } = options

  return defineAsyncComponent({
    loader: async () => {
      const themeStore = useThemeStore()

      if (isCritical) {
        return loader()
      }

      if (suspendDuringThemeChange && themeStore.isTransitioning) {
        await new Promise(resolve => {
          const checkTheme = () => {
            if (!themeStore.isTransitioning) {
              resolve(true)
            } else {
              setTimeout(checkTheme, 50)
            }
          }
          checkTheme()
        })
      }

      if (!themeStore.shouldLoadComponent('async-component', isCritical)) {
        return {
          template: '<div class="lazy-component-placeholder"></div>'
        }
      }

      return loader()
    },
    
    loadingComponent: loadingComponent || {
      template: `
        <div class="d-flex align-center justify-center pa-4">
          <v-progress-circular indeterminate size="24" width="2" />
          <span class="ml-2 text-body-2">Loading...</span>
        </div>
      `
    },

    errorComponent: errorComponent || {
      template: `
        <div class="d-flex align-center justify-center pa-4 text-error">
          <v-icon icon="mdi-alert-circle" class="mr-2" />
          <span class="text-body-2">Failed to load component</span>
        </div>
      `
    },
    
    delay,
    timeout
  })
}

export const LazyLineChart = createThemeAwareLazyComponent(
  () => import('@/components/charts/LineChart.vue'),
  {
    isCritical: false,
    suspendDuringThemeChange: true,
    delay: 100
  }
)

export const LazyDoughnutChart = createThemeAwareLazyComponent(
  () => import('@/components/charts/DoughnutChart.vue'),
  {
    isCritical: false,
    suspendDuringThemeChange: true,
    delay: 100
  }
)

export const LazyUserFormDialog = createThemeAwareLazyComponent(
  () => import('@/components/UserFormDialog.vue'),
  {
    isCritical: false,
    suspendDuringThemeChange: true,
    delay: 50
  }
)

export async function batchLoadComponents(componentLoaders: Array<() => Promise<any>>) {
  const themeStore = useThemeStore()

  if (themeStore.isTransitioning) {
    await new Promise(resolve => {
      const checkTheme = () => {
        if (!themeStore.isTransitioning) {
          resolve(true)
        } else {
          setTimeout(checkTheme, 50)
        }
      }
      checkTheme()
    })
  }

  const batchSize = 3
  const results = []

  for (let i = 0; i < componentLoaders.length; i += batchSize) {
    const batch = componentLoaders.slice(i, i + batchSize)
    const batchResults = await Promise.allSettled(
      batch.map(loader => loader())
    )
    results.push(...batchResults)

    if (i + batchSize < componentLoaders.length) {
      await new Promise(resolve => setTimeout(resolve, 10))
    }
  }

  return results
}

export function preloadCriticalComponents() {
  const criticalComponents = [
    () => import('@/components/layout/AppLayout.vue'),
    () => import('@/components/ConfirmDialog.vue')
  ]

  const schedulePreload = (callback: () => void) => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(callback, { timeout: 1000 })
    } else {
      setTimeout(callback, 100)
    }
  }

  schedulePreload(() => {
    batchLoadComponents(criticalComponents).catch(() => {
      // Silent fail for preloading
    })
  })
}


