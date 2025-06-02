import { supabase, supabaseAdmin } from '@/config/supabase'
import { format, subDays, startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns'

export interface AnalyticsMetrics {
  totalUsers: number
  totalPets: number
  totalOrders: number
  totalRevenue: number
  totalConversations: number
  pendingConversations: number
  resolvedConversations: number
  unreadMessages: number
  usersTrend: number
  petsTrend: number
  ordersTrend: number
  revenueTrend: number
  conversationsTrend: number
}

export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

export interface TimeSeriesData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor: string
    backgroundColor: string
    tension?: number
  }[]
}

export interface PetStatistics {
  dogs: number
  cats: number
  total: number
  dogsPercentage: number
  catsPercentage: number
}

export interface OrderStatistics {
  pending: number
  processing: number
  shipped: number
  delivered: number
  cancelled: number
  total: number
}

export interface ConversationMetrics {
  averageResponseTime: number
  resolutionRate: number
  totalMessages: number
  customerSatisfaction: number
}

export class AnalyticsApiService {
  // Get comprehensive analytics metrics
  static async getAnalyticsMetrics(days = 30): Promise<AnalyticsMetrics> {
    try {
      const startDate = subDays(new Date(), days)
      const prevStartDate = subDays(startDate, days)

      // Current period metrics
      const [
        usersResult,
        petsResult,
        ordersResult,
        revenueResult,
        conversationsResult,
        messagesResult
      ] = await Promise.all([
        supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
        supabaseAdmin.from('pets').select('id', { count: 'exact', head: true }),
        supabaseAdmin.from('orders').select('id', { count: 'exact', head: true }),
        supabaseAdmin.from('orders').select('total_amount').not('status', 'eq', 'cancelled'),
        supabaseAdmin.from('conversations').select('id, status', { count: 'exact' }),
        supabaseAdmin
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('sender_type', 'user')
          .eq('is_read', false)
      ])

      // Previous period metrics for trend calculation
      const [
        prevUsersResult,
        prevPetsResult,
        prevOrdersResult,
        prevRevenueResult,
        prevConversationsResult
      ] = await Promise.all([
        supabaseAdmin
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .lt('created_at', startDate.toISOString()),
        supabaseAdmin
          .from('pets')
          .select('id', { count: 'exact', head: true })
          .lt('created_at', startDate.toISOString()),
        supabaseAdmin
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .lt('created_at', startDate.toISOString()),
        supabaseAdmin
          .from('orders')
          .select('total_amount')
          .not('status', 'eq', 'cancelled')
          .lt('created_at', startDate.toISOString()),
        supabaseAdmin
          .from('conversations')
          .select('id', { count: 'exact', head: true })
          .lt('created_at', startDate.toISOString())
      ])

      // Calculate current metrics
      const totalUsers = usersResult.count || 0
      const totalPets = petsResult.count || 0
      const totalOrders = ordersResult.count || 0
      const totalRevenue = revenueResult.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
      const totalConversations = conversationsResult.count || 0
      const unreadMessages = messagesResult.count || 0

      // Calculate conversation status counts
      const pendingConversations = conversationsResult.data?.filter(c => c.status === 'pending').length || 0
      const resolvedConversations = conversationsResult.data?.filter(c => c.status === 'resolved').length || 0

      // Calculate previous metrics
      const prevTotalUsers = prevUsersResult.count || 0
      const prevTotalPets = prevPetsResult.count || 0
      const prevTotalOrders = prevOrdersResult.count || 0
      const prevTotalRevenue = prevRevenueResult.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
      const prevTotalConversations = prevConversationsResult.count || 0

      // Calculate trends (percentage change)
      const usersTrend = prevTotalUsers > 0 ? ((totalUsers - prevTotalUsers) / prevTotalUsers) * 100 : 0
      const petsTrend = prevTotalPets > 0 ? ((totalPets - prevTotalPets) / prevTotalPets) * 100 : 0
      const ordersTrend = prevTotalOrders > 0 ? ((totalOrders - prevTotalOrders) / prevTotalOrders) * 100 : 0
      const revenueTrend = prevTotalRevenue > 0 ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100 : 0
      const conversationsTrend = prevTotalConversations > 0 ? ((totalConversations - prevTotalConversations) / prevTotalConversations) * 100 : 0

      return {
        totalUsers,
        totalPets,
        totalOrders,
        totalRevenue,
        totalConversations,
        pendingConversations,
        resolvedConversations,
        unreadMessages,
        usersTrend,
        petsTrend,
        ordersTrend,
        revenueTrend,
        conversationsTrend
      }
    } catch (error) {

      throw error
    }
  }

