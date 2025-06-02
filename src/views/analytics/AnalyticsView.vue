<template>
  <div class="analytics-view">
    <!-- Professional Header - Following ProductsView Pattern -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">Analytics Dashboard</h1>
          <p class="page-subtitle">Comprehensive insights into your business performance and key metrics</p>
        </div>
        <div class="header-actions">
          <v-select
            v-model="selectedTimeframe"
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
            variant="flat"
            prepend-icon="mdi-refresh"
            @click="refreshData"
            :loading="loading"
            class="refresh-btn"
          >
            Refresh
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <v-row class="stats-section mb-6">
      <v-col
        v-for="metric in keyMetrics"
        :key="metric.title"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card rounded="xl" class="stats-card" elevation="2">
          <v-card-text class="pa-4">
            <div class="d-flex align-center">
              <div class="stats-icon-container me-3">
                <v-icon :icon="metric.icon" size="32" :color="metric.color" />
              </div>
              <div class="flex-grow-1">
                <div class="d-flex align-center justify-space-between">
                  <div class="text-h5 font-weight-bold">{{ metric.value }}</div>
                  <v-chip
                    v-if="metric.trend !== 0"
                    :color="getTrendColor(metric.trend)"
                    size="x-small"
                    variant="tonal"
                  >
                    <v-icon :icon="getTrendIcon(metric.trend)" size="10" class="me-1" />
                    {{ Math.abs(metric.trend).toFixed(1) }}%
                  </v-chip>
                </div>
                <div class="text-body-2 text-on-surface-variant">{{ metric.title }}</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Charts Section -->
    <!-- User Registration Trends Chart -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card class="chart-card" rounded="xl" elevation="2">
          <v-card-title class="pa-6 pb-4">
            <div class="d-flex align-center">
              <v-icon icon="mdi-account-plus" class="me-2" />
              <span class="text-h6 font-weight-bold">User Registration Trends</span>
            </div>
          </v-card-title>
          <v-card-text class="pa-6 pt-0">
            <div v-if="loading" class="chart-loading">
              <v-progress-circular indeterminate color="primary" />
              <p class="text-body-2 text-on-surface-variant mt-2">Loading chart data...</p>
            </div>
            <div v-else-if="themeStore.isTransitioning" class="chart-loading">
              <v-skeleton-loader type="image" height="350" />
            </div>
            <div v-else-if="userRegistrationTrends.labels.length > 0 && shouldRenderCharts" class="chart-container">
              <LineChart
                :key="`user-chart-${selectedTimeframe}`"
                :data="userRegistrationTrends"
                :height="350"
                type="line"
              />
            </div>
            <div v-else class="chart-empty">
              <div class="d-flex align-center justify-center h-100">
                <div class="text-center">
                  <v-icon icon="mdi-chart-line" size="48" color="grey" />
                  <p class="text-body-2 text-grey mt-2">No registration data available</p>
                  <p class="text-caption text-grey">Data will appear when users register</p>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Revenue Trends Chart -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card class="chart-card" rounded="xl" elevation="2">
          <v-card-title class="pa-6 pb-4">
            <div class="d-flex align-center">
              <v-icon icon="mdi-currency-usd" class="me-2" />
              <span class="text-h6 font-weight-bold">Revenue Trends</span>
            </div>
          </v-card-title>
          <v-card-text class="pa-6 pt-0">
            <!-- Revenue Statistics Cards -->
            <div class="revenue-stats-grid mb-4">
              <v-row>
                <v-col cols="12" sm="4">
                  <v-card class="revenue-stat-card" variant="tonal" color="primary">
                    <v-card-text class="pa-4 text-center">
                      <div class="text-caption text-on-surface-variant mb-1">Total Revenue</div>
                      <div class="text-h6 font-weight-bold">{{ formatCurrency(metrics.totalRevenue) }}</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-card class="revenue-stat-card" variant="tonal" color="success">
                    <v-card-text class="pa-4 text-center">
                      <div class="text-caption text-on-surface-variant mb-1">Avg Monthly</div>
                      <div class="text-h6 font-weight-bold">{{ formatCurrency(metrics.totalRevenue / Math.max(1, Math.ceil(selectedTimeframe / 30))) }}</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-card class="revenue-stat-card" variant="tonal" :color="getTrendColor(metrics.revenueTrend)">
                    <v-card-text class="pa-4 text-center">
                      <div class="text-caption text-on-surface-variant mb-1">Trend</div>
                      <div class="text-h6 font-weight-bold d-flex align-center justify-center">
                        <v-icon :icon="getTrendIcon(metrics.revenueTrend)" size="16" class="me-1" />
                        {{ Math.abs(metrics.revenueTrend).toFixed(1) }}%
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>

            <div v-if="loading" class="chart-loading">
              <v-progress-circular indeterminate color="primary" />
              <p class="text-body-2 text-on-surface-variant mt-2">Loading chart data...</p>
            </div>
            <div v-else-if="themeStore.isTransitioning" class="chart-loading">
              <v-skeleton-loader type="image" height="350" />
            </div>
            <div v-else-if="revenueTrends.labels.length > 0 && shouldRenderCharts" class="chart-container">
              <LineChart
                :key="`revenue-chart-${selectedTimeframe}`"
                :data="revenueTrends"
                :height="350"
                type="area"
              />
            </div>
            <div v-else class="chart-empty">
              <div class="d-flex align-center justify-center h-100">
                <div class="text-center">
                  <v-icon icon="mdi-chart-areaspline" size="48" color="grey" />
                  <p class="text-body-2 text-grey mt-2">No revenue data available</p>
                  <p class="text-caption text-grey">Data will appear when orders are placed</p>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Detailed Analytics -->
    <v-row class="mb-8">
      <!-- Pet Statistics -->
      <v-col cols="12" md="6" lg="4">
        <v-card class="analytics-card h-100" rounded="xl" elevation="2">
          <v-card-title class="pa-6 pb-4">
            <div class="d-flex align-center">
              <v-icon icon="mdi-paw" class="me-2" />
              <span class="text-h6 font-weight-bold">Pet Statistics</span>
            </div>
          </v-card-title>
          <v-card-text class="pa-6 pt-0">
            <div v-if="loading" class="text-center py-8">
              <v-progress-circular indeterminate color="primary" />
            </div>
            <div v-else-if="themeStore.isTransitioning" class="text-center py-8">
              <v-skeleton-loader type="avatar" width="200" height="200" class="mx-auto" />
            </div>
            <div v-else-if="petStatistics.total > 0 && shouldRenderCharts">
              <div class="mb-4">
                <DoughnutChart
                  :key="`pet-chart-${selectedTimeframe}`"
                  :data="petChartData"
                  :height="200"
                />
              </div>

              <!-- Statistics -->
              <div class="pet-stats-summary">
                <div class="d-flex justify-space-between align-center mb-2">
                  <div class="d-flex align-center">
                    <div class="pet-stat-dot bg-primary me-2"></div>
                    <span class="text-body-2">Dogs</span>
                  </div>
                  <span class="text-h6 font-weight-bold">{{ petStatistics.dogs }}</span>
                </div>
                <div class="d-flex justify-space-between align-center mb-2">
                  <div class="d-flex align-center">
                    <div class="pet-stat-dot bg-success me-2"></div>
                    <span class="text-body-2">Cats</span>
                  </div>
                  <span class="text-h6 font-weight-bold">{{ petStatistics.cats }}</span>
                </div>
                <v-divider class="my-3" />
                <div class="text-center">
                  <p class="text-h5 font-weight-bold mb-1">{{ petStatistics.total }}</p>
                  <p class="text-body-2 text-on-surface-variant">Total Pets Registered</p>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8">
              <v-icon icon="mdi-paw" size="48" color="grey" />
              <p class="text-body-2 text-grey mt-2">No pets registered yet</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Order Statistics -->
      <v-col cols="12" md="6" lg="4">
        <v-card class="analytics-card h-100" rounded="xl" elevation="2">
          <v-card-title class="pa-6 pb-4">
            <div class="d-flex align-center">
              <v-icon icon="mdi-shopping" class="me-2" />
              <span class="text-h6 font-weight-bold">Order Statistics</span>
            </div>
          </v-card-title>
          <v-card-text class="pa-6 pt-0">
            <div v-if="loading" class="text-center py-8">
              <v-progress-circular indeterminate color="primary" />
            </div>
            <div v-else>
              <div class="order-stats-list">
                <div class="order-stat-item">
                  <div class="d-flex align-center justify-space-between py-2">
                    <div class="d-flex align-center">
                      <div class="order-status-dot bg-warning me-3"></div>
                      <span class="text-body-1">Pending</span>
                    </div>
                    <span class="text-h6 font-weight-bold">{{ orderStatistics.pending }}</span>
                  </div>
                </div>
                <v-divider />
                <div class="order-stat-item">
                  <div class="d-flex align-center justify-space-between py-2">
                    <div class="d-flex align-center">
                      <div class="order-status-dot bg-info me-3"></div>
                      <span class="text-body-1">Processing</span>
                    </div>
                    <span class="text-h6 font-weight-bold">{{ orderStatistics.processing }}</span>
                  </div>
                </div>
                <v-divider />
                <div class="order-stat-item">
                  <div class="d-flex align-center justify-space-between py-2">
                    <div class="d-flex align-center">
                      <div class="order-status-dot bg-primary me-3"></div>
                      <span class="text-body-1">Shipped</span>
                    </div>
                    <span class="text-h6 font-weight-bold">{{ orderStatistics.shipped }}</span>
                  </div>
                </div>
                <v-divider />
                <div class="order-stat-item">
                  <div class="d-flex align-center justify-space-between py-2">
                    <div class="d-flex align-center">
                      <div class="order-status-dot bg-success me-3"></div>
                      <span class="text-body-1">Delivered</span>
                    </div>
                    <span class="text-h6 font-weight-bold">{{ orderStatistics.delivered }}</span>
                  </div>
                </div>
              </div>
              <v-divider class="my-3" />
              <div class="text-center">
                <p class="text-h5 font-weight-bold mb-1">{{ orderStatistics.total }}</p>
                <p class="text-body-2 text-on-surface-variant">Total Orders</p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Conversation Metrics -->
      <v-col cols="12" md="6" lg="4">
        <v-card class="analytics-card h-100" rounded="xl" elevation="2">
          <v-card-title class="pa-6 pb-4">
            <div class="d-flex align-center">
              <v-icon icon="mdi-message" class="me-2" />
              <span class="text-h6 font-weight-bold">Customer Support</span>
            </div>
          </v-card-title>
          <v-card-text class="pa-6 pt-0">
            <div v-if="loading" class="text-center py-8">
              <v-progress-circular indeterminate color="primary" />
            </div>
            <div v-else>
              <div class="conversation-metrics">
                <div class="metric-row">
                  <div class="metric-label">
                    <v-icon icon="mdi-clock-outline" size="16" class="me-2" />
                    Avg Response Time
                  </div>
                  <div class="metric-value">{{ conversationMetrics.averageResponseTime }}h</div>
                </div>
                <div class="metric-row">
                  <div class="metric-label">
                    <v-icon icon="mdi-check-circle-outline" size="16" class="me-2" />
                    Resolution Rate
                  </div>
                  <div class="metric-value">{{ conversationMetrics.resolutionRate.toFixed(1) }}%</div>
                </div>
                <div class="metric-row">
                  <div class="metric-label">
                    <v-icon icon="mdi-message-outline" size="16" class="me-2" />
                    Total Messages
                  </div>
                  <div class="metric-value">{{ formatNumber(conversationMetrics.totalMessages) }}</div>
                </div>
                <div class="metric-row">
                  <div class="metric-label">
                    <v-icon icon="mdi-star-outline" size="16" class="me-2" />
                    Satisfaction
                  </div>
                  <div class="metric-value">{{ conversationMetrics.customerSatisfaction }}%</div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- System Health -->
    <v-row>
      <v-col cols="12">
        <v-card class="system-health-card" rounded="xl" elevation="2">
          <v-card-title class="pa-6 pb-4">
            <div class="d-flex align-center">
              <v-icon icon="mdi-heart-pulse" class="me-2" />
              <span class="text-h6 font-weight-bold">System Health</span>
            </div>
          </v-card-title>
          <v-card-text class="pa-6 pt-0">
            <div class="health-indicators">
              <div class="health-item">
                <div class="d-flex align-center justify-space-between py-3">
                  <div class="d-flex align-center">
                    <div class="health-dot bg-success me-3"></div>
                    <div>
                      <p class="text-body-1 font-weight-medium mb-1">Database</p>
                      <p class="text-caption text-on-surface-variant">All systems operational</p>
                    </div>
                  </div>
                  <v-chip color="success" size="small" variant="tonal">Healthy</v-chip>
                </div>
              </div>
              <v-divider />
              <div class="health-item">
                <div class="d-flex align-center justify-space-between py-3">
                  <div class="d-flex align-center">
                    <div class="health-dot bg-success me-3"></div>
                    <div>
                      <p class="text-body-1 font-weight-medium mb-1">API Services</p>
                      <p class="text-caption text-on-surface-variant">Response time: 120ms</p>
                    </div>
                  </div>
                  <v-chip color="success" size="small" variant="tonal">Healthy</v-chip>
                </div>
              </div>
              <v-divider />
              <div class="health-item">
                <div class="d-flex align-center justify-space-between py-3">
                  <div class="d-flex align-center">
                    <div class="health-dot bg-warning me-3"></div>
                    <div>
                      <p class="text-body-1 font-weight-medium mb-1">Message Queue</p>
                      <p class="text-caption text-on-surface-variant">{{ metrics.unreadMessages }} pending items</p>
                    </div>
                  </div>
                  <v-chip
                    :color="metrics.unreadMessages > 10 ? 'warning' : 'success'"
                    size="small"
                    variant="tonal"
                  >
                    {{ metrics.unreadMessages > 10 ? 'Attention' : 'Healthy' }}
                  </v-chip>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useAnalytics } from '@/composables/useAnalytics'
