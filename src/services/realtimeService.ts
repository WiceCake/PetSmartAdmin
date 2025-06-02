/**
 * Global Real-time Service for SPA-compatible notifications and messaging
 * This service maintains persistent real-time subscriptions across the entire application lifecycle
 */

import { ref, computed, reactive } from 'vue'
import { supabase } from '@/config/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

// Global reactive state
const globalState = reactive({
  // Notifications
  notifications: [] as any[],
  unreadNotificationCount: 0,
  notificationsLoading: false,

  // Messages
  conversations: [] as any[],
  unreadMessageCount: 0,
  messagesLoading: false,

  // Orders
  orders: [] as any[],
  pendingOrderCount: 0,
  ordersLoading: false,

  // Appointments
  appointments: [] as any[],
  upcomingAppointmentCount: 0,
  appointmentsLoading: false,

  // Real-time events for components to listen to
  lastNotificationUpdate: null as any,
  lastConversationUpdate: null as any,
  lastMessageUpdate: null as any,
  lastOrderUpdate: null as any,
  lastAppointmentUpdate: null as any,

  // Subscription status
  isConnected: false,
  lastError: null as string | null,
  retryCount: 0
})

// Subscription references
let notificationsChannel: RealtimeChannel | null = null
let messagesChannel: RealtimeChannel | null = null
let conversationsChannel: RealtimeChannel | null = null
let ordersChannel: RealtimeChannel | null = null
let appointmentsChannel: RealtimeChannel | null = null

// Service state
let isInitialized = false
let currentAdminUserId: string | null = null
let isConnecting = false
let connectionTimeout: number | null = null

// Debug flag removed for production

// Toast notification callback
let toastCallback: ((notification: any) => void) | null = null

class RealtimeService {
  
  /**
   * Initialize the real-time service
   * This should be called once when the app starts
   */
  async initialize(adminUserId?: string) {
    if (isInitialized && currentAdminUserId === adminUserId) {
      return
    }

    // If no admin user ID provided, wait for it
    if (!adminUserId) {
      return
    }

    currentAdminUserId = adminUserId
    isInitialized = true

    // Load initial data immediately to show badges on page load
    await this.loadInitialData()

    // Set up real-time subscriptions
    await this.setupSubscriptions()
  }
  
  /**
   * Load initial data from database
   */
  private async loadInitialData() {
    try {
      globalState.notificationsLoading = true
      globalState.messagesLoading = true
      globalState.ordersLoading = true
      globalState.appointmentsLoading = true

      // Load notifications
      await this.loadNotifications()
      await this.loadUnreadNotificationCount()

      // Load messages
      await this.loadConversations()
      await this.loadUnreadMessageCount()

      // Load orders
      await this.loadOrders()
      await this.loadPendingOrderCount()

      // Load appointments
      await this.loadAppointments()
      await this.loadUpcomingAppointmentCount()

    } catch (error) {
      globalState.lastError = 'Failed to load initial data'
    } finally {
      globalState.notificationsLoading = false
      globalState.messagesLoading = false
      globalState.ordersLoading = false
      globalState.appointmentsLoading = false
    }
  }
  
  /**
   * Set up persistent real-time subscriptions
   */
  private async setupSubscriptions() {
    if (!currentAdminUserId) {      return
    }

    // Prevent multiple concurrent connection attempts
    if (isConnecting) {      return
    }    isConnecting = true

    try {
      // Clean up existing subscriptions first
      this.cleanup()

      // Clear any existing connection timeout
      if (connectionTimeout) {
        clearTimeout(connectionTimeout)
        connectionTimeout = null
      }

      // Set up subscriptions with delays to prevent WebSocket overload
      await this.setupNotificationsSubscription()
      await this.delay(500) // 500ms delay between subscriptions

      await this.setupMessagesSubscription()
      await this.delay(500)

      await this.setupConversationsSubscription()
      await this.delay(500)

      await this.setupOrdersSubscription()
      await this.delay(500)

      await this.setupAppointmentsSubscription()

      // Set connection timeout
      connectionTimeout = setTimeout(() => {
        this.verifyConnections()
        isConnecting = false
      }, 3000) as unknown as number

      globalState.lastError = null
      globalState.retryCount = 0

    } catch (error) {
      // Keep essential error logging for production monitoring
      console.error('Failed to setup real-time subscriptions:', error)
      isConnecting = false
      globalState.isConnected = false
      globalState.lastError = 'Failed to setup subscriptions'
      this.scheduleRetry()
    }
  }

