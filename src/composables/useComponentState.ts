import { ref, onActivated, onDeactivated, onMounted, onUnmounted } from 'vue'

export interface ComponentStateOptions {
  key: string
  persistInLocalStorage?: boolean
  restoreOnActivated?: boolean
  saveOnDeactivated?: boolean
}

export function useComponentState<T = any>(
  initialState: T,
  options: ComponentStateOptions
) {
  const {
    key,
    persistInLocalStorage = true,
    restoreOnActivated = true,
    saveOnDeactivated = true
  } = options

  const state = ref<T>(initialState)
  const isActive = ref(true)
  const storageKey = `component-state-${key}`

  // Load state from localStorage
  const loadState = (): T | null => {
    if (!persistInLocalStorage) return null

    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.warn(`Failed to load component state for ${key}:`, error)
    }
    return null
  }

  // Save state to localStorage
  const saveState = () => {
    if (!persistInLocalStorage) return

    try {
      localStorage.setItem(storageKey, JSON.stringify(state.value))
    } catch (error) {
      console.warn(`Failed to save component state for ${key}:`, error)
    }
  }

  // Restore state
  const restoreState = () => {
    const savedState = loadState()
    if (savedState !== null) {
      state.value = savedState
    }
  }

  // Clear stored state
  const clearState = () => {
    try {
      localStorage.removeItem(storageKey)
    } catch (error) {
      console.warn(`Failed to clear component state for ${key}:`, error)
    }
  }

  // Update state
  const setState = (newState: T) => {
    state.value = newState
    if (persistInLocalStorage) {
      saveState()
    }
  }

  // Merge state (for object states)
  const mergeState = (partialState: Partial<T>) => {
    if (typeof state.value === 'object' && state.value !== null) {
      state.value = { ...state.value, ...partialState }
      if (persistInLocalStorage) {
        saveState()
      }
    }
  }

  // Component lifecycle hooks for keep-alive components
  onActivated(() => {
    isActive.value = true
    if (restoreOnActivated) {
      restoreState()
    }
  })

  onDeactivated(() => {
    isActive.value = false
    if (saveOnDeactivated) {
      saveState()
    }
  })

  // Regular component lifecycle hooks
  onMounted(() => {
    if (restoreOnActivated) {
      restoreState()
    }
  })

  onUnmounted(() => {
    if (saveOnDeactivated) {
      saveState()
    }
  })

  return {
    state,
    isActive,
    setState,
    mergeState,
    saveState,
    restoreState,
    clearState
  }
}
