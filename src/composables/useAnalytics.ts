import { ref, computed, onMounted, onUnmounted } from 'vue'
import { AnalyticsApiService } from '@/services/analyticsApi'
import type { 
  AnalyticsMetrics, 
  TimeSeriesData, 
  PetStatistics, 
  OrderStatistics, 
  ConversationMetrics 
} from '@/services/analyticsApi'
import { supabase } from '@/config/supabase'
import { useToast } from 'vue-toastification'

export function useAnalytics() {
  const toast = useToast()

  // State
  const loading = ref(false)
  const metrics = ref<AnalyticsMetrics>({
    totalUsers: 0,
    totalPets: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalConversations: 0,
    pendingConversations: 0,
    resolvedConversations: 0,
    unreadMessages: 0,
    usersTrend: 0,
    petsTrend: 0,
    ordersTrend: 0,
    revenueTrend: 0,
    conversationsTrend: 0
  })

  const userRegistrationTrends = ref<TimeSeriesData>({
    labels: [],
    datasets: []
  })

  const revenueTrends = ref<TimeSeriesData>({
    labels: [],
    datasets: []
  })

  const petStatistics = ref<PetStatistics>({
    dogs: 0,
    cats: 0,
    total: 0,
    dogsPercentage: 0,
    catsPercentage: 0
  })

  const orderStatistics = ref<OrderStatistics>({
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    total: 0
  })

  const conversationMetrics = ref<ConversationMetrics>({
    averageResponseTime: 0,
    resolutionRate: 0,
    totalMessages: 0,
    customerSatisfaction: 0
  })

  const recentActivities = ref<any[]>([])

  // Real-time subscriptions
  let metricsSubscription: any = null
  let ordersSubscription: any = null
  let conversationsSubscription: any = null

  // Computed properties
  const totalRevenueTrend = computed(() => {
    const trend = metrics.value.revenueTrend
    return {
      value: Math.abs(trend),
      isPositive: trend >= 0,
      formatted: `${trend >= 0 ? '+' : ''}${trend.toFixed(1)}%`
    }
  })

  const totalUsersTrend = computed(() => {
    const trend = metrics.value.usersTrend
    return {
      value: Math.abs(trend),
      isPositive: trend >= 0,
      formatted: `${trend >= 0 ? '+' : ''}${trend.toFixed(1)}%`
    }
  })

  const formattedRevenue = computed(() => {
    const revenue = metrics.value.totalRevenue
    if (revenue >= 1000000) {
      return `$${(revenue / 1000000).toFixed(1)}M`
    } else if (revenue >= 1000) {
      return `$${(revenue / 1000).toFixed(1)}K`
    }
    return `$${revenue.toFixed(0)}`
  })

  // Methods
  const loadAnalyticsMetrics = async (days = 30) => {
    loading.value = true
    try {
      const data = await AnalyticsApiService.getAnalyticsMetrics(days)
      metrics.value = data
    } catch (error) {

      toast.error('Failed to load analytics metrics')
    } finally {
      loading.value = false
    }
  }

  const loadUserRegistrationTrends = async (days = 30) => {
    try {
      const data = await AnalyticsApiService.getUserRegistrationTrends(days)
      userRegistrationTrends.value = data
    } catch (error) {

      toast.error('Failed to load user registration trends')
    }
  }

  const loadRevenueTrends = async (days = 30) => {
    try {
      const data = await AnalyticsApiService.getRevenueTrends(days)
      revenueTrends.value = data
    } catch (error) {

      toast.error('Failed to load revenue trends')
    }
  }

  const loadPetStatistics = async () => {
    try {
      const data = await AnalyticsApiService.getPetStatistics()
      petStatistics.value = data
    } catch (error) {

      toast.error('Failed to load pet statistics')
    }
  }

  const loadOrderStatistics = async () => {
    try {
      const data = await AnalyticsApiService.getOrderStatistics()
      orderStatistics.value = data
    } catch (error) {
      toast.error('Failed to load order statistics')
    }
  }

  const loadConversationMetrics = async () => {
    try {
      const data = await AnalyticsApiService.getConversationMetrics()
      conversationMetrics.value = data
    } catch (error) {
      toast.error('Failed to load conversation metrics')
    }
  }

  const loadRecentActivities = async (limit = 10) => {
    try {
      const data = await AnalyticsApiService.getRecentActivities(limit)
      recentActivities.value = data
    } catch (error) {
      toast.error('Failed to load recent activities')
    }
  }

  const loadAllAnalytics = async (days = 30) => {
    await Promise.all([
      loadAnalyticsMetrics(days),
      loadUserRegistrationTrends(days),
      loadRevenueTrends(days),
      loadPetStatistics(),
      loadOrderStatistics(),
      loadConversationMetrics(),
      loadRecentActivities()
    ])
  }

  const refreshMetrics = async () => {
    await loadAnalyticsMetrics()
  }

  // Real-time subscriptions
  const setupRealTimeSubscriptions = () => {
    // Subscribe to profile changes for user metrics
    metricsSubscription = supabase
      .channel('analytics_profiles')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          // Refresh metrics when users are added/updated
          refreshMetrics()
        }
      )
      .subscribe()

    // Subscribe to order changes
    ordersSubscription = supabase
      .channel('analytics_orders')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          // Refresh metrics when orders change
          refreshMetrics()
          loadOrderStatistics()
        }
      )
      .subscribe()

    // Subscribe to conversation changes
    conversationsSubscription = supabase
      .channel('analytics_conversations')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        () => {
          // Refresh metrics when conversations change
          refreshMetrics()
          loadConversationMetrics()
        }
      )
      .subscribe()
  }

  const cleanup = () => {
    if (metricsSubscription) {
      supabase.removeChannel(metricsSubscription)
    }
    if (ordersSubscription) {
      supabase.removeChannel(ordersSubscription)
    }
    if (conversationsSubscription) {
      supabase.removeChannel(conversationsSubscription)
    }
  }

  // Utility functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount).replace('PHP', '₱').replace('₱ ', '₱')
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-PH').format(num)
  }

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`
  }

  const getTrendColor = (trend: number) => {
    return trend >= 0 ? 'success' : 'error'
  }

  const getTrendIcon = (trend: number) => {
    return trend >= 0 ? 'mdi-trending-up' : 'mdi-trending-down'
  }

  return {
    // State
    loading,
    metrics,
    userRegistrationTrends,
    revenueTrends,
    petStatistics,
    orderStatistics,
    conversationMetrics,
    recentActivities,

    // Computed
    totalRevenueTrend,
    totalUsersTrend,
    formattedRevenue,

    // Methods
    loadAnalyticsMetrics,
    loadUserRegistrationTrends,
    loadRevenueTrends,
    loadPetStatistics,
    loadOrderStatistics,
    loadConversationMetrics,
    loadRecentActivities,
    loadAllAnalytics,
    refreshMetrics,
    setupRealTimeSubscriptions,
    cleanup,

    // Utilities
    formatCurrency,
    formatNumber,
    formatPercentage,
    getTrendColor,
    getTrendIcon
  }
}
