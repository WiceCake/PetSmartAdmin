<template>
  <div class="notifications-view">
    <!-- Enhanced Professional Header -->
    <v-card rounded="xl" class="page-header mb-6" elevation="2">
      <v-card-text class="pa-6">
        <div class="header-content">
          <div class="header-text">
            <div class="d-flex align-center mb-2">
              <v-icon icon="mdi-bell" size="32" color="primary" class="me-3" />
              <h1 class="page-title">Notification Center</h1>
            </div>
            <p class="page-subtitle">Monitor and manage all system notifications and alerts</p>
          </div>
          <div class="header-actions">

            <v-btn
              v-if="unreadNotifications.length > 0"
              color="secondary"
              size="large"
              variant="outlined"
              prepend-icon="mdi-check-all"
              :loading="markingAllAsRead"
              @click="handleMarkAllAsRead"
              class="mark-all-btn me-3"
            >
              Mark All as Read
            </v-btn>
            <v-btn
              color="primary"
              size="large"
              variant="flat"
              prepend-icon="mdi-refresh"
              :loading="loading"
              @click="refreshNotifications"
              class="refresh-btn"
            >
              Refresh
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Statistics Cards -->
    <v-row class="stats-section mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="xl" class="stats-card" elevation="2">
          <v-card-text class="pa-4">
            <div class="d-flex align-center">
              <div class="stats-icon-container me-3">
                <v-icon icon="mdi-bell" size="32" color="primary" />
              </div>
              <div>
                <div class="text-h5 font-weight-bold">{{ notifications.length }}</div>
                <div class="text-body-2 text-on-surface-variant">Total Notifications</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card rounded="xl" class="stats-card" elevation="2">
          <v-card-text class="pa-4">
            <div class="d-flex align-center">
              <div class="stats-icon-container me-3">
                <v-icon icon="mdi-bell-alert" size="32" color="error" />
              </div>
              <div>
                <div class="text-h5 font-weight-bold">{{ unreadCount }}</div>
                <div class="text-body-2 text-on-surface-variant">Unread</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card rounded="xl" class="stats-card" elevation="2">
          <v-card-text class="pa-4">
            <div class="d-flex align-center">
              <div class="stats-icon-container me-3">
                <v-icon icon="mdi-chevron-triple-up" size="32" color="warning" />
              </div>
              <div>
                <div class="text-h5 font-weight-bold">{{ notificationsByPriority.high.length }}</div>
                <div class="text-body-2 text-on-surface-variant">High Priority</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card rounded="xl" class="stats-card" elevation="2">
          <v-card-text class="pa-4">
            <div class="d-flex align-center">
              <div class="stats-icon-container me-3">
                <v-icon icon="mdi-calendar-today" size="32" color="info" />
              </div>
              <div>
                <div class="text-h5 font-weight-bold">{{ todayNotifications }}</div>
                <div class="text-body-2 text-on-surface-variant">Today</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Enhanced Filters Section -->
    <v-card rounded="xl" class="filters-card mb-6" elevation="2">
      <v-card-text class="pa-6">
        <div class="filters-header mb-4">
          <h3 class="text-h6 font-weight-bold">Filter & Search Notifications</h3>
          <p class="text-body-2 text-medium-emphasis">Find notifications by content, type, or priority</p>
        </div>

        <v-row>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="searchQuery"
              label="Search notifications..."
              placeholder="Search by title or message..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              clearable
              @update:model-value="debouncedSearch"
              class="search-field"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-select
              v-model="selectedType"
              label="Type"
              :items="typeFilterOptions"
              variant="outlined"
              density="comfortable"
              clearable
              @update:model-value="handleTypeFilter"
              class="filter-select"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-select
              v-model="selectedPriority"
              label="Priority"
              :items="priorityFilterOptions"
              variant="outlined"
              density="comfortable"
              clearable
              @update:model-value="handlePriorityFilter"
              class="filter-select"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-select
              v-model="selectedCategory"
              label="Category"
              :items="categoryFilterOptions"
              variant="outlined"
              density="comfortable"
              clearable
              @update:model-value="handleCategoryFilter"
              class="filter-select"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-select
              v-model="selectedStatus"
              label="Status"
              :items="statusFilterOptions"
              variant="outlined"
              density="comfortable"
              clearable
              @update:model-value="handleStatusFilter"
              class="filter-select"
            />
          </v-col>

          <v-col cols="12" md="1">
            <v-btn
              color="primary"
              variant="outlined"
              size="large"
              block
              @click="resetFilters"
              class="reset-btn"
            >
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Enhanced Notifications Table -->
    <v-card rounded="xl" class="notifications-table-card" elevation="2">
      <v-card-title class="table-header pa-6">
        <div class="d-flex align-center justify-space-between w-100">
          <div>
            <h3 class="text-h6 font-weight-bold">Notifications</h3>
            <p class="text-body-2 text-medium-emphasis">{{ filteredNotifications.length }} notifications found</p>
          </div>
          <div class="d-flex align-center gap-2">
            <v-chip
              v-if="loading"
              color="primary"
              variant="tonal"
              size="small"
            >
              <v-progress-circular size="12" width="2" indeterminate class="me-2" />
              Loading...
            </v-chip>
            <v-chip
              v-else
              color="success"
              variant="tonal"
              size="small"
            >
              {{ filteredNotifications.length }} of {{ notifications.length }} notifications
            </v-chip>
          </div>
        </div>
      </v-card-title>

      <v-divider />

      <!-- Enhanced Bulk Actions Bar -->
      <v-slide-y-transition>
        <div v-if="selectedNotifications.length > 0" class="bulk-actions-bar">
          <div class="bulk-actions-content">
            <div class="bulk-selection-info">
              <v-icon icon="mdi-checkbox-marked" color="primary" size="20" class="me-2" />
              <span class="text-body-1 font-weight-medium text-primary">
                {{ selectedNotifications.length }} notification{{ selectedNotifications.length > 1 ? 's' : '' }} selected
              </span>
            </div>
            <div class="bulk-actions-buttons">
              <v-btn
                variant="flat"
                size="small"
                color="success"
                prepend-icon="mdi-check-all"
                :loading="bulkMarkingAsRead"
                @click="handleBulkMarkAsRead"
                class="bulk-action-btn me-2"
              >
                Mark as Read
              </v-btn>
              <v-btn
                variant="flat"
                size="small"
                color="error"
                prepend-icon="mdi-delete"
                :loading="bulkDeleting"
                @click="handleBulkDelete"
                class="bulk-action-btn me-2"
              >
                Delete
              </v-btn>
              <v-btn
                variant="outlined"
                size="small"
                color="default"
                @click="clearSelection"
                class="bulk-action-btn"
              >
                Clear
              </v-btn>
            </div>
          </div>
        </div>
      </v-slide-y-transition>

      <!-- Error Alert -->
      <v-alert
        v-if="error"
        type="error"
        variant="tonal"
        class="ma-4"
        closable
        @click:close="error = null"
      >
        {{ error }}
      </v-alert>

      <div class="table-wrapper">
        <!-- Custom Table with Manual Pagination -->
        <v-table class="modern-custom-table" hover>
          <thead>
            <tr>
              <th style="width: 50px;">
                <v-checkbox
                  v-model="selectAll"
                  @update:model-value="handleSelectAll"
                  hide-details
                  density="compact"
                />
              </th>
              <th v-for="header in headers" :key="header.key" :style="{ width: header.width, minWidth: header.minWidth }">
                {{ header.title }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td :colspan="headers.length + 1" class="text-center py-8">
                <v-progress-circular indeterminate color="primary" size="40" />
                <div class="mt-2 text-body-2">Loading notifications...</div>
              </td>
            </tr>
            <tr v-else-if="filteredNotifications.length === 0">
              <td :colspan="headers.length + 1" class="text-center py-8">
                <v-icon size="48" color="grey-lighten-2" class="mb-2">mdi-bell-outline</v-icon>
                <div class="text-h6 mb-2">No notifications found</div>
                <div class="text-body-2 text-medium-emphasis">
                  {{ searchQuery ? 'Try adjusting your search terms or filters' : 'You\'re all caught up!' }}
                </div>
              </td>
            </tr>
            <tr v-else v-for="item in paginatedNotifications" :key="item.id"
                class="table-row"
                :class="{ 'notification-unread': !item.is_read }"
                @click="handleRowClick($event, item)">
              <!-- Checkbox -->
              <td>
                <v-checkbox
                  v-model="selectedNotifications"
                  :value="item.id"
                  hide-details
                  density="compact"
                  @click.stop
                />
              </td>

              <!-- Notification Info -->
              <td>
                <div class="notification-info d-flex align-center">
                  <v-avatar size="40" class="me-3 flex-shrink-0" :color="getNotificationColor(item.type)" variant="tonal">
                    <v-icon :icon="getNotificationIcon(item.type)" />
                  </v-avatar>
                  <div class="notification-content">
                    <div class="notification-title font-weight-medium text-body-1 mb-1">
                      {{ item.title }}
                    </div>
                    <div class="notification-message text-body-2 text-medium-emphasis mb-1">
                      {{ item.message }}
                    </div>
                    <div class="notification-meta d-flex align-center gap-4">
                      <v-chip
                        :color="getNotificationColor(item.type)"
                        size="x-small"
                        variant="tonal"
                        class="me-1"
                      >
                        {{ item.category }}
                      </v-chip>
                      <v-chip
                        :color="getPriorityColor(item.priority)"
                        size="x-small"
                        variant="tonal"
                        class="me-1"
                      >
                        <v-icon start size="10">{{ getPriorityIcon(item.priority) }}</v-icon>
                        {{ item.priority.charAt(0).toUpperCase() + item.priority.slice(1) }}
                      </v-chip>
                      <span class="text-caption text-medium-emphasis ml-2">
                        {{ formatTimeAgo(item.created_at) }}
                      </span>
                    </div>
                  </div>
                </div>
              </td>

              <!-- Status -->
              <td>
                <v-chip
                  :color="item.is_read ? 'success' : 'warning'"
                  size="small"
                  variant="tonal"
                  class="font-weight-medium"
                >
                  <v-icon
                    :icon="item.is_read ? 'mdi-check-circle' : 'mdi-circle-outline'"
                    size="16"
                    class="me-1"
                  />
                  {{ item.is_read ? 'Read' : 'Unread' }}
                </v-chip>
              </td>

              <!-- Actions -->
              <td>
                <div class="actions-column">
                  <div class="d-flex align-center gap-1">
                    <v-btn
                      v-if="!item.is_read"
                      icon="mdi-check"
                      variant="text"
                      size="small"
                      color="success"
                      @click.stop="handleMarkAsRead(item.id)"
                      title="Mark as read"
                    />
                    <v-btn
                      v-if="item.action_url"
                      icon="mdi-open-in-new"
                      variant="text"
                      size="small"
                      color="info"
                      @click.stop="handleNotificationAction(item)"
                      title="View details"
                    />
                    <v-btn
                      icon="mdi-delete"
                      variant="text"
                      size="small"
                      color="error"
                      @click.stop="handleDeleteNotification(item.id)"
                      title="Delete notification"
                    />
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>

        <!-- Custom Pagination Footer -->
        <div v-if="!loading && filteredNotifications.length > 0" class="custom-pagination-footer">
          <div class="pagination-info">
            <div class="items-per-page-section">
              <span class="text-body-2 me-2">Rows per page:</span>
              <v-select
                v-model="itemsPerPage"
                :items="[10, 25, 50, 100]"
                variant="outlined"
                density="compact"
                hide-details
                class="items-per-page-select"
                @update:model-value="handleItemsPerPageChange"
              />
            </div>

            <div class="pagination-text">
              <span class="text-body-2">
                {{ getPaginationText() }}
              </span>
            </div>
          </div>

          <div class="pagination-controls">
            <v-btn
              icon="mdi-chevron-left"
              variant="text"
              size="small"
              :disabled="page <= 1 || loading"
              @click="goToPage(page - 1)"
              class="pagination-btn"
            />

            <div class="page-numbers">
              <v-btn
                v-for="pageNum in getVisiblePages()"
                :key="pageNum"
                :variant="pageNum === page ? 'flat' : 'text'"
                :color="pageNum === page ? 'primary' : 'default'"
                size="small"
                :disabled="loading"
                @click="goToPage(pageNum)"
                class="pagination-btn"
                min-width="40"
              >
                {{ pageNum }}
              </v-btn>
            </div>

            <v-btn
              icon="mdi-chevron-right"
              variant="text"
              size="small"
              :disabled="page >= totalPages || loading"
              @click="goToPage(page + 1)"
              class="pagination-btn"
            />
          </div>
        </div>
      </div>
    </v-card>

    <!-- Loading State -->
    <div v-if="loading && notifications.length === 0" class="d-flex justify-center py-12">
      <div class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
          width="6"
        />
        <p class="text-body-1 text-medium-emphasis mt-4">Loading notifications...</p>
      </div>
    </div>

    <!-- Empty State -->
    <v-card v-if="!loading && notifications.length === 0" rounded="xl" class="text-center py-16" elevation="2">
      <v-icon size="80" color="grey-lighten-2" class="mb-6">mdi-bell-outline</v-icon>
      <h3 class="text-h4 font-weight-bold mb-3">No notifications yet</h3>
      <p class="text-body-1 text-medium-emphasis mb-6 mx-auto" style="max-width: 400px;">
        You're all caught up! New notifications will appear here when they arrive.
      </p>
      <v-btn
        color="primary"
        variant="outlined"
        size="large"
        prepend-icon="mdi-refresh"
        @click="refreshNotifications"
      >
        Refresh
      </v-btn>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useGlobalRealtime } from '@/composables/useGlobalRealtime'
