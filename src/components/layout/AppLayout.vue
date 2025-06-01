<template>
  <v-app class="app-container">
    <!-- Modern Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail && !isMobile"
      :permanent="sidebarPermanent"
      :temporary="sidebarTemporary"
      class="modern-sidebar"
      :class="{ 'modern-sidebar--mobile': isMobile }"
      :width="280"
      :rail-width="72"
      :scrim="isMobile"
      :disable-resize-watcher="false"
      :disable-route-watcher="false"
      :touchless="!isMobile"
      floating
    >
      <!-- Sidebar Header -->
      <div class="sidebar-header" :class="{ 'sidebar-header--rail': rail }">
        <!-- Expanded State: Logo + Toggle -->
        <div v-if="!rail" class="sidebar-header__content">
          <div class="sidebar-header__logo-container">
            <AppLogo
              context="sidebar"
              :collapsed="false"
              :clickable="true"
              @click="$router.push('/dashboard')"
            />
          </div>

          <!-- Hide collapse button on mobile devices -->
          <v-btn
            v-if="!isMobile"
            icon="mdi-chevron-left"
            variant="text"
            size="small"
            class="sidebar-toggle sidebar-toggle--expanded"
            @click.stop="rail = !rail"
          />
        </div>

        <!-- Collapsed State: Only Toggle Button -->
        <div v-if="rail" class="sidebar-header__collapsed">
          <!-- Hide collapse button on mobile devices -->
          <v-btn
            v-if="!isMobile"
            icon="mdi-chevron-right"
            variant="text"
            size="small"
            class="sidebar-toggle sidebar-toggle--collapsed"
            @click.stop="rail = !rail"
          />
        </div>
      </div>

      <v-divider class="mx-4 my-2" />

      <!-- Navigation Menu -->
      <div class="sidebar-nav">
        <nav class="pa-2 sidebar-nav-content">
          <!-- Main Navigation -->
          <div class="nav-section">
            <p v-if="!rail" class="nav-section-title">Main</p>
            <div class="nav-items">
              <router-link
                v-for="item in mainNavItems"
                :key="item.value"
                :to="item.to"
                class="nav-item"
                :class="{ 'nav-item--active': isActiveRoute(item.to) }"
                :aria-label="`Navigate to ${item.title}`"
                :title="rail ? item.title : ''"
                @click="handleNavClick(item)"
                @keydown.enter="handleNavClick(item)"
                tabindex="0"
              >
                <div class="nav-item-content">
                  <v-icon
                    :icon="item.icon"
                    size="20"
                    class="nav-item-icon"
                  />
                  <span v-if="!rail" class="nav-item-text">{{ item.title }}</span>
                  <v-badge
                    v-if="item.badge && !rail"
                    :content="item.badge"
                    color="error"
                    class="nav-item-badge"
                  />
                </div>
              </router-link>
            </div>
          </div>

          <!-- Management Section -->
          <div class="nav-section mt-6">
            <p v-if="!rail" class="nav-section-title">Management</p>
            <div class="nav-items">
              <router-link
                v-for="item in managementNavItems"
                :key="item.value"
                :to="item.to"
                class="nav-item"
                :class="{ 'nav-item--active': isActiveRoute(item.to) }"
                :aria-label="`Navigate to ${item.title}`"
                :title="rail ? item.title : ''"
                @click="handleNavClick(item)"
                @keydown.enter="handleNavClick(item)"
                tabindex="0"
              >
                <div class="nav-item-content">
                  <v-icon
                    :icon="item.icon"
                    size="20"
                    class="nav-item-icon"
                  />
                  <span v-if="!rail" class="nav-item-text">{{ item.title }}</span>
                  <v-badge
                    v-if="item.badge && !rail"
                    :content="item.badge"
                    color="error"
                    class="nav-item-badge"
                  />
                </div>
              </router-link>
            </div>
          </div>
        </nav>
      </div>

      <!-- Sidebar Footer -->
      <template v-slot:append>
        <div class="sidebar-footer pa-4">
          <!-- User Profile -->
          <div v-if="!rail" class="user-profile mb-3">
            <div class="d-flex align-center">
              <v-avatar size="36" class="me-3">
                <v-img
                  v-if="userAvatar"
                  :src="userAvatar"
                  alt="User Avatar"
                />
                <v-icon v-else icon="mdi-account" />
              </v-avatar>
              <div class="flex-grow-1 min-width-0">
                <p class="text-subtitle-2 font-weight-medium mb-0 text-truncate">
                  {{ userName }}
                </p>
                <p class="text-caption text-on-surface-variant mb-0">
                  Administrator
                </p>
              </div>
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn
                    icon="mdi-dots-vertical"
                    variant="text"
                    size="small"
                    v-bind="props"
                  />
                </template>
                <v-list>
                  <v-list-item
                    prepend-icon="mdi-account"
                    title="Profile"
                    @click="$router.push('/profile')"
                  />
                  <v-list-item
                    prepend-icon="mdi-cog"
                    title="Settings"
                    @click="$router.push('/settings')"
                  />
                  <v-divider />
                  <v-list-item
                    prepend-icon="mdi-logout"
                    title="Logout"
                    @click="handleLogout"
                  />
                </v-list>
              </v-menu>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="quick-actions">
            <v-btn
              v-if="rail"
              icon="mdi-account"
              variant="text"
              size="small"
              class="mb-2"
              @click="$router.push('/profile')"
            />
            <v-btn
              :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
              variant="text"
              size="small"
              :class="{ 'mb-2': rail }"
              @click="toggleTheme"
            />
            <v-btn
              v-if="rail"
              icon="mdi-logout"
              variant="text"
              size="small"
              @click="handleLogout"
            />
          </div>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Modern App Bar -->
    <v-app-bar
      class="modern-app-bar"
      elevation="0"
      height="72"
    >
      <!-- Page Title and Breadcrumbs -->
      <div class="app-bar-content">
        <!-- Mobile Menu Button -->
        <v-btn
          v-if="isMobile"
          icon="mdi-menu"
          variant="text"
          class="mobile-menu-btn me-3"
          @click="drawer = !drawer"
          :aria-label="drawer ? 'Close navigation menu' : 'Open navigation menu'"
        />

        <div class="page-header">
          <h1 class="page-title">{{ pageTitle }}</h1>
          <v-breadcrumbs
            v-if="breadcrumbs.length > 0"
            :items="breadcrumbs"
            class="page-breadcrumbs"
            density="compact"
          />
        </div>

        <v-spacer />

        <!-- Search Bar -->
        <div class="app-bar-search">
          <v-text-field
            placeholder="Search anything..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            class="search-field"
            @input="handleGlobalSearch"
          />
        </div>

        <!-- Action Buttons -->
        <div class="app-bar-actions">
          <!-- Notifications -->
          <v-btn
            icon
            variant="text"
            class="action-btn notification-btn"
            @click="toggleNotifications"
            :aria-label="`Notifications${unreadNotifications > 0 ? ` (${unreadNotifications} unread)` : ''}`"
            role="button"
            tabindex="0"
          >
            <v-badge
              v-if="unreadNotifications > 0"
              :content="unreadNotifications"
              color="error"
              floating
              class="notification-badge"
            >
              <v-icon size="20">mdi-bell</v-icon>
            </v-badge>
            <v-icon v-else size="20">mdi-bell-outline</v-icon>
          </v-btn>
        </div>
      </div>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <v-container fluid>
        <slot />
      </v-container>
    </v-main>

    <!-- Connection Status Monitor - Temporarily disabled for performance testing -->
    <!-- <ConnectionStatus /> -->

    <!-- Modern Notifications Drawer -->
    <v-navigation-drawer
      v-model="showNotifications"
      location="right"
      temporary
      absolute
      :width="isMobile ? '100vw' : isTablet ? '380' : '420'"
      class="notifications-drawer"
      :class="{
        'notifications-drawer--mobile': isMobile,
        'notifications-drawer--tablet': isTablet
      }"
      :disable-resize-watcher="true"
      :disable-route-watcher="false"
      :touchless="isMobile ? false : true"
      :scrim="true"
      :mobile-breakpoint="768"
      :overlay-opacity="0.5"
    >
      <!-- Drawer Header -->
      <div class="notifications-header">
        <div class="notifications-header__content">
          <div class="notifications-header__title-section">
            <h2 class="notifications-header__title">Notifications</h2>
            <v-chip
              v-if="unreadNotifications > 0"
              :text="unreadNotifications.toString()"
              color="error"
              size="small"
              class="notifications-header__badge"
            />
          </div>

          <div class="notifications-header__actions">
            <v-btn
              v-if="unreadNotifications > 0"
              variant="text"
              size="small"
              class="notifications-header__action-btn"
              @click="markAllAsRead"
            >
              Mark all read
            </v-btn>

            <v-btn
              icon="mdi-close"
              variant="text"
              size="small"
              class="notifications-header__close-btn"
              @click="closeNotifications"
              :aria-label="'Close notifications'"
            />
          </div>
        </div>
      </div>

      <v-divider />

      <!-- Notifications List -->
      <div class="notifications-content">
        <div v-if="notifications.length === 0" class="notifications-empty">
          <div class="notifications-empty__content">
            <v-icon size="64" color="grey-lighten-1">mdi-bell-outline</v-icon>
            <h3 class="notifications-empty__title">No notifications</h3>
            <p class="notifications-empty__subtitle">You're all caught up!</p>
          </div>
        </div>

        <div v-else class="notifications-list">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="notification-item"
            :class="{
              'notification-item--unread': !notification.read,
              'notification-item--read': notification.read
            }"
            @click="markAsRead(notification)"
          >
            <div class="notification-item__indicator" />

            <div class="notification-item__avatar">
              <v-avatar
                :color="getNotificationColor(notification.type)"
                size="40"
                class="notification-item__avatar-content"
              >
                <v-icon
                  :icon="getNotificationIcon(notification.type)"
                  color="white"
                  size="20"
                />
              </v-avatar>
            </div>

            <div class="notification-item__content">
              <div class="notification-item__header">
                <h4 class="notification-item__title">{{ notification.title }}</h4>
                <span class="notification-item__time">{{ formatNotificationTime(notification.timestamp) }}</span>
              </div>

              <p class="notification-item__message">{{ notification.message }}</p>

              <div v-if="notification.actions" class="notification-item__actions">
                <v-btn
                  v-for="action in notification.actions"
                  :key="action.label"
                  :variant="action.primary ? 'elevated' : 'text'"
                  :color="action.primary ? 'primary' : 'default'"
                  size="small"
                  class="notification-item__action-btn"
                  @click.stop="handleNotificationAction(notification, action)"
                >
                  {{ action.label }}
                </v-btn>
              </div>
            </div>

            <div class="notification-item__menu">
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn
                    icon="mdi-dots-vertical"
                    variant="text"
                    size="small"
                    v-bind="props"
                    class="notification-item__menu-btn"
                  />
                </template>
                <v-list density="compact">
                  <v-list-item
                    v-if="!notification.read"
                    prepend-icon="mdi-check"
                    title="Mark as read"
                    @click="markAsRead(notification)"
                  />
                  <v-list-item
                    v-else
                    prepend-icon="mdi-email-outline"
                    title="Mark as unread"
                    @click="markAsUnread(notification)"
                  />
                  <v-list-item
                    prepend-icon="mdi-delete"
                    title="Delete"
                    @click="deleteNotification(notification)"
                  />
                </v-list>
              </v-menu>
            </div>
          </div>
        </div>
      </div>
    </v-navigation-drawer>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import { useAuthStore } from '@/stores/auth'
