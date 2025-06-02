<template>
  <div class="messages-view">
    <!-- Enhanced Professional Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">Message Management</h1>
          <p class="page-subtitle">Manage customer conversations and support tickets across the platform</p>
        </div>
        <div class="header-actions">
          <v-btn
            color="secondary"
            size="large"
            variant="outlined"
            prepend-icon="mdi-refresh"
            :loading="loading"
            @click="refreshData"
            class="refresh-btn me-3"
          >
            {{ loading ? 'Refreshing...' : 'Refresh' }}
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Statistics Cards - Simplified to 3-card layout -->
    <v-row class="stats-section mb-6">
      <v-col cols="12" sm="6" md="4">
        <v-card rounded="xl" class="stats-card" elevation="2">
          <v-card-text class="pa-4">
            <div class="d-flex align-center">
              <div class="stats-icon-container me-3">
                <v-icon icon="mdi-message-text" size="32" color="primary" />
              </div>
              <div>
                <div class="text-h5 font-weight-bold">{{ stats.total }}</div>
                <div class="text-body-2 text-on-surface-variant">Total Conversations</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card rounded="xl" class="stats-card" elevation="2">
          <v-card-text class="pa-4">
            <div class="d-flex align-center">
              <div class="stats-icon-container me-3">
                <v-icon icon="mdi-clock-outline" size="32" color="warning" />
              </div>
              <div>
                <div class="text-h5 font-weight-bold">{{ stats.pending }}</div>
                <div class="text-body-2 text-on-surface-variant">Pending</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card rounded="xl" class="stats-card" elevation="2">
          <v-card-text class="pa-4">
            <div class="d-flex align-center">
              <div class="stats-icon-container me-3">
                <v-icon icon="mdi-check-all" size="32" color="success" />
              </div>
              <div>
                <div class="text-h5 font-weight-bold">{{ stats.resolved }}</div>
                <div class="text-body-2 text-on-surface-variant">Resolved</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Enhanced Filters Section - Simplified -->
    <v-card rounded="xl" class="filters-card mb-6" elevation="2">
      <v-card-text class="pa-6">
        <div class="filters-header mb-4">
          <h3 class="text-h6 font-weight-bold">Filter & Search Conversations</h3>
          <p class="text-body-2 text-medium-emphasis">Find conversations by customer name, email, or status</p>
        </div>

        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchQuery"
              label="Search conversations..."
              placeholder="Search by customer name, email, or message content..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              clearable
              @input="debouncedSearch"
              class="search-field"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="statusFilter"
              label="Status"
              :items="statusFilterOptions"
              variant="outlined"
              density="comfortable"
              clearable
              @update:model-value="applyFilters"
              class="filter-select"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-btn
              color="primary"
              variant="outlined"
              size="large"
              block
              @click="clearFilters"
              class="reset-btn"
            >
              <v-icon start>mdi-refresh</v-icon>
              Reset
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Modern Conversations Table -->
    <v-card class="conversations-table-card" rounded="xl">
      <v-card-title class="pa-6 pb-4">
        <div class="d-flex align-center justify-space-between w-100">
          <div class="d-flex align-center">
            <v-icon icon="mdi-message-text" class="me-2" />
            <span class="text-h6 font-weight-bold">Conversations Directory</span>
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
              {{ conversations.length }} of {{ totalConversations }} conversations
            </v-chip>
          </div>
        </div>
      </v-card-title>

      <!-- Bulk Actions Bar - Simplified -->
      <div v-if="selectedConversations.length > 0" class="bulk-actions-bar">
        <div class="bulk-actions-info">
          <v-icon class="me-2" color="primary">mdi-checkbox-marked</v-icon>
          <span class="font-weight-medium">{{ selectedConversations.length }} conversation(s) selected</span>
        </div>
        <div class="bulk-actions-buttons">
          <v-btn
            variant="outlined"
            size="small"
            prepend-icon="mdi-check-circle"
            @click="bulkMarkResolved"
            class="me-2"
          >
            Mark Resolved
          </v-btn>
          <v-btn
            variant="text"
            size="small"
            prepend-icon="mdi-close"
            @click="clearSelection"
          >
            Clear
          </v-btn>
        </div>
      </div>

      <div class="table-wrapper">
        <!-- Custom Table with Manual Pagination - Following Users page pattern -->
        <v-table class="modern-custom-table" hover>
          <thead>
            <tr>
              <th style="width: 50px;">
                <v-checkbox
                  v-model="selectAll"
                  @change="toggleSelectAll"
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
              <td colspan="6" class="text-center py-8">
                <v-progress-circular indeterminate color="primary" size="40" />
                <div class="mt-2 text-body-2">Loading conversations...</div>
              </td>
            </tr>
            <tr v-else-if="conversations.length === 0">
              <td colspan="6" class="text-center py-8">
                <v-icon size="48" color="grey-lighten-2" class="mb-2">mdi-message-outline</v-icon>
                <div class="text-h6 mb-2">No conversations found</div>
                <div class="text-body-2 text-medium-emphasis">
                  {{ hasActiveFilters ? 'Try adjusting your filters' : 'Conversations will appear here when customers start messaging' }}
                </div>
              </td>
            </tr>

            <tr v-else v-for="conversation in paginatedConversations" :key="conversation.id"
                class="table-row"
                :class="{ 'unread-conversation': conversation.unread_messages > 0 }"
                @click="handleRowClick($event, conversation)">
              <!-- Checkbox -->
              <td @click.stop>
                <v-checkbox
                  v-model="selectedConversations"
                  :value="conversation.id"
                  hide-details
                  density="compact"
                />
              </td>

              <!-- Customer (Avatar & Name) - Enhanced with tooltips -->
              <td>
                <div class="user-info d-flex align-center">
                  <v-avatar size="40" color="primary" class="me-3 flex-shrink-0">
                    <span class="text-white font-weight-medium">
                      {{ getCustomerInitials(conversation.user_first_name, conversation.user_last_name) }}
                    </span>
                  </v-avatar>
                  <div class="user-text-content">
                    <v-tooltip
                      :text="getCustomerName(conversation.user_first_name, conversation.user_last_name)"
                      location="top"
                      :disabled="!getCustomerName(conversation.user_first_name, conversation.user_last_name) || getCustomerName(conversation.user_first_name, conversation.user_last_name).length <= 20"
                    >
                      <template #activator="{ props }">
                        <div
                          class="user-name font-weight-medium text-body-1"
                          v-bind="props"
                        >
                          {{ getCustomerName(conversation.user_first_name, conversation.user_last_name) }}
                        </div>
                      </template>
                    </v-tooltip>
                    <v-tooltip
                      :text="conversation.user_email"
                      location="bottom"
                      :disabled="!conversation.user_email || conversation.user_email.length <= 25"
                    >
                      <template #activator="{ props }">
                        <div
                          class="user-email text-caption text-medium-emphasis"
                          v-bind="props"
                        >
                          {{ conversation.user_email }}
                        </div>
                      </template>
                    </v-tooltip>
                  </div>
                </div>
              </td>

              <!-- Subject - Enhanced with better formatting -->
              <td>
                <div class="subject-column">
                  <div class="d-flex align-center">
                    <v-tooltip
                      :text="conversation.subject || 'No subject'"
                      location="top"
                      :disabled="!conversation.subject || conversation.subject.length <= 25"
                    >
                      <template #activator="{ props }">
                        <span
                          class="text-body-2 font-weight-medium subject-text"
                          v-bind="props"
                        >
                          {{ conversation.subject || 'No subject' }}
                        </span>
                      </template>
                    </v-tooltip>
                    <v-chip
                      v-if="conversation.unread_messages > 0"
                      color="error"
                      size="x-small"
                      variant="elevated"
                      class="ms-2 unread-badge"
                    >
                      <v-icon size="10" class="me-1">mdi-message-alert</v-icon>
                      {{ conversation.unread_messages }}
                    </v-chip>
                  </div>
                </div>
              </td>

              <!-- Last Message - Enhanced with better preview -->
              <td>
                <div class="message-column">
                  <v-tooltip
                    :text="conversation.last_message_content || 'No messages'"
                    location="top"
                    :disabled="!conversation.last_message_content || conversation.last_message_content.length <= 40"
                  >
                    <template #activator="{ props }">
                      <div
                        class="text-body-2 message-preview"
                        v-bind="props"
                      >
                        {{ conversation.last_message_content || 'No messages' }}
                      </div>
                    </template>
                  </v-tooltip>
                  <div class="d-flex align-center justify-space-between mt-1">
                    <div class="d-flex align-center">
                      <v-icon
                        size="12"
                        :color="conversation.last_message_sender_type === 'admin' ? 'primary' : 'default'"
                        class="me-1"
                      >
                        {{ conversation.last_message_sender_type === 'admin' ? 'mdi-account-tie' : 'mdi-account' }}
                      </v-icon>
                      <span class="text-caption text-medium-emphasis">
                        {{ conversation.last_message_sender_type === 'admin' ? 'Admin' : 'Customer' }}
                      </span>
                    </div>
                    <span class="text-caption text-medium-emphasis">
                      {{ formatTimeAgo(conversation.last_message_at) }}
                    </span>
                  </div>
                </div>
              </td>

              <!-- Status - Enhanced with icons -->
              <td>
                <v-chip
                  :color="getStatusColor(conversation.status)"
                  size="small"
                  variant="tonal"
                  class="font-weight-medium status-chip"
                >
                  <v-icon
                    :icon="conversation.status === 'pending' ? 'mdi-clock-outline' : 'mdi-check-all'"
                    size="16"
                    class="me-1"
                  />
                  {{ conversation.status }}
                </v-chip>
              </td>

              <!-- Updated Date - Enhanced with better formatting -->
              <td>
                <div class="date-column">
                  <div class="text-body-2 font-weight-medium">
                    {{ formatDate(conversation.updated_at) }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ formatTime(conversation.updated_at) }}
                  </div>
                </div>
              </td>

              <!-- Actions - Simplified -->
              <td>
                <div class="actions-column">
                  <!-- Desktop Actions -->
                  <div class="desktop-actions d-flex align-center gap-1">
                    <v-btn
                      icon="mdi-eye"
                      variant="text"
                      size="small"
                      color="info"
                      @click.stop="openConversation(conversation)"
                      title="View Conversation"
                    />
                    <v-btn
                      icon="mdi-check-circle"
                      variant="text"
                      size="small"
                      color="success"
                      @click.stop="markResolved(conversation)"
                      title="Mark Resolved"
                    />
                  </div>

                  <!-- Mobile Actions -->
                  <div class="mobile-actions">
                    <v-menu>
                      <template #activator="{ props }">
                        <v-btn
                          icon="mdi-dots-vertical"
                          variant="text"
                          size="small"
                          v-bind="props"
                          @click.stop
                        />
                      </template>
                      <v-list>
                        <v-list-item @click="openConversation(conversation)">
                          <template #prepend>
                            <v-icon>mdi-eye</v-icon>
                          </template>
                          <v-list-item-title>View</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="markResolved(conversation)">
                          <template #prepend>
                            <v-icon>mdi-check-circle</v-icon>
                          </template>
                          <v-list-item-title>Mark Resolved</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>

        <!-- Custom Pagination Footer -->
        <div class="custom-pagination-footer">
          <div class="pagination-info">
            <div class="items-per-page-section">
              <span class="text-body-2 me-2">Rows per page:</span>
              <v-select
                v-model="itemsPerPage"
                :items="[5, 10, 25, 50, 100]"
                variant="outlined"
                density="compact"
                hide-details
                class="items-per-page-select"
                @update:model-value="changeItemsPerPage"
              />
            </div>

            <div class="pagination-text">
              <span class="text-body-2">
                {{ ((currentPage - 1) * itemsPerPage) + 1 }}-{{ Math.min(currentPage * itemsPerPage, totalConversations) }} of {{ totalConversations }}
              </span>
            </div>
          </div>

          <div class="pagination-controls">
            <v-btn
              icon="mdi-chevron-left"
              variant="text"
              size="small"
              :disabled="currentPage <= 1 || loading"
              @click="previousPage"
              class="pagination-btn"
            />

            <div class="page-numbers">
              <v-btn
                v-for="pageNum in getVisiblePages()"
                :key="pageNum"
                :variant="pageNum === currentPage ? 'flat' : 'text'"
                :color="pageNum === currentPage ? 'primary' : 'default'"
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
              :disabled="currentPage >= totalPages || loading"
              @click="nextPage"
              class="pagination-btn"
            />
          </div>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useMessaging } from '@/composables/useMessaging'