  /**
   * Helper method to add delays between operations
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
  
  /**
   * Set up notifications real-time subscription
   */
  private async setupNotificationsSubscription(): Promise<void> {
    if (!currentAdminUserId) return

    return new Promise((resolve, reject) => {
      try {
        notificationsChannel = supabase
          .channel(`notifications_${currentAdminUserId}_${Date.now()}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'admin_notifications',
              filter: `admin_user_id=eq.${currentAdminUserId}`
            },
            async (payload) => {
              const newNotification = payload.new as any

              // Add to notifications list
              globalState.notifications.unshift(newNotification)

              // Update global state with notification update for components to react to
              globalState.lastNotificationUpdate = {
                type: 'INSERT',
                notification: newNotification,
                timestamp: Date.now()
              }

              // Update unread count
              await this.loadUnreadNotificationCount()

              // Handle toast notifications for high priority
              if (toastCallback && (newNotification.priority === 'high' || newNotification.priority === 'medium')) {
                toastCallback(newNotification)
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'admin_notifications',
              filter: `admin_user_id=eq.${currentAdminUserId}`
            },
            async (payload) => {
              const updatedNotification = payload.new as any
              const oldNotification = payload.old as any

              // Update local notification
              const index = globalState.notifications.findIndex(n => n.id === updatedNotification.id)
              if (index > -1) {
                globalState.notifications[index] = updatedNotification
              }

              // Update global state with notification update for components to react to
              globalState.lastNotificationUpdate = {
                type: 'UPDATE',
                notification: updatedNotification,
                oldNotification: oldNotification,
                timestamp: Date.now()
              }

              // Update unread count if read status changed
              if (updatedNotification.is_read !== oldNotification.is_read) {
                await this.loadUnreadNotificationCount()
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'admin_notifications'
              // No filter for DELETE events due to Supabase limitation
            },
            async (payload) => {
              const deletedNotification = payload.old as any

              // Check if this notification belongs to the current admin user
              // We need to check our local notifications since payload.old might not have admin_user_id
              const localNotificationIndex = globalState.notifications.findIndex(n => n.id === deletedNotification.id)

              if (localNotificationIndex > -1) {
                // This is our notification, remove it
                globalState.notifications.splice(localNotificationIndex, 1)
                // Update global state with notification update for components to react to
                globalState.lastNotificationUpdate = {
                  type: 'DELETE',
                  notification: deletedNotification,
                  timestamp: Date.now()
                }

                // Update unread count
                await this.loadUnreadNotificationCount()
              } else {
                // This notification doesn't belong to current admin user, ignore
              }
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              resolve()
            } else if (status === 'CHANNEL_ERROR') {
              console.error('❌ Notifications channel error')
              reject(new Error('Notifications channel error'))
            } else if (status === 'TIMED_OUT') {
              console.error('⏰ Notifications channel timeout')
              reject(new Error('Notifications channel timeout'))
            }
          })
      } catch (error) {
        reject(error)
      }
    })
  }
  
  /**
   * Set up messages real-time subscription
   */
  private async setupMessagesSubscription(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        messagesChannel = supabase
          .channel(`messages_global_${Date.now()}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'messages'
            },
            async (payload) => {
              if (payload.eventType === 'INSERT') {
                const newMessage = payload.new as any

                // Update global state with message update for components to react to
                globalState.lastMessageUpdate = {
                  type: 'INSERT',
                  message: newMessage,
                  timestamp: Date.now()
                }

                // Only handle user messages for unread count
                if (newMessage.sender_type === 'user') {
                  await this.loadUnreadMessageCount()
                  await this.loadConversations()
                }
              } else if (payload.eventType === 'UPDATE') {
                const updatedMessage = payload.new as any
                const oldMessage = payload.old as any

                // Update global state with message update for components to react to
                globalState.lastMessageUpdate = {
                  type: 'UPDATE',
                  message: updatedMessage,
                  oldMessage: oldMessage,
                  timestamp: Date.now()
                }

                // Handle read status changes
                if (updatedMessage.is_read !== oldMessage.is_read) {
                  await this.loadUnreadMessageCount()
                  await this.loadConversations()
                }
              }
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              resolve()
            } else if (status === 'CHANNEL_ERROR') {
              reject(new Error('Messages channel error'))
            } else if (status === 'TIMED_OUT') {
              reject(new Error('Messages channel timeout'))
            }
          })
      } catch (error) {
        reject(error)
      }
    })
  }
  
  /**
   * Set up conversations real-time subscription
   */
  private async setupConversationsSubscription(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        conversationsChannel = supabase
          .channel(`conversations_global_${Date.now()}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'conversations'
            },
            async (payload) => {
              // Handle conversation status changes (like reopening)
              if (payload.eventType === 'UPDATE') {
                const updatedConversation = payload.new as any
                const oldConversation = payload.old as any

                // Update global state with conversation update for components to react to
                globalState.lastConversationUpdate = {
                  type: 'UPDATE',
                  conversation: updatedConversation,
                  oldConversation: oldConversation,
                  timestamp: Date.now()
                }
              }

              // Reload conversations when they change
              await this.loadConversations()

              // Also reload unread message count as conversation changes might affect it
              await this.loadUnreadMessageCount()
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              resolve()
            } else if (status === 'CHANNEL_ERROR') {
              reject(new Error('Conversations channel error'))
            } else if (status === 'TIMED_OUT') {
              reject(new Error('Conversations channel timeout'))
            }
          })
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Set up orders real-time subscription
   */
  private async setupOrdersSubscription(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        ordersChannel = supabase
          .channel(`orders_global_${Date.now()}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'orders'
            },
            async (payload) => {
              if (payload.eventType === 'INSERT') {
                const newOrder = payload.new as any

                // Add to orders list
                globalState.orders.unshift(newOrder)

                // Update global state with order update for components to react to
                globalState.lastOrderUpdate = {
                  type: 'INSERT',
                  order: newOrder,
                  timestamp: Date.now()
                }

                // Update pending order count
                await this.loadPendingOrderCount()
                await this.loadOrders()
              } else if (payload.eventType === 'UPDATE') {
                const updatedOrder = payload.new as any
                const oldOrder = payload.old as any

                // Update local order
                const index = globalState.orders.findIndex(o => o.id === updatedOrder.id)
                if (index > -1) {
                  globalState.orders[index] = updatedOrder
                }

                // Update global state with order update for components to react to
                globalState.lastOrderUpdate = {
                  type: 'UPDATE',
                  order: updatedOrder,
                  oldOrder: oldOrder,
                  timestamp: Date.now()
                }

                // Handle status changes
                if (updatedOrder.status !== oldOrder.status) {
                  await this.loadPendingOrderCount()
                  await this.loadOrders()
                }
              } else if (payload.eventType === 'DELETE') {
                const deletedOrder = payload.old as any

                // Remove from local orders
                const index = globalState.orders.findIndex(o => o.id === deletedOrder.id)
                if (index > -1) {
                  globalState.orders.splice(index, 1)
                }

                // Update global state with order update for components to react to
                globalState.lastOrderUpdate = {
                  type: 'DELETE',
                  order: deletedOrder,
                  timestamp: Date.now()
                }

                // Update pending order count
                await this.loadPendingOrderCount()
              }
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              resolve()
            } else if (status === 'CHANNEL_ERROR') {
              console.error('❌ Orders channel error')
              reject(new Error('Orders channel error'))
            } else if (status === 'TIMED_OUT') {
              console.error('⏰ Orders channel timeout')
              reject(new Error('Orders channel timeout'))
            }
          })
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Set up appointments real-time subscription
   */
  private async setupAppointmentsSubscription(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        appointmentsChannel = supabase
          .channel(`appointments_global_${Date.now()}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'appointments'
            },
            async (payload) => {
              if (payload.eventType === 'INSERT') {
                const newAppointment = payload.new as any

                // Add to appointments list
                globalState.appointments.unshift(newAppointment)

                // Update global state with appointment update for components to react to
                globalState.lastAppointmentUpdate = {
                  type: 'INSERT',
                  appointment: newAppointment,
                  timestamp: Date.now()
                }

                // Update upcoming appointment count
                await this.loadUpcomingAppointmentCount()
                await this.loadAppointments()
              } else if (payload.eventType === 'UPDATE') {
                const updatedAppointment = payload.new as any
                const oldAppointment = payload.old as any

                // Update local appointment
                const index = globalState.appointments.findIndex(a => a.id === updatedAppointment.id)
                if (index > -1) {
                  globalState.appointments[index] = updatedAppointment
                }

                // Update global state with appointment update for components to react to
                globalState.lastAppointmentUpdate = {
                  type: 'UPDATE',
                  appointment: updatedAppointment,
                  oldAppointment: oldAppointment,
                  timestamp: Date.now()
                }

                // Handle status changes
                if (updatedAppointment.status !== oldAppointment.status) {
                  await this.loadUpcomingAppointmentCount()
                  await this.loadAppointments()
                }
              } else if (payload.eventType === 'DELETE') {
                const deletedAppointment = payload.old as any

                // Remove from local appointments
                const index = globalState.appointments.findIndex(a => a.id === deletedAppointment.id)
                if (index > -1) {
                  globalState.appointments.splice(index, 1)
                }

                // Update global state with appointment update for components to react to
                globalState.lastAppointmentUpdate = {
                  type: 'DELETE',
                  appointment: deletedAppointment,
                  timestamp: Date.now()
                }

                // Update upcoming appointment count
                await this.loadUpcomingAppointmentCount()
              }
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              resolve()
            } else if (status === 'CHANNEL_ERROR') {
              console.error('❌ Appointments channel error')
              reject(new Error('Appointments channel error'))
            } else if (status === 'TIMED_OUT') {
              console.error('⏰ Appointments channel timeout')
              reject(new Error('Appointments channel timeout'))
            }
          })
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Load notifications from database
   */
  async loadNotifications(page = 1, limit = 50) {
    if (!currentAdminUserId) return
    
    try {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .eq('admin_user_id', currentAdminUserId)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)
      
      if (error) throw error
      
      if (page === 1) {
        globalState.notifications = data || []
      } else {
        globalState.notifications.push(...(data || []))
      }
    } catch (error) {
      globalState.lastError = 'Failed to load notifications'
    }
  }
  
  /**
   * Load unread notification count
   */
  async loadUnreadNotificationCount() {
    if (!currentAdminUserId) return
    
    try {
      const { count, error } = await supabase
        .from('admin_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('admin_user_id', currentAdminUserId)
        .eq('is_read', false)
      
      if (error) throw error
      globalState.unreadNotificationCount = count || 0
    } catch (error) {
      globalState.lastError = 'Failed to load unread notification count'
    }
  }
  
  /**
   * Load conversations from database
   */
  async loadConversations() {
    try {
      const { data, error } = await supabase
        .from('conversation_details')
        .select('*')
        .order('last_message_at', { ascending: false })
        .limit(50)
      
      if (error) throw error
      globalState.conversations = data || []
    } catch (error) {
      globalState.lastError = 'Failed to load conversations'
    }
  }
  
  /**
   * Load unread message count
   */
  async loadUnreadMessageCount() {
    try {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender_type', 'user')
        .eq('is_read', false)

      if (error) throw error
      globalState.unreadMessageCount = count || 0
    } catch (error) {
      globalState.lastError = 'Failed to load unread message count'
    }
  }

  /**
   * Load orders from database
   */
  async loadOrders(page = 1, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:user_id (
            id,
            first_name,
            last_name,
            username
          )
        `)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (error) throw error

      if (page === 1) {
        globalState.orders = data || []
      } else {
        globalState.orders.push(...(data || []))
      }
    } catch (error) {
      globalState.lastError = 'Failed to load orders'
    }
  }

  /**
   * Load pending order count
   */
  async loadPendingOrderCount() {
    try {
      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['Pending', 'Preparing'])

      if (error) throw error
      globalState.pendingOrderCount = count || 0
    } catch (error) {
      globalState.lastError = 'Failed to load pending order count'
    }
  }

  /**
   * Load appointments from database
   */
  async loadAppointments(page = 1, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          pets!inner(name, type),
          profiles!inner(username, first_name, last_name)
        `)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: true })
        .range((page - 1) * limit, page * limit - 1)

      if (error) throw error

      if (page === 1) {
        globalState.appointments = data || []
      } else {
        globalState.appointments.push(...(data || []))
      }
    } catch (error) {
      globalState.lastError = 'Failed to load appointments'
    }
  }

  /**
   * Load upcoming appointment count
   */
  async loadUpcomingAppointmentCount() {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { count, error } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Pending')
        .gte('appointment_date', today)

      if (error) throw error
      globalState.upcomingAppointmentCount = count || 0
    } catch (error) {
      globalState.lastError = 'Failed to load upcoming appointment count'
    }
  }

  /**
   * Update admin user ID (called when auth state changes)
   */
  updateAdminUser(adminUserId: string | null) {
    if (adminUserId !== currentAdminUserId) {
      if (adminUserId) {
        // User changed, reinitialize completely
        currentAdminUserId = adminUserId
        isInitialized = false // Reset initialization flag
        this.initialize(adminUserId) // Full initialization with data loading
      } else {
        // User logged out, cleanup
        this.cleanup()
        currentAdminUserId = null
        isInitialized = false
      }
    }
  }

  /**
   * Set toast notification callback
   */
  setToastCallback(callback: (notification: any) => void) {
    toastCallback = callback
  }

  /**
   * Verify that all subscriptions are properly connected
   */
  private verifyConnections() {
    const channels = [
      { name: 'notifications', channel: notificationsChannel },
      { name: 'messages', channel: messagesChannel },
      { name: 'conversations', channel: conversationsChannel },
      { name: 'orders', channel: ordersChannel },
      { name: 'appointments', channel: appointmentsChannel }
    ]

    let connectedCount = 0
    channels.forEach(({ name, channel }) => {
      const state = channel?.state || 'null'
      const connected = channel && channel.state === 'joined'

      if (connected) {
        connectedCount++
      }
    })

    globalState.isConnected = connectedCount === channels.length
    if (!globalState.isConnected) {
      this.scheduleRetry()
    }
  }
  
  /**
   * Schedule retry for failed subscriptions
   */
  private scheduleRetry() {
    globalState.retryCount++
    const delay = Math.min(1000 * Math.pow(2, globalState.retryCount), 30000) // Exponential backoff, max 30s
    
    setTimeout(() => {
      if (currentAdminUserId) {
        this.setupSubscriptions()
      }
    }, delay)
  }
  
  /**
   * Clean up all subscriptions
   */
  cleanup() {
    // Clear connection timeout
    if (connectionTimeout) {
      clearTimeout(connectionTimeout)
      connectionTimeout = null
    }

    // Reset connection state
    isConnecting = false

    // Remove all channels
    if (notificationsChannel) {
      supabase.removeChannel(notificationsChannel)
      notificationsChannel = null
    }

    if (messagesChannel) {
      supabase.removeChannel(messagesChannel)
      messagesChannel = null
    }

    if (conversationsChannel) {
      supabase.removeChannel(conversationsChannel)
      conversationsChannel = null
    }

    if (ordersChannel) {
      supabase.removeChannel(ordersChannel)
      ordersChannel = null
    }

    if (appointmentsChannel) {
      supabase.removeChannel(appointmentsChannel)
      appointmentsChannel = null
    }

    globalState.isConnected = false
  }
  
  /**
   * Force refresh all data
   */
  async forceRefresh() {
    await this.loadInitialData()
  }
  
  /**
   * Get reactive state for components
   */
  getState() {
    return {
      // Notifications
      notifications: computed(() => globalState.notifications),
      unreadNotificationCount: computed(() => globalState.unreadNotificationCount),
      notificationsLoading: computed(() => globalState.notificationsLoading),

      // Messages
      conversations: computed(() => globalState.conversations),
      unreadMessageCount: computed(() => globalState.unreadMessageCount),
      messagesLoading: computed(() => globalState.messagesLoading),

      // Orders
      orders: computed(() => globalState.orders),
      pendingOrderCount: computed(() => globalState.pendingOrderCount),
      ordersLoading: computed(() => globalState.ordersLoading),

      // Appointments
      appointments: computed(() => globalState.appointments),
      upcomingAppointmentCount: computed(() => globalState.upcomingAppointmentCount),
      appointmentsLoading: computed(() => globalState.appointmentsLoading),

      // Real-time events for components to listen to
      lastNotificationUpdate: computed(() => globalState.lastNotificationUpdate),
      lastConversationUpdate: computed(() => globalState.lastConversationUpdate),
      lastMessageUpdate: computed(() => globalState.lastMessageUpdate),
      lastOrderUpdate: computed(() => globalState.lastOrderUpdate),
      lastAppointmentUpdate: computed(() => globalState.lastAppointmentUpdate),

      // Notification badge count (only notifications and messages)
      notificationBadgeCount: computed(() => globalState.unreadNotificationCount + globalState.unreadMessageCount),

      // Total unread count for dashboard (including pending orders and upcoming appointments)
      totalUnreadCount: computed(() => globalState.unreadNotificationCount + globalState.unreadMessageCount + globalState.pendingOrderCount + globalState.upcomingAppointmentCount),

      // Connection status
      isConnected: computed(() => globalState.isConnected),
      lastError: computed(() => globalState.lastError)
    }
  }
}

// Create singleton instance
export const realtimeService = new RealtimeService()

// Export reactive state for components
export const useRealtimeState = () => realtimeService.getState()