import { useSidebarStore } from '@/stores/sidebar'
import { useScrollPosition } from '@/composables/useScrollPosition'
import AppLogo from '@/components/ui/AppLogo.vue'
import ConnectionStatus from '@/components/common/ConnectionStatus.vue'
// import SearchBar from '@/components/ui/SearchBar.vue'

const route = useRoute()
const router = useRouter()
const theme = useTheme()
const authStore = useAuthStore()
const sidebarStore = useSidebarStore()

// Initialize scroll position management
const { restoreScrollPosition, saveScrollPosition } = useScrollPosition({
  selector: '.sidebar-nav',
  saveOnScroll: true,
  restoreOnMount: true
})

// Responsive state management
const windowWidth = ref(window.innerWidth)

// Use sidebar store for persistent state
const drawer = computed({
  get: () => sidebarStore.drawer,
  set: (value) => sidebarStore.setDrawer(value)
})

const rail = computed({
  get: () => sidebarStore.rail,
  set: (value) => sidebarStore.setRail(value)
})
const showNotifications = ref(false)

// Enhanced notification drawer state management
const notificationDrawerState = computed(() => ({
  isOpen: showNotifications.value,
  isMobile: isMobile.value,
  isTablet: isTablet.value,
  width: isMobile.value ? '100vw' : isTablet.value ? '380' : '420'
}))
const notifications = ref([
  {
    id: 1,
    title: 'New Order Received',
    message: 'Order #12345 has been placed by John Smith for premium dog food.',
    type: 'success',
    read: false,
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    actions: [
      { label: 'View Order', primary: true, action: 'view-order', data: { orderId: 12345 } },
      { label: 'Dismiss', primary: false, action: 'dismiss' }
    ]
  },
  {
    id: 2,
    title: 'Appointment Reminder',
    message: 'Upcoming grooming appointment for Buddy at 2:00 PM today.',
    type: 'info',
    read: false,
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    actions: [
      { label: 'View Details', primary: true, action: 'view-appointment', data: { appointmentId: 456 } }
    ]
  },
  {
    id: 3,
    title: 'Low Stock Alert',
    message: 'Cat litter inventory is running low. Only 5 units remaining.',
    type: 'warning',
    read: false,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    actions: [
      { label: 'Reorder', primary: true, action: 'reorder', data: { productId: 789 } },
      { label: 'View Inventory', primary: false, action: 'view-inventory' }
    ]
  },
  {
    id: 4,
    title: 'System Maintenance',
    message: 'Scheduled maintenance will occur tonight from 11 PM to 1 AM.',
    type: 'info',
    read: true,
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
  },
  {
    id: 5,
    title: 'Payment Failed',
    message: 'Payment processing failed for order #12340. Customer needs to update payment method.',
    type: 'error',
    read: true,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    actions: [
      { label: 'Contact Customer', primary: true, action: 'contact-customer', data: { orderId: 12340 } }
    ]
  }
])

