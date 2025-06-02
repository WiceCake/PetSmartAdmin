/**
 * Early theme initialization to prevent FOUC (Flash of Unstyled Content)
 * This script runs before Vue app initialization to apply the saved theme immediately
 */

export const STORAGE_KEY = 'petsmart-admin-theme'

export type ThemeMode = 'light' | 'dark' | 'system'

/**
 * Get the saved theme preference from localStorage
 */
export const getSavedTheme = (): ThemeMode => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && ['light', 'dark', 'system'].includes(saved)) {
      return saved as ThemeMode
    }
  } catch (error) {
    // Silent fail for localStorage issues
  }
  
  // Default to system preference for new users
  return 'system'
}

/**
 * Check if system prefers dark mode
 */
export const getSystemPrefersDark = (): boolean => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  return false
}

/**
 * Determine if dark mode should be active based on saved preference
 */
export const shouldUseDarkMode = (mode: ThemeMode): boolean => {
  if (mode === 'system') {
    return getSystemPrefersDark()
  }
  return mode === 'dark'
}

/**
 * Apply theme classes to document early to prevent FOUC
 */
export const applyEarlyTheme = (): void => {
  const savedMode = getSavedTheme()
  const isDark = shouldUseDarkMode(savedMode)
  
  // Apply theme classes to document
  document.documentElement.classList.toggle('dark-theme', isDark)
  document.documentElement.classList.toggle('light-theme', !isDark)
  
  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    const color = isDark ? '#1E293B' : '#2563eb'
    metaThemeColor.setAttribute('content', color)
  }
  
  // Add a data attribute to indicate theme has been initialized
  document.documentElement.setAttribute('data-theme-initialized', 'true')
  document.documentElement.setAttribute('data-theme-mode', savedMode)
  document.documentElement.setAttribute('data-theme-dark', isDark.toString())
}

/**
 * Initialize theme as early as possible
 * This should be called before Vue app creation
 */
export const initializeEarlyTheme = (): void => {
  // Only run in browser environment
  if (typeof window === 'undefined') return
  
  // Apply theme immediately
  applyEarlyTheme()
  
  // Listen for system preference changes and update if using system theme
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemChange = (e: MediaQueryListEvent) => {
      const currentMode = getSavedTheme()
      if (currentMode === 'system') {
        const isDark = e.matches
        document.documentElement.classList.toggle('dark-theme', isDark)
        document.documentElement.classList.toggle('light-theme', !isDark)
        document.documentElement.setAttribute('data-theme-dark', isDark.toString())
        
        // Update meta theme-color
        const metaThemeColor = document.querySelector('meta[name="theme-color"]')
        if (metaThemeColor) {
          const color = isDark ? '#1E293B' : '#2563eb'
          metaThemeColor.setAttribute('content', color)
        }
      }
    }
    
    // Use the newer addEventListener if available, fallback to addListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemChange)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleSystemChange)
    }
  }
}

/**
 * CSS custom properties for theme-aware styling
 * These can be used in CSS for early theme application
 */
export const injectThemeCSS = (): void => {
  const style = document.createElement('style')
  style.textContent = `
    :root {
      --theme-transition-fast: color 0.15s ease-out, background-color 0.15s ease-out, border-color 0.15s ease-out;
      --theme-transition-slow: color 0.3s ease-out, background-color 0.3s ease-out, border-color 0.3s ease-out;
      --theme-surface-opacity: 1;
      --theme-border-opacity: 0.12;
      --theme-shadow-opacity: 0.1;
      --theme-hover-opacity: 0.04;
      --theme-focus-opacity: 0.08;
      --theme-selected-opacity: 0.12;
      --theme-disabled-opacity: 0.38;
      --theme-primary-rgb: 99, 102, 241;
      --theme-surface-rgb: 255, 255, 255;
      --theme-background-rgb: 248, 250, 252;
      --theme-on-surface-rgb: 30, 41, 59;
      --theme-border-radius-sm: 8px;
      --theme-border-radius-md: 12px;
      --theme-border-radius-lg: 16px;
      --theme-border-radius-xl: 20px;
    }

    html:not([data-theme-initialized]) body {
      visibility: hidden;
    }

    html[data-theme-initialized] body {
      visibility: visible;
    }

    .light-theme {
      color-scheme: light;
      --theme-surface-rgb: 255, 255, 255;
      --theme-background-rgb: 248, 250, 252;
      --theme-on-surface-rgb: 30, 41, 59;
      --theme-primary-rgb: 99, 102, 241;
    }

    .dark-theme {
      color-scheme: dark;
      --theme-surface-rgb: 30, 41, 59;
      --theme-background-rgb: 15, 23, 42;
      --theme-on-surface-rgb: 248, 250, 252;
      --theme-primary-rgb: 129, 140, 248;
    }

    .v-theme--light,
    .v-theme--dark {
      transition: var(--theme-transition-fast);
    }

    html.theme-changing * {
      transition: none !important;
      animation: none !important;
    }

    html:not(.theme-changing) .v-card,
    html:not(.theme-changing) .v-btn,
    html:not(.theme-changing) .v-field,
    html:not(.theme-changing) .v-navigation-drawer,
    html:not(.theme-changing) .v-app-bar {
      transition: var(--theme-transition-fast);
    }

    @media (prefers-reduced-motion: reduce) {
      * {
        transition: none !important;
        animation: none !important;
      }
    }

    .theme-transition-containment .v-data-table,
    .theme-transition-containment .chart-container,
    .theme-transition-containment [class*="-table-card"] {
      contain: layout style;
    }

    .v-card,
    .v-btn,
    .v-navigation-drawer,
    .v-app-bar {
      transform: translateZ(0);
      will-change: background-color, color, border-color;
    }

    .v-data-table,
    .chart-container,
    [class*="-table-container"] {
      contain: layout;
    }

    .theme-changing .v-data-table,
    .theme-changing .chart-container {
      contain: layout style paint;
    }
  `

  document.head.appendChild(style)

  // Shorter delay for faster perceived performance
  setTimeout(() => {
    document.documentElement.classList.add('transitions-enabled')
  }, 50)
}
