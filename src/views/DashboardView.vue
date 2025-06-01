<template>
  <div class="modern-dashboard">
      <!-- Welcome Header -->
      <div class="welcome-header mb-8">
        <div class="d-flex justify-space-between align-start flex-wrap gap-4">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">
              Hello, Margaret 👋
            </h1>
            <p class="text-subtitle-1 text-on-surface-variant mb-4">
              Track team progress here. You almost reach a goal!
            </p>
            <div class="d-flex align-center gap-4 flex-wrap">
              <div class="d-flex align-center">
                <v-icon icon="mdi-calendar" size="16" class="me-2 text-on-surface-variant" />
                <span class="text-body-2 text-on-surface-variant">{{ currentDate }}</span>
              </div>
              <div class="d-flex align-center">
                <v-icon icon="mdi-clock" size="16" class="me-2 text-on-surface-variant" />
                <span class="text-body-2 text-on-surface-variant">{{ currentTime }}</span>
              </div>
            </div>
          </div>

          <div class="d-flex align-center gap-3">
            <v-avatar size="48" class="user-avatar">
              <v-img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150" alt="User" />
            </v-avatar>
            <div class="d-none d-md-block">
              <p class="text-subtitle-2 font-weight-medium mb-0">Megan Norton</p>
              <p class="text-caption text-on-surface-variant">@megnorton</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid mb-8">
        <v-card
          v-for="stat in stats"
          :key="stat.title"
          class="stats-card"
          :class="{ 'stats-card--loading': loading }"
          @click="handleStatClick(stat)"
        >
          <v-card-text class="pa-6">
            <div class="d-flex align-center justify-space-between mb-4">
              <div class="stats-icon" :class="`bg-${stat.color}`">
                <v-icon :icon="stat.icon" size="24" color="white" />
              </div>
            </div>

            <div class="mb-2">
              <h3 class="text-h4 font-weight-bold text-on-surface mb-1">
                {{ stat.value }}
              </h3>
              <p class="text-subtitle-2 text-on-surface-variant mb-0">
                {{ stat.title }}
              </p>
            </div>

            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-chip
                  v-if="stat.trend !== null"
                  :color="stat.trend >= 0 ? 'success' : 'error'"
                  variant="tonal"
                  size="small"
                  class="trend-chip"
                >
                  <v-icon
                    :icon="stat.trend >= 0 ? 'mdi-trending-up' : 'mdi-trending-down'"
                    size="14"
                    class="me-1"
                  />
                  {{ Math.abs(stat.trend) }}%
                </v-chip>
              </div>

              <div v-if="stat.subtitle" class="text-caption text-on-surface-variant">
                {{ stat.subtitle }}
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <!-- Main Content Grid -->
      <div class="content-grid mb-8">
        <!-- Performance Chart -->
        <v-card class="performance-card">
          <v-card-title class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon icon="mdi-chart-line" class="me-2" />
              <span class="text-h6 font-weight-bold">Performance</span>
            </div>
            <v-select
              v-model="performanceTimeframe"
              :items="timeframeOptions"
              item-title="title"
              item-value="value"
              variant="outlined"
              density="compact"
              hide-details
              style="max-width: 140px;"
              @update:model-value="loadChartData"
            />
          </v-card-title>
          <v-card-text>
            <div class="chart-container">
              <div v-if="chartLoading" class="chart-loading">
                <v-progress-circular indeterminate color="primary" />
                <p class="text-body-2 text-on-surface-variant mt-2">Loading chart data...</p>
              </div>
              <div v-else class="chart-stats mb-4">
                <div class="d-flex gap-6">
                  <div>
                    <p class="text-caption text-on-surface-variant mb-1">Total Revenue</p>
                    <p class="text-h6 font-weight-bold">${(metrics.totalRevenue / 1000).toFixed(1)}k</p>
                  </div>
                  <div>
                    <p class="text-caption text-on-surface-variant mb-1">Avg Daily</p>
                    <p class="text-h6 font-weight-bold">${(metrics.totalRevenue / (performanceTimeframe * 1000)).toFixed(1)}k</p>
                  </div>
                </div>
              </div>
              <div v-if="!chartLoading" class="chart-visual" style="height: 250px;">
                <!-- Chart placeholder -->
                <div class="d-flex align-center justify-center h-100 bg-grey-lighten-4 rounded">
                  <div class="text-center">
                    <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-chart-line</v-icon>
                    <p class="text-body-2 text-medium-emphasis">Performance Chart</p>
                    <p class="text-caption text-medium-emphasis">Chart component will be implemented</p>
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Activity Feed -->
        <v-card class="activity-feed">
          <v-card-title class="d-flex align-center justify-space-between pa-6 pb-4">
            <div class="d-flex align-center">
              <v-icon icon="mdi-timeline" class="me-2" />
              <span class="text-h6 font-weight-bold">Activity</span>
            </div>
            <v-btn
              variant="text"
              size="small"
              @click="$router.push('/activity')"
            >
              View All
            </v-btn>
          </v-card-title>

          <v-card-text class="pa-0">
            <div class="activity-list">
              <div
                v-for="(activity, index) in activities"
                :key="activity.id"
                class="activity-item"
                :class="{ 'activity-item--last': index === activities.length - 1 }"
              >
                <!-- Timeline dot -->
                <div class="activity-timeline">
                  <div
                    class="activity-dot"
                    :class="`activity-dot--${activity.type}`"
                  >
                    <v-icon
                      :icon="getActivityIcon(activity.type)"
                      size="14"
                      color="white"
                    />
                  </div>
                  <div
                    v-if="index !== activities.length - 1"
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
                          v-if="activity.user"
                          size="x-small"
                          variant="tonal"
                          color="primary"
                        >
                          <v-avatar
                            v-if="activity.user.avatar"
                            size="16"
                            class="me-1"
                          >
                            <v-img :src="activity.user.avatar" />
                          </v-avatar>
                          <v-icon
                            v-else
                            icon="mdi-account"
                            size="12"
                            class="me-1"
                          />
                          {{ activity.user.name }}
                        </v-chip>

                        <v-chip
                          v-if="activity.category"
                          size="x-small"
                          variant="outlined"
                        >
                          {{ activity.category }}
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
          </v-card-text>
        </v-card>
      </div>

      <!-- Task Board Section -->
      <div class="task-board-section">
        <div class="d-flex align-center justify-space-between mb-6">
          <div class="d-flex align-center">
            <v-icon icon="mdi-view-dashboard" class="me-2" />
            <h2 class="text-h5 font-weight-bold">Task board</h2>
          </div>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="showTaskDialog = true"
          >
            All task
          </v-btn>
        </div>

        <div class="task-grid">
          <v-card
            v-for="task in tasks"
            :key="task.id"
            class="task-card"
            :class="`task-card--${task.status}`"
          >
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between mb-3">
                <h3 class="text-h6 font-weight-bold">{{ task.title }}</h3>
                <v-chip
                  :color="getTaskStatusColor(task.status)"
                  size="small"
                  variant="flat"
                >
                  {{ task.status }}
                </v-chip>
              </div>
              <p class="text-body-2 text-on-surface-variant mb-3">
                {{ task.description }}
              </p>
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-icon icon="mdi-clock" size="14" class="me-1 text-on-surface-variant" />
                  <span class="text-caption text-on-surface-variant">{{ task.duration }}</span>
                </div>
                <v-progress-circular
                  :model-value="task.progress"
                  :color="getTaskStatusColor(task.status)"
                  size="24"
                  width="3"
                >
                  <span class="text-caption">{{ task.progress }}%</span>
                </v-progress-circular>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </div>

      <!-- Recent Activity -->
      <v-row>
        <!-- Recent Orders -->
        <v-col cols="12" md="6">
          <v-card elevation="2">
            <v-card-title>
              <div class="d-flex justify-space-between align-center w-100">
                <span>Recent Orders</span>
                <v-btn
                  variant="text"
                  size="small"
                  @click="$router.push('/orders')"
                >
                  View All
                </v-btn>
              </div>
            </v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item
                  v-for="order in recentOrders"
                  :key="order.id"
                  @click="$router.push(`/orders/${order.id}`)"
                  class="px-0"
                >
                  <v-list-item-title class="text-body-2">
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
                      <span class="text-caption mt-1">
                        ₱{{ order.total_amount.toLocaleString() }}
                      </span>
                    </div>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Recent Appointments -->
        <v-col cols="12" md="6">
          <v-card elevation="2">
            <v-card-title>
              <div class="d-flex justify-space-between align-center w-100">
                <span>Today's Appointments</span>
                <v-btn
                  variant="text"
                  size="small"
                  @click="$router.push('/appointments')"
                >
                  View All
                </v-btn>
              </div>
            </v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item
                  v-for="appointment in todayAppointments"
                  :key="appointment.id"
                  class="px-0"
                >
                  <template v-slot:prepend>
                    <v-avatar size="32" color="primary" variant="tonal">
                      <v-icon>mdi-paw</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="text-body-2">
                    {{ appointment.pet_name }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ appointment.customer_name }} • {{ appointment.appointment_time }}
                  </v-list-item-subtitle>
                  <template v-slot:append>
                    <v-chip
                      :color="getAppointmentStatusColor(appointment.status)"
                      size="small"
                      variant="tonal"
                    >
                      {{ appointment.status }}
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { format } from 'date-fns'
// import PerformanceChart from '@/components/ui/PerformanceChart.vue'
// import { DashboardService } from '@/services/dashboard'
// import type { DashboardMetrics, ChartData, Activity } from '@/services/dashboard'
// import StatsCard from '@/components/ui/StatsCard.vue'
// import ActivityFeed from '@/components/ui/ActivityFeed.vue'