const unreadNotifications = computed(() =>
  notifications.value.filter(n => !n.read).length
)

// Mobile breakpoint detection
const isMobile = computed(() => windowWidth.value <= 768)
const isTablet = computed(() => windowWidth.value <= 1024 && windowWidth.value > 768)

// Sidebar behavior based on screen size
const sidebarPermanent = computed(() => !isMobile.value)
const sidebarTemporary = computed(() => isMobile.value)

const isDark = computed(() => theme.global.current.value.dark)
const userAvatar = computed(() => authStore.user?.user_metadata?.avatar_url || null)
const userName = computed(() => {
  if (authStore.adminUser) {
    return authStore.adminUser.email?.split('@')[0] || 'Admin User'
  }
  return authStore.user?.email?.split('@')[0] || 'Admin User'
})

const pageTitle = computed(() => {
  const routeName = route.name as string
  const titles: Record<string, string> = {
    'Dashboard': 'Dashboard',
    'Users': 'User Management',
    'Pets': 'Pet Management',
    'Appointments': 'Appointments',
    'Products': 'Product Catalog',
    'Orders': 'Order Management',
    'Messages': 'Messages',
    'Notifications': 'Notifications',
    'Analytics': 'Analytics',
    'Settings': 'Settings'
  }
  return titles[routeName] || routeName || 'Dashboard'
})

const breadcrumbs = computed(() => {
  const pathSegments = route.path.split('/').filter(Boolean)
  if (pathSegments.length <= 1) return []

  return pathSegments.map((segment, index) => ({
    title: segment.charAt(0).toUpperCase() + segment.slice(1),
    disabled: index === pathSegments.length - 1,
    href: '/' + pathSegments.slice(0, index + 1).join('/')
  }))
})

const mainNavItems = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/dashboard', value: 'dashboard' },
  { title: 'Analytics', icon: 'mdi-chart-line', to: '/analytics', value: 'analytics' },
  { title: 'Messages', icon: 'mdi-message', to: '/messages', value: 'messages', badge: 5 },
  { title: 'Notifications', icon: 'mdi-bell', to: '/notifications', value: 'notifications', badge: 3 }
]

