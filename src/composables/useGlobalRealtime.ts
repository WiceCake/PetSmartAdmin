/**
 * Global Real-time Composable
 * Provides access to the global real-time service state and methods
 * This ensures consistent state across all components in the SPA
 */

import { realtimeService, useRealtimeState } from '@/services/realtimeService'
import { supabase } from '@/config/supabase'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'

export function useGlobalRealtime() {
  const toast = useToast()
  const state = useRealtimeState()
  
  /**
   * Initialize the global real-time service
   * Should be called once in the app lifecycle
   */
  const initialize = async () => {
    const authStore = useAuthStore()

    if (authStore.adminUser?.id) {
      // Set up toast callback for high-priority notifications
      realtimeService.setToastCallback((notification) => {
        if (notification.priority === 'high') {
          toast.error(notification.title, {
            timeout: 8000,
            closeOnClick: true,
            pauseOnFocusLoss: false,
            pauseOnHover: true,
            draggable: true,
            showCloseButtonOnHover: false,
            hideProgressBar: false,
            closeButton: "button",
            icon: "🚨",
            rtl: false
          })
        } else if (notification.priority === 'medium') {
          toast.info(notification.title, {
            timeout: 5000
          })
        }
      })

      await realtimeService.initialize(authStore.adminUser.id)
    }
  }
  
  /**
   * Force refresh all real-time data
   */
  const forceRefresh = async () => {
    try {
      await realtimeService.forceRefresh()
      // Success toast removed for silent refresh operation
    } catch (error) {
      toast.error('Unable to refresh data. Please check your connection.', {
        timeout: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnFocusLoss: false,
        pauseOnHover: true,
        draggable: true
      })
    }
  }
  
  /**
   * Mark notification as read
   */
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)
      
      if (error) throw error
      
      // The real-time subscription will automatically update the state
      return { success: true }
    } catch (error) {
      return { success: false, error }
    }
  }
  
  /**
   * Mark all notifications as read
   */
  const markAllNotificationsAsRead = async () => {
    try {
      const authStore = useAuthStore()
      if (!authStore.adminUser?.id) {
        throw new Error('Admin user not found')
      }

      const { error } = await supabase
        .from('admin_notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('admin_user_id', authStore.adminUser.id)
        .eq('is_read', false)

      if (error) throw error

      // Toast will be shown by the calling component
      return { success: true }
    } catch (error) {
      // Error toast will be shown by the calling component
      return { success: false, error }
    }
  }
  
  /**
   * Delete notification
   */
  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .delete()
        .eq('id', notificationId)
      
      if (error) throw error
      
      // The real-time subscription will automatically update the state
      return { success: true }
    } catch (error) {
      return { success: false, error }
    }
  }
  
  /**
   * Create test notification (for testing purposes)
   */
  const createTestNotification = async () => {
    try {
      const { data: adminUser } = await supabase.auth.getUser()
      if (!adminUser.user) throw new Error('No authenticated user')
      
      // Get admin user ID from admin_users table
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', adminUser.user.email)
        .single()
      
      if (adminError || !adminData) throw new Error('Admin user not found')
      
      const testNotification = {
        admin_user_id: adminData.id,
        title: `🧪 Test Notification`,
        message: `Real-time test created at ${new Date().toLocaleTimeString()}`,
        type: 'info',
        priority: 'medium',
        is_read: false
      }
      
      const { error } = await supabase
        .from('admin_notifications')
        .insert([testNotification])
      
      if (error) throw error
      
      toast.success('Test notification created!')
      return { success: true }
    } catch (error) {
      toast.error('Failed to create test notification')
      return { success: false, error }
    }
  }
  
  /**
   * Mark messages as read for a conversation
   */
  const markMessagesAsRead = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('conversation_id', conversationId)
        .eq('sender_type', 'user')
        .eq('is_read', false)
      
      if (error) throw error
      
      // The real-time subscription will automatically update the state
      return { success: true }
    } catch (error) {
      return { success: false, error }
    }
  }
  
  /**
   * Create test message (for testing purposes)
   */
  const createTestMessage = async () => {
    try {
      // Get a conversation to add message to
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .limit(1)
      
      if (convError || !conversations?.length) {
        toast.error('No conversations found to add test message')
        return { success: false, error: 'No conversations found' }
      }
      
      const testMessage = {
        conversation_id: conversations[0].id,
        sender_type: 'user',
        message_content: `🧪 Test message created at ${new Date().toLocaleTimeString()} to verify real-time updates`,
        is_read: false
      }
      
      const { error } = await supabase
        .from('messages')
        .insert([testMessage])
      
      if (error) throw error
      
      toast.success('Test message created!')
      return { success: true }
    } catch (error) {
      toast.error('Failed to create test message')
      return { success: false, error }
    }
  }
  
  /**
   * Get notification utilities
   */
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return 'mdi-check-circle'
      case 'warning': return 'mdi-alert'
      case 'error': return 'mdi-alert-circle'
      case 'info':
      default: return 'mdi-information'
    }
  }
  
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'success'
      case 'warning': return 'warning'
      case 'error': return 'error'
      case 'info':
      default: return 'info'
    }
  }
  
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return 'mdi-alert'
      case 'medium': return 'mdi-information'
      case 'low':
      default: return 'mdi-circle-small'
    }
  }
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low':
      default: return 'info'
    }
  }
  
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    
    return time.toLocaleDateString()
  }
  
  /**
   * Update admin user (called when auth state changes)
   */
  const updateAdminUser = (adminUserId: string | null) => {
    realtimeService.updateAdminUser(adminUserId)
  }

  /**
   * Cleanup (called when app unmounts)
   */
  const cleanup = () => {
    realtimeService.cleanup()
  }
  
  return {
    // State
    ...state,

    // Methods
    initialize,
    updateAdminUser,
    forceRefresh,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    createTestNotification,
    markMessagesAsRead,
    createTestMessage,
    cleanup,

    // Utilities
    getNotificationIcon,
    getNotificationColor,
    getPriorityIcon,
    getPriorityColor,
    formatTimeAgo
  }
}
