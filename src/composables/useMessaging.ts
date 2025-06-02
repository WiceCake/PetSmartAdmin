import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useToast } from 'vue-toastification'
import { supabase } from '@/config/supabase'
import { MessagingApiService, type Conversation, type Message, type ConversationFilters } from '@/services/messagingApi'

export function useMessaging() {
  const toast = useToast()

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

  // Real-time subscriptions
  let conversationsSubscription: any = null
  let messagesSubscription: any = null

  // Computed properties
  const unreadConversations = computed(() => 
    conversations.value.filter(c => c.unread_messages > 0)
  )

  const totalUnreadMessages = computed(() => 
    conversations.value.reduce((total, c) => total + c.unread_messages, 0)
  )

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

      toast.success(`Conversation marked as ${status}`)
      return { data, error: null }
    } catch (error) {

      toast.error('Failed to update conversation status')
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

      toast.success(`${conversationIds.length} conversations marked as ${status}`)
      return { data, error: null }
    } catch (error) {

      toast.error('Failed to update conversation status')
      return { data: null, error }
    }
  }

  // Real-time subscriptions with conversation reopening support
  const setupRealTimeSubscriptions = () => {
    // Subscribe to conversation changes (including status changes from reopening)
    conversationsSubscription = supabase
      .channel('conversations_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        (payload) => {


          if (payload.eventType === 'UPDATE') {
            const updatedConversation = payload.new as any

            // Update conversation in local state
            const conversationIndex = conversations.value.findIndex(c => c.id === updatedConversation.id)
            if (conversationIndex !== -1) {
              // Update status if it changed (e.g., from resolved to pending due to reopening)
              if (conversations.value[conversationIndex].status !== updatedConversation.status) {
                conversations.value[conversationIndex].status = updatedConversation.status

                // Show toast notification for reopened conversations
                if (updatedConversation.status === 'pending' && payload.old?.status === 'resolved') {
                  toast.info('A resolved conversation has been reopened by a customer')
                }
              }

              // Update other fields
              conversations.value[conversationIndex].last_message_at = updatedConversation.last_message_at
              conversations.value[conversationIndex].updated_at = updatedConversation.updated_at
            }

            // Update current conversation if viewing it
            if (currentConversation.value?.id === updatedConversation.id) {
              currentConversation.value.status = updatedConversation.status
              currentConversation.value.last_message_at = updatedConversation.last_message_at
              currentConversation.value.updated_at = updatedConversation.updated_at
            }
          }

          // Reload stats to reflect changes
          loadStats()
        }
      )
      .subscribe()

    // Subscribe to message changes (including read status updates)
    messagesSubscription = supabase
      .channel('messages_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        (payload) => {


          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as Message

            // Add to messages if viewing this conversation
            if (currentConversation.value?.id === newMessage.conversation_id) {
              const existingMessage = messages.value.find(m => m.id === newMessage.id)
              if (!existingMessage) {
                messages.value.push(newMessage)
              }
            }

            // Update conversation in list
            const conversationIndex = conversations.value.findIndex(c => c.id === newMessage.conversation_id)
            if (conversationIndex !== -1) {
              conversations.value[conversationIndex].last_message_content = newMessage.message_content
              conversations.value[conversationIndex].last_message_sender_type = newMessage.sender_type
              conversations.value[conversationIndex].last_message_created_at = newMessage.created_at
              conversations.value[conversationIndex].last_message_at = newMessage.created_at

              if (newMessage.sender_type === 'user') {
                conversations.value[conversationIndex].unread_messages += 1
              }
            }
          }

          if (payload.eventType === 'UPDATE') {
            const updatedMessage = payload.new as Message
            const oldMessage = payload.old as Message

            // Handle message read status changes
            if (updatedMessage.is_read !== oldMessage.is_read && updatedMessage.sender_type === 'user') {
              // Update message in local state if viewing this conversation
              if (currentConversation.value?.id === updatedMessage.conversation_id) {
                const messageIndex = messages.value.findIndex(m => m.id === updatedMessage.id)
                if (messageIndex !== -1) {
                  messages.value[messageIndex].is_read = updatedMessage.is_read
                  messages.value[messageIndex].read_at = updatedMessage.read_at
                }
              }

              // Update conversation unread count
              const conversationIndex = conversations.value.findIndex(c => c.id === updatedMessage.conversation_id)
              if (conversationIndex !== -1) {
                // Recalculate unread count for this conversation
                // This is a simplified approach - in production you might want to query the database
                if (updatedMessage.is_read) {
                  conversations.value[conversationIndex].unread_messages = Math.max(0,
                    conversations.value[conversationIndex].unread_messages - 1)
                } else {
                  conversations.value[conversationIndex].unread_messages += 1
                }
              }
            }
          }
        }
      )
      .subscribe()
  }

  const cleanup = () => {
    if (conversationsSubscription) {
      supabase.removeChannel(conversationsSubscription)
    }
    if (messagesSubscription) {
      supabase.removeChannel(messagesSubscription)
    }
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
    bulkUpdateStatus,
    setupRealTimeSubscriptions,
    cleanup,

    // Utilities
    getStatusColor,
    formatTimeAgo
  }
}