const managementNavItems = [
  { title: 'Users', icon: 'mdi-account-group', to: '/users', value: 'users' },
  { title: 'Pets', icon: 'mdi-paw', to: '/pets', value: 'pets' },
  { title: 'Appointments', icon: 'mdi-calendar-clock', to: '/appointments', value: 'appointments' },
  { title: 'Products', icon: 'mdi-package-variant', to: '/products', value: 'products' },
  { title: 'Orders', icon: 'mdi-shopping', to: '/orders', value: 'orders' },
  { title: 'Settings', icon: 'mdi-cog', to: '/settings', value: 'settings' },
  { title: 'State Test', icon: 'mdi-test-tube', to: '/state-test', value: 'state-test' }
]

const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}

const handleLogout = async () => {
  await authStore.signOut()
  router.push('/login')
}

const handleGlobalSearch = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const query = target.value.trim()

  if (query.length < 2) return

  try {
    // Import the dashboard service dynamically to avoid circular imports
    const { DashboardService } = await import('@/services/dashboard')
    const results = await DashboardService.searchGlobal(query, 5)

    // For now, just log the results. In a full implementation,
    // you would show these in a dropdown or navigate to results
    console.log('Search results:', results)

    // Navigate to the first result if Enter is pressed
    if (results.length > 0) {
      const firstResult = results[0]
      switch (firstResult.type) {
        case 'user':
          router.push(`/users/${firstResult.id}`)
          break
        case 'pet':
          router.push(`/pets/${firstResult.id}`)
          break
        case 'order':
          router.push(`/orders/${firstResult.id}`)
          break
      }
    }
  } catch (error) {
    console.error('Search error:', error)
  }
}

const isActiveRoute = (to: string) => {
  // Enhanced active route detection for better highlighting
  if (to === '/dashboard') {
    return route.path === '/dashboard'
  }

  // For other routes, check if current path starts with the route
  // but also handle nested routes properly
  return route.path.startsWith(to) && (
    route.path === to ||
    route.path.startsWith(to + '/') ||
    route.path.startsWith(to + '?')
  )
}

const handleNavClick = (item: any) => {
  // Save current scroll position before navigation
  saveScrollPosition()

  // Update last active route in store
  sidebarStore.setLastActiveRoute(item.to)

  // Close mobile sidebar after navigation on mobile devices
  if (isMobile.value) {
    drawer.value = false
  }

  // Add subtle haptic feedback on mobile
  if ('vibrate' in navigator && isMobile.value) {
    navigator.vibrate(10)
  }

  // Log navigation for debugging (can be removed in production)
  console.log('Navigating to:', item.to)
}

// Enhanced keyboard navigation support
const handleKeyboardNavigation = (event: KeyboardEvent) => {
  // Handle keyboard shortcuts for navigation
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case '1':
        event.preventDefault()
        router.push('/dashboard')
        break
      case '2':
        event.preventDefault()
        router.push('/analytics')
        break
      case '3':
        event.preventDefault()
        router.push('/users')
        break
      case '4':
        event.preventDefault()
        router.push('/pets')
        break
      case '/':
        event.preventDefault()
        // Focus search if available
        break
    }
  }
}

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'error': return 'error'
    case 'warning': return 'warning'
    case 'success': return 'success'
    default: return 'info'
  }
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'error': return 'mdi-alert-circle'
    case 'warning': return 'mdi-alert'
    case 'success': return 'mdi-check-circle'
    case 'info': return 'mdi-information'
    default: return 'mdi-bell'
  }
}

// Notification management functions
const markAsRead = (notification: any) => {
  notification.read = true
}

const markAsUnread = (notification: any) => {
  notification.read = false
}

const markAllAsRead = () => {
  notifications.value.forEach(notification => {
    notification.read = true
  })
}

// Simple notification drawer toggle
const toggleNotifications = () => {
  console.log('Toggle notifications clicked', {
    current: showNotifications.value,
    isMobile: isMobile.value,
    windowWidth: windowWidth.value
  })
  showNotifications.value = !showNotifications.value
  console.log('New state:', showNotifications.value)

  // Debug: Check if drawer element exists and its classes
  setTimeout(() => {
    const drawerElement = document.querySelector('.notifications-drawer')
    if (drawerElement) {
      console.log('Drawer element classes:', drawerElement.className)
      console.log('Drawer computed styles:', {
        transform: getComputedStyle(drawerElement).transform,
        visibility: getComputedStyle(drawerElement).visibility,
        opacity: getComputedStyle(drawerElement).opacity,
        right: getComputedStyle(drawerElement).right,
        display: getComputedStyle(drawerElement).display
      })
    }
  }, 100)
}

// Close notification drawer safely
const closeNotifications = () => {
  showNotifications.value = false
}