  // Get user registration trends (daily aggregation)
  static async getUserRegistrationTrends(days = 30): Promise<TimeSeriesData> {
    try {
      const labels: string[] = []
      const data: number[] = []
      const dailyData = new Map<string, number>()

      // Calculate the date range
      const endDate = new Date()
      const startDate = subDays(endDate, days - 1) // Include the current day



      // Get all user registrations within the date range
      const { data: users } = await supabaseAdmin
        .from('profiles')
        .select('created_at')
        .gte('created_at', startOfDay(startDate).toISOString())
        .lte('created_at', endOfDay(endDate).toISOString())

      // Group users by day
      users?.forEach(user => {
        const userDate = new Date(user.created_at)
        const dayKey = format(userDate, 'yyyy-MM-dd')

        if (!dailyData.has(dayKey)) {
          dailyData.set(dayKey, 0)
        }
        dailyData.set(dayKey, (dailyData.get(dayKey) || 0) + 1)
      })

      // Generate daily labels for the time period
      for (let i = 0; i < days; i++) {
        const currentDate = subDays(endDate, days - 1 - i)
        const dayKey = format(currentDate, 'yyyy-MM-dd')
        const dayLabel = format(currentDate, 'MMM dd')

        labels.push(dayLabel)
        data.push(dailyData.get(dayKey) || 0)
      }



      return {
        labels,
        datasets: [
          {
            label: 'New Users',
            data,
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4
          }
        ]
      }
    } catch (error) {

      throw error
    }
  }

  // Get pet statistics
  static async getPetStatistics(): Promise<PetStatistics> {
    try {
      const { data: pets } = await supabaseAdmin
        .from('pets')
        .select('type')

      const dogs = pets?.filter(pet => pet.type?.toLowerCase() === 'dog').length || 0
      const cats = pets?.filter(pet => pet.type?.toLowerCase() === 'cat').length || 0
      const total = pets?.length || 0

      return {
        dogs,
        cats,
        total,
        dogsPercentage: total > 0 ? (dogs / total) * 100 : 0,
        catsPercentage: total > 0 ? (cats / total) * 100 : 0
      }
    } catch (error) {

      throw error
    }
  }

  // Get order statistics
  static async getOrderStatistics(): Promise<OrderStatistics> {
    try {
      const { data: orders } = await supabaseAdmin
        .from('orders')
        .select('status')

      const pending = orders?.filter(order => order.status === 'pending').length || 0
      const processing = orders?.filter(order => order.status === 'processing').length || 0
      const shipped = orders?.filter(order => order.status === 'shipped').length || 0
      const delivered = orders?.filter(order => order.status === 'delivered').length || 0
      const cancelled = orders?.filter(order => order.status === 'cancelled').length || 0
      const total = orders?.length || 0

      return {
        pending,
        processing,
        shipped,
        delivered,
        cancelled,
        total
      }
    } catch (error) {

      throw error
    }
  }

  // Get revenue trends (daily aggregation)
  static async getRevenueTrends(days = 30): Promise<TimeSeriesData> {
    try {
      const labels: string[] = []
      const data: number[] = []
      const dailyData = new Map<string, number>()

      // Calculate the date range
      const endDate = new Date()
      const startDate = subDays(endDate, days - 1) // Include the current day



      // Get all orders within the date range
      const { data: orders } = await supabaseAdmin
        .from('orders')
        .select('total_amount, created_at')
        .not('status', 'eq', 'cancelled')
        .gte('created_at', startOfDay(startDate).toISOString())
        .lte('created_at', endOfDay(endDate).toISOString())

      // Group orders by day and sum revenue
      orders?.forEach(order => {
        const orderDate = new Date(order.created_at)
        const dayKey = format(orderDate, 'yyyy-MM-dd')

        if (!dailyData.has(dayKey)) {
          dailyData.set(dayKey, 0)
        }
        dailyData.set(dayKey, (dailyData.get(dayKey) || 0) + (order.total_amount || 0))
      })

      // Generate daily labels for the time period
      for (let i = 0; i < days; i++) {
        const currentDate = subDays(endDate, days - 1 - i)
        const dayKey = format(currentDate, 'yyyy-MM-dd')
        const dayLabel = format(currentDate, 'MMM dd')

        labels.push(dayLabel)
        data.push(dailyData.get(dayKey) || 0)
      }

      return {
        labels,
        datasets: [
          {
            label: 'Revenue (₱)',
            data,
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4
          }
        ]
      }
    } catch (error) {
      throw error
    }
  }

