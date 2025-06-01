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

  const isAuthenticated = computed(() => !!user.value && !!session.value)
  const isAdmin = computed(() => !!adminUser.value && adminUser.value.is_active)
  const hasValidSession = computed(() => {
    if (!session.value) return false
    const now = Math.floor(Date.now() / 1000)
    return session.value.expires_at ? session.value.expires_at > now : true
  })

  // Initialize auth state with timeout protection
  const initialize = async () => {
    if (initialized.value) {
      return // Prevent multiple initializations
    }

    loading.value = true
    sessionExpired.value = false

    // Add timeout protection to prevent hanging
    const initTimeout = setTimeout(() => {
      console.warn('Auth initialization timeout, forcing completion')
      loading.value = false
      initialized.value = true
    }, 5000) // 5 second timeout

    try {
      // Get current session
      const { data: { session: currentSession }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Session retrieval error:', error)
        await handleSessionExpiration()
        return
      }

      if (currentSession) {
        // Set session first so hasValidSession can check it
        session.value = currentSession
        user.value = currentSession.user

        // Validate session expiration
        if (!hasValidSession.value) {
          console.log('Session expired, clearing auth state')
          await handleSessionExpiration()
          return
        }

        // Check admin status
        const isAdminUser = await checkAdminStatus()
        if (!isAdminUser) {
          console.log('User is not an admin, signing out')
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
        console.log('Auth state change:', event, newSession?.user?.email)

        // Handle different auth events
        if (event === 'SIGNED_OUT') {
          session.value = null
          user.value = null
          adminUser.value = null
          sessionExpired.value = false
          console.log('User signed out, cleared auth state')
          return
        }

        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed, updating session')
        }

        // Update session and user for all other events
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          session.value = newSession
          user.value = newSession?.user || null

          if (newSession?.user) {
            const isAdminUser = await checkAdminStatus()
            if (!isAdminUser) {
              console.log('User does not have admin privileges, signing out')
              await signOut()
              return
            }
            console.log('Auth state updated successfully')
          } else {
            adminUser.value = null
          }
        }
      })

      initialized.value = true
    } catch (error) {
      console.error('Auth initialization error:', error)
      await handleSessionExpiration()
    } finally {
      clearTimeout(initTimeout) // Clear the timeout
      loading.value = false
    }
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
      console.error('Error during session cleanup:', error)
    }
  }

  // Set redirect URL for post-login navigation
  const setRedirectUrl = (url: string) => {
    redirectUrl.value = url
    // Store in sessionStorage for persistence across page reloads
    try {
      sessionStorage.setItem('auth-redirect-url', url)
    } catch (error) {
      console.warn('Failed to store redirect URL:', error)
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
        console.warn('Failed to retrieve redirect URL:', error)
      }
    }

    // Clear the redirect URL
    redirectUrl.value = null
    try {
      sessionStorage.removeItem('auth-redirect-url')
    } catch (error) {
      console.warn('Failed to clear redirect URL:', error)
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
      console.error('Admin status check error:', error)
      adminUser.value = null
      return false
    }
  }

  // Sign in
  const signIn = async (email: string, password: string) => {
    loading.value = true
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
          console.error('Auth state not properly set after login')
          await signOut()
          throw new Error('Authentication state error. Please try again.')
        }

        console.log('Successfully signed in!')
        return { success: true }
      } else {
        throw new Error('No user data returned from authentication')
      }
    } catch (error: any) {
      console.error('Sign in failed:', error.message)
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
      console.log('Successfully signed out!')
    } catch (error: any) {
      console.error('Sign out failed:', error.message)
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

      console.log('Password reset email sent!')
      return { success: true }
    } catch (error: any) {
      console.error('Password reset failed:', error.message)
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

      console.log('Password updated successfully!')
      return { success: true }
    } catch (error: any) {
      console.error('Password update failed:', error.message)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // Refresh session manually
  const refreshSession = async () => {
    try {
      console.log('🔄 Manually refreshing session...')
      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        console.error('Session refresh failed:', error)
        await handleSessionExpiration()
        return false
      }

      if (data.session) {
        session.value = data.session
        user.value = data.session.user
        console.log('✅ Session refreshed successfully')
        return true
      }

      return false
    } catch (error) {
      console.error('Session refresh error:', error)
      await handleSessionExpiration()
      return false
    }
  }

  // Recover from connection issues
  const recoverConnection = async () => {
    try {
      console.log('🔄 Attempting connection recovery...')

      // First try to get current session
      const { data: { session: currentSession }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Session recovery failed:', error)
        await handleSessionExpiration()
        return false
      }

      if (currentSession) {
        // Validate session
        if (!hasValidSession.value) {
          console.log('Session expired during recovery')
          await handleSessionExpiration()
          return false
        }

        // Update auth state
        session.value = currentSession
        user.value = currentSession.user

        // Verify admin status
        const isAdminUser = await checkAdminStatus()
        if (!isAdminUser) {
          console.log('Admin status lost during recovery')
          await signOut()
          return false
        }

        // Force reactivity update
        await nextTick()

        console.log('✅ Connection recovered successfully')
        return true
      }

      console.log('No session found during recovery')
      await handleSessionExpiration()
      return false
    } catch (error) {
      console.error('Connection recovery failed:', error)
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
        console.log('Session validation failed: expired')
        await handleSessionExpiration()
        return false
      }

      // Verify admin status
      const isAdminUser = await checkAdminStatus()
      if (!isAdminUser) {
        console.log('Session validation failed: not admin')
        await signOut()
        return false
      }

      return true
    } catch (error) {
      console.error('Session validation error:', error)
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