const deleteNotification = (notification: any) => {
  const index = notifications.value.findIndex(n => n.id === notification.id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

const handleNotificationAction = (notification: any, action: any) => {
  console.log('Notification action:', action, 'for notification:', notification)

  switch (action.action) {
    case 'view-order':
      router.push(`/orders/${action.data.orderId}`)
      break
    case 'view-appointment':
      router.push(`/appointments/${action.data.appointmentId}`)
      break
    case 'reorder':
      router.push(`/products/${action.data.productId}`)
      break
    case 'view-inventory':
      router.push('/inventory')
      break
    case 'contact-customer':
      router.push(`/orders/${action.data.orderId}`)
      break
    case 'dismiss':
      markAsRead(notification)
      break
    default:
      console.log('Unknown action:', action.action)
  }

  // Close notifications drawer after action
  if (action.action !== 'dismiss') {
    closeNotifications()
  }
}

const formatNotificationTime = (timestamp: Date) => {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return timestamp.toLocaleDateString()
}

// Debounced resize handler for better performance
let resizeTimeout: number | null = null

// Window resize handler for responsive behavior
const handleResize = () => {
  // Clear previous timeout to debounce resize events
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }

  resizeTimeout = setTimeout(() => {
    const previousIsMobile = windowWidth.value <= 768
    const previousIsTablet = windowWidth.value <= 1024 && windowWidth.value > 768

    // Update window width
    windowWidth.value = window.innerWidth

    const currentIsMobile = windowWidth.value <= 768
    const currentIsTablet = windowWidth.value <= 1024 && windowWidth.value > 768

    // Handle notification drawer responsive behavior
    // Temporarily disabled to test if this is causing the issue
    // handleNotificationDrawerResize(previousIsMobile, currentIsMobile, previousIsTablet, currentIsTablet)

    // Use sidebar store's responsive handler
    sidebarStore.handleResize(windowWidth.value)
  }, 150) // 150ms debounce delay
}

// Handle notification drawer behavior during resize
const handleNotificationDrawerResize = (
  previousIsMobile: boolean,
  currentIsMobile: boolean,
  previousIsTablet: boolean,
  currentIsTablet: boolean
) => {
  // Close notification drawer when transitioning between different screen sizes
  // to prevent stuck states and ensure proper responsive behavior
  const screenSizeChanged = (
    previousIsMobile !== currentIsMobile ||
    previousIsTablet !== currentIsTablet
  )

  if (screenSizeChanged && showNotifications.value) {
    // Close the notification drawer when screen size changes
    // This prevents the drawer from getting stuck in an improper state
    showNotifications.value = false
  }
}

onMounted(() => {
  // Initialize sidebar store with current window width
  sidebarStore.initialize(windowWidth.value)

  // Load notifications
  // This would typically fetch from your API

  // Add window resize listener
  window.addEventListener('resize', handleResize)

  // Add keyboard navigation listener
  window.addEventListener('keydown', handleKeyboardNavigation)

  // Restore scroll position after component is mounted
  restoreScrollPosition()

  // Expose debugging methods to global scope for testing
  if (typeof window !== 'undefined') {
    ;(window as any).debugNotifications = {
      toggle: toggleNotifications,
      close: closeNotifications,
      getState: () => ({
        showNotifications: showNotifications.value,
        isMobile: isMobile.value,
        isTablet: isTablet.value,
        windowWidth: windowWidth.value
      }),
      forceOpen: () => {
        showNotifications.value = true
      }
    }
  }
})

onUnmounted(() => {
  // Save scroll position before unmounting
  saveScrollPosition()

  // Clean up resize timeout
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
    resizeTimeout = null
  }

  // Clean up event listeners
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleKeyboardNavigation)
})

// Watch for route changes to update active route in store
watch(() => route.path, (newPath) => {
  sidebarStore.setLastActiveRoute(newPath)
}, { immediate: true })

// Watch for screen size changes to handle notification drawer responsiveness
// Temporarily disabled to test if this is causing the issue
// watch([isMobile, isTablet], ([newIsMobile, newIsTablet], [oldIsMobile, oldIsTablet]) => {
//   // Close notification drawer when transitioning between screen sizes
//   // This ensures the drawer doesn't get stuck in an improper state
//   if ((newIsMobile !== oldIsMobile || newIsTablet !== oldIsTablet) && showNotifications.value) {
//     showNotifications.value = false
//   }
// }, { immediate: false })
</script>

<style scoped>
/* App Container - Full Height Layout */
.app-container {
  height: 100vh !important;
  overflow: hidden !important;
}

/* Modern Sidebar Styles - Fixed Height */
.modern-sidebar {
  border-right: 1px solid rgba(0, 0, 0, 0.08) !important;
  background: linear-gradient(180deg, #ffffff 0%, #fafbfc 100%) !important;
  height: 100vh !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  z-index: 1005 !important;
  display: flex !important;
  flex-direction: column !important;
}

/* Ensure sidebar content is properly structured */
.modern-sidebar :deep(.v-navigation-drawer__content) {
  height: 100vh !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
}

/* Main Content Area - Account for Fixed Sidebar */
:deep(.v-main) {
  height: 100vh !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
}

/* Adjust main content padding based on sidebar state */
:deep(.v-main__wrap) {
  min-height: 100vh !important;
}

/* Container adjustments */
:deep(.v-container) {
  max-width: none !important;
  padding-top: 24px !important;
  padding-bottom: 24px !important;
}

/* Sidebar Header Styles - Material Design 3 */
.sidebar-header {
  padding: 24px 20px;
  flex-shrink: 0; /* Prevent header from shrinking */
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 80px;
  position: relative;
}

.sidebar-header--rail {
  padding: 16px;
  justify-content: center;
  min-height: 72px;
}

/* Expanded State Layout */
.sidebar-header__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-width: 0; /* Prevent flex item overflow */
}

.sidebar-header__logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Collapsed State Layout */
.sidebar-header__collapsed {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

/* Sidebar Toggle Button */
.sidebar-toggle {
  opacity: 0.7;
  transition: all 0.2s ease;
  border-radius: 8px !important;
  flex-shrink: 0;
  z-index: 10;
}

.sidebar-toggle:hover {
  opacity: 1;
  background: rgba(var(--v-theme-primary), 0.08) !important;
  transform: scale(1.05);
}

/* Toggle Button in Expanded State */
.sidebar-toggle--expanded {
  margin-left: 8px;
}

/* Toggle Button in Collapsed State */
.sidebar-toggle--collapsed {
  margin: 0;
  position: relative;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 20px;
  min-height: 0; /* Allow flex item to shrink */
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.sidebar-nav-content {
  min-height: 100%;
}

.nav-section-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(0, 0, 0, 0.6);
  margin: 0 0 8px 16px;
}

.nav-items {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: block;
  text-decoration: none;
  color: inherit;
  margin: 0 8px;
  border-radius: 12px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  outline: none;
}

/* Enhanced focus states for accessibility */
.nav-item:focus-visible {
  outline: 2px solid rgba(99, 102, 241, 0.5);
  outline-offset: 2px;
}

.nav-item:hover {
  background: rgba(99, 102, 241, 0.08);
  transform: translateX(2px);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
}

.nav-item--active {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0.05));
  color: #6366F1;
  box-shadow: 0 2px 12px rgba(99, 102, 241, 0.15);
}