import { debounce } from 'lodash-es'

const router = useRouter()
const toast = useToast()

// Use global real-time service
const {
  notifications,
  unreadNotificationCount: unreadCount,
  notificationsLoading: loading,
  lastNotificationUpdate,
  markNotificationAsRead: markAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  forceRefresh,
  getNotificationIcon,
  getNotificationColor,
  getPriorityIcon,
  getPriorityColor,
  formatTimeAgo
} = useGlobalRealtime()

// Local state
const searchQuery = ref('')
const selectedType = ref('')
const selectedPriority = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')
const page = ref(1)
const itemsPerPage = ref(25)
const selectedNotifications = ref<string[]>([])
const selectAll = ref(false)
const error = ref<string | null>(null)

// Loading states
const markingAllAsRead = ref(false)
const bulkMarkingAsRead = ref(false)
const bulkDeleting = ref(false)
// creatingTestNotification is handled by the global service

// Filter options
const typeFilterOptions = [
  { title: 'All Types', value: '' },
  { title: 'Success', value: 'success' },
  { title: 'Info', value: 'info' },
  { title: 'Warning', value: 'warning' },
  { title: 'Error', value: 'error' }
]

const priorityFilterOptions = [
  { title: 'All Priorities', value: '' },
  { title: 'High', value: 'high' },
  { title: 'Medium', value: 'medium' },
  { title: 'Low', value: 'low' }
]

