import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { ApiService } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/config/supabase'

export interface AdminNotification {
  id: string
  admin_user_id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  priority: 'low' | 'medium' | 'high'
  category: 'system' | 'user_management' | 'orders' | 'products' | 'security' | 'appointments' | 'general'
  is_read: boolean
  metadata: Record<string, any>
  action_url?: string
  action_label?: string
  expires_at?: string
  created_at: string
  updated_at: string
  read_at?: string
}

export const useNotifications = () => {
  const toast = useToast()
  const authStore = useAuthStore()

  // State
  const notifications = ref<AdminNotification[]>([])
  const unreadCount = ref(0)
  const loading = ref(false)

  // Computed
  const unreadNotifications = computed(() => 
    notifications.value.filter(n => !n.is_read)
  )

  const notificationsByPriority = computed(() => ({
    high: notifications.value.filter(n => n.priority === 'high' && !n.is_read),
    medium: notifications.value.filter(n => n.priority === 'medium' && !n.is_read),
    low: notifications.value.filter(n => n.priority === 'low' && !n.is_read)
  }))

  // Methods
  const loadNotifications = async (page = 1, limit = 20, filters = {}) => {
    if (!authStore.adminUser?.id) return

    loading.value = true
    try {
      const { data, error, count } = await ApiService.getAdminNotifications(
        authStore.adminUser.id,
        page,
        limit,
        filters
      )

      if (error) throw error

      notifications.value = data
      return { data, count, error: null }
    } catch (error) {
      return { data: [], count: 0, error }
    } finally {
      loading.value = false
    }
  }

  const loadUnreadCount = async () => {
    if (!authStore.adminUser?.id) return

    try {
      const { data, error } = await ApiService.getUnreadNotificationCount(authStore.adminUser.id)
      if (error) throw error
      unreadCount.value = data
    } catch (error) {

    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const { data, error } = await ApiService.markNotificationAsRead(notificationId)
      if (error) throw error

      // Update local state
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification) {
        notification.is_read = true
        notification.read_at = new Date().toISOString()
      }

      // Update unread count
      unreadCount.value = Math.max(0, unreadCount.value - 1)

      return { data, error: null }
    } catch (error) {

      return { data: null, error }
    }
  }

  const markAllAsRead = async () => {
    if (!authStore.adminUser?.id) return

    try {
      const { data, error } = await ApiService.markAllNotificationsAsRead(authStore.adminUser.id)
      if (error) throw error

      // Update local state
      notifications.value.forEach(notification => {
        if (!notification.is_read) {
          notification.is_read = true
          notification.read_at = new Date().toISOString()
        }
      })

      unreadCount.value = 0
      toast.success('All notifications marked as read')

      return { data, error: null }
    } catch (error) {

      toast.error('Failed to mark all notifications as read')
      return { data: null, error }
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const { data, error } = await ApiService.deleteNotification(notificationId)
      if (error) throw error

      // Update local state
      const index = notifications.value.findIndex(n => n.id === notificationId)
      if (index > -1) {
        const notification = notifications.value[index]
        if (!notification.is_read) {
          unreadCount.value = Math.max(0, unreadCount.value - 1)
        }
        notifications.value.splice(index, 1)
      }

      return { data, error: null }
    } catch (error) {

      return { data: null, error }
    }
  }

  const bulkDelete = async (notificationIds: string[]) => {
    try {
      const { data, error } = await ApiService.bulkDeleteNotifications(notificationIds)
      if (error) throw error

      // Update local state
      notificationIds.forEach(id => {
        const index = notifications.value.findIndex(n => n.id === id)
        if (index > -1) {
          const notification = notifications.value[index]
          if (!notification.is_read) {
            unreadCount.value = Math.max(0, unreadCount.value - 1)
          }
          notifications.value.splice(index, 1)
        }
      })

      toast.success(`${notificationIds.length} notifications deleted`)
      return { data, error: null }
    } catch (error) {
      toast.error('Failed to delete notifications')
      return { data: null, error }
    }
  }

  // Note: Real-time subscriptions are now handled by the global real-time service
  // to prevent conflicts and ensure consistent state across all components

  // Utility functions
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
      case 'high': return 'mdi-chevron-triple-up'
      case 'medium': return 'mdi-chevron-double-up'
      case 'low':
      default: return 'mdi-chevron-up'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low':
      default: return 'success'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    
    return date.toLocaleDateString()
  }

  // Note: Lifecycle management is handled by the consuming component (AppLayout)
  // to avoid conflicts with multiple instances of the composable

  return {
    // State
    notifications,
    unreadCount,
    loading,
    
    // Computed
    unreadNotifications,
    notificationsByPriority,
    
    // Methods
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    bulkDelete,
    
    // Utilities
    getNotificationIcon,
    getNotificationColor,
    getPriorityIcon,
    getPriorityColor,
    formatTimeAgo
  }
}