// Mock types for dashboard
interface DashboardMetrics {
  totalUsers: number
  totalPets: number
  totalOrders: number
  totalRevenue: number
  usersTrend: number
  petsTrend: number
  ordersTrend: number
  revenueTrend: number
}

interface ChartData {
  labels: string[]
  datasets: any[]
}

interface Activity {
  id: string
  type: string
  message: string
  timestamp: Date
}

const performanceTimeframe = ref('7 days')
const showTaskDialog = ref(false)
const loading = ref(true)
const chartLoading = ref(true)

const timeframeOptions = [
  { title: '7 days', value: 7 },
  { title: '14 days', value: 14 },
  { title: '30 days', value: 30 },
  { title: '90 days', value: 90 }
]

const currentDate = computed(() => format(new Date(), 'dd MMM, yyyy'))
const currentTime = computed(() => format(new Date(), 'HH:mm'))

// Real data from Supabase
const metrics = ref<DashboardMetrics>({
  totalUsers: 0,
  totalPets: 0,
  totalOrders: 0,
  totalRevenue: 0,
  usersTrend: 0,
  petsTrend: 0,
  ordersTrend: 0,
  revenueTrend: 0
})

const chartData = ref<ChartData>({
  labels: [],
  datasets: []
})

const activities = ref<Activity[]>([])

