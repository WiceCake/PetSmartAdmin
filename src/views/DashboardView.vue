<template>
  <div class="dashboard-view">
    <!-- Professional Header - Following ProductsView Pattern -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">Dashboard Overview</h1>
          <p class="page-subtitle">Welcome back, {{ adminName }}! Here's what's happening with your business today.</p>
        </div>
        <div class="header-actions">
          <v-select
            v-model="performanceTimeframe"
            :items="timeframeOptions"
            item-title="title"
            item-value="value"
            variant="outlined"
            density="comfortable"
            hide-details
            style="min-width: 140px;"
            @update:model-value="handleTimeframeChange"
            class="timeframe-select me-3"
          />
          <v-btn
            color="primary"
            size="large"
            variant="outlined"
            prepend-icon="mdi-refresh"
            @click="refreshDashboard"
            :loading="loading"
            class="refresh-btn me-3"
          >
            Refresh
          </v-btn>
          <v-btn
            color="primary"
            size="large"
            variant="flat"
            prepend-icon="mdi-view-dashboard"
            @click="$router.push('/analytics')"
            class="analytics-btn"
          >
            Analytics
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <v-row class="stats-section mb-6">
      <v-col
        v-for="stat in stats"
        :key="stat.title"
        cols="12"
        sm="6"
        md="3"
      >
        <v-card
          rounded="xl"
          class="stats-card"
          elevation="2"
          :class="{ 'stats-card--loading': loading }"
          @click="handleStatClick(stat)"
        >
          <v-card-text class="pa-4">
            <div class="d-flex align-center">
              <div class="stats-icon-container me-3">
                <v-icon :icon="stat.icon" size="32" :color="stat.color" />
              </div>
              <div class="flex-grow-1">
                <div class="d-flex align-center justify-space-between">
                  <div class="text-h5 font-weight-bold">{{ stat.value }}</div>
                  <v-chip
                    v-if="stat.trend !== null"
                    :color="getTrendColor(stat.trend)"
                    size="x-small"
                    variant="tonal"
                  >
                    <v-icon :icon="getTrendIcon(stat.trend)" size="10" class="me-1" />
                    {{ Math.abs(stat.trend).toFixed(1) }}%
                  </v-chip>
                </div>
                <div class="text-body-2 text-on-surface-variant">{{ stat.title }}</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>



    <!-- Recent Activities Section -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card rounded="xl" elevation="2">
          <v-card-title class="pa-6 pb-4">
            <div class="d-flex align-center justify-space-between w-100">
              <div class="d-flex align-center">
                <v-icon icon="mdi-timeline" class="me-2" />
                <span class="text-h6 font-weight-bold">Recent Activities</span>
              </div>
              <v-btn
                variant="text"
                size="small"
                @click="$router.push('/analytics')"
              >
                View Analytics
              </v-btn>
            </div>
          </v-card-title>

          <v-card-text class="pa-0">
            <div v-if="dataLoading" class="text-center py-8">
              <v-progress-circular indeterminate color="primary" />
              <p class="text-body-2 text-on-surface-variant mt-2">Loading activities...</p>
            </div>
            <div v-else-if="recentActivitiesData.length > 0" class="activity-list">
              <div
                v-for="(activity, index) in recentActivitiesData"
                :key="activity.id"
                class="activity-item"
                :class="{ 'activity-item--last': index === recentActivitiesData.length - 1 }"
              >
                <!-- Timeline dot -->
                <div class="activity-timeline">
                  <div
                    class="activity-dot"
                    :class="`activity-dot--${activity.color}`"
                  >
                    <v-icon
                      :icon="activity.icon"
                      size="14"
                      color="white"
                    />
                  </div>
                  <div
                    v-if="index !== recentActivitiesData.length - 1"
                    class="activity-line"
                  />
                </div>

                <!-- Activity content -->
                <div class="activity-content">
                  <div class="d-flex align-start justify-space-between mb-2">
                    <div class="activity-main">
                      <h4 class="text-subtitle-1 font-weight-medium mb-1">
                        {{ activity.title }}
                      </h4>
                      <p class="text-body-2 text-on-surface-variant mb-2">
                        {{ activity.description }}
                      </p>

                      <!-- Activity metadata -->
                      <div class="d-flex align-center flex-wrap gap-2">
                        <v-chip
                          size="x-small"
                          variant="tonal"
                          :color="activity.color"
                        >
                          <v-icon
                            :icon="activity.icon"
                            size="12"
                            class="me-1"
                          />
                          {{ activity.type }}
                        </v-chip>
                      </div>
                    </div>

                    <div class="activity-time text-caption text-on-surface-variant">
                      {{ formatTime(activity.timestamp) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8">
              <v-icon icon="mdi-timeline" size="48" color="grey" />
              <p class="text-body-2 text-grey mt-2">No recent activities</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Activity -->
    <v-row>
      <!-- Recent Orders -->
      <v-col cols="12" md="6">
        <v-card rounded="xl" elevation="2">
          <v-card-title class="pa-6 pb-4">
            <div class="d-flex justify-space-between align-center w-100">
              <div class="d-flex align-center">
                <v-icon icon="mdi-shopping" class="me-2" />
                <span class="text-h6 font-weight-bold">Recent Orders</span>
              </div>
              <v-btn
                variant="text"
                size="small"
                @click="$router.push('/orders')"
              >
                View All
              </v-btn>
            </div>
          </v-card-title>
          <v-card-text class="pa-6 pt-0">
            <div v-if="dataLoading" class="text-center py-8">
              <v-progress-circular indeterminate color="primary" />
              <p class="text-body-2 text-on-surface-variant mt-2">Loading orders...</p>
            </div>
            <div v-else-if="recentOrdersData.length > 0">
              <v-list density="compact">
                <v-list-item
                  v-for="order in recentOrdersData"
                  :key="order.id"
                  @click="$router.push(`/orders/${order.id}`)"
                  class="px-0 rounded-lg mb-2"
                  style="cursor: pointer;"
                >
                  <template v-slot:prepend>
                    <v-avatar size="32" color="info" variant="tonal">
                      <v-icon>mdi-shopping</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="text-body-2 font-weight-medium">
                    Order #{{ order.id.slice(-8) }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ order.customer_name }} • {{ formatDate(order.created_at) }}
                  </v-list-item-subtitle>
                  <template v-slot:append>
                    <div class="d-flex flex-column align-end">
                      <v-chip
                        :color="getOrderStatusColor(order.status)"
                        size="small"
                        variant="tonal"
                      >
                        {{ order.status }}
                      </v-chip>
                      <span class="text-caption mt-1 font-weight-medium">
                        {{ formatCurrency(order.total_amount) }}
                      </span>
                    </div>
                  </template>
                </v-list-item>
              </v-list>
            </div>
            <div v-else class="text-center py-8">
              <v-icon icon="mdi-shopping" size="48" color="grey" />
              <p class="text-body-2 text-grey mt-2">No recent orders</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Recent Conversations -->
      <v-col cols="12" md="6">
        <v-card rounded="xl" elevation="2">
          <v-card-title class="pa-6 pb-4">
            <div class="d-flex justify-space-between align-center w-100">
              <div class="d-flex align-center">
                <v-icon icon="mdi-message" class="me-2" />
                <span class="text-h6 font-weight-bold">Recent Conversations</span>
              </div>
              <v-btn
                variant="text"
                size="small"
                @click="$router.push('/messages')"
              >
                View All
              </v-btn>
            </div>
          </v-card-title>
          <v-card-text class="pa-6 pt-0">
            <div v-if="dataLoading" class="text-center py-8">
              <v-progress-circular indeterminate color="primary" />
              <p class="text-body-2 text-on-surface-variant mt-2">Loading conversations...</p>
            </div>
            <div v-else-if="recentConversationsData.length > 0">
              <v-list density="compact">
                <v-list-item
                  v-for="conversation in recentConversationsData"
                  :key="conversation.id"
                  @click="$router.push(`/messages/${conversation.id}`)"
                  class="px-0 rounded-lg mb-2"
                  style="cursor: pointer;"
                >
                  <template v-slot:prepend>
                    <v-avatar size="32" color="primary" variant="tonal">
                      <v-icon>mdi-account</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="text-body-2 font-weight-medium">
                    {{ conversation.user_name }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ conversation.last_message }} • {{ formatTime(conversation.updated_at) }}
                  </v-list-item-subtitle>
                  <template v-slot:append>
                    <div class="d-flex flex-column align-end">
                      <v-chip
                        :color="conversation.status === 'pending' ? 'warning' : 'success'"
                        size="small"
                        variant="tonal"
                      >
                        {{ conversation.status }}
                      </v-chip>
                      <v-badge
                        v-if="conversation.unread_count > 0"
                        :content="conversation.unread_count"
                        color="error"
                        class="mt-1"
                      >
                        <v-icon size="16" color="grey">mdi-message</v-icon>
                      </v-badge>
                    </div>
                  </template>
                </v-list-item>
              </v-list>
            </div>
            <div v-else class="text-center py-8">
              <v-icon icon="mdi-message" size="48" color="grey" />
              <p class="text-body-2 text-grey mt-2">No recent conversations</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { format } from 'date-fns'
import { useRouter } from 'vue-router'
import { useAnalytics } from '@/composables/useAnalytics'
import { useAuthStore } from '@/stores/auth'
import { AnalyticsApiService } from '@/services/analyticsApi'
import { supabaseAdmin } from '@/config/supabase'

const router = useRouter()
const authStore = useAuthStore()

// Use analytics composable
const {
  loading,
  metrics,
  loadAllAnalytics,
  setupRealTimeSubscriptions,
  cleanup,
  formatCurrency,
  formatNumber,
  getTrendColor,
  getTrendIcon
} = useAnalytics()

const performanceTimeframe = ref(7)
const showTaskDialog = ref(false)
const chartLoading = ref(false)

const timeframeOptions = [
  { title: '7 days', value: 7 },
  { title: '14 days', value: 14 },
  { title: '30 days', value: 30 },
  { title: '90 days', value: 90 }
]

const currentDate = computed(() => format(new Date(), 'dd MMM, yyyy'))
const currentTime = computed(() => format(new Date(), 'HH:mm'))

// Get admin user name
const adminName = computed(() => {
  if (authStore.adminUser) {
    return authStore.adminUser.email?.split('@')[0]?.replace('.', ' ') || 'Admin'
  }
  return 'Admin'
})

const stats = computed(() => [
  {
    title: 'Total Users',
    value: formatNumber(metrics.value.totalUsers),
    trend: metrics.value.usersTrend,
    icon: 'mdi-account-group',
    color: 'primary',
    subtitle: `${metrics.value.usersTrend >= 0 ? '+' : ''}${metrics.value.usersTrend.toFixed(1)}% from last month`,
    route: '/users'
  },
  {
    title: 'Active Pets',
    value: formatNumber(metrics.value.totalPets),
    trend: metrics.value.petsTrend,
    icon: 'mdi-paw',
    color: 'success',
    subtitle: `${metrics.value.petsTrend >= 0 ? '+' : ''}${metrics.value.petsTrend.toFixed(1)}% from last month`,
    route: '/pets'
  },
  {
    title: 'Total Orders',
    value: formatNumber(metrics.value.totalOrders),
    trend: metrics.value.ordersTrend,
    icon: 'mdi-shopping',
    color: 'info',
    subtitle: `${metrics.value.ordersTrend >= 0 ? '+' : ''}${metrics.value.ordersTrend.toFixed(1)}% from last month`,
    route: '/orders'
  },
  {
    title: 'Revenue',
    value: formatCurrency(metrics.value.totalRevenue),
    trend: metrics.value.revenueTrend,
    icon: 'mdi-currency-php',
    color: 'warning',
    subtitle: `${metrics.value.revenueTrend >= 0 ? '+' : ''}${metrics.value.revenueTrend.toFixed(1)}% from last month`,
    route: '/orders'
  }
])

// Real data from Supabase
const recentActivitiesData = ref([])
const recentOrdersData = ref([])
const recentConversationsData = ref([])
const dataLoading = ref(false)



const formatDate = (date: Date) => {
  return format(date, 'MMM dd, yyyy')
}

const getOrderStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'warning'
    case 'confirmed': return 'info'
    case 'delivered': return 'success'
    case 'cancelled': return 'error'
    default: return 'grey'
  }
}