const categoryFilterOptions = [
  { title: 'All Categories', value: '' },
  { title: 'System', value: 'system' },
  { title: 'User Management', value: 'user_management' },
  { title: 'Orders', value: 'orders' },
  { title: 'Products', value: 'products' },
  { title: 'Security', value: 'security' },
  { title: 'Appointments', value: 'appointments' },
  { title: 'General', value: 'general' }
]

const statusFilterOptions = [
  { title: 'All Status', value: '' },
  { title: 'Unread', value: 'unread' },
  { title: 'Read', value: 'read' }
]

// Table headers
const headers = [
  { title: 'Notification', key: 'notification', width: '60%', minWidth: '400px' },
  { title: 'Status', key: 'status', width: '20%', minWidth: '120px' },
  { title: 'Actions', key: 'actions', width: '20%', minWidth: '150px' }
]

// Computed properties
const filteredNotifications = computed(() => {
  let filtered = [...notifications.value]

  // Apply search filter
  if (searchQuery.value) {
    const searchLower = searchQuery.value.toLowerCase()
    filtered = filtered.filter(n =>
      n.title.toLowerCase().includes(searchLower) ||
      n.message.toLowerCase().includes(searchLower)
    )
  }

  // Apply type filter
  if (selectedType.value) {
    filtered = filtered.filter(n => n.type === selectedType.value)
  }

  // Apply priority filter
  if (selectedPriority.value) {
    filtered = filtered.filter(n => n.priority === selectedPriority.value)
  }

  // Apply category filter
  if (selectedCategory.value) {
    filtered = filtered.filter(n => n.category === selectedCategory.value)
  }

  // Apply status filter
  if (selectedStatus.value) {
    if (selectedStatus.value === 'unread') {
      filtered = filtered.filter(n => !n.is_read)
    } else if (selectedStatus.value === 'read') {
      filtered = filtered.filter(n => n.is_read)
    }
  }

  // Sort by created_at (newest first)
  return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})