const stats = computed(() => [
  {
    title: 'Total Users',
    value: metrics.value.totalUsers.toLocaleString(),
    trend: metrics.value.usersTrend,
    icon: 'mdi-account-group',
    color: 'primary',
    subtitle: `${metrics.value.usersTrend >= 0 ? '+' : ''}${metrics.value.usersTrend.toFixed(1)}% from last month`
  },
  {
    title: 'Active Pets',
    value: metrics.value.totalPets.toLocaleString(),
    trend: metrics.value.petsTrend,
    icon: 'mdi-paw',
    color: 'success',
    subtitle: `${metrics.value.petsTrend >= 0 ? '+' : ''}${metrics.value.petsTrend.toFixed(1)}% from last month`
  },
  {
    title: 'Total Orders',
    value: metrics.value.totalOrders.toLocaleString(),
    trend: metrics.value.ordersTrend,
    icon: 'mdi-shopping',
    color: 'info',
    subtitle: `${metrics.value.ordersTrend >= 0 ? '+' : ''}${metrics.value.ordersTrend.toFixed(1)}% from last month`
  },
  {
    title: 'Revenue',
    value: `$${(metrics.value.totalRevenue / 1000).toFixed(1)}k`,
    trend: metrics.value.revenueTrend,
    icon: 'mdi-currency-usd',
    color: 'warning',
    subtitle: `${metrics.value.revenueTrend >= 0 ? '+' : ''}${metrics.value.revenueTrend.toFixed(1)}% from last month`
  }
])

