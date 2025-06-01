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
  const findScrollElement = (): HTMLElement | null => {
    if (options.element) return options.element
    
    const element = document.querySelector(selector) as HTMLElement
    if (!element) {
      console.warn(`Scroll element not found with selector: ${selector}`)
      return null
    }
    
    return element
  }

  // Restore scroll position
  const restoreScrollPosition = async () => {
    if (!restoreOnMount || !sidebarStore.userPreferences.rememberScrollPosition) return

    await nextTick()
    
    const element = scrollElement.value || findScrollElement()
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
    const element = scrollElement.value || findScrollElement()
    if (element) {
      const position = element.scrollTop
      sidebarStore.setScrollPosition(position)
    }
  }

  // Scroll to specific position
  const scrollTo = (position: number, smooth = true) => {
    const element = scrollElement.value || findScrollElement()
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

  // Initialize scroll position management
  const initialize = async () => {
    await nextTick()
    
    // Find the scroll element
    const element = findScrollElement()
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
