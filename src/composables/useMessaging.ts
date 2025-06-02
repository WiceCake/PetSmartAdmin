import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useToast } from 'vue-toastification'
import { supabase } from '@/config/supabase'
import { MessagingApiService, type Conversation, type Message, type ConversationFilters } from '@/services/messagingApi'
import { useGlobalRealtime } from '@/composables/useGlobalRealtime'

export function useMessaging() {
  const toast = useToast()

  // Use global real-time service for unread counts and real-time updates
  const { unreadMessageCount: globalUnreadMessageCount } = useGlobalRealtime()

  // State
  const conversations = ref<Conversation[]>([])
  const currentConversation = ref<Conversation | null>(null)
  const messages = ref<Message[]>([])
  const loading = ref(false)
  const messagesLoading = ref(false)
  const sending = ref(false)
  const stats = ref({
    total: 0,
    pending: 0,
    resolved: 0
  })

  // Remove local real-time subscriptions - use global service instead
  // Real-time subscriptions are now handled by the global realtimeService

  // Computed properties
  const unreadConversations = computed(() =>
    conversations.value.filter(c => c.unread_messages > 0)
  )

  // Use global unread count instead of local calculation
  const totalUnreadMessages = computed(() => globalUnreadMessageCount.value)

  // Keep loadUnreadMessageCount for backward compatibility but delegate to global service
  const loadUnreadMessageCount = async () => {
    // This is now handled by the global real-time service
    // No need to load separately as it's automatically updated
    return globalUnreadMessageCount.value
  }

  const pendingConversations = computed(() =>
    conversations.value.filter(c => c.status === 'pending')
  )

  const resolvedConversations = computed(() =>
    conversations.value.filter(c => c.status === 'resolved')
  )

  // Load conversations
  const loadConversations = async (page: number = 1, limit: number = 25, filters: ConversationFilters = {}) => {
    loading.value = true
    try {
      const { data, count, error } = await MessagingApiService.getConversations(page, limit, filters)
      
      if (error) throw error

      if (page === 1) {
        conversations.value = data
      } else {
        conversations.value.push(...data)
      }

      return { data, count, error: null }
    } catch (error) {

      toast.error('Failed to load conversations')
      return { data: [], count: 0, error }
    } finally {
      loading.value = false
    }
  }

  // Load single conversation
  const loadConversation = async (conversationId: string) => {
    try {
      const { data, error } = await MessagingApiService.getConversation(conversationId)
      
      if (error) throw error

      currentConversation.value = data
      return { data, error: null }
    } catch (error) {

      toast.error('Failed to load conversation')
      return { data: null, error }
    }
  }

  // Load messages for conversation
  const loadMessages = async (conversationId: string, page: number = 1, limit: number = 50) => {
    messagesLoading.value = true
    try {
      const { data, count, error } = await MessagingApiService.getMessages(conversationId, page, limit)
      
      if (error) throw error

      if (page === 1) {
        messages.value = data
      } else {
        messages.value.unshift(...data) // Prepend older messages
      }

      return { data, count, error: null }
    } catch (error) {

      toast.error('Failed to load messages')
      return { data: [], count: 0, error }
    } finally {
      messagesLoading.value = false
    }
  }

  // Send message
  const sendMessage = async (
    conversationId: string,
    senderId: string,
    senderType: 'user' | 'admin',
    messageContent: string,
    messageType: 'text' | 'image' | 'file' | 'system' = 'text'
  ) => {
    sending.value = true
    try {
      const { data, error } = await MessagingApiService.sendMessage(
        conversationId,
        senderId,
        senderType,
        messageContent,
        messageType
      )
      
      if (error) throw error

      // Add message to local state
      if (data) {
        messages.value.push(data)
      }

      return { data, error: null }
    } catch (error) {
      toast.error('Failed to send message')
      return { data: null, error }
    } finally {
      sending.value = false
    }
  }



  // Update conversation status
  const updateConversationStatus = async (conversationId: string, status: 'pending' | 'resolved') => {
    try {
      const { data, error } = await MessagingApiService.updateConversationStatus(conversationId, status)

      if (error) throw error

      // Update local state
      const conversationIndex = conversations.value.findIndex(c => c.id === conversationId)
      if (conversationIndex !== -1) {
        conversations.value[conversationIndex].status = status
      }

      if (currentConversation.value?.id === conversationId) {
        currentConversation.value.status = status
      }

      // Toast will be shown by the calling component
      return { data, error: null }
    } catch (error) {
      // Error toast will be shown by the calling component
      return { data: null, error }
    }
  }



  // Mark messages as read
  const markMessagesAsRead = async (conversationId: string, adminId: string) => {
    try {
      const { data, error } = await MessagingApiService.markMessagesAsRead(conversationId, adminId)
      
      if (error) throw error

      // Update local state
      messages.value.forEach(message => {
        if (message.conversation_id === conversationId && message.sender_type === 'user' && !message.is_read) {
          message.is_read = true
          message.read_at = new Date().toISOString()
        }
      })

      const conversationIndex = conversations.value.findIndex(c => c.id === conversationId)
      if (conversationIndex !== -1) {
        conversations.value[conversationIndex].unread_messages = 0
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }



  // Load statistics
  const loadStats = async () => {
    try {
      const { data, error } = await MessagingApiService.getConversationStats()
      
      if (error) throw error

      if (data) {
        stats.value = data
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Bulk operations - Simplified
  const bulkUpdateStatus = async (conversationIds: string[], status: 'pending' | 'resolved') => {
    try {
      const { data, error } = await MessagingApiService.bulkUpdateStatus(conversationIds, status)

      if (error) throw error

      // Update local state
      conversationIds.forEach(id => {
        const conversationIndex = conversations.value.findIndex(c => c.id === id)
        if (conversationIndex !== -1) {
          conversations.value[conversationIndex].status = status
        }
      })

      // Toast will be shown by the calling component
      return { data, error: null }
    } catch (error) {
      // Error toast will be shown by the calling component
      return { data: null, error }
    }
  }

  // Real-time subscriptions are now handled by the global service
  // This method is kept for backward compatibility but does nothing
  const setupRealTimeSubscriptions = () => {
    // Real-time subscriptions are handled by the global realtimeService
    // Individual components no longer need to set up their own subscriptions
    // The global service handles all real-time updates and badge counts
  }

  const cleanup = () => {
    // Real-time subscriptions are handled by the global service
    // No local cleanup needed
  }

  // Utility functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'resolved': return 'success'
      default: return 'default'
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

  return {
    // State
    conversations,
    currentConversation,
    messages,
    loading,
    messagesLoading,
    sending,
    stats,

    // Computed
    unreadConversations,
    totalUnreadMessages,
    pendingConversations,
    resolvedConversations,

    // Methods
    loadConversations,
    loadConversation,
    loadMessages,
    sendMessage,
    updateConversationStatus,
    markMessagesAsRead,
    loadStats,
    loadUnreadMessageCount,
    bulkUpdateStatus,
    setupRealTimeSubscriptions,
    cleanup,

    // Utilities
    getStatusColor,
    formatTimeAgo
  }
}