.nav-item--active:hover {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.08));
  transform: translateX(3px);
}

.nav-item--active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: linear-gradient(180deg, #6366F1, #4F46E5);
  border-radius: 0 2px 2px 0;
}

.nav-item-content {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  position: relative;
}

.nav-item-icon {
  margin-right: 12px;
  transition: transform 0.2s ease;
}

.nav-item:hover .nav-item-icon {
  transform: scale(1.1);
}

.nav-item-text {
  font-weight: 500;
  font-size: 0.875rem;
  flex: 1;
}

.nav-item-badge {
  margin-left: auto;
}

.sidebar-footer {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(0, 0, 0, 0.02);
}

.user-profile {
  background: rgba(99, 102, 241, 0.05);
  border-radius: 12px;
  padding: 12px;
}

.quick-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

/* Modern App Bar Styles - Material Design 3 */
.modern-app-bar {
  background: linear-gradient(180deg, #ffffff 0%, #fafbfc 100%) !important;
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08) !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06) !important;
}

.app-bar-content {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 24px;
  gap: 24px;
}

.page-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.33;
  letter-spacing: 0.0125em;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
  margin-bottom: 2px;
  transition: color 0.2s ease;
}

.page-breadcrumbs {
  padding: 0 !important;
  margin: 0 !important;
  min-height: auto !important;
}

.page-breadcrumbs :deep(.v-breadcrumbs-item) {
  font-size: 0.875rem;
  font-weight: 400;
  color: rgb(var(--v-theme-on-surface-variant));
  opacity: 0.8;
}

.page-breadcrumbs :deep(.v-breadcrumbs-divider) {
  color: rgb(var(--v-theme-on-surface-variant));
  opacity: 0.6;
  margin: 0 8px;
}

.app-bar-search {
  max-width: 400px;
  width: 100%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-field {
  border-radius: 12px !important;
}

.search-field :deep(.v-field) {
  border-radius: 12px !important;
  background: rgba(var(--v-theme-surface), 0.8) !important;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(var(--v-theme-outline), 0.2) !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04) !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-field :deep(.v-field:hover) {
  border-color: rgba(var(--v-theme-primary), 0.3) !important;
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.1) !important;
}

.search-field :deep(.v-field--focused) {
  border-color: rgb(var(--v-theme-primary)) !important;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1) !important;
}

.app-bar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mobile-menu-btn {
  border-radius: 12px !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(var(--v-theme-surface), 0.6) !important;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(var(--v-theme-outline), 0.1) !important;
}

.mobile-menu-btn:hover {
  background: rgba(var(--v-theme-primary), 0.08) !important;
  border-color: rgba(var(--v-theme-primary), 0.2) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15) !important;
}

.action-btn {
  border-radius: 12px !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(var(--v-theme-surface), 0.6) !important;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(var(--v-theme-outline), 0.1) !important;
}

.action-btn:hover {
  background: rgba(var(--v-theme-primary), 0.08) !important;
  border-color: rgba(var(--v-theme-primary), 0.2) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15) !important;
}

.notification-btn {
  position: relative;
  overflow: visible;
}

.notification-badge {
  z-index: 10;
}

.notification-badge :deep(.v-badge__badge) {
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 18px;
  height: 18px;
  border: 2px solid rgb(var(--v-theme-surface));
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Modern Notifications Drawer Styles */
.notifications-drawer {
  background: linear-gradient(180deg, #ffffff 0%, #fafbfc 100%) !important;
  border-left: 1px solid rgba(0, 0, 0, 0.08) !important;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12) !important;
}

/* Ensure drawer is completely hidden when not active */
.notifications-drawer:not(.v-navigation-drawer--active) {
  transform: translateX(100%) !important;
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
}

/* Force proper positioning for temporary drawers */
.notifications-drawer.v-navigation-drawer--temporary {
  position: fixed !important;
  top: 0 !important;
  right: 0 !important;
  height: 100vh !important;
  z-index: 2000 !important;
}

/* Ensure active state shows the drawer */
.notifications-drawer.v-navigation-drawer--active {
  transform: translateX(0) !important;
  visibility: visible !important;
  opacity: 1 !important;
  pointer-events: auto !important;
}

.notifications-drawer--mobile {
  box-shadow: none !important;
}

/* Mobile-specific positioning fixes */
.notifications-drawer--mobile:not(.v-navigation-drawer--active) {
  transform: translateX(100%) !important;
  right: -100vw !important;
}

.notifications-drawer--mobile.v-navigation-drawer--active {
  transform: translateX(0) !important;
  right: 0 !important;
}

.notifications-drawer--tablet {
  box-shadow: -2px 0 16px rgba(0, 0, 0, 0.08) !important;
}

.notifications-header {
  padding: 24px 20px 16px;
  background: rgba(var(--v-theme-surface), 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.1);
}

.notifications-header__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.notifications-header__title-section {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.notifications-header__title {
  font-size: 1.375rem;
  font-weight: 600;
  line-height: 1.33;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
}

.notifications-header__badge {
  flex-shrink: 0;
}

.notifications-header__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.notifications-header__action-btn {
  font-size: 0.875rem;
  text-transform: none;
  border-radius: 8px;
}

.notifications-header__close-btn {
  border-radius: 8px;
}

.notifications-content {
  flex: 1;
  overflow-y: auto;
  max-height: calc(100vh - 140px);
}

.notifications-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px 20px;
}

.notifications-empty__content {
  text-align: center;
  max-width: 300px;
}

.notifications-empty__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 16px 0 8px;
}