import { useToast } from 'vue-toastification'
import { useThemeStore } from '@/stores/theme'
import { LazyLineChart, LazyDoughnutChart } from '@/utils/lazy-loading'

const LineChart = LazyLineChart
const DoughnutChart = LazyDoughnutChart

const toast = useToast()
const themeStore = useThemeStore()

// Use analytics composable
const {
  loading,
  metrics,
  userRegistrationTrends,
  revenueTrends,
  petStatistics,
  orderStatistics,
  conversationMetrics,
  loadAllAnalytics,
  loadUserRegistrationTrends,
  loadRevenueTrends,
  setupRealTimeSubscriptions,
  cleanup,
  formatCurrency,
  formatNumber,
  getTrendColor,
  getTrendIcon
} = useAnalytics()

const shouldRenderCharts = computed(() => {
  return !themeStore.isTransitioning && themeStore.shouldLoadComponent('charts', false)
})

// Local state
const selectedTimeframe = ref(30)

const timeframeOptions = [
  { title: '7 days', value: 7 },
  { title: '14 days', value: 14 },
  { title: '30 days', value: 30 },
  { title: '90 days', value: 90 }
]

// Computed properties
const keyMetrics = computed(() => [
  {
    title: 'Total Users',
    value: formatNumber(metrics.value.totalUsers),
    trend: metrics.value.usersTrend,
    icon: 'mdi-account-group',
    color: 'primary',
    subtitle: `${metrics.value.usersTrend >= 0 ? '+' : ''}${metrics.value.usersTrend.toFixed(1)}% from last period`
  },
  {
    title: 'Active Pets',
    value: formatNumber(metrics.value.totalPets),
    trend: metrics.value.petsTrend,
    icon: 'mdi-paw',
    color: 'success',
    subtitle: `${metrics.value.petsTrend >= 0 ? '+' : ''}${metrics.value.petsTrend.toFixed(1)}% from last period`
  },
  {
    title: 'Total Orders',
    value: formatNumber(metrics.value.totalOrders),
    trend: metrics.value.ordersTrend,
    icon: 'mdi-shopping',
    color: 'info',
    subtitle: `${metrics.value.ordersTrend >= 0 ? '+' : ''}${metrics.value.ordersTrend.toFixed(1)}% from last period`
  },
  {
    title: 'Revenue',
    value: formatCurrency(metrics.value.totalRevenue),
    trend: metrics.value.revenueTrend,
    icon: 'mdi-currency-usd',
    color: 'warning',
    subtitle: `${metrics.value.revenueTrend >= 0 ? '+' : ''}${metrics.value.revenueTrend.toFixed(1)}% from last period`
  },
  {
    title: 'Conversations',
    value: formatNumber(metrics.value.totalConversations),
    trend: metrics.value.conversationsTrend,
    icon: 'mdi-message',
    color: 'purple',
    subtitle: `${metrics.value.conversationsTrend >= 0 ? '+' : ''}${metrics.value.conversationsTrend.toFixed(1)}% from last period`
  },
  {
    title: 'Unread Messages',
    value: formatNumber(metrics.value.unreadMessages),
    trend: 0,
    icon: 'mdi-message-alert',
    color: 'error',
    subtitle: 'Requires immediate attention'
  }
])