import { debounce } from 'lodash-es'
import type { Conversation } from '@/services/messagingApi'

const router = useRouter()
const toast = useToast()

// Use messaging composable - Simplified
const {
  conversations,
  loading,
  stats,
  loadConversations,
  loadStats,
  updateConversationStatus,
  bulkUpdateStatus,
  setupRealTimeSubscriptions,
  cleanup,
  getStatusColor,
  formatTimeAgo
} = useMessaging()

// Local state - Simplified
const searchQuery = ref('')
const statusFilter = ref('')
const selectedConversations = ref<string[]>([])
const selectAll = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(25)
const totalConversations = ref(0)

// Table configuration - Simplified to remove assignment and priority
const headers = [
  { title: 'Customer', key: 'customer', sortable: false, width: '280px', minWidth: '250px' },
  { title: 'Subject', key: 'subject', sortable: false, width: '220px', minWidth: '180px' },
  { title: 'Last Message', key: 'message', sortable: false, width: '300px', minWidth: '250px' },
  { title: 'Status', key: 'status', sortable: false, width: '120px', minWidth: '100px' },
  { title: 'Updated', key: 'updated', sortable: false, width: '140px', minWidth: '120px' },
  { title: 'Actions', key: 'actions', sortable: false, width: '120px', minWidth: '90px', align: 'start' as const }
]