const tasks = ref([
  {
    id: '1',
    title: 'EduPath',
    description: 'Platform for online learning and professional development',
    status: 'design',
    duration: 'Log 13h 20m',
    progress: 75
  },
  {
    id: '2',
    title: 'GreenMarket',
    description: 'Eco-friendly online grocery and household goods store',
    status: 'concept',
    duration: 'Log 8h 20m',
    progress: 45
  },
  {
    id: '3',
    title: 'TravelTales',
    description: 'A social network for travelers to share stories and plan trips',
    status: 're-design',
    duration: 'Log 80h 40m',
    progress: 90
  }
])

const topProducts = ref([
  { id: '1', title: 'Premium Dog Food', sales: 156, revenue: 78000 },
  { id: '2', title: 'Cat Litter Box', sales: 134, revenue: 45600 },
  { id: '3', title: 'Pet Vitamins', sales: 98, revenue: 32400 },
  { id: '4', title: 'Dog Leash Set', sales: 87, revenue: 26100 },
  { id: '5', title: 'Cat Toys Bundle', sales: 76, revenue: 19000 }
])

const recentOrders = ref([
  {
    id: 'ord_1234567890',
    customer_name: 'Maria Santos',
    total_amount: 2450,
    status: 'pending',
    created_at: new Date()
  },
  {
    id: 'ord_0987654321',
    customer_name: 'Juan Dela Cruz',
    total_amount: 1890,
    status: 'confirmed',
    created_at: new Date(Date.now() - 86400000)
  }
])

const todayAppointments = ref([
  {
    id: 'apt_1',
    pet_name: 'Buddy',
    customer_name: 'Anna Garcia',
    appointment_time: '10:00 AM',
    status: 'confirmed'
  },
  {
    id: 'apt_2',
    pet_name: 'Whiskers',
    customer_name: 'Carlos Reyes',
    appointment_time: '2:30 PM',
    status: 'pending'
  }
])

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

const getTaskStatusColor = (status: string) => {
  switch (status) {
    case 'design': return 'success'
    case 'concept': return 'info'
    case 're-design': return 'warning'
    default: return 'grey'
  }
}

const getAppointmentStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed': return 'success'
    case 'pending': return 'warning'
    case 'completed': return 'info'
    case 'cancelled': return 'error'
    default: return 'grey'
  }
}

const handleStatClick = (stat: any) => {
  console.log('Stat clicked:', stat)
  // Navigate to detailed view
}

const handleActivityAction = (action: any, activity: any) => {
  console.log('Activity action:', action, activity)
  // Handle activity actions
}

const getActivityIcon = (type: string) => {
  const icons = {
    success: 'mdi-check',
    warning: 'mdi-alert',
    error: 'mdi-close',
    info: 'mdi-information',
    default: 'mdi-circle-small',
  }
  return icons[type as keyof typeof icons] || icons.default
}

const formatTime = (timestamp: Date | string) => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  return format(date, 'HH:mm')
}