// Pet chart data for doughnut chart
const petChartData = computed(() => ({
  labels: ['Dogs', 'Cats'],
  datasets: [{
    data: [petStatistics.value.dogs, petStatistics.value.cats],
    backgroundColor: ['#6366F1', '#10B981'],
    borderColor: ['#fff', '#fff'],
    borderWidth: 2
  }]
}))

const handleTimeframeChange = async () => {
  try {
    await loadAllAnalytics(selectedTimeframe.value)
  } catch (error) {
    // Silent fail for timeframe changes
  }
}

const refreshData = async () => {
  try {
    await loadAllAnalytics(selectedTimeframe.value)
    toast.success('Analytics data refreshed successfully')
  } catch (error) {
    toast.error('Failed to refresh analytics data')
  }
}



watch(selectedTimeframe, async () => {
  await handleTimeframeChange()
}, { immediate: false })

onMounted(async () => {
  await loadAllAnalytics(selectedTimeframe.value)
  setupRealTimeSubscriptions()
})

onUnmounted(() => {
  cleanup()
})
</script>

<style scoped>
.analytics-view {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  contain: layout;
}

/* Professional Header - Following ProductsView Pattern */
.page-header {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05) 0%, rgba(var(--v-theme-primary), 0.02) 100%);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 32px;
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
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

