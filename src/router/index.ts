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
      path: '/messages/:id',
      name: 'ConversationDetail',
      component: () => import(/* webpackChunkName: "communication" */ '@/views/messages/ConversationDetailView.vue'),
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
      path: '/admin-management',
      name: 'AdminManagement',
      component: () => import(/* webpackChunkName: "admin" */ '@/views/admin/AdminManagementView.vue'),
      meta: { requiresAuth: true, requiresSuperAdmin: true }
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
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import(/* webpackChunkName: "misc" */ '@/views/NotFoundView.vue')
    }
  ]
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Wait for auth initialization to complete if it's in progress
  // Don't trigger new initialization - App.vue handles primary initialization
  if (authStore.loading) {


    // Wait for auth initialization with a reasonable timeout
    const authTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Auth initialization timeout')), 5000)
    )

    const authComplete = new Promise((resolve) => {
      const checkAuth = () => {
        if (!authStore.loading) {

          resolve(true)
        } else {
          setTimeout(checkAuth, 100) // Check every 100ms instead of 50ms
        }
      }
      checkAuth()
    })

    try {
      await Promise.race([authComplete, authTimeout])
    } catch (error) {

      // Don't treat timeout as an error - just proceed
    }
  }

  // If auth is still not initialized and not loading, something went wrong
  // Only then should we try to initialize (as a fallback)
  if (!authStore.initialized && !authStore.loading) {

    try {
      await authStore.initialize()
    } catch (error) {

    }
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  const requiresSuperAdmin = to.matched.some(record => record.meta.requiresSuperAdmin)



  // Handle authentication requirements
  if (requiresAuth) {
    if (!authStore.isAuthenticated) {

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

      const intendedUrl = to.fullPath
      if (intendedUrl !== '/login') {
        authStore.setRedirectUrl(intendedUrl)
      }
      next('/login')
      return
    }

    // Check super admin requirement
    if (requiresSuperAdmin) {
      const userRole = authStore.adminUser?.role
      if (userRole !== 'super_admin') {
        next('/dashboard')
        return
      }
    }
  }

  // Handle guest-only routes (like login page)
  if (requiresGuest && authStore.isAuthenticated && authStore.isAdmin) {
    const redirectUrl = authStore.getAndClearRedirectUrl()
    next(redirectUrl)
    return
  }

  // Handle session expiration
  if (authStore.sessionExpired && to.path !== '/login') {
    const intendedUrl = to.fullPath
    authStore.setRedirectUrl(intendedUrl)
    next('/login')
    return
  }

  next()
})

export default router