.notifications-empty__subtitle {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface-variant));
  margin: 0;
  opacity: 0.8;
}

.notifications-list {
  padding: 8px 0;
}

.notification-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.08);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification-item:hover {
  background: rgba(var(--v-theme-primary), 0.04);
}

.notification-item--unread {
  background: rgba(var(--v-theme-primary), 0.02);
  border-left: 3px solid rgb(var(--v-theme-primary));
}

.notification-item--unread .notification-item__indicator {
  position: absolute;
  left: 8px;
  top: 20px;
  width: 8px;
  height: 8px;
  background: rgb(var(--v-theme-primary));
  border-radius: 50%;
}

.notification-item__avatar {
  flex-shrink: 0;
  margin-top: 2px;
}

.notification-item__avatar-content {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.notification-item__content {
  flex: 1;
  min-width: 0;
}

.notification-item__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 4px;
}

.notification-item__title {
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.43;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
  flex: 1;
  min-width: 0;
}

.notification-item__time {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-on-surface-variant));
  opacity: 0.8;
  white-space: nowrap;
  flex-shrink: 0;
}

.notification-item__message {
  font-size: 0.8125rem;
  line-height: 1.5;
  color: rgb(var(--v-theme-on-surface-variant));
  margin: 0 0 12px;
}

.notification-item__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.notification-item__action-btn {
  font-size: 0.75rem;
  text-transform: none;
  border-radius: 6px;
  min-height: 28px;
  padding: 0 12px;
}

.notification-item__menu {
  flex-shrink: 0;
  margin-left: 8px;
}

.notification-item__menu-btn {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.notification-item:hover .notification-item__menu-btn {
  opacity: 1;
}

/* Mobile sidebar styles */
.modern-sidebar--mobile {
  z-index: 1010 !important;
  position: fixed !important;
  height: 100vh !important;
}

.modern-sidebar--mobile :deep(.v-navigation-drawer__scrim) {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1009 !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .app-bar-content {
    padding: 0 16px;
    gap: 16px;
  }

  .app-bar-search {
    max-width: 280px;
  }

  .page-title {
    font-size: 1.375rem;
  }

  .page-breadcrumbs :deep(.v-breadcrumbs-item) {
    font-size: 0.8125rem;
  }

  /* Mobile sidebar adjustments */
  .modern-sidebar {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
    position: fixed !important;
    height: 100vh !important;
  }

  /* Mobile main content adjustments */
  :deep(.v-main) {
    margin-left: 0 !important;
  }

  .sidebar-header {
    padding: 20px 16px;
    min-height: 72px;
  }

  .sidebar-header--rail {
    padding: 12px;
    min-height: 64px;
  }

  /* Mobile sidebar header layout adjustments when toggle button is hidden */
  .sidebar-header__content {
    justify-content: center; /* Center logo when toggle button is hidden on mobile */
  }

  .sidebar-header__logo-container {
    justify-content: center; /* Ensure logo stays centered */
  }

  .nav-item-content {
    padding: 10px 12px;
  }

  /* Mobile menu button */
  .mobile-menu-btn {
    min-width: 44px;
    min-height: 44px;
  }

  /* Enhanced notification button for mobile */
  .notification-btn {
    min-width: 44px;
    min-height: 44px;
  }

  .notification-badge :deep(.v-badge__badge) {
    font-size: 0.7rem;
    min-width: 16px;
    height: 16px;
  }

  /* Mobile notification drawer */
  .notifications-drawer {
    border-left: none !important;
  }

  /* Force proper hiding on mobile */
  .notifications-drawer:not(.v-navigation-drawer--active) {
    transform: translateX(100%) !important;
    right: -100vw !important;
    visibility: hidden !important;
    opacity: 0 !important;
  }

  /* Ensure proper showing on mobile */
  .notifications-drawer.v-navigation-drawer--active {
    transform: translateX(0) !important;
    right: 0 !important;
    visibility: visible !important;
    opacity: 1 !important;
  }

  .notifications-header {
    padding: 20px 16px 12px;
  }

  .notifications-header__title {
    font-size: 1.25rem;
  }

  .notification-item {
    padding: 16px;
  }

  .notification-item__content {
    gap: 12px;
  }

  .notification-item__actions {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }

  .notification-item__action-btn {
    width: 100%;
    justify-content: center;
  }

  .notification-item {
    padding: 12px 16px;
    gap: 12px;
  }

  .notification-item__title {
    font-size: 0.8125rem;
  }

  .notification-item__message {
    font-size: 0.75rem;
  }

  .notification-item__actions {
    gap: 6px;
  }

  .notification-item__action-btn {
    font-size: 0.7rem;
    min-height: 32px;
    padding: 0 10px;
  }
}

/* Tablet-specific responsive styles */
@media (max-width: 1024px) and (min-width: 769px) {
  .notifications-drawer {
    border-left: 1px solid rgba(0, 0, 0, 0.06) !important;
  }

  .notifications-header {
    padding: 20px 18px 14px;
  }

  .notifications-header__title {
    font-size: 1.3rem;
  }

  .notification-item {
    padding: 14px 18px;
  }

  .notification-item__content {
    gap: 10px;
  }

  .notification-item__title {
    font-size: 0.95rem;
  }

  .notification-item__message {
    font-size: 0.85rem;
  }
}

/* Specific fix for screens below 800px */
@media (max-width: 800px) {
  .notifications-drawer:not(.v-navigation-drawer--active) {
    transform: translateX(100%) !important;
    right: -100vw !important;
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
    display: none !important; /* Force hide if other methods fail */
  }

  .notifications-drawer.v-navigation-drawer--active {
    transform: translateX(0) !important;
    right: 0 !important;
    visibility: visible !important;
    opacity: 1 !important;
    pointer-events: auto !important;
    display: flex !important;
  }
}

@media (max-width: 480px) {
  .app-bar-content {
    padding: 0 12px;
    gap: 12px;
  }

  .app-bar-search {
    display: none;
  }

  .page-header {
    flex: 1;
    min-width: 0;
  }

  .page-title {
    font-size: 1.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .page-breadcrumbs {
    display: none;
  }

  /* Mobile sidebar for small screens */
  .sidebar-header {
    padding: 16px 12px;
    min-height: 64px;
  }

  .sidebar-header--rail {
    padding: 8px;
    min-height: 56px;
  }

  /* Mobile sidebar header layout adjustments for small screens when toggle button is hidden */
  .sidebar-header__content {
    justify-content: center; /* Center logo when toggle button is hidden on mobile */
  }

  .sidebar-header__logo-container {
    justify-content: center; /* Ensure logo stays centered */
  }

  /* Compact notification button for small screens */
  .notification-btn {
    min-width: 40px;
    min-height: 40px;
  }

  .notification-badge :deep(.v-badge__badge) {
    font-size: 0.65rem;
    min-width: 14px;
    height: 14px;
  }

  /* Ensure proper touch targets */
  .action-btn {
    min-width: 40px;
    min-height: 40px;
  }
}

/* Dark theme adjustments */
.v-theme--dark .modern-sidebar {
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%) !important;
  border-right-color: rgba(255, 255, 255, 0.1) !important;
  height: 100vh !important;
  position: fixed !important;
}

/* Dark theme scrollbar */
.v-theme--dark .sidebar-nav {
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.v-theme--dark .sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
}

.v-theme--dark .sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}