  // Get conversation metrics
  static async getConversationMetrics(): Promise<ConversationMetrics> {
    try {
      const { data: conversations } = await supabaseAdmin
        .from('conversations')
        .select('status, created_at, updated_at')

      const { data: messages } = await supabaseAdmin
        .from('messages')
        .select('conversation_id, sender_type, created_at')

      const totalConversations = conversations?.length || 0
      const resolvedConversations = conversations?.filter(c => c.status === 'resolved').length || 0
      const resolutionRate = totalConversations > 0 ? (resolvedConversations / totalConversations) * 100 : 0

      // Calculate average response time (simplified)
      const averageResponseTime = 2.5 // hours (placeholder - would need more complex calculation)

      const totalMessages = messages?.length || 0
      const customerSatisfaction = 85 // percentage (placeholder - would come from surveys)

      return {
        averageResponseTime,
        resolutionRate,
        totalMessages,
        customerSatisfaction
      }
    } catch (error) {

      throw error
    }
  }

  // Get recent activities
  static async getRecentActivities(limit = 10) {
    try {
      const activities = []

      // Get recent user registrations
      const { data: recentUsers } = await supabaseAdmin
        .from('profiles')
        .select('first_name, last_name, created_at')
        .order('created_at', { ascending: false })
        .limit(3)

      recentUsers?.forEach(user => {
        activities.push({
          id: `user-${user.created_at}`,
          type: 'user_registration',
          title: 'New User Registration',
          description: `${user.first_name} ${user.last_name} joined the platform`,
          timestamp: new Date(user.created_at),
          icon: 'mdi-account-plus',
          color: 'primary'
        })
      })

      // Get recent orders with proper relationship handling
      const { data: recentOrders } = await supabaseAdmin
        .from('orders')
        .select('id, total_amount, status, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(3)

      // Get order activities with user details
      const orderActivities = []
      if (recentOrders) {
        for (const order of recentOrders) {
          let customerInfo = 'Unknown Customer'
          if (order.user_id) {
            const { data: userProfiles, error: profileError } = await supabaseAdmin
              .from('profiles')
              .select('first_name, last_name, username')
              .eq('id', order.user_id)
              .limit(1)

            if (!profileError && userProfiles && userProfiles.length > 0) {
              const userProfile = userProfiles[0]
              customerInfo = `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || userProfile.username || 'Unknown Customer'
            }
          }

          orderActivities.push({
            id: `order-${order.id}`,
            type: 'order',
            title: 'New Order',
            description: `Order #${order.id.slice(0, 8)} - ₱${Number(order.total_amount).toLocaleString()} by ${customerInfo}`,
            timestamp: new Date(order.created_at),
            icon: 'mdi-shopping',
            color: 'success'
          })
        }
      }

      // Add order activities to main activities array
      activities.push(...orderActivities)

      // Get recent conversations with proper user relationship
      const { data: recentConversations } = await supabaseAdmin
        .from('conversations')
        .select(`
          id, subject, created_at, user_id
        `)
        .order('created_at', { ascending: false })
        .limit(2)

      // Get user details separately for conversations
      const conversationActivities = []
      if (recentConversations) {
        for (const conversation of recentConversations) {
          let userProfile = null
          if (conversation.user_id) {
            const { data: userProfiles, error: profileError } = await supabaseAdmin
              .from('profiles')
              .select('first_name, last_name, username')
              .eq('id', conversation.user_id)
              .limit(1)

            if (!profileError && userProfiles && userProfiles.length > 0) {
              userProfile = userProfiles[0]
            }
          }

          conversationActivities.push({
            id: `conversation-${conversation.id}`,
            type: 'conversation',
            title: 'New Conversation',
            description: conversation.subject || 'Customer inquiry',
            timestamp: new Date(conversation.created_at),
            icon: 'mdi-message',
            color: 'info',
            user: userProfile
          })
        }
      }

      // Add conversation activities to main activities array
      activities.push(...conversationActivities)

      // Sort by timestamp and limit
      return activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit)

    } catch (error) {

      throw error
    }
  }
}
