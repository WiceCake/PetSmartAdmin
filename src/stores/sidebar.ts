import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'

export interface SidebarState {
  drawer: boolean
  rail: boolean
  scrollPosition: number
  lastActiveRoute: string
  userPreferences: {
    autoCollapse: boolean
    rememberScrollPosition: boolean
    persistState: boolean
  }
}

const STORAGE_KEY = 'petsmart-admin-sidebar-state'

export const useSidebarStore = defineStore('sidebar', () => {
  // Reactive state
  const drawer = ref(true)
  const rail = ref(false)
  const scrollPosition = ref(0)
  const lastActiveRoute = ref('')
  const isInitialized = ref(false)

  // User preferences
  const userPreferences = ref({
    autoCollapse: false,
    rememberScrollPosition: true,
    persistState: true
  })

  // Computed properties
  const isExpanded = computed(() => drawer.value && !rail.value)
  const isCollapsed = computed(() => rail.value)
  const isClosed = computed(() => !drawer.value)

  // Load state from localStorage
  const loadState = (): SidebarState | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.warn('Failed to load sidebar state from localStorage:', error)
    }
    return null
  }

  // Save state to localStorage
  const saveState = () => {
    if (!userPreferences.value.persistState) return

    try {
      const state: SidebarState = {
        drawer: drawer.value,
        rail: rail.value,
        scrollPosition: scrollPosition.value,
        lastActiveRoute: lastActiveRoute.value,
        userPreferences: userPreferences.value
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (error) {
      console.warn('Failed to save sidebar state to localStorage:', error)
    }
  }

  // Initialize state from localStorage or defaults
  const initialize = (windowWidth: number) => {
    const savedState = loadState()
    
    if (savedState && savedState.userPreferences.persistState) {
      // Restore saved state
      drawer.value = savedState.drawer
      rail.value = savedState.rail
      scrollPosition.value = savedState.scrollPosition || 0
      lastActiveRoute.value = savedState.lastActiveRoute || ''
      userPreferences.value = { ...userPreferences.value, ...savedState.userPreferences }
    } else {
      // Set defaults based on screen size
      const isMobile = windowWidth <= 768
      drawer.value = !isMobile
      rail.value = false
      scrollPosition.value = 0
    }

    isInitialized.value = true
  }

  // Update drawer state
  const setDrawer = (value: boolean) => {
    drawer.value = value
    saveState()
  }

  // Toggle drawer
  const toggleDrawer = () => {
    setDrawer(!drawer.value)
  }

  // Update rail state
  const setRail = (value: boolean) => {
    rail.value = value
    saveState()
  }

  // Toggle rail mode
  const toggleRail = () => {
    setRail(!rail.value)
  }

  // Update scroll position
  const setScrollPosition = (position: number) => {
    if (userPreferences.value.rememberScrollPosition) {
      scrollPosition.value = position
      saveState()
    }
  }

  // Update last active route
  const setLastActiveRoute = (route: string) => {
    lastActiveRoute.value = route
    saveState()
  }

  // Update user preferences
  const updatePreferences = (newPreferences: Partial<typeof userPreferences.value>) => {
    userPreferences.value = { ...userPreferences.value, ...newPreferences }
    saveState()
  }

  // Handle responsive behavior
  const handleResize = (windowWidth: number) => {
    const isMobile = windowWidth <= 768
    
    if (isMobile) {
      // On mobile, close drawer and disable rail
      if (drawer.value) {
        setDrawer(false)
      }
      if (rail.value) {
        setRail(false)
      }
    } else {
      // On desktop, restore drawer if it was closed due to mobile
      if (!drawer.value && isInitialized.value) {
        setDrawer(true)
      }
    }
  }

  // Reset to defaults
  const reset = () => {
    drawer.value = true
    rail.value = false
    scrollPosition.value = 0
    lastActiveRoute.value = ''
    userPreferences.value = {
      autoCollapse: false,
      rememberScrollPosition: true,
      persistState: true
    }
    saveState()
  }

  // Clear stored state
  const clearStoredState = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.warn('Failed to clear sidebar state from localStorage:', error)
    }
  }

  // Watch for changes and auto-save
  watch([drawer, rail], () => {
    if (isInitialized.value) {
      saveState()
    }
  })

  return {
    // State
    drawer,
    rail,
    scrollPosition,
    lastActiveRoute,
    userPreferences,
    isInitialized,
    
    // Computed
    isExpanded,
    isCollapsed,
    isClosed,
    
    // Actions
    initialize,
    setDrawer,
    toggleDrawer,
    setRail,
    toggleRail,
    setScrollPosition,
    setLastActiveRoute,
    updatePreferences,
    handleResize,
    reset,
    clearStoredState,
    saveState,
    loadState
  }
})
