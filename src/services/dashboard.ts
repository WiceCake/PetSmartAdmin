import { supabase, supabaseAdmin } from '@/config/supabase'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'

export interface DashboardMetrics {
  totalUsers: number
  totalPets: number
  totalOrders: number
  totalRevenue: number
  usersTrend: number
  petsTrend: number
  ordersTrend: number
  revenueTrend: number
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor?: string
    backgroundColor?: string
  }[]
}

export interface Activity {
  id: string
  title: string
  description: string
  type: 'success' | 'warning' | 'error' | 'info' | 'default'
  timestamp: Date
  user?: {
    name: string
    avatar?: string
  }
  category?: string
}

export class DashboardService {
  static async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      // Get current period metrics
      const [usersResult, petsResult, ordersResult, revenueResult] = await Promise.all([
        supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
        supabaseAdmin.from('pets').select('id', { count: 'exact', head: true }),
        supabaseAdmin.from('orders').select('id', { count: 'exact', head: true }),
        supabaseAdmin.from('orders').select('total_amount')
      ])

      // Get previous period for trend calculation (30 days ago)
      const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd')
      
      const [prevUsersResult, prevPetsResult, prevOrdersResult, prevRevenueResult] = await Promise.all([
        supabaseAdmin
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .lt('created_at', thirtyDaysAgo),
        supabaseAdmin
          .from('pets')
          .select('id', { count: 'exact', head: true })
          .lt('created_at', thirtyDaysAgo),
        supabaseAdmin
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .lt('created_at', thirtyDaysAgo),
        supabaseAdmin
          .from('orders')
          .select('total_amount')
          .lt('created_at', thirtyDaysAgo)
      ])

      // Calculate current metrics
      const totalUsers = usersResult.count || 0
      const totalPets = petsResult.count || 0
      const totalOrders = ordersResult.count || 0
      const totalRevenue = revenueResult.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

      // Calculate previous metrics
      const prevUsers = prevUsersResult.count || 0
      const prevPets = prevPetsResult.count || 0
      const prevOrders = prevOrdersResult.count || 0
      const prevRevenue = prevRevenueResult.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

      // Calculate trends
      const usersTrend = prevUsers > 0 ? ((totalUsers - prevUsers) / prevUsers) * 100 : 0
      const petsTrend = prevPets > 0 ? ((totalPets - prevPets) / prevPets) * 100 : 0
      const ordersTrend = prevOrders > 0 ? ((totalOrders - prevOrders) / prevOrders) * 100 : 0
      const revenueTrend = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0

      return {
        totalUsers,
        totalPets,
        totalOrders,
        totalRevenue,
        usersTrend: Math.round(usersTrend * 10) / 10,
        petsTrend: Math.round(petsTrend * 10) / 10,
        ordersTrend: Math.round(ordersTrend * 10) / 10,
        revenueTrend: Math.round(revenueTrend * 10) / 10
      }
    } catch (error) {

      // Return fallback data
      return {
        totalUsers: 0,
        totalPets: 0,
        totalOrders: 0,
        totalRevenue: 0,
        usersTrend: 0,
        petsTrend: 0,
        ordersTrend: 0,
        revenueTrend: 0
      }
    }
  }

  static async getPerformanceChartData(days = 7): Promise<ChartData> {
    try {
      const labels: string[] = []
      const data: number[] = []

      // Generate labels for the last N days
      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i)
        labels.push(format(date, 'MMM dd'))
      }

      // Get order data for each day
      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i)
        const startDate = startOfDay(date)
        const endDate = endOfDay(date)

        const { data: orders } = await supabaseAdmin
          .from('orders')
          .select('total_amount')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())

        const dayRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
        data.push(dayRevenue / 1000) // Convert to thousands for better chart display
      }

      return {
        labels,
        datasets: [
          {
            label: 'Revenue',
            data,
            borderColor: '#6366F1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)'
          }
        ]
      }
    } catch (error) {

      // Return fallback data
      const labels = Array.from({ length: days }, (_, i) => 
        format(subDays(new Date(), days - 1 - i), 'MMM dd')
      )
      return {
        labels,
        datasets: [
          {
            label: 'Revenue',
            data: Array.from({ length: days }, () => Math.random() * 10),
            borderColor: '#6366F1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)'
          }
        ]
      }
    }
  }

  static async getRecentActivities(limit = 10): Promise<Activity[]> {
    try {
      // Get recent orders as activities
      const { data: orders } = await supabaseAdmin
        .from('orders')
        .select(`
          id,
          total_amount,
          status,
          created_at,
          profiles:user_id (
            first_name,
            last_name,
            username,
            profile_pic
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      const activities: Activity[] = orders?.map(order => ({
        id: order.id,
        title: `${order.profiles?.first_name || order.profiles?.username || 'User'} placed an order`,
        description: `Order #${order.id.slice(-8)} - $${order.total_amount}`,
        type: order.status === 'completed' ? 'success' : 'info',
        timestamp: new Date(order.created_at),
        user: {
          name: `${order.profiles?.first_name || ''} ${order.profiles?.last_name || ''}`.trim() || order.profiles?.username || 'User',
          avatar: order.profiles?.profile_pic || undefined
        },
        category: 'Order'
      })) || []

      return activities
    } catch (error) {

      return []
    }
  }

  static async searchGlobal(query: string, limit = 10) {
    try {
      const searchTerm = `%${query}%`
      
      const [usersResult, petsResult, ordersResult] = await Promise.all([
        supabaseAdmin
          .from('profiles')
          .select('id, username, first_name, last_name, email')
          .or(`username.ilike.${searchTerm},first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},email.ilike.${searchTerm}`)
          .limit(limit),
        supabaseAdmin
          .from('pets')
          .select('id, name, breed, profiles:owner_id(username, first_name, last_name)')
          .ilike('name', searchTerm)
          .limit(limit),
        supabaseAdmin
          .from('orders')
          .select('id, total_amount, status, profiles:user_id(username, first_name, last_name)')
          .ilike('id', searchTerm)
          .limit(limit)
      ])

      const results = [
        ...(usersResult.data?.map(user => ({
          id: user.id,
          title: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'User',
          subtitle: user.email,
          type: 'user',
          icon: 'mdi-account'
        })) || []),
        ...(petsResult.data?.map(pet => ({
          id: pet.id,
          title: pet.name,
          subtitle: `${pet.breed} - Owner: ${pet.profiles?.first_name || pet.profiles?.username || 'Unknown'}`,
          type: 'pet',
          icon: 'mdi-paw'
        })) || []),
        ...(ordersResult.data?.map(order => ({
          id: order.id,
          title: `Order #${order.id.slice(-8)}`,
          subtitle: `$${order.total_amount} - ${order.status}`,
          type: 'order',
          icon: 'mdi-shopping'
        })) || [])
      ]

      return results
    } catch (error) {

      return []
    }
  }
}
