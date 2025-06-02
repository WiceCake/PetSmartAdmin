import { defineStore } from 'pinia'
import { ref, computed, watch, nextTick } from 'vue'
import { useTheme } from 'vuetify'

export type ThemeMode = 'light' | 'dark' | 'system'

export const useThemeStore = defineStore('theme', () => {
  // State
  const mode = ref<ThemeMode>('light')
  const systemPrefersDark = ref(false)
  const isTransitioning = ref(false)

  // Storage key for localStorage
  const STORAGE_KEY = 'petsmart-admin-theme'

  // Vuetify theme instance (will be set when store is initialized)
  let vuetifyTheme: ReturnType<typeof useTheme> | null = null

  // Performance optimization: debounce theme changes
  let themeChangeTimeout: number | null = null
  let broadcastTimeout: number | null = null
  let saveTimeout: number | null = null

  // Lazy loading state for non-critical components
  const lazyComponentsEnabled = ref(true)
  const criticalComponentsOnly = ref(false)
  
  // Computed
  const isDark = computed(() => {
    if (mode.value === 'system') {
      return systemPrefersDark.value
    }
    return mode.value === 'dark'
  })
  
  const currentTheme = computed(() => isDark.value ? 'dark' : 'light')
  
  // Actions
  const initializeTheme = (theme: ReturnType<typeof useTheme>) => {
    vuetifyTheme = theme
    
    // Load saved preference from localStorage
    loadThemeFromStorage()
    
    // Set up system preference detection
    setupSystemPreferenceDetection()
    
    // Apply initial theme
    applyTheme()
    
    // Optimized watchers with debouncing
    watch(mode, () => {
      // Debounce theme changes to prevent rapid switching lag
      if (themeChangeTimeout) {
        clearTimeout(themeChangeTimeout)
      }

      themeChangeTimeout = window.setTimeout(() => {
        saveThemeToStorage()
        applyTheme()
        broadcastThemeChange()
      }, 50) // Small debounce to batch rapid changes
    }, { immediate: false })

    // Watch for system preference changes (less frequent, no debounce needed)
    watch(systemPrefersDark, () => {
      if (mode.value === 'system') {
        applyTheme()
        broadcastThemeChange()
      }
    })
  }
  
  const loadThemeFromStorage = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        mode.value = saved as ThemeMode
      } else {
        mode.value = 'system'
      }
    } catch (error) {
      mode.value = 'system'
    }
  }
  
  const saveThemeToStorage = () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }

    saveTimeout = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, mode.value)
      } catch (error) {
        // Silent fail for localStorage issues
      }
    }, 200)
  }
  
  const setupSystemPreferenceDetection = () => {
    // Check initial system preference
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      systemPrefersDark.value = mediaQuery.matches
      
      // Listen for system preference changes
      const handleChange = (e: MediaQueryListEvent) => {
        systemPrefersDark.value = e.matches
      }
      
      // Use the newer addEventListener if available, fallback to addListener
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange)
      } else {
        // Fallback for older browsers
        mediaQuery.addListener(handleChange)
      }
    }
  }
  
  const applyTheme = () => {
    if (!vuetifyTheme) return

    const targetTheme = currentTheme.value
    const isDarkMode = isDark.value

    isTransitioning.value = true
    criticalComponentsOnly.value = true

    requestAnimationFrame(() => {
      const docElement = document.documentElement
      const classList = docElement.classList

      classList.add('theme-changing', 'theme-transition-containment')
      vuetifyTheme!.global.name.value = targetTheme

      if (isDarkMode) {
        classList.replace('light-theme', 'dark-theme')
      } else {
        classList.replace('dark-theme', 'light-theme')
      }

      updateMetaThemeColor(targetTheme)

      nextTick(() => {
        setTimeout(() => {
          classList.remove('theme-changing', 'theme-transition-containment')
          isTransitioning.value = false

          setTimeout(() => {
            criticalComponentsOnly.value = false
          }, 50)
        }, 30)
      })
    })
  }
  
  const updateMetaThemeColor = (theme: string) => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      // Use the primary color from the current theme
      const color = theme === 'dark' ? '#1E293B' : '#2563eb'
      metaThemeColor.setAttribute('content', color)
    }
  }
  
  const broadcastThemeChange = () => {
    if (broadcastTimeout) {
      clearTimeout(broadcastTimeout)
    }

    broadcastTimeout = window.setTimeout(() => {
      try {
        const themeData = {
          mode: mode.value,
          isDark: isDark.value,
          timestamp: Date.now()
        }

        const event = new CustomEvent('theme-changed', { detail: themeData })
        window.dispatchEvent(event)
        localStorage.setItem(`${STORAGE_KEY}-broadcast`, JSON.stringify(themeData))
      } catch (error) {
        // Silent fail for non-critical broadcast functionality
      }
    }, 100)
  }
  
  const setupCrossTabSync = () => {
    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const newMode = e.newValue as ThemeMode
        if (newMode !== mode.value && ['light', 'dark', 'system'].includes(newMode)) {
          mode.value = newMode
          applyTheme()
        }
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Listen for custom theme change events
    const handleThemeChange = (e: CustomEvent) => {
      if (e.detail.mode !== mode.value) {
        mode.value = e.detail.mode
        applyTheme()
      }
    }
    
    window.addEventListener('theme-changed', handleThemeChange as EventListener)
  }
  
  // Public methods for theme switching
  const setTheme = (newMode: ThemeMode) => {
    mode.value = newMode
  }
  
  const toggleTheme = () => {
    if (mode.value === 'system') {
      // If currently system, toggle to opposite of current system preference
      mode.value = systemPrefersDark.value ? 'light' : 'dark'
    } else {
      // Toggle between light and dark
      mode.value = mode.value === 'light' ? 'dark' : 'light'
    }
  }
  
  const setLightTheme = () => setTheme('light')
  const setDarkTheme = () => setTheme('dark')
  const setSystemTheme = () => setTheme('system')

  // Lazy loading utilities for performance during theme changes
  const enableLazyComponents = () => {
    lazyComponentsEnabled.value = true
  }

  const disableLazyComponents = () => {
    lazyComponentsEnabled.value = false
  }

  const shouldLoadComponent = (componentName: string, isCritical = false) => {
    // Always load critical components
    if (isCritical) return true

    // During theme transitions, only load critical components
    if (criticalComponentsOnly.value) return false

    // Otherwise, respect lazy loading setting
    return lazyComponentsEnabled.value
  }

  // Initialize cross-tab synchronization
  setupCrossTabSync()
  
  return {
    // State
    mode,
    systemPrefersDark,
    isTransitioning,
    lazyComponentsEnabled,
    criticalComponentsOnly,

    // Computed
    isDark,
    currentTheme,

    // Actions
    initializeTheme,
    setTheme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setSystemTheme,
    enableLazyComponents,
    disableLazyComponents,
    shouldLoadComponent
  }
})