// Filter options - Simplified to two-state system
const statusFilterOptions = [
  { title: 'All Statuses', value: '' },
  { title: 'Pending', value: 'pending' },
  { title: 'Resolved', value: 'resolved' }
]

// Computed properties - Simplified
const hasActiveFilters = computed(() =>
  searchQuery.value || statusFilter.value
)

const paginatedConversations = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return conversations.value.slice(start, end)
})

const totalPages = computed(() =>
  Math.ceil(totalConversations.value / itemsPerPage.value)
)

// Utility functions - Enhanced for better UX
const getCustomerInitials = (firstName: string, lastName: string) => {
  const first = firstName?.charAt(0)?.toUpperCase() || ''
  const last = lastName?.charAt(0)?.toUpperCase() || ''
  return (first + last) || '?'
}

const getCustomerName = (firstName: string, lastName: string) => {
  const name = `${firstName || ''} ${lastName || ''}`.trim()
  return name || 'Unknown User'
}

const getAdminInitials = (firstName: string, lastName: string) => {
  const first = firstName?.charAt(0)?.toUpperCase() || ''
  const last = lastName?.charAt(0)?.toUpperCase() || ''
  return (first + last) || '?'
}

const getAdminName = (firstName: string, lastName: string) => {
  const name = `${firstName || ''} ${lastName || ''}`.trim()
  return name || 'Unknown Admin'
}