const formatTime = (timestamp: Date | string) => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  return format(date, 'HH:mm')
}

// Load real data from Supabase
const loadRecentData = async () => {
  dataLoading.value = true
  try {
    // Load recent activities
    const activities = await AnalyticsApiService.getRecentActivities(5)
    recentActivitiesData.value = activities

    // Load recent orders with proper relationship handling
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        total_amount,
        status,
        created_at,
        user_id
      `)
      .order('created_at', { ascending: false })
      .limit(5)

    if (ordersError) {

      recentOrdersData.value = []
    } else {
      // Get user details separately for each order
      const orderResults = []
      if (orders) {
        for (const order of orders) {
          let customerName = 'Unknown User'
          if (order.user_id) {
            const { data: userProfiles, error: profileError } = await supabaseAdmin
              .from('profiles')
              .select('first_name, last_name, username')
              .eq('id', order.user_id)
              .limit(1)

            if (!profileError && userProfiles && userProfiles.length > 0) {
              const userProfile = userProfiles[0]
              customerName = `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || userProfile.username || 'Unknown User'
            }
          }

          orderResults.push({
            id: order.id,
            customer_name: customerName,
            total_amount: order.total_amount,
            status: order.status,
            created_at: order.created_at
          })
        }
      }

      recentOrdersData.value = orderResults
    }

    // Load recent conversations with proper relationship handling
    const { data: conversations, error: conversationsError } = await supabaseAdmin
      .from('conversations')
      .select(`
        id,
        status,
        updated_at,
        user_id,
        subject
      `)
      .order('updated_at', { ascending: false })
      .limit(5)

    if (conversationsError) {

      recentConversationsData.value = []
    } else {
      // Get user details and messages separately for each conversation
      const conversationResults = []
      if (conversations) {
        for (const conv of conversations) {
          // Get user profile
          let userName = 'Unknown User'
          if (conv.user_id) {
            const { data: userProfiles, error: profileError } = await supabaseAdmin
              .from('profiles')
              .select('first_name, last_name, username')
              .eq('id', conv.user_id)
              .limit(1)

            if (!profileError && userProfiles && userProfiles.length > 0) {
              const userProfile = userProfiles[0]
              userName = `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || userProfile.username || 'Unknown User'
            }
          }

          // Get latest message
          const { data: latestMessages, error: messageError } = await supabaseAdmin
            .from('messages')
            .select('message_content, sender_type, is_read')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)

          const latestMessage = (!messageError && latestMessages && latestMessages.length > 0) ? latestMessages[0] : null

          // Get unread count
          const { count: unreadCount } = await supabaseAdmin
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('sender_type', 'user')
            .eq('is_read', false)

          // Format last message with proper fallback
          let lastMessageText = 'No messages'
          if (latestMessage?.message_content) {
            lastMessageText = latestMessage.message_content.length > 50
              ? latestMessage.message_content.substring(0, 50) + '...'
              : latestMessage.message_content
          } else if (conv.subject) {
            lastMessageText = conv.subject
          }

          conversationResults.push({
            id: conv.id,
            user_name: userName,
            last_message: lastMessageText,
            status: conv.status,
            unread_count: unreadCount || 0,
            updated_at: conv.updated_at
          })
        }
      }

      recentConversationsData.value = conversationResults
    }

  } catch (error) {

  } finally {
    dataLoading.value = false
  }
}

// Handle timeframe change
const handleTimeframeChange = async () => {
  try {
    await loadAllAnalytics(performanceTimeframe.value)
  } catch (error) {
    // Silent fail for analytics loading
  }
}

// Refresh dashboard data
const refreshDashboard = async () => {
  try {
    await Promise.all([
      loadAllAnalytics(performanceTimeframe.value),
      loadRecentData()
    ])
  } catch (error) {
    // Silent fail for dashboard refresh
  }
}

// Handle stat card clicks
const handleStatClick = (stat: any) => {
  if (stat.route) {
    router.push(stat.route)
  }
}

onMounted(async () => {
  // Load all analytics data and recent data
  await Promise.all([
    loadAllAnalytics(performanceTimeframe.value),
    loadRecentData()
  ])

  // Setup real-time subscriptions
  setupRealTimeSubscriptions()
})

onUnmounted(() => {
  // Cleanup subscriptions
  cleanup()
})
</script>

<style scoped>
.dashboard-view {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Professional Header - Following ProductsView Pattern */
.page-header {
  background: rgb(var(--v-theme-surface));
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 32px;
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.header-text {
  flex: 1;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 1.1rem;
  color: rgb(var(--v-theme-on-surface-variant));
  margin: 0;
  line-height: 1.5;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

/* Statistics Cards - Following Analytics Page Pattern */
.stats-section {
  margin-bottom: 32px;
}

.stats-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
}

.stats-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(var(--v-theme-shadow-key-umbra), 0.1);
}

.stats-card--loading {
  pointer-events: none;
  opacity: 0.7;
}

.stats-icon-container {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--v-theme-surface-variant), 0.1);
}



/* Activity Section */
.activity-list {
  max-height: 400px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  padding: 16px 24px;
  position: relative;
}

.activity-item--last {
  padding-bottom: 24px;
}

.activity-timeline {
  position: relative;
  margin-right: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.activity-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.activity-dot--success {
  background: linear-gradient(135deg, rgb(var(--v-theme-success)), rgb(var(--v-theme-success-darken-1)));
}

.activity-dot--warning {
  background: linear-gradient(135deg, rgb(var(--v-theme-warning)), rgb(var(--v-theme-warning-darken-1)));
}

.activity-dot--error {
  background: linear-gradient(135deg, rgb(var(--v-theme-error)), rgb(var(--v-theme-error-darken-1)));
}

.activity-dot--info {
  background: linear-gradient(135deg, rgb(var(--v-theme-info)), rgb(var(--v-theme-info-darken-1)));
}

.activity-dot--default {
  background: linear-gradient(135deg, rgb(var(--v-theme-secondary)), rgb(var(--v-theme-secondary-darken-1)));
}

.activity-dot--primary {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-primary-darken-1)));
}

.activity-line {
  width: 2px;
  flex: 1;
  background: rgba(var(--v-theme-outline), 0.3);
  margin-top: 8px;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-main {
  flex: 1;
}

.activity-time {
  white-space: nowrap;
  margin-left: 16px;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.performance-card {
  min-height: 400px;
}

.chart-container {
  height: 280px;
  position: relative;
}

.chart-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.chart-stats {
  padding: 16px 0;
}

.chart-visual {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.task-board-section {
  margin-top: 32px;
}

.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
}

.task-card {
  border-left: 4px solid transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(var(--v-theme-shadow-key-umbra), 0.1);
}

.task-card--design {
  border-left-color: rgb(var(--v-theme-success));
}

.task-card--concept {
  border-left-color: rgb(var(--v-theme-info));
}

.task-card--re-design {
  border-left-color: rgb(var(--v-theme-warning));
}

/* Dark theme dashboard adjustments */
.v-theme--dark .page-header {
  background: rgb(var(--v-theme-surface));
  border-color: rgba(var(--v-theme-outline), 0.2);
}

.v-theme--dark .stats-card {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-color: rgba(var(--v-theme-outline), 0.2);
}

.v-theme--dark .stats-card:hover {
  background: rgba(var(--v-theme-surface-variant), 0.4);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.v-theme--dark .recent-activity-card,
.v-theme--dark .recent-conversations-card,
.v-theme--dark .recent-orders-card {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-color: rgba(var(--v-theme-outline), 0.2);
}

.v-theme--dark .activity-item:hover,
.v-theme--dark .conversation-item:hover,
.v-theme--dark .order-item:hover {
  background: rgba(var(--v-theme-primary), 0.05);
}

.v-theme--dark .activity-line {
  background: rgba(var(--v-theme-outline), 0.3);
}

.v-theme--dark .task-card {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-color: rgba(var(--v-theme-outline), 0.2);
}

.v-theme--dark .task-card:hover {
  background: rgba(var(--v-theme-surface-variant), 0.4);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .dashboard-view {
    padding: 16px;
  }

  .page-header {
    padding: 24px;
  }

  .page-title {
    font-size: 2rem;
  }

  .header-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .revenue-stats-grid .v-row {
    margin: 0;
  }

  .revenue-stat-card {
    margin-bottom: 12px;
  }

  .chart-container {
    height: 250px;
  }

  .activity-item {
    padding: 12px 16px;
  }

  .activity-timeline {
    margin-right: 12px;
  }
}

/* Animation for chart */
.chart-visual path {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: drawLine 2s ease-in-out forwards;
}

@keyframes drawLine {
  to {
    stroke-dashoffset: 0;
  }
}

/* Custom scrollbar for activity feed */
:deep(.activity-list) {
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--v-theme-primary), 0.3) transparent;
}

:deep(.activity-list::-webkit-scrollbar) {
  width: 4px;
}

:deep(.activity-list::-webkit-scrollbar-track) {
  background: transparent;
}

:deep(.activity-list::-webkit-scrollbar-thumb) {
  background: rgba(var(--v-theme-primary), 0.3);
  border-radius: 2px;
}
</style>
