import { ref, nextTick } from 'vue'
import { supabase, supabaseAdmin } from '@/config/supabase'
import { useAuthStore } from '@/stores/auth'

export class ConnectionMonitor {
  private static instance: ConnectionMonitor
  private isMonitoring = false
  private healthCheckInterval: number | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 3
  private lastActivity = Date.now()
  private visibilityChangeHandler: (() => void) | null = null
  private focusHandler: (() => void) | null = null
  private blurHandler: (() => void) | null = null

  // Reactive state
  public isConnected = ref(true)
  public isReconnecting = ref(false)
  public lastHealthCheck = ref<Date | null>(null)

  private constructor() {}

  static getInstance(): ConnectionMonitor {
    if (!ConnectionMonitor.instance) {
      ConnectionMonitor.instance = new ConnectionMonitor()
    }
    return ConnectionMonitor.instance
  }

  // Start monitoring connection health
  startMonitoring() {
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.setupEventListeners()
    this.startHealthChecks()
  }

  // Stop monitoring
  stopMonitoring() {
    this.isMonitoring = false
    this.cleanup()
  }

  // Setup browser event listeners
  private setupEventListeners() {
    // Handle visibility change (tab switching)
    this.visibilityChangeHandler = () => {
      if (document.visibilityState === 'visible') {

        this.handleTabVisible()
      } else {

        this.handleTabHidden()
      }
    }

    // Handle window focus/blur
    this.focusHandler = () => {

      this.handleWindowFocus()
    }

    this.blurHandler = () => {

      this.lastActivity = Date.now()
    }

    document.addEventListener('visibilitychange', this.visibilityChangeHandler)
    window.addEventListener('focus', this.focusHandler)
    window.addEventListener('blur', this.blurHandler)

    // Track user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    const updateActivity = () => {
      this.lastActivity = Date.now()
    }

    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true })
    })
  }

  // Start periodic health checks with optimized intervals
  private startHealthChecks() {
    // Initial health check
    this.performHealthCheck()

    // Set up interval for regular checks - increased to 60 seconds for better performance
    this.healthCheckInterval = window.setInterval(() => {
      // Only perform health check if tab is visible
      if (document.visibilityState === 'visible') {
        this.performHealthCheck()
      }
    }, 60000) // Check every 60 seconds instead of 30
  }

  // Perform connection health check
  private async performHealthCheck() {
    try {
      // Test basic Supabase connection
      const { data, error } = await supabaseAdmin
        .from('admin_users')
        .select('id')
        .limit(1)

      if (error) {
        throw new Error(`Health check failed: ${error.message}`)
      }

      // Check auth session validity
      const authStore = useAuthStore()
      if (authStore.isAuthenticated && !authStore.hasValidSession) {
        throw new Error('Session expired')
      }

      this.isConnected.value = true
      this.lastHealthCheck.value = new Date()
      this.reconnectAttempts = 0
    } catch (error) {
      this.isConnected.value = false
      await this.handleConnectionFailure()
    }
  }

  // Handle tab becoming visible
  private async handleTabVisible() {
    const authStore = useAuthStore()

    // Don't interfere if auth is currently loading (login in progress)
    if (authStore.loading) {
      return
    }

    const timeSinceLastActivity = Date.now() - this.lastActivity

    // If tab was hidden for more than 5 minutes, force reconnection
    if (timeSinceLastActivity > 5 * 60 * 1000) {
      await this.forceReconnection()
    } else {
      // Quick health check
      await this.performHealthCheck()
    }
  }

  // Handle tab becoming hidden
  private handleTabHidden() {
    this.lastActivity = Date.now()
  }

  // Handle window focus
  private async handleWindowFocus() {
    // Force a health check and potential reconnection
    await this.performHealthCheck()

    // Refresh auth session - but avoid interfering with ongoing auth operations
    try {
      const authStore = useAuthStore()

      // Don't interfere if auth is currently loading (login in progress)
      if (authStore.loading) {

        return
      }

      // Only refresh session if user is already authenticated
      if (authStore.isAuthenticated && authStore.initialized) {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error || !session) {

          // Use handleSessionExpiration instead of initialize to avoid conflicts
          await authStore.handleSessionExpiration()
        } else {
          // Session is valid, just refresh the token if needed

          await authStore.refreshSession()
        }
      }
    } catch (error) {

    }
  }

  // Handle connection failure
  private async handleConnectionFailure() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {

      return
    }

    this.isReconnecting.value = true
    this.reconnectAttempts++

    try {
      await this.forceReconnection()
    } catch (error) {

    } finally {
      this.isReconnecting.value = false
    }
  }

  // Force reconnection
  private async forceReconnection() {
    try {
      // Refresh auth session
      const authStore = useAuthStore()
      if (authStore.isAuthenticated) {
        await authStore.initialize()
      }

      // Test connection
      await this.performHealthCheck()

      // Trigger reactivity update
      await nextTick()
    } catch (error) {

      throw error
    }
  }

  // Cleanup event listeners and intervals
  private cleanup() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }

    if (this.visibilityChangeHandler) {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler)
      this.visibilityChangeHandler = null
    }

    if (this.focusHandler) {
      window.removeEventListener('focus', this.focusHandler)
      this.focusHandler = null
    }

    if (this.blurHandler) {
      window.removeEventListener('blur', this.blurHandler)
      this.blurHandler = null
    }
  }

  // Manual reconnection trigger
  async reconnect() {
    this.reconnectAttempts = 0
    await this.forceReconnection()
  }

  // Get connection status
  getStatus() {
    return {
      isConnected: this.isConnected.value,
      isReconnecting: this.isReconnecting.value,
      lastHealthCheck: this.lastHealthCheck.value,
      reconnectAttempts: this.reconnectAttempts
    }
  }
}

// Export singleton instance
export const connectionMonitor = ConnectionMonitor.getInstance()