// Enhanced formatting functions
const formatDate = (date: string | null) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatTime = (date: string | null) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Row click handler - Following Users page pattern
const handleRowClick = (event: Event, conversation: Conversation) => {
  // Don't trigger row click if clicking on action buttons or checkboxes
  const target = event.target as HTMLElement
  if (target.closest('.actions-column') || target.closest('input[type="checkbox"]')) {
    return
  }
  openConversation(conversation)
}

// Search and filtering
const debouncedSearch = debounce(() => {
  applyFilters()
}, 300)

const applyFilters = async () => {
  currentPage.value = 1
  await loadConversationsWithFilters()
}

const clearFilters = async () => {
  searchQuery.value = ''
  statusFilter.value = ''
  currentPage.value = 1
  await loadConversationsWithFilters()
}

const loadConversationsWithFilters = async () => {
  const filters = {
    search: searchQuery.value,
    status: statusFilter.value
  }

  const { count } = await loadConversations(currentPage.value, itemsPerPage.value, filters)
  totalConversations.value = count || 0
}

// Pagination
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    loadConversationsWithFilters()
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    loadConversationsWithFilters()
  }
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadConversationsWithFilters()
  }
}

const getVisiblePages = () => {
  const total = totalPages.value
  const current = currentPage.value
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

const changeItemsPerPage = () => {
  currentPage.value = 1
  loadConversationsWithFilters()
}

// Selection management
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedConversations.value = paginatedConversations.value.map((c: any) => c.id)
  } else {
    selectedConversations.value = []
  }
}

const clearSelection = () => {
  selectedConversations.value = []
  selectAll.value = false
}

// Actions
const openConversation = (conversation: Conversation) => {
  router.push(`/messages/${conversation.id}`)
}

const markResolved = async (conversation: Conversation) => {
  try {
    await updateConversationStatus(conversation.id, 'resolved')
    toast.success('Conversation marked as resolved')
    await loadConversationsWithFilters()
  } catch (error) {

    toast.error('Failed to mark conversation as resolved')
  }
}

const bulkMarkResolved = async () => {
  if (selectedConversations.value.length > 0) {
    try {
      await bulkUpdateStatus(selectedConversations.value, 'resolved')
      toast.success(`${selectedConversations.value.length} conversation(s) marked as resolved`)
      clearSelection()
      await loadConversationsWithFilters()
    } catch (error) {
      toast.error('Failed to mark conversations as resolved')
    }
  }
}