const paginatedNotifications = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredNotifications.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredNotifications.value.length / itemsPerPage.value)
})

// Add missing computed properties for compatibility
const unreadNotifications = computed(() =>
  notifications.value.filter(n => !n.is_read)
)

const notificationsByPriority = computed(() => ({
  high: notifications.value.filter(n => n.priority === 'high'),
  medium: notifications.value.filter(n => n.priority === 'medium'),
  low: notifications.value.filter(n => n.priority === 'low')
}))

const todayNotifications = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return notifications.value.filter(n => {
    const notificationDate = new Date(n.created_at)
    notificationDate.setHours(0, 0, 0, 0)
    return notificationDate.getTime() === today.getTime()
  }).length
})

// Methods
const refreshNotifications = async () => {
  await forceRefresh()
}

// createTestNotification is now provided by the global real-time service

const handleMarkAllAsRead = async () => {
  if (unreadNotifications.value.length === 0) return

  markingAllAsRead.value = true
  try {
    const { error } = await markAllNotificationsAsRead()
    if (error) throw error
    toast.success('All notifications marked as read')
  } catch (error) {
    toast.error('Failed to mark all notifications as read')
  } finally {
    markingAllAsRead.value = false
  }
}

const handleMarkAsRead = async (notificationId: string) => {
  try {
    const { error } = await markAsRead(notificationId)
    if (error) throw error
    // No toast for individual mark as read to avoid spam
  } catch (error) {
    toast.error('Failed to mark notification as read')
  }
}

