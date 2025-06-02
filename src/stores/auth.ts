import { defineStore } from 'pinia'
import { ref, computed, nextTick } from 'vue'
import { supabase, supabaseAdmin } from '@/config/supabase'
import type { User, Session } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const loading = ref(false)
  const adminUser = ref<any>(null)
  const initialized = ref(false)
  const redirectUrl = ref<string | null>(null)
  const sessionExpired = ref(false)

  // Store auth state change subscription for cleanup
  let authStateSubscription: { data: { subscription: { unsubscribe: () => void } } } | null = null

  // Track initialization promise to prevent multiple concurrent initializations
  let initializationPromise: Promise<void> | null = null

  const isAuthenticated = computed(() => !!user.value && !!session.value)
  const isAdmin = computed(() => !!adminUser.value && adminUser.value.is_active)
  const hasValidSession = computed(() => {
    if (!session.value) return false
    const now = Math.floor(Date.now() / 1000)
    return session.value.expires_at ? session.value.expires_at > now : true
  })

  // Initialize auth state with timeout protection
  const initialize = async () => {
    // If already initialized, return immediately
    if (initialized.value) {

      return
    }

    // If initialization is already in progress, wait for it
    if (initializationPromise) {

      await initializationPromise
      return
    }

    // Start new initialization
    loading.value = true
    sessionExpired.value = false

    // Create initialization promise
    initializationPromise = (async () => {
      // Add timeout protection to prevent hanging
      const initTimeout = setTimeout(() => {
        loading.value = false
        initialized.value = true
      }, 8000) // 8 second timeout

      try {
        // Get current session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession()

        if (error) {

          await handleSessionExpiration()
          return
        }

        if (currentSession) {
          // Set session first so hasValidSession can check it
          session.value = currentSession
          user.value = currentSession.user

          // Validate session expiration
          if (!hasValidSession.value) {
            await handleSessionExpiration()
            return
          }

          // Check admin status
          const isAdminUser = await checkAdminStatus()
          if (!isAdminUser) {
            await signOut()
            return
          }
        }

        // Clean up existing listener
        if (authStateSubscription) {
          authStateSubscription.data.subscription.unsubscribe()
        }

        // Listen for auth changes
        authStateSubscription = supabase.auth.onAuthStateChange(async (event, newSession) => {


          // Handle different auth events
          if (event === 'SIGNED_OUT') {
            session.value = null
            user.value = null
            adminUser.value = null
            sessionExpired.value = false

            return
          }

          if (event === 'TOKEN_REFRESHED') {

          }

          // Update session and user for all other events
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            session.value = newSession
            user.value = newSession?.user || null

            if (newSession?.user) {
              const isAdminUser = await checkAdminStatus()
              if (!isAdminUser) {
                await signOut()
                return
              }
            } else {
              adminUser.value = null
            }
          }
        })

        initialized.value = true
      } catch (error) {

        await handleSessionExpiration()
      } finally {
        clearTimeout(initTimeout)
        loading.value = false
        initializationPromise = null
      }
    })()

    // Wait for the initialization to complete
    await initializationPromise
  }

  // Handle session expiration
  const handleSessionExpiration = async () => {
    sessionExpired.value = true
    session.value = null
    user.value = null
    adminUser.value = null

    // Clear any stored session data
    try {
      await supabase.auth.signOut()
    } catch (error) {

    }
  }

  // Set redirect URL for post-login navigation
  const setRedirectUrl = (url: string) => {
    redirectUrl.value = url
    // Store in sessionStorage for persistence across page reloads
    try {
      sessionStorage.setItem('auth-redirect-url', url)
    } catch (error) {

    }
  }

  // Get and clear redirect URL
  const getAndClearRedirectUrl = (): string => {
    let url = redirectUrl.value || '/dashboard'

    // Try to get from sessionStorage if not in memory
    if (!redirectUrl.value) {
      try {
        const storedUrl = sessionStorage.getItem('auth-redirect-url')
        if (storedUrl) {
          url = storedUrl
        }
      } catch (error) {

      }
    }

    // Clear the redirect URL
    redirectUrl.value = null
    try {
      sessionStorage.removeItem('auth-redirect-url')
    } catch (error) {

    }

    return url
  }

  // Check if user is admin
  const checkAdminStatus = async () => {
    if (!user.value) return false

    try {
      // Check admin_users table using email since that's how admins are identified
      const { data, error } = await supabaseAdmin
        .from('admin_users')
        .select('*')
        .eq('email', user.value.email)
        .eq('is_active', true)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      adminUser.value = data
      return !!data
    } catch (error) {

      adminUser.value = null
      return false
    }
  }

  // Sign in
  const signIn = async (email: string, password: string) => {
    // Prevent concurrent login attempts
    if (loading.value) {

      return { success: false, error: 'Login already in progress' }
    }

    loading.value = true
    sessionExpired.value = false

    try {

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      if (data.user && data.session) {
        // Manually set the auth state immediately for faster UI response
        session.value = data.session
        user.value = data.user
        sessionExpired.value = false

        // Wait a bit longer for auth state change to propagate
        await new Promise(resolve => setTimeout(resolve, 300))

        // Check admin status after auth state has been updated
        const isAdminUser = await checkAdminStatus()
        if (!isAdminUser) {
          await signOut()
          throw new Error('Access denied. Admin privileges required.')
        }

        // Double-check that all auth state is properly set
        if (!isAuthenticated.value || !isAdmin.value) {
          await signOut()
          throw new Error('Authentication state error. Please try again.')
        }

        return { success: true }
      } else {
        throw new Error('No user data returned from authentication')
      }
    } catch (error: any) {

      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // Sign out
  const signOut = async () => {
    loading.value = true
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      user.value = null
      session.value = null
      adminUser.value = null

    } catch (error: any) {

    } finally {
      loading.value = false
    }
  }

  // Reset password
  const resetPassword = async (email: string) => {
    loading.value = true
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)

      if (error) throw error


      return { success: true }
    } catch (error: any) {

      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // Update password
  const updatePassword = async (newPassword: string) => {
    loading.value = true
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error


      return { success: true }
    } catch (error: any) {

      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // Refresh session manually
  const refreshSession = async () => {
    try {

      const { data, error } = await supabase.auth.refreshSession()

      if (error) {

        await handleSessionExpiration()
        return false
      }

      if (data.session) {
        session.value = data.session
        user.value = data.session.user

        return true
      }

      return false
    } catch (error) {

      await handleSessionExpiration()
      return false
    }
  }

  // Recover from connection issues
  const recoverConnection = async () => {
    try {


      // First try to get current session
      const { data: { session: currentSession }, error } = await supabase.auth.getSession()

      if (error) {

        await handleSessionExpiration()
        return false
      }

      if (currentSession) {
        // Validate session
        if (!hasValidSession.value) {

          await handleSessionExpiration()
          return false
        }

        // Update auth state
        session.value = currentSession
        user.value = currentSession.user

        // Verify admin status
        const isAdminUser = await checkAdminStatus()
        if (!isAdminUser) {

          await signOut()
          return false
        }

        // Force reactivity update
        await nextTick()


        return true
      }


      await handleSessionExpiration()
      return false
    } catch (error) {

      await handleSessionExpiration()
      return false
    }
  }

  // Validate current session
  const validateSession = async () => {
    if (!session.value || !user.value) {
      return false
    }

    try {
      // Check if session is still valid
      if (!hasValidSession.value) {

        await handleSessionExpiration()
        return false
      }

      // Verify admin status
      const isAdminUser = await checkAdminStatus()
      if (!isAdminUser) {

        await signOut()
        return false
      }

      return true
    } catch (error) {

      await handleSessionExpiration()
      return false
    }
  }

  // Cleanup function
  const cleanup = () => {
    if (authStateSubscription) {
      authStateSubscription.data.subscription.unsubscribe()
      authStateSubscription = null
    }
    initialized.value = false
    loading.value = false
    initializationPromise = null
  }

  return {
    user,
    session,
    adminUser,
    loading,
    initialized,
    redirectUrl,
    sessionExpired,
    isAuthenticated,
    isAdmin,
    hasValidSession,
    initialize,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    checkAdminStatus,
    handleSessionExpiration,
    setRedirectUrl,
    getAndClearRedirectUrl,
    refreshSession,
    recoverConnection,
    validateSession,
    cleanup
  }
})