const refreshData = async () => {
  await Promise.all([
    loadConversationsWithFilters(),
    loadStats()
  ])
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadConversationsWithFilters(),
    loadStats()
  ])
  setupRealTimeSubscriptions()
})

onUnmounted(() => {
  cleanup()
})

// Watch for filter changes - Simplified
watch([statusFilter], () => {
  applyFilters()
})
</script>

<style scoped>
/* Messages View Styling - Following Established Admin Page Design Patterns */
.messages-view {
  padding: 32px;
  background: rgb(var(--v-theme-background));
  min-height: 100vh;
}

/* Professional Header - Standard Pattern */
.page-header {
  background: rgb(var(--v-theme-surface));
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 32px;
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
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
  font-size: 1.125rem;
  color: rgb(var(--v-theme-on-surface-variant));
  margin: 0;
  line-height: 1.4;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

/* Statistics Cards - Standard Pattern */
.stats-section {
  margin-bottom: 32px;
}

.stats-card {
  transition: all 0.3s ease;
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
}

.stats-icon-container {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--v-theme-primary), 0.1);
}

/* Filters Section - Standard Pattern */
.filters-card {
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
}

.filters-header {
  margin-bottom: 16px;
}

.search-field :deep(.v-field) {
  border-radius: 12px;
}

.filter-select :deep(.v-field) {
  border-radius: 12px;
}

.reset-btn {
  border-radius: 12px;
}

/* Table Section - Standard Pattern */
.conversations-table-card {
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
}

.table-wrapper {
  overflow-x: auto;
}

/* Bulk Actions Bar */
.bulk-actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: rgba(var(--v-theme-primary), 0.02);
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.2);
}

.bulk-actions-info {
  display: flex;
  align-items: center;
  color: rgb(var(--v-theme-on-surface));
}

.bulk-actions-buttons {
  display: flex;
  gap: 8px;
}

/* Enhanced Table Styling - Following Users page pattern */
.modern-custom-table {
  border-radius: 0;
}

.table-row {
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.table-row:hover {
  background: rgba(var(--v-theme-primary), 0.02);
  border-left-color: rgba(var(--v-theme-primary), 0.1);
}

.unread-conversation {
  background: rgba(var(--v-theme-primary), 0.02);
  border-left-color: rgba(var(--v-theme-primary), 0.6);
}

.unread-conversation:hover {
  background: rgba(var(--v-theme-primary), 0.04);
  border-left-color: rgba(var(--v-theme-primary), 0.8);
}

/* Enhanced User Info Styling */
.user-info {
  min-width: 250px;
  padding: 8px 0;
}

.user-name {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.3;
}

.user-email {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.2;
}

/* Enhanced Subject Column */
.subject-column {
  min-width: 180px;
}

.subject-text {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.3;
}

.unread-badge {
  animation: pulse 2s infinite;
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.3);
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

/* Enhanced Message Column */
.message-column {
  min-width: 250px;
  max-width: 300px;
}

.message-preview {
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
  color: rgb(var(--v-theme-on-surface-variant));
}

/* Enhanced Status and Priority Chips */
.status-chip,
.priority-chip {
  text-transform: capitalize;
  font-weight: 600;
  letter-spacing: 0.02em;
}

/* Enhanced Assigned Column */
.assigned-column {
  min-width: 150px;
}

.admin-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unassigned-indicator {
  display: flex;
  align-items: center;
  opacity: 0.7;
}

/* Enhanced Date Column */
.date-column {
  min-width: 120px;
}

/* Enhanced Actions Column */
.actions-column {
  width: 120px;
  min-width: 90px;
}

.desktop-actions {
  display: flex;
  gap: 4px;
}

.mobile-actions {
  display: none;
}

/* Pagination Footer - Standard Pattern */
.custom-pagination-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid rgba(var(--v-theme-outline), 0.2);
  background: rgb(var(--v-theme-surface-variant));
  border-radius: 0 0 20px 20px;
  min-height: 64px;
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 24px;
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
  flex-shrink: 0;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-btn {
  font-weight: 500;
}

/* Responsive Design */
/* Dark theme adjustments */
.v-theme--dark .page-header {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.1), rgba(var(--v-theme-primary), 0.05));
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.v-theme--dark .filters-card {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-color: rgba(var(--v-theme-outline), 0.2);
}

.v-theme--dark .conversations-table-card {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-color: rgba(var(--v-theme-outline), 0.2);
}