const handleDeleteNotification = async (notificationId: string) => {
  try {
    const { error } = await deleteNotification(notificationId)
    if (error) throw error
    // Toast notification will be shown by real-time watcher
  } catch (error) {
    toast.error('Failed to delete notification')
  }
}

const handleBulkMarkAsRead = async () => {
  if (selectedNotifications.value.length === 0) return

  bulkMarkingAsRead.value = true
  try {
    // Mark each selected notification as read
    for (const notificationId of selectedNotifications.value) {
      await markAsRead(notificationId)
    }
    toast.success(`${selectedNotifications.value.length} notifications marked as read`)
    clearSelection()
  } catch (error) {

    toast.error('Failed to mark notifications as read')
  } finally {
    bulkMarkingAsRead.value = false
  }
}

const handleBulkDelete = async () => {
  if (selectedNotifications.value.length === 0) return

  bulkDeleting.value = true
  try {
    // Delete each selected notification individually
    for (const notificationId of selectedNotifications.value) {
      await deleteNotification(notificationId)
    }
    toast.success(`${selectedNotifications.value.length} notifications deleted`)
    clearSelection()
  } catch (error) {
    toast.error('Failed to delete notifications')
  } finally {
    bulkDeleting.value = false
  }
}

const handleNotificationAction = (notification: any) => {
  if (notification.action_url) {
    router.push(notification.action_url)
  }
}

