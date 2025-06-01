/**
 * Asset Configuration
 * 
 * This file manages all asset paths and configurations for the PetSmart Admin Dashboard.
 * Update the logo paths here to change logos throughout the entire application.
 */

export const ASSETS = {
  // Logo Configuration
  logos: {
    // Main logo (wordmark) - horizontal text-based logo
    main: '/assets/images/logo-petsmart.svg',

    // Alternative formats for different use cases
    mainPng: '/assets/images/logo-petsmart.png',

    // Icon/symbol only (for small spaces) - using main logo for now
    icon: '/assets/images/logo-petsmart.svg',
    iconPng: '/assets/images/logo-petsmart.png',

    // White/light versions for dark backgrounds
    mainWhite: '/assets/images/logo-petsmart-white.svg',
    iconWhite: '/assets/images/logo-petsmart-white.svg',

    // Fallback placeholder - will be created
    placeholder: '/assets/images/logo-placeholder.svg'
  },

  // Default images - using data URIs for fallbacks to avoid 404 errors
  defaults: {
    userAvatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNFNUU3RUIiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIxNiIgcj0iNiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMzAgMzJDMzAgMjYuNDc3MSAyNS41MjI5IDIyIDIwIDIyQzE0LjQ3NzEgMjIgMTAgMjYuNDc3MSAxMCAzMkgzMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+',
    petAvatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGRkY3RUQiLz4KPGVsbGlwc2UgY3g9IjIwIiBjeT0iMjIiIHJ4PSIxMiIgcnk9IjEwIiBmaWxsPSIjRjU5RTBCIi8+CjxjaXJjbGUgY3g9IjE2IiBjeT0iMTgiIHI9IjIiIGZpbGw9IiMxRjJBMzciLz4KPGNpcmNsZSBjeD0iMjQiIGN5PSIxOCIgcj0iMiIgZmlsbD0iIzFGMkEzNyIvPgo8cGF0aCBkPSJNMTggMjJIMjJWMjRIMThaIiBmaWxsPSIjMUYyQTM3Ii8+Cjwvc3ZnPg==',
    productImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iI0Y5RkFGQiIvPgo8cmVjdCB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHJ4PSI0IiBmaWxsPSIjRTVFN0VCIi8+CjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjYiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'
  }
}

/**
 * Logo Display Configuration
 * 
 * These settings help ensure the wordmark logo displays properly
 * at different screen sizes while maintaining readability.
 */
export const LOGO_CONFIG = {
  // Aspect ratio for the wordmark (width:height)
  // PetSmart wordmark is typically very wide, optimized for horizontal layout
  aspectRatio: {
    width: 20,
    height: 6
  },

  // Recommended sizes for different contexts
  sizes: {
    // Sidebar logo (collapsed state) - use smaller version of main logo
    sidebarCollapsed: {
      width: 36,
      height: 36,
      useIcon: false // Use main logo even when collapsed, just smaller
    },

    // Sidebar logo (expanded state)
    sidebarExpanded: {
      width: 180,
      height: 54,
      useIcon: false
    },

    // Login page logo
    loginPage: {
      width: 240,
      height: 72,
      useIcon: false
    },

    // App header logo
    appHeader: {
      width: 140,
      height: 42,
      useIcon: false
    },
    
    // Mobile sizes
    mobile: {
      sidebarCollapsed: {
        width: 28,
        height: 28,
        useIcon: false // Use main logo even on mobile, just very small
      },
      sidebarExpanded: {
        width: 150,
        height: 45,
        useIcon: false
      },
      loginPage: {
        width: 180,
        height: 54,
        useIcon: false
      }
    }
  }
}

/**
 * Get the appropriate logo based on context and theme
 */
export function getLogo(context: 'sidebar' | 'login' | 'header', options: {
  collapsed?: boolean
  isDark?: boolean
  isMobile?: boolean
} = {}) {
  const { collapsed = false, isDark = false, isMobile = false } = options

  // Login page always uses white logo due to dark gradient background
  if (context === 'login') {
    return ASSETS.logos.mainWhite
  }

  // For sidebar, always use main logo (wordmark) regardless of collapsed state
  // The size will be adjusted via CSS, but we keep the wordmark for brand consistency
  if (context === 'sidebar') {
    return isDark ? ASSETS.logos.mainWhite : ASSETS.logos.main
  }

  // For other contexts, use main logo
  return isDark ? ASSETS.logos.mainWhite : ASSETS.logos.main
}

/**
 * Get logo size configuration for a specific context
 */
export function getLogoSize(context: 'sidebar' | 'login' | 'header', options: {
  collapsed?: boolean
  isMobile?: boolean
} = {}) {
  const { collapsed = false, isMobile = false } = options
  
  const sizeConfig = isMobile ? LOGO_CONFIG.sizes.mobile : LOGO_CONFIG.sizes
  
  switch (context) {
    case 'sidebar':
      return collapsed ? sizeConfig.sidebarCollapsed : sizeConfig.sidebarExpanded
    case 'login':
      return isMobile ? sizeConfig.mobile.loginPage : sizeConfig.loginPage
    case 'header':
      return sizeConfig.appHeader
    default:
      return sizeConfig.sidebarExpanded
  }
}
