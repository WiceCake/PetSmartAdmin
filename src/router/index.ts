import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import(/* webpackChunkName: "auth" */ '@/views/auth/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import(/* webpackChunkName: "dashboard" */ '@/views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/users',
      name: 'Users',
      component: () => import(/* webpackChunkName: "users" */ '@/views/users/UsersView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/users/:id',
      name: 'UserDetail',
      component: () => import(/* webpackChunkName: "users" */ '@/views/users/UserDetailView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/pets',
      name: 'Pets',
      component: () => import(/* webpackChunkName: "content" */ '@/views/pets/PetsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/appointments',
      name: 'Appointments',
      component: () => import(/* webpackChunkName: "content" */ '@/views/appointments/AppointmentsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/products',
      name: 'Products',
      component: () => import(/* webpackChunkName: "content" */ '@/views/products/ProductsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/products/new',
      name: 'NewProduct',
      component: () => import(/* webpackChunkName: "content" */ '@/views/products/ProductFormView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/products/:id/edit',
      name: 'EditProduct',
      component: () => import(/* webpackChunkName: "content" */ '@/views/products/ProductFormView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/orders',
      name: 'Orders',
      component: () => import(/* webpackChunkName: "content" */ '@/views/orders/OrdersView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/orders/:id',
      name: 'OrderDetail',
      component: () => import(/* webpackChunkName: "content" */ '@/views/orders/OrderDetailView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/messages',
      name: 'Messages',
      component: () => import(/* webpackChunkName: "communication" */ '@/views/messages/MessagesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/notifications',
      name: 'Notifications',
      component: () => import(/* webpackChunkName: "communication" */ '@/views/notifications/NotificationsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/analytics',
      name: 'Analytics',
      component: () => import(/* webpackChunkName: "admin" */ '@/views/analytics/AnalyticsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import(/* webpackChunkName: "admin" */ '@/views/settings/SettingsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/layout-test',
      name: 'LayoutTest',
      component: () => import(/* webpackChunkName: "dev" */ '@/views/LayoutTestView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/state-test',
      name: 'StatePersistenceTest',
      component: () => import(/* webpackChunkName: "dev" */ '@/views/StatePersistenceTestView.vue'),
      meta: { requiresAuth: true }
    },

    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import(/* webpackChunkName: "misc" */ '@/views/NotFoundView.vue')
    }
  ]
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  console.log('Router guard:', {
    to: to.path,
    from: from.path,
    initialized: authStore.initialized,
    loading: authStore.loading,
    isAuthenticated: authStore.isAuthenticated,
    isAdmin: authStore.isAdmin
  })

  // Initialize auth if not already done (App.vue handles primary initialization)
  if (!authStore.initialized && !authStore.loading) {
    console.log('Initializing auth store from router guard')
    await authStore.initialize()
  }

  // Wait for auth initialization to complete with timeout
  if (authStore.loading) {
    console.log('Auth store is loading, waiting...')
    // Use Promise.race to implement a proper timeout
    const authTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Auth initialization timeout')), 3000)
    )

    const authComplete = new Promise((resolve) => {
      const checkAuth = () => {
        if (!authStore.loading) {
          resolve(true)
        } else {
          setTimeout(checkAuth, 50)
        }
      }
      checkAuth()
    })

    try {
      await Promise.race([authComplete, authTimeout])
    } catch (error) {
      console.error('Auth initialization timeout, proceeding with current state')
    }
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)

  console.log('Route requirements:', { requiresAuth, requiresGuest })

  // Handle authentication requirements
  if (requiresAuth) {
    if (!authStore.isAuthenticated) {
      console.log('Route requires auth but user not authenticated, redirecting to login')
      // Store intended destination for redirect after login
      const intendedUrl = to.fullPath
      if (intendedUrl !== '/login') {
        authStore.setRedirectUrl(intendedUrl)
      }
      next('/login')
      return
    }

    if (!authStore.isAdmin) {
      // User is authenticated but not an admin
      console.log('User is authenticated but not an admin, redirecting to login')
      const intendedUrl = to.fullPath
      if (intendedUrl !== '/login') {
        authStore.setRedirectUrl(intendedUrl)
      }
      next('/login')
      return
    }
  }

  // Handle guest-only routes (like login page)
  if (requiresGuest && authStore.isAuthenticated && authStore.isAdmin) {
    // User is already authenticated and is an admin, redirect to intended destination or dashboard
    console.log('User already authenticated, redirecting from guest route')
    const redirectUrl = authStore.getAndClearRedirectUrl()
    next(redirectUrl)
    return
  }

  // Handle session expiration
  if (authStore.sessionExpired && to.path !== '/login') {
    console.log('Session expired, redirecting to login')
    const intendedUrl = to.fullPath
    authStore.setRedirectUrl(intendedUrl)
    next('/login')
    return
  }

  // All checks passed, proceed with navigation
  console.log('All router checks passed, proceeding with navigation')
  next()
})

export default router