const handleRowClick = (event: Event, notification: any) => {
  // Mark as read when clicking on the row (but not on action buttons)
  if (!notification.is_read) {
    handleMarkAsRead(notification.id)
  }
}

// Selection methods
const handleSelectAll = (value: boolean) => {
  if (value) {
    selectedNotifications.value = paginatedNotifications.value.map(n => n.id)
  } else {
    selectedNotifications.value = []
  }
}

const clearSelection = () => {
  selectedNotifications.value = []
  selectAll.value = false
}

// Filter methods
const debouncedSearch = debounce(() => {
  page.value = 1 // Reset to first page when searching
}, 300)

const handleTypeFilter = () => {
  page.value = 1
}

const handlePriorityFilter = () => {
  page.value = 1
}

const handleCategoryFilter = () => {
  page.value = 1
}

const handleStatusFilter = () => {
  page.value = 1
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedType.value = ''
  selectedPriority.value = ''
  selectedCategory.value = ''
  selectedStatus.value = ''
  page.value = 1
}

// Pagination methods
const goToPage = (newPage: number) => {
  if (newPage >= 1 && newPage <= totalPages.value) {
    page.value = newPage
    clearSelection()
  }
}

const handleItemsPerPageChange = () => {
  page.value = 1
  clearSelection()
}

const getPaginationText = () => {
  const start = (page.value - 1) * itemsPerPage.value + 1
  const end = Math.min(page.value * itemsPerPage.value, filteredNotifications.value.length)
  const total = filteredNotifications.value.length
  return `${start}-${end} of ${total} notifications`
}

const getVisiblePages = () => {
  const total = totalPages.value
  const current = page.value
  const delta = 2

  const range = []
  const rangeWithDots = []

  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i)
  }

  if (current - delta > 2) {
    rangeWithDots.push(1, '...')
  } else {
    rangeWithDots.push(1)
  }

  rangeWithDots.push(...range)

  if (current + delta < total - 1) {
    rangeWithDots.push('...', total)
  } else {
    rangeWithDots.push(total)
  }

  return rangeWithDots.filter((item, index, arr) => arr.indexOf(item) === index && item !== '...' || item === '...')
}

// Watchers
watch(selectedNotifications, (newVal) => {
  selectAll.value = newVal.length === paginatedNotifications.value.length && newVal.length > 0
})

watch(paginatedNotifications, () => {
  // Clear selection when pagination changes
  if (selectedNotifications.value.length > 0) {
    selectedNotifications.value = selectedNotifications.value.filter(id =>
      paginatedNotifications.value.some(n => n.id === id)
    )
  }
})

// Watch for real-time notification updates
watch(lastNotificationUpdate, (update) => {
  if (update) {
    if (update.type === 'DELETE') {
      // Show toast notification for successful delete
      toast.success('Notification deleted successfully')

      // Clear selection if deleted notification was selected
      if (selectedNotifications.value.includes(update.notification.id)) {
        selectedNotifications.value = selectedNotifications.value.filter(id => id !== update.notification.id)
      }
    } else if (update.type === 'INSERT') {
      // Show toast for new notifications (optional)
      if (update.notification.priority === 'high') {
        toast.info(`New ${update.notification.priority} priority notification: ${update.notification.title}`)
      }
    } else if (update.type === 'UPDATE') {
      // Handle notification updates (like mark as read)
      // No toast needed as this is handled by the mark as read action
    }
  }
}, { deep: true })