/* Statistics Cards - Following Users Page Pattern */
.stats-section {
  margin-bottom: 32px;
}

.stats-card {
  transition: all 0.3s ease;
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
}

.stats-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(var(--v-theme-shadow-key-umbra), 0.15);
}

.stats-icon-container {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: rgba(var(--v-theme-primary), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Chart Cards */
.chart-card {
  transition: all 0.3s ease;
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
}

.chart-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(var(--v-theme-shadow-key-umbra), 0.15);
}

.chart-container {
  height: 350px;
  min-height: 300px;
  contain: layout;
}

.chart-empty {
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  contain: layout;
}

.chart-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 250px;
  contain: layout style;
}

/* Revenue Statistics Cards */
.revenue-stats-grid {
  margin-bottom: 24px;
}

.revenue-stat-card {
  transition: all 0.3s ease;
  border-radius: 12px;
}

.revenue-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-shadow-key-umbra), 0.1);
}

/* Analytics Cards */
.analytics-card {
  transition: all 0.3s ease;
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
}

.analytics-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(var(--v-theme-shadow-key-umbra), 0.15);
}

.pet-stats-summary {
  margin-top: 16px;
}

.pet-stat-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.order-stats-list {
  display: flex;
  flex-direction: column;
}

.order-stat-item {
  padding: 8px 0;
}

