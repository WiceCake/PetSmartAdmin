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

    console.log('🔍 Starting connection monitoring...')
    this.isMonitoring = true
    this.setupEventListeners()
    this.startHealthChecks()
  }

  // Stop monitoring
  stopMonitoring() {
    console.log('🛑 Stopping connection monitoring...')
    this.isMonitoring = false
    this.cleanup()
  }

  // Setup browser event listeners
  private setupEventListeners() {
    // Handle visibility change (tab switching)
    this.visibilityChangeHandler = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ Tab became visible, checking connection...')
        this.handleTabVisible()
      } else {
        console.log('🙈 Tab became hidden')
        this.handleTabHidden()
      }
    }

    // Handle window focus/blur
    this.focusHandler = () => {
      console.log('🎯 Window focused, refreshing connection...')
      this.handleWindowFocus()
    }

    this.blurHandler = () => {
      console.log('😴 Window blurred')
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
      console.log('🏥 Performing health check...')
      
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
      
      console.log('✅ Health check passed')
    } catch (error) {
      console.error('❌ Health check failed:', error)
      this.isConnected.value = false
      await this.handleConnectionFailure()
    }
  }

  // Handle tab becoming visible
  private async handleTabVisible() {
    const timeSinceLastActivity = Date.now() - this.lastActivity
    
    // If tab was hidden for more than 5 minutes, force reconnection
    if (timeSinceLastActivity > 5 * 60 * 1000) {
      console.log('⏰ Tab was hidden for extended period, forcing reconnection...')
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
    
    // Refresh auth session
    try {
      const authStore = useAuthStore()
      if (authStore.isAuthenticated) {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error || !session) {
          console.log('🔄 Session invalid, reinitializing auth...')
          await authStore.initialize()
        }
      }
    } catch (error) {
      console.error('Error refreshing session on focus:', error)
    }
  }

  // Handle connection failure
  private async handleConnectionFailure() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('🚨 Max reconnection attempts reached')
      return
    }

    this.isReconnecting.value = true
    this.reconnectAttempts++

    console.log(`🔄 Attempting reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)

    try {
      await this.forceReconnection()
    } catch (error) {
      console.error('Reconnection failed:', error)
    } finally {
      this.isReconnecting.value = false
    }
  }

  // Force reconnection
  private async forceReconnection() {
    console.log('🔄 Forcing reconnection...')
    
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
      
      console.log('✅ Reconnection successful')
    } catch (error) {
      console.error('❌ Reconnection failed:', error)
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
    console.log('🔄 Manual reconnection triggered...')
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