// Lifecycle - notifications are loaded by the global real-time service
onMounted(async () => {
  // Global real-time service handles data loading
  // No need to load notifications here
})
</script>

<style scoped>
/* Page Layout */
.notifications-view {
  padding: 24px;
  background-color: rgb(var(--v-theme-background));
  min-height: 100vh;
}

/* Header Styles */
.page-header {
  border-radius: 20px;
  border: 1px solid rgba(var(--v-theme-outline), 0.12);
  background: rgb(var(--v-theme-surface));
  transition: all 0.3s ease;
}

.page-header:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  flex-wrap: wrap;
}

.header-text {
  flex: 1;
  min-width: 300px;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 1rem;
  color: rgb(var(--v-theme-on-surface-variant));
  line-height: 1.5;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.mark-all-btn,
.refresh-btn {
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.mark-all-btn:hover,
.refresh-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.3);
}

/* Stats Cards */
.stats-section {
  margin-bottom: 24px;
}

.stats-card {
  border-radius: 20px;
  transition: all 0.3s ease;
  border: 1px solid rgba(var(--v-theme-outline), 0.12);
  background: rgb(var(--v-theme-surface));
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stats-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background-color: rgba(var(--v-theme-primary), 0.1);
}

/* Filters Card */
.filters-card {
  border-radius: 20px;
  border: 1px solid rgba(var(--v-theme-outline), 0.12);
  background: rgb(var(--v-theme-surface));
}

.filters-header {
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.12);
  padding-bottom: 16px;
  margin-bottom: 24px;
}

.search-field,
.filter-select {
  border-radius: 12px;
}

.reset-btn {
  border-radius: 12px;
  height: 56px;
}

/* Table Styles */
.notifications-table-card {
  border-radius: 20px;
  border: 1px solid rgba(var(--v-theme-outline), 0.12);
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
}

.table-header {
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.12);
}

/* Enhanced Bulk Actions Bar */
.bulk-actions-bar {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.08), rgba(var(--v-theme-primary), 0.04));
  border-bottom: 1px solid rgba(var(--v-theme-primary), 0.2);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.bulk-actions-bar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, rgb(var(--v-theme-primary)), rgba(var(--v-theme-primary), 0.5));
}

.bulk-actions-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  gap: 16px;
  flex-wrap: wrap;
}

.bulk-selection-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 200px;
}

.bulk-actions-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.bulk-action-btn {
  border-radius: 8px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  min-width: 100px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.bulk-action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modern-custom-table {
  background-color: transparent;
}

.modern-custom-table thead th {
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface-variant));
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.12);
  padding: 16px;
}

.table-row {
  transition: all 0.2s ease;
  cursor: pointer;
}

.table-row:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.notification-unread {
  background-color: rgba(var(--v-theme-warning), 0.05);
  border-left: 4px solid rgb(var(--v-theme-warning));
}

.notification-unread:hover {
  background-color: rgba(var(--v-theme-warning), 0.08);
}

.notification-info {
  padding: 12px 0;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 0.95rem;
  line-height: 1.4;
  margin-bottom: 4px;
}