.order-status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.conversation-metrics {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.metric-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.2);
}

.metric-row:last-child {
  border-bottom: none;
}

.metric-label {
  display: flex;
  align-items: center;
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 14px;
}

.metric-value {
  font-weight: 600;
  font-size: 16px;
}

.system-health-card {
  border-radius: 20px;
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
}

.health-indicators {
  display: flex;
  flex-direction: column;
}

.health-item {
  padding: 16px 0;
}

.health-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

/* System Health */
.system-health-card {
  transition: all 0.3s ease;
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
}

.system-health-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(var(--v-theme-shadow-key-umbra), 0.15);
}

.health-indicators {
  display: flex;
  flex-direction: column;
}

.health-item {
  padding: 16px 0;
}

.health-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

/* Responsive Design - Following ProductsView Pattern */
@media (max-width: 768px) {
  .analytics-view {
    padding: 16px;
  }

  .page-header {
    padding: 24px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .page-title {
    font-size: 2rem;
  }

  .header-actions {
    width: 100%;
    justify-content: stretch;
  }

  .chart-container {
    height: 280px;
    min-height: 250px;
  }

  .revenue-stats-grid .v-row {
    margin: 0;
  }

  .revenue-stat-card {
    margin-bottom: 12px;
  }
}

@media (max-width: 600px) {
  .page-title {
    font-size: 1.75rem;
  }

  .chart-container {
    height: 250px;
    min-height: 220px;
  }

  .stats-icon-container {
    width: 48px;
    height: 48px;
  }
}

/* Color utilities */
.bg-primary {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-primary-darken-1)));
}

.bg-success {
  background: linear-gradient(135deg, rgb(var(--v-theme-success)), rgb(var(--v-theme-success-darken-1)));
}

.bg-info {
  background: linear-gradient(135deg, rgb(var(--v-theme-info)), rgb(var(--v-theme-info-darken-1)));
}

.bg-warning {
  background: linear-gradient(135deg, rgb(var(--v-theme-warning)), rgb(var(--v-theme-warning-darken-1)));
}

.bg-error {
  background: linear-gradient(135deg, rgb(var(--v-theme-error)), rgb(var(--v-theme-error-darken-1)));
}

.bg-purple {
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
}

/* Dark Theme Adjustments - Following ProductsView Pattern */
/* Page title and subtitle colors are now handled by theme variables above */
</style>
