import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useSidebarStore } from '@/stores/sidebar'

export interface ScrollPositionOptions {
  element?: HTMLElement | null
  selector?: string
  throttleMs?: number
  saveOnScroll?: boolean
  restoreOnMount?: boolean
}

export function useScrollPosition(options: ScrollPositionOptions = {}) {
  const {
    selector = '.sidebar-nav',
    throttleMs = 100,
    saveOnScroll = true,
    restoreOnMount = true
  } = options

  const sidebarStore = useSidebarStore()
  const scrollElement = ref<HTMLElement | null>(options.element || null)
  const isRestoring = ref(false)
  let throttleTimer: number | null = null

  // Throttled scroll handler
  const handleScroll = () => {
    if (isRestoring.value || !scrollElement.value || !saveOnScroll) return

    if (throttleTimer) {
      clearTimeout(throttleTimer)
    }

    throttleTimer = window.setTimeout(() => {
      if (scrollElement.value) {
        const position = scrollElement.value.scrollTop
        sidebarStore.setScrollPosition(position)
      }
    }, throttleMs)
  }

  // Find scroll element by selector
  const findScrollElement = (silent = false): HTMLElement | null => {
    if (options.element) return options.element

    try {
      const element = document.querySelector(selector) as HTMLElement
      if (!element && !silent) {
        return null
      }

      return element
    } catch (error) {
      return null
    }
  }

  // Restore scroll position
  const restoreScrollPosition = async () => {
    if (!restoreOnMount || !sidebarStore.userPreferences.rememberScrollPosition) return

    await nextTick()

    const element = scrollElement.value || findScrollElement(true) // Silent check
    if (!element) return

    const savedPosition = sidebarStore.scrollPosition
    if (savedPosition > 0) {
      isRestoring.value = true
      
      // Use requestAnimationFrame for smooth restoration
      requestAnimationFrame(() => {
        if (element) {
          element.scrollTop = savedPosition
          
          // Reset restoring flag after a short delay
          setTimeout(() => {
            isRestoring.value = false
          }, 100)
        }
      })
    }
  }

  // Save current scroll position
  const saveScrollPosition = () => {
    const element = scrollElement.value || findScrollElement(true) // Silent check
    if (element) {
      const position = element.scrollTop
      sidebarStore.setScrollPosition(position)
    }
  }

  // Scroll to specific position
  const scrollTo = (position: number, smooth = true) => {
    const element = scrollElement.value || findScrollElement(true) // Silent check
    if (element) {
      element.scrollTo({
        top: position,
        behavior: smooth ? 'smooth' : 'auto'
      })
    }
  }

  // Scroll to top
  const scrollToTop = (smooth = true) => {
    scrollTo(0, smooth)
  }

  // Initialize scroll position management with retry
  const initialize = async () => {
    await nextTick()

    // Try to find the scroll element with retries
    let element = findScrollElement(true) // Silent first attempt
    let retries = 0
    const maxRetries = 3

    while (!element && retries < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 100)) // Wait 100ms
      element = findScrollElement(true) // Silent retry
      retries++
    }

    if (element) {
      scrollElement.value = element

      // Add scroll listener
      element.addEventListener('scroll', handleScroll, { passive: true })

      // Restore scroll position
      await restoreScrollPosition()
    }
  }

  // Cleanup
  const cleanup = () => {
    if (scrollElement.value) {
      scrollElement.value.removeEventListener('scroll', handleScroll)
    }
    
    if (throttleTimer) {
      clearTimeout(throttleTimer)
      throttleTimer = null
    }
  }

  // Lifecycle hooks
  onMounted(() => {
    initialize()
  })

  onUnmounted(() => {
    // Save current position before unmounting
    saveScrollPosition()
    cleanup()
  })

  return {
    scrollElement,
    isRestoring,
    restoreScrollPosition,
    saveScrollPosition,
    scrollTo,
    scrollToTop,
    initialize,
    cleanup
  }
}