.notification-message {
  font-size: 0.875rem;
  line-height: 1.4;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-meta {
  font-size: 0.75rem;
}

.actions-column {
  padding: 8px 0;
}

/* Pagination */
.custom-pagination-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid rgba(var(--v-theme-outline), 0.12);
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
  flex-wrap: wrap;
  gap: 16px;
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.items-per-page-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.items-per-page-select {
  width: 80px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-btn {
  min-width: 40px;
  height: 40px;
}

/* Dark theme adjustments */
.v-theme--dark .notifications-view {
  background-color: rgb(var(--v-theme-background));
}

.v-theme--dark .page-header {
  background: rgb(var(--v-theme-surface));
  border-color: rgba(var(--v-theme-outline), 0.2);
}

.v-theme--dark .page-header:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.v-theme--dark .stats-card {
  background: rgb(var(--v-theme-surface));
  border-color: rgba(var(--v-theme-outline), 0.2);
}

.v-theme--dark .stats-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.v-theme--dark .stats-icon-container {
  background-color: rgba(var(--v-theme-primary), 0.15);
}

.v-theme--dark .filters-card {
  background: rgb(var(--v-theme-surface));
  border-color: rgba(var(--v-theme-outline), 0.2);
}

.v-theme--dark .filters-header {
  border-bottom-color: rgba(var(--v-theme-outline), 0.2);
}

.v-theme--dark .notifications-table-card {
  background: rgb(var(--v-theme-surface));
  border-color: rgba(var(--v-theme-outline), 0.2);
}

.v-theme--dark .table-header {
  background-color: rgba(var(--v-theme-surface-variant), 0.5);
  border-bottom-color: rgba(var(--v-theme-outline), 0.2);
}

/* Dark Mode Bulk Actions Bar */
.v-theme--dark .bulk-actions-bar {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.12), rgba(var(--v-theme-primary), 0.06));
  border-bottom-color: rgba(var(--v-theme-primary), 0.3);
  backdrop-filter: blur(10px);
}

.v-theme--dark .bulk-actions-bar::before {
  background: linear-gradient(90deg, rgb(var(--v-theme-primary)), rgba(var(--v-theme-primary), 0.7));
}

.v-theme--dark .bulk-selection-info span {
  color: rgb(var(--v-theme-primary));
}

.v-theme--dark .bulk-action-btn {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.v-theme--dark .bulk-action-btn:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.v-theme--dark .modern-custom-table thead th {
  background-color: rgba(var(--v-theme-surface-variant), 0.5);
  color: rgb(var(--v-theme-on-surface));
  border-bottom-color: rgba(var(--v-theme-outline), 0.2);
}

.v-theme--dark .table-row:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
}

.v-theme--dark .notification-unread {
  background-color: rgba(var(--v-theme-warning), 0.08);
  border-left-color: rgb(var(--v-theme-warning));
}

.v-theme--dark .notification-unread:hover {
  background-color: rgba(var(--v-theme-warning), 0.12);
}

.v-theme--dark .custom-pagination-footer {
  background-color: rgba(var(--v-theme-surface-variant), 0.5);
  border-top-color: rgba(var(--v-theme-outline), 0.2);
}

.v-theme--dark .mark-all-btn:hover,
.v-theme--dark .refresh-btn:hover {
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.4);
}

.v-theme--dark .search-field :deep(.v-field),
.v-theme--dark .filter-select :deep(.v-field) {
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
  border-color: rgba(var(--v-theme-outline), 0.2);
}

.v-theme--dark .reset-btn {
  border-color: rgba(var(--v-theme-outline), 0.2);
}

/* Responsive Design */
@media (max-width: 768px) {
  .notifications-view {
    padding: 16px;
  }

  .page-header {
    border-radius: 16px;
  }

  .page-title {
    font-size: 1.75rem;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .header-text {
    min-width: auto;
  }

  .header-actions {
    justify-content: stretch;
  }

  .header-actions .v-btn {
    flex: 1;
  }

  .stats-card,
  .filters-card,
  .notifications-table-card {
    border-radius: 16px;
  }

  .bulk-actions-content {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 12px 16px;
  }

  .bulk-selection-info {
    justify-content: center;
    min-width: auto;
  }

  .bulk-actions-buttons {
    justify-content: center;
  }

  .bulk-action-btn {
    flex: 1;
    min-width: 80px;
  }

  .custom-pagination-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .pagination-info {
    justify-content: center;
  }

  .pagination-controls {
    justify-content: center;
  }
}

@media (max-width: 600px) {
  .page-title {
    font-size: 1.75rem;
  }

  .stats-section .v-col {
    padding: 6px;
  }

  .notification-content {
    padding-right: 8px;
  }

  .notification-message {
    -webkit-line-clamp: 1;
  }
}
</style>