.v-theme--dark .modern-table :deep(.v-data-table-header) {
  background: rgba(var(--v-theme-primary), 0.1);
}

.v-theme--dark .modern-table :deep(.v-data-table-header th) {
  color: rgb(var(--v-theme-on-surface));
  border-bottom-color: rgba(var(--v-theme-primary), 0.2);
}

.v-theme--dark .modern-table :deep(.v-data-table__tr:hover) {
  background: rgba(var(--v-theme-primary), 0.05);
}

.v-theme--dark .modern-table :deep(.v-data-table__td) {
  border-bottom-color: rgba(var(--v-theme-outline), 0.1);
  color: rgb(var(--v-theme-on-surface));
}

.v-theme--dark .messages-view {
  background: rgb(var(--v-theme-background));
}

.v-theme--dark .bulk-actions-bar {
  background: rgba(var(--v-theme-primary), 0.08);
  border-bottom-color: rgba(var(--v-theme-outline), 0.2);
}

.v-theme--dark .table-row:hover {
  background: rgba(var(--v-theme-primary), 0.08);
}

.v-theme--dark .unread-conversation {
  background: rgba(var(--v-theme-primary), 0.08);
}

.v-theme--dark .unread-conversation:hover {
  background: rgba(var(--v-theme-primary), 0.12);
}

.v-theme--dark .custom-pagination-footer {
  background: rgba(var(--v-theme-surface-variant), 0.5);
  border-top-color: rgba(var(--v-theme-outline), 0.2);
}

.v-theme--dark .stats-card {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-color: rgba(var(--v-theme-outline), 0.2);
}

.v-theme--dark .stats-card:hover {
  background: rgba(var(--v-theme-surface-variant), 0.4);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3) !important;
}

@media (max-width: 1200px) {
  .messages-view {
    padding: 20px;
  }
}

@media (max-width: 1024px) {
  .messages-view {
    padding: 16px;
  }

  .page-header {
    padding: 24px;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  /* Table responsive adjustments */
  .user-info {
    min-width: 200px;
  }

  .user-name {
    max-width: 150px;
    font-size: 0.875rem;
  }

  .user-email {
    max-width: 150px;
    font-size: 0.75rem;
  }

  .subject-text {
    max-width: 140px;
  }

  .message-preview {
    max-width: 200px;
  }

  .admin-name {
    max-width: 100px;
  }

  .desktop-actions {
    display: none;
  }

  .mobile-actions {
    display: block;
  }
}

@media (max-width: 768px) {
  .custom-pagination-footer {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    align-items: stretch;
  }

  .pagination-info {
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }

  .items-per-page-section {
    justify-content: center;
  }

  .pagination-controls {
    justify-content: center;
  }

  .page-numbers {
    gap: 2px;
  }

  .pagination-btn {
    min-width: 36px;
    min-height: 36px;
  }

  .items-per-page-select {
    width: 100px;
  }

  /* Enhanced mobile table styling */
  .user-info {
    min-width: 160px;
  }

  .user-name {
    max-width: 120px;
    font-size: 0.875rem;
    line-height: 1.3;
  }

  .user-email {
    max-width: 120px;
    font-size: 0.75rem;
    line-height: 1.2;
  }

  .subject-text {
    max-width: 100px;
    font-size: 0.875rem;
  }

  .message-preview {
    max-width: 150px;
    font-size: 0.875rem;
  }

  .admin-name {
    max-width: 80px;
    font-size: 0.875rem;
  }

  .date-column {
    min-width: 100px;
  }

  .date-column .text-body-2 {
    font-size: 0.875rem;
  }

  .date-column .text-caption {
    font-size: 0.75rem;
  }

  /* Improve chip sizing on mobile */
  .status-chip,
  .priority-chip {
    font-size: 0.75rem;
    height: 24px;
  }

  .unread-badge {
    font-size: 0.7rem;
    height: 20px;
  }
}

/* Form Field Enhancements - Standard Pattern */
:deep(.v-field) {
  border-radius: 12px !important;
}

:deep(.v-field--variant-outlined .v-field__outline) {
  --v-field-border-opacity: 0.2;
}

:deep(.v-field--focused .v-field__outline) {
  --v-field-border-opacity: 1;
}

:deep(.v-btn) {
  border-radius: 12px !important;
  text-transform: none !important;
  font-weight: 500 !important;
}

:deep(.v-chip) {
  border-radius: 8px !important;
  font-weight: 500 !important;
}

/* Transitions */
.table-row,
.stats-card,
.filters-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}
</style>