// Load dashboard metrics
const loadMetrics = async () => {
  loading.value = true
  try {
    // Mock data for now
    const data: DashboardMetrics = {
      totalUsers: 1250,
      totalPets: 890,
      totalOrders: 456,
      totalRevenue: 125000,
      usersTrend: 12.5,
      petsTrend: 8.3,
      ordersTrend: 15.2,
      revenueTrend: 22.1
    }
    metrics.value = data
  } catch (error) {
    console.error('Error loading metrics:', error)
  } finally {
    loading.value = false
  }
}

// Load chart data
const loadChartData = async () => {
  chartLoading.value = true
  try {
    // Mock chart data
    const data: ChartData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Revenue',
          data: [12000, 15000, 18000, 14000, 22000, 25000, 20000],
          borderColor: '#6366F1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)'
        }
      ]
    }
    chartData.value = data
  } catch (error) {
    console.error('Error loading chart data:', error)
  } finally {
    chartLoading.value = false
  }
}

// Load activities
const loadActivities = async () => {
  try {
    // Mock activities data
    const data: Activity[] = [
      {
        id: '1',
        type: 'success',
        message: 'New user registered: Maria Santos',
        timestamp: new Date()
      },
      {
        id: '2',
        type: 'info',
        message: 'Order #12345 has been processed',
        timestamp: new Date(Date.now() - 3600000)
      }
    ]
    activities.value = data
  } catch (error) {
    console.error('Error loading activities:', error)
  }
}

onMounted(async () => {
  await Promise.all([
    loadMetrics(),
    loadChartData(),
    loadActivities()
  ])
})
</script>

<style scoped>
.modern-dashboard {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.welcome-header {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(99, 102, 241, 0.02));
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(99, 102, 241, 0.1);
}

.user-avatar {
  border: 3px solid rgba(99, 102, 241, 0.2);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.stats-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stats-card--loading {
  pointer-events: none;
  opacity: 0.7;
}

.stats-card--loading .stats-icon {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.chart-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 250px;
}

.stats-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.stats-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0));
}

.bg-primary {
  background: linear-gradient(135deg, #6366F1, #4F46E5);
}

.bg-success {
  background: linear-gradient(135deg, #10B981, #059669);
}

.bg-warning {
  background: linear-gradient(135deg, #F59E0B, #D97706);
}

.bg-error {
  background: linear-gradient(135deg, #EF4444, #DC2626);
}

.bg-info {
  background: linear-gradient(135deg, #3B82F6, #2563EB);
}

.trend-chip {
  font-weight: 600;
  font-size: 0.75rem;
}

.activity-feed {
  height: 100%;
}

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
  background: linear-gradient(135deg, #10B981, #059669);
}

.activity-dot--warning {
  background: linear-gradient(135deg, #F59E0B, #D97706);
}

.activity-dot--error {
  background: linear-gradient(135deg, #EF4444, #DC2626);
}

.activity-dot--info {
  background: linear-gradient(135deg, #3B82F6, #2563EB);
}

.activity-dot--default {
  background: linear-gradient(135deg, #64748B, #475569);
}

.activity-line {
  width: 2px;
  flex: 1;
  background: rgba(0, 0, 0, 0.1);
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

.gap-2 {
  gap: 8px;
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
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.task-card--design {
  border-left-color: #10B981;
}

.task-card--concept {
  border-left-color: #3B82F6;
}

.task-card--re-design {
  border-left-color: #F59E0B;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .modern-dashboard {
    padding: 16px;
  }

  .welcome-header {
    padding: 16px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .task-grid {
    grid-template-columns: 1fr;
    gap: 16px;
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
  scrollbar-color: rgba(99, 102, 241, 0.3) transparent;
}

:deep(.activity-list::-webkit-scrollbar) {
  width: 4px;
}

:deep(.activity-list::-webkit-scrollbar-track) {
  background: transparent;
}

:deep(.activity-list::-webkit-scrollbar-thumb) {
  background: rgba(99, 102, 241, 0.3);
  border-radius: 2px;
}
</style>