.v-theme--dark .sidebar-toggle:hover {
  background: rgba(var(--v-theme-primary), 0.12) !important;
}

.v-theme--dark .sidebar-footer {
  border-top-color: rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);
}

.v-theme--dark .user-profile {
  background: rgba(99, 102, 241, 0.1);
}

/* Dark theme navigation section labels */
.v-theme--dark .nav-section-title {
  color: rgba(255, 255, 255, 0.8) !important;
}

/* Dark theme app bar */
.v-theme--dark .modern-app-bar {
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%) !important;
  border-bottom-color: rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.3) !important;
}

.v-theme--dark .page-title {
  color: rgb(var(--v-theme-on-surface));
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.v-theme--dark .page-breadcrumbs :deep(.v-breadcrumbs-item) {
  color: rgb(var(--v-theme-on-surface-variant));
  opacity: 0.9;
}

.v-theme--dark .page-breadcrumbs :deep(.v-breadcrumbs-divider) {
  color: rgb(var(--v-theme-on-surface-variant));
  opacity: 0.7;
}

.v-theme--dark .search-field :deep(.v-field) {
  background: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2) !important;
}

.v-theme--dark .search-field :deep(.v-field:hover) {
  border-color: rgba(var(--v-theme-primary), 0.4) !important;
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.2) !important;
}

.v-theme--dark .search-field :deep(.v-field--focused) {
  border-color: rgb(var(--v-theme-primary)) !important;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2) !important;
}

.v-theme--dark .action-btn {
  background: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

.v-theme--dark .action-btn:hover {
  background: rgba(var(--v-theme-primary), 0.12) !important;
  border-color: rgba(var(--v-theme-primary), 0.3) !important;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25) !important;
}

/* Dark theme notification styles */
.v-theme--dark .notification-badge :deep(.v-badge__badge) {
  border-color: rgb(var(--v-theme-surface));
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.v-theme--dark .mobile-menu-btn {
  background: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

.v-theme--dark .mobile-menu-btn:hover {
  background: rgba(var(--v-theme-primary), 0.12) !important;
  border-color: rgba(var(--v-theme-primary), 0.3) !important;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25) !important;
}

/* Dark theme notification drawer */
.v-theme--dark .notifications-drawer {
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%) !important;
  border-left-color: rgba(255, 255, 255, 0.1) !important;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.3) !important;
}

/* Dark theme - ensure proper hiding */
.v-theme--dark .notifications-drawer:not(.v-navigation-drawer--active) {
  transform: translateX(100%) !important;
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
}

.v-theme--dark .notifications-drawer.v-navigation-drawer--active {
  transform: translateX(0) !important;
  visibility: visible !important;
  opacity: 1 !important;
  pointer-events: auto !important;
}

.v-theme--dark .notifications-header {
  background: rgba(255, 255, 255, 0.05);
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.v-theme--dark .notifications-header__title {
  color: rgb(var(--v-theme-on-surface));
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.v-theme--dark .notifications-empty__title {
  color: rgb(var(--v-theme-on-surface));
}

.v-theme--dark .notifications-empty__subtitle {
  color: rgb(var(--v-theme-on-surface-variant));
  opacity: 0.9;
}

.v-theme--dark .notification-item {
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.v-theme--dark .notification-item:hover {
  background: rgba(var(--v-theme-primary), 0.08);
}

.v-theme--dark .notification-item--unread {
  background: rgba(var(--v-theme-primary), 0.05);
  border-left-color: rgb(var(--v-theme-primary));
}

.v-theme--dark .notification-item__title {
  color: rgb(var(--v-theme-on-surface));
}

.v-theme--dark .notification-item__time {
  color: rgb(var(--v-theme-on-surface-variant));
  opacity: 0.9;
}

.v-theme--dark .notification-item__message {
  color: rgb(var(--v-theme-on-surface-variant));
}
</style>
