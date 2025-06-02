import { supabase } from '@/config/supabase'

export interface Conversation {
  id: string
  user_id: string
  status: 'pending' | 'resolved'
  subject: string | null
  last_message_at: string
  created_at: string
  updated_at: string
  // From view
  user_email: string
  user_first_name: string
  user_last_name: string
  total_messages: number
  unread_messages: number
  last_message_content: string | null
  last_message_sender_type: 'user' | 'admin' | null
  last_message_created_at: string | null
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  sender_type: 'user' | 'admin'
  message_content: string
  message_type: 'text' | 'image' | 'file' | 'system'
  is_read: boolean
  read_at: string | null
  created_at: string
  updated_at: string
}

export interface ConversationFilters {
  status?: string
  search?: string
}

export class MessagingApiService {
  // Get conversations with pagination and filtering
  static async getConversations(
    page: number = 1,
    limit: number = 25,
    filters: ConversationFilters = {}
  ) {
    try {
      let query = supabase
        .from('conversation_details')
        .select('*', { count: 'exact' })
        .order('last_message_at', { ascending: false })

      // Apply filters - Simplified
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.search) {
        query = query.or(`subject.ilike.%${filters.search}%,user_email.ilike.%${filters.search}%,last_message_content.ilike.%${filters.search}%`)
      }

      // Apply pagination
      const from = (page - 1) * limit
      const to = from + limit - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error

      return {
        data: data as Conversation[],
        count: count || 0,
        error: null
      }
    } catch (error) {

      return {
        data: [],
        count: 0,
        error: error as Error
      }
    }
  }

  // Get single conversation by ID
  static async getConversation(conversationId: string) {
    try {
      const { data, error } = await supabase
        .from('conversation_details')
        .select('*')
        .eq('id', conversationId)
        .single()

      if (error) throw error

      return {
        data: data as Conversation,
        error: null
      }
    } catch (error) {

      return {
        data: null,
        error: error as Error
      }
    }
  }

  // Get messages for a conversation
  static async getMessages(conversationId: string, page: number = 1, limit: number = 50) {
    try {
      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data, error, count } = await supabase
        .from('messages')
        .select('*', { count: 'exact' })
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .range(from, to)

      if (error) throw error

      return {
        data: data as Message[],
        count: count || 0,
        error: null
      }
    } catch (error) {
      return {
        data: [],
        count: 0,
        error: error as Error
      }
    }
  }

  // Send a message (with automatic conversation reopening handled by database trigger)
  static async sendMessage(
    conversationId: string,
    senderId: string,
    senderType: 'user' | 'admin',
    messageContent: string,
    messageType: 'text' | 'image' | 'file' | 'system' = 'text'
  ) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          sender_type: senderType,
          message_content: messageContent,
          message_type: messageType
        })
        .select()
        .single()

      if (error) throw error

      return {
        data: data as Message,
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }



  // Update conversation status
  static async updateConversationStatus(conversationId: string, status: 'pending' | 'resolved') {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .update({ status })
        .eq('id', conversationId)
        .select()
        .single()

      if (error) throw error

      return {
        data: data,
        error: null
      }
    } catch (error) {

      return {
        data: null,
        error: error as Error
      }
    }
  }



  // Mark messages as read
  static async markMessagesAsRead(conversationId: string, adminId: string) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('conversation_id', conversationId)
        .eq('sender_type', 'user')
        .eq('is_read', false)
        .select()

      if (error) throw error

      return {
        data: data,
        error: null
      }
    } catch (error) {

      return {
        data: null,
        error: error as Error
      }
    }
  }

  // Get conversation statistics - Simplified
  static async getConversationStats() {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('status')

      if (error) throw error

      const stats = {
        total: data.length,
        pending: data.filter(c => c.status === 'pending').length,
        resolved: data.filter(c => c.status === 'resolved').length
      }

      return {
        data: stats,
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error
      }
    }
  }

  // Get total unread message count from customers
  static async getTotalUnreadMessageCount() {
    try {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender_type', 'user')
        .eq('is_read', false)

      if (error) throw error

      return {
        data: count || 0,
        error: null
      }
    } catch (error) {

      return {
        data: 0,
        error: error as Error
      }
    }
  }

  // Bulk operations - Simplified
  static async bulkUpdateStatus(conversationIds: string[], status: 'pending' | 'resolved') {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .update({ status })
        .in('id', conversationIds)
        .select()

      if (error) throw error

      return {
        data: data,
        error: null
      }
    } catch (error) {

      return {
        data: null,
        error: error as Error
      }
    }
  }
}
