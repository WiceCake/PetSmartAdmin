<template>
  <div class="users-view">
    <!-- Enhanced Professional Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">User Management</h1>
          <p class="page-subtitle">Manage and monitor all registered users across the platform</p>
        </div>
        <div class="header-actions">
          <v-btn
            color="secondary"
            size="large"
            variant="outlined"
            prepend-icon="mdi-download"
            :loading="exporting"
            :disabled="loading || users.length === 0"
            @click="exportUsers"
            class="export-btn me-3"
          >
            {{ exporting ? 'Exporting...' : 'Export' }}
          </v-btn>
          <v-btn
            color="primary"
            size="large"
            variant="flat"
            prepend-icon="mdi-account-plus"
            class="add-user-btn"
            @click="openAddUserDialog"
          >
            Add New User
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <v-row class="stats-section mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="xl" class="stats-card" elevation="2">
          <v-card-text class="pa-4">
            <div class="d-flex align-center">
              <div class="stats-icon-container me-3">
                <v-icon icon="mdi-account-group" size="32" color="primary" />
              </div>
              <div>
                <div class="text-h5 font-weight-bold">{{ totalUsers }}</div>
                <div class="text-body-2 text-on-surface-variant">Total Users</div>
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
                <v-icon icon="mdi-account-check" size="32" color="success" />
              </div>
              <div>
                <div class="text-h5 font-weight-bold">{{ activeUsers }}</div>
                <div class="text-body-2 text-on-surface-variant">Active Users</div>
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
                <v-icon icon="mdi-account-plus" size="32" color="info" />
              </div>
              <div>
                <div class="text-h5 font-weight-bold">{{ newUsersThisMonth }}</div>
                <div class="text-body-2 text-on-surface-variant">New This Month</div>
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
                <v-icon icon="mdi-account-clock" size="32" color="warning" />
              </div>
              <div>
                <div class="text-h5 font-weight-bold">{{ recentlyActiveUsers }}</div>
                <div class="text-body-2 text-on-surface-variant">Recently Active</div>
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
          <h3 class="text-h6 font-weight-bold">Filter & Search Users</h3>
          <p class="text-body-2 text-medium-emphasis">Find users by name, email, or status</p>
        </div>

        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="search"
              label="Search users..."
              placeholder="Search by name, username, or email..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              clearable
              @input="debouncedSearch"
              class="search-field"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-select
              v-model="statusFilter"
              label="Status"
              :items="statusFilterOptions"
              variant="outlined"
              density="comfortable"
              clearable
              @update:model-value="handleStatusFilter"
              class="filter-select"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-select
              v-model="sortBy"
              label="Sort By"
              :items="sortOptions"
              variant="outlined"
              density="comfortable"
              @update:model-value="handleSortChange"
              class="filter-select"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-select
              v-model="dateFilter"
              label="Date Range"
              :items="dateFilterOptions"
              variant="outlined"
              density="comfortable"
              clearable
              @update:model-value="handleDateFilter"
              class="filter-select"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-btn
              color="primary"
              variant="outlined"
              size="large"
              block
              @click="resetFilters"
              class="reset-btn"
            >
              <v-icon start>mdi-refresh</v-icon>
              Reset
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

      <!-- Modern Users Table -->
      <v-card class="users-table-card" rounded="xl">
        <v-card-title class="pa-6 pb-4">
          <div class="d-flex align-center justify-space-between w-100">
            <div class="d-flex align-center">
              <v-icon icon="mdi-table" class="me-2" />
              <span class="text-h6 font-weight-bold">Users Directory</span>
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
                {{ users.length }} of {{ totalUsers }} users
              </v-chip>
            </div>
          </div>
        </v-card-title>

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
                <th v-for="header in headers" :key="header.key" :style="{ width: header.width, minWidth: header.minWidth }">
                  {{ header.title }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td :colspan="headers.length" class="text-center py-8">
                  <v-progress-circular indeterminate color="primary" size="40" />
                  <div class="mt-2 text-body-2">Loading users...</div>
                </td>
              </tr>
              <tr v-else-if="users.length === 0">
                <td :colspan="headers.length" class="text-center py-8">
                  <v-icon size="48" color="grey-lighten-2" class="mb-2">mdi-account-off</v-icon>
                  <div class="text-h6 mb-2">No users found</div>
                  <div class="text-body-2 text-medium-emphasis">
                    {{ search ? 'Try adjusting your search terms' : 'Start by adding your first user' }}
                  </div>
                </td>
              </tr>
              <tr v-else v-for="item in users" :key="item.id" class="table-row"
                  @click="handleRowClick($event, item)">
                <!-- User (Avatar & Name) -->
                <td>
                  <div class="user-info d-flex align-center">
                    <v-avatar size="40" class="me-3 flex-shrink-0">
                      <v-img
                        v-if="item.profile_pic"
                        :src="item.profile_pic"
                        :alt="getFullName(item) || item.username"
                      />
                      <v-icon v-else icon="mdi-account" />
                    </v-avatar>
                    <div class="user-text-content">
                      <v-tooltip
                        :text="getFullName(item) || 'No name provided'"
                        location="top"
                        :disabled="!getFullName(item) || getFullName(item).length <= 20"
                      >
                        <template #activator="{ props }">
                          <div
                            class="user-name font-weight-medium text-body-1"
                            v-bind="props"
                          >
                            {{ getFullName(item) || 'No name provided' }}
                          </div>
                        </template>
                      </v-tooltip>
                      <v-tooltip
                        :text="'@' + (item.username || 'No username')"
                        location="bottom"
                        :disabled="!item.username || item.username.length <= 15"
                      >
                        <template #activator="{ props }">
                          <div
                            class="user-username text-caption text-medium-emphasis"
                            v-bind="props"
                          >
                            @{{ item.username || 'No username' }}
                          </div>
                        </template>
                      </v-tooltip>
                    </div>
                  </div>
                </td>

                <!-- Email -->
                <td>
                  <div class="email-column">
                    <div class="text-body-2">{{ item.email || 'No email' }}</div>
                  </div>
                </td>

                <!-- Phone -->
                <td>
                  <div class="text-body-2">
                    {{ item.mobile_number || 'Not provided' }}
                  </div>
                </td>

                <!-- Status -->
                <td>
                  <v-chip
                    :color="(item.is_active !== false) ? 'success' : 'error'"
                    size="small"
                    variant="tonal"
                    class="font-weight-medium"
                  >
                    <v-icon
                      :icon="(item.is_active !== false) ? 'mdi-check-circle' : 'mdi-close-circle'"
                      size="16"
                      class="me-1"
                    />
                    {{ (item.is_active !== false) ? 'Active' : 'Inactive' }}
                  </v-chip>
                </td>

                <!-- Created Date -->
                <td>
                  <div class="date-column">
                    <div class="text-body-2 font-weight-medium">
                      {{ formatDate(item.created_at) }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ formatTime(item.created_at) }}
                    </div>
                  </div>
                </td>

                <!-- Actions -->
                <td>
                  <div class="actions-column">
                    <!-- Desktop Actions -->
                    <div class="desktop-actions d-flex align-center gap-1">
                      <v-btn
                        icon="mdi-eye"
                        variant="text"
                        size="small"
                        color="info"
                        @click.stop="viewUser(item)"
                      />
                      <v-btn
                        icon="mdi-pencil"
                        variant="text"
                        size="small"
                        color="primary"
                        @click.stop="editUser(item)"
                      />
                      <v-btn
                        icon="mdi-delete"
                        variant="text"
                        size="small"
                        color="error"
                        @click.stop="deleteUser(item)"
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
                          <v-list-item @click="viewUser(item)">
                            <template #prepend>
                              <v-icon>mdi-eye</v-icon>
                            </template>
                            <v-list-item-title>View</v-list-item-title>
                          </v-list-item>
                          <v-list-item @click="editUser(item)">
                            <template #prepend>
                              <v-icon>mdi-pencil</v-icon>
                            </template>
                            <v-list-item-title>Edit</v-list-item-title>
                          </v-list-item>
                          <v-list-item @click="deleteUser(item)">
                            <template #prepend>
                              <v-icon>mdi-delete</v-icon>
                            </template>
                            <v-list-item-title>Delete</v-list-item-title>
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
    <!-- Enhanced User Form Dialog -->
    <UserFormDialog
      v-model="showCreateDialog"
      :user="editingUser"
      :loading="saving"
      @submit="handleUserSubmit"
      @cancel="closeUserDialog"
    />

    <!-- Enhanced Delete Confirmation Dialog -->
    <UserDeleteDialog
      v-model="showDeleteDialog"
      :user="userToDelete"
      :loading="deletingUser"
      :show-stats="false"
      @confirm="handleDeleteConfirm"
      @cancel="handleDeleteCancel"
    />

    <!-- Password Reset Dialog -->
    <PasswordResetDialog
      v-model="showPasswordResetDialog"
      :user-name="userToResetPassword?.username || 'Unknown'"
      :loading="resettingPassword"
      @reset="handlePasswordReset"
      @cancel="showPasswordResetDialog = false; userToResetPassword = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { format } from 'date-fns'
import { debounce } from 'lodash-es'
import { ApiService } from '@/services/api'
import { useToast } from 'vue-toastification'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import PasswordResetDialog from '@/components/PasswordResetDialog.vue'
import UserDeleteDialog from '@/components/UserDeleteDialog.vue'
import UserFormDialog from '@/components/UserFormDialog.vue'

const router = useRouter()
const toast = useToast()

// Types
interface User {
  id: string
  username: string | null
  first_name: string | null
  last_name: string | null
  email: string
  mobile_number: string | null
  bio: string | null
  profile_pic: string | null
  created_at: string | null
  updated_at: string | null
  profile_visibility: boolean | null
  is_active: boolean | null
  pets?: Array<{ count: number }>
  orders?: Array<{ count: number }>
  appointments?: Array<{ count: number }>
}

// Data
const users = ref<User[]>([])
const loading = ref(false)
const saving = ref(false)
const exporting = ref(false)
const error = ref<string | null>(null)
const search = ref('')
const sortBy = ref('created_at')
const statusFilter = ref('active')
const dateFilter = ref('')
const page = ref(1)
const itemsPerPage = ref(10)
const totalUsers = ref(0)
const showCreateDialog = ref(false)
const editingUser = ref<User | null>(null)
const showDeleteDialog = ref(false)
const userToDelete = ref<User | null>(null)
const deletingUser = ref(false)
const showPasswordResetDialog = ref(false)
const userToResetPassword = ref<User | null>(null)
const resettingPassword = ref(false)

// Computed properties for statistics
const activeUsers = computed(() =>
  users.value.filter((user: User) => user.is_active !== false).length
)

const newUsersThisMonth = computed(() => {
  const now = new Date()
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  return users.value.filter((user: User) => {
    if (!user.created_at) return false
    return new Date(user.created_at) >= thisMonth
  }).length
})

const recentlyActiveUsers = computed(() => {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  return users.value.filter((user: User) => {
    if (!user.updated_at) return false
    return new Date(user.updated_at) >= sevenDaysAgo
  }).length
})

const hasActiveFilters = computed(() =>
  search.value || sortBy.value !== 'created_at' || statusFilter.value !== 'active' || dateFilter.value
)

// Form data interface for the new dialog
interface FormData {
  first_name: string
  last_name: string
  username: string
  email: string
  password: string
  mobile_number: string
  bio: string
}

// Table configuration
const headers = [
  { title: 'User', key: 'user', sortable: false, width: '250px', minWidth: '200px' },
  { title: 'Email', key: 'email', sortable: true, width: '220px', minWidth: '180px' },
  { title: 'Phone', key: 'phone', sortable: false, width: '140px', minWidth: '120px' },
  { title: 'Status', key: 'status', sortable: false, width: '120px', minWidth: '100px' },
  { title: 'Created', key: 'created_at', sortable: true, width: '140px', minWidth: '120px' },
  { title: 'Actions', key: 'actions', sortable: false, width: '120px', minWidth: '90px', align: 'start' as const }
]

const sortOptions = [
  { title: 'Newest First', value: 'created_at' },
  { title: 'Name A-Z', value: 'first_name' },
  { title: 'Username A-Z', value: 'username' }
]

const statusFilterOptions = [
  { title: 'Active', value: 'active' },
  { title: 'Inactive', value: 'inactive' },
  { title: 'All Users', value: 'all' }
]

const dateFilterOptions = [
  { title: 'Last 7 days', value: '7d' },
  { title: 'Last 30 days', value: '30d' },
  { title: 'Last 3 months', value: '3m' },
  { title: 'This year', value: '1y' }
]

// Methods
const loadUsers = async () => {
  loading.value = true
  error.value = null
  try {
    const { data, error: apiError, count } = await ApiService.getUsers(
      page.value,
      itemsPerPage.value,
      search.value
    )

    if (apiError) {
      throw apiError
    }

    users.value = data || []
    totalUsers.value = count || 0
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load users'
    users.value = []
    totalUsers.value = 0
  } finally {
    loading.value = false
  }
}

const debouncedSearch = debounce(() => {
  page.value = 1
  loadUsers()
}, 500)

// Custom pagination functions
const totalPages = computed(() => Math.ceil(totalUsers.value / itemsPerPage.value))

const goToPage = (newPage: number) => {
  if (newPage >= 1 && newPage <= totalPages.value && !loading.value) {

    page.value = newPage
    loadUsers()
  }
}

const handleItemsPerPageChange = (newItemsPerPage: number) => {

  itemsPerPage.value = newItemsPerPage
  page.value = 1 // Reset to first page
  loadUsers()
}

const getPaginationText = () => {
  if (totalUsers.value === 0) return '0 of 0'
  const start = (page.value - 1) * itemsPerPage.value + 1
  const end = Math.min(page.value * itemsPerPage.value, totalUsers.value)
  return `${start}-${end} of ${totalUsers.value}`
}

const getVisiblePages = () => {
  const total = totalPages.value
  const current = page.value
  const delta = 2 // Number of pages to show on each side of current page

  if (total <= 7) {
    // Show all pages if total is small
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  let start = Math.max(1, current - delta)
  let end = Math.min(total, current + delta)

  // Adjust if we're near the beginning or end
  if (current <= delta + 1) {
    end = Math.min(total, 2 * delta + 2)
  }
  if (current >= total - delta) {
    start = Math.max(1, total - 2 * delta - 1)
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

const handleRowClick = (event: Event, item: User) => {
  // Don't trigger row click if clicking on action buttons
  const target = event.target as HTMLElement
  if (target.closest('.actions-column')) {
    return
  }
  // You can add row click functionality here if needed

}

// Helper function to get full name
const getFullName = (user: User) => {
  const firstName = user.first_name?.trim() || ''
  const lastName = user.last_name?.trim() || ''
  return `${firstName} ${lastName}`.trim() || null
}



const formatDate = (date: string | null) => {
  if (!date) return 'N/A'
  return format(new Date(date), 'MMM dd, yyyy')
}

const formatTime = (date: string | null) => {
  if (!date) return 'N/A'
  return format(new Date(date), 'HH:mm')
}

const viewUser = (user: any) => {
  router.push(`/users/${user.id}`)
}

const openAddUserDialog = () => {
  // Ensure clean state before opening
  closeUserDialog()

  // Open dialog for new user
  nextTick(() => {
    showCreateDialog.value = true
  })
}

const editUser = (user: any) => {
  editingUser.value = user
  showCreateDialog.value = true
}

const handleUserSubmit = async (formData: FormData) => {
  saving.value = true
  error.value = null

  try {
    if (editingUser.value) {
      // Update existing user
      const updates = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: formData.username,
        mobile_number: formData.mobile_number || null,
        bio: formData.bio || null
      }

      const result = await ApiService.updateUser(editingUser.value.id, updates)
      if (result.error) throw result.error

      toast.success('User updated successfully')
    } else {
      // Create new user
      const result = await ApiService.createUser({
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: formData.username,
        mobile_number: formData.mobile_number || undefined,
        bio: formData.bio || undefined
      })

      if (result.error) throw result.error

      toast.success('User created successfully')
    }

    closeUserDialog()
    loadUsers()
  } catch (err) {

    error.value = err instanceof Error ? err.message : 'Failed to save user'
    toast.error(error.value)
  } finally {
    saving.value = false
  }
}

const closeUserDialog = () => {
  // Reset reactive state
  showCreateDialog.value = false
  editingUser.value = null
  saving.value = false
}

const resetUserPassword = (user: User) => {
  userToResetPassword.value = user
  showPasswordResetDialog.value = true
}

const handlePasswordReset = async (newPassword: string) => {
  if (!userToResetPassword.value) return

  resettingPassword.value = true
  try {
    const result = await ApiService.resetUserPassword(userToResetPassword.value.id, newPassword)
    if (result.error) throw result.error

    toast.success(`Password reset successfully for ${userToResetPassword.value.username}`)
    showPasswordResetDialog.value = false
    userToResetPassword.value = null
  } catch (err) {

    const errorMessage = err instanceof Error ? err.message : 'Failed to reset password'
    toast.error(errorMessage)
  } finally {
    resettingPassword.value = false
  }
}

const deleteUser = (user: User) => {
  userToDelete.value = user
  showDeleteDialog.value = true
}

const handleDeleteConfirm = async () => {
  if (!userToDelete.value) return

  deletingUser.value = true

  try {
    const result = await ApiService.deleteUser(userToDelete.value.id)
    if (result.error) throw result.error

    const userName = userToDelete.value.username || `${userToDelete.value.first_name} ${userToDelete.value.last_name}`.trim() || 'User'
    toast.success(`${userName} has been deleted successfully`)

    showDeleteDialog.value = false
    userToDelete.value = null

    // Reload users to reflect the change
    loadUsers()
  } catch (err) {

    const errorMessage = err instanceof Error ? err.message : 'Failed to delete user'
    toast.error(errorMessage)
  } finally {
    deletingUser.value = false
  }
}

const handleDeleteCancel = () => {
  showDeleteDialog.value = false
  userToDelete.value = null
  deletingUser.value = false
}

// Filter handlers
const handleStatusFilter = () => {
  page.value = 1
  loadUsers()
}

const handleSortChange = () => {
  page.value = 1
  loadUsers()
}

const handleDateFilter = () => {
  page.value = 1
  loadUsers()
}

const resetFilters = () => {
  search.value = ''
  sortBy.value = 'created_at'
  statusFilter.value = 'active'
  dateFilter.value = ''
  page.value = 1
  loadUsers()
}

const exportUsers = async () => {
  exporting.value = true
  try {
    // Fetch all users for export (not just current page)
    const { data, error: apiError } = await ApiService.getUsers(1, 1000, search.value)

    if (apiError) {
      throw apiError
    }

    if (!data || data.length === 0) {
      throw new Error('No users found to export')
    }

    // Prepare CSV data
    const csvHeaders = [
      'Name',
      'Username',
      'Email',
      'Mobile Number',
      'Profile Visibility',
      'Registration Date',
      'Last Updated',
      'Total Pets',
      'Total Orders',
      'Total Appointments'
    ]

    const csvRows = data.map((user: User) => [
      `"${user.first_name || ''} ${user.last_name || ''}".trim()`,
      `"${user.username || ''}"`,
      `"${user.email || ''}"`,
      `"${user.mobile_number || ''}"`,
      user.profile_visibility ? 'Public' : 'Private',
      user.created_at ? formatDate(user.created_at) : '',
      user.updated_at ? formatDate(user.updated_at) : '',
      user.pets?.[0]?.count || 0,
      user.orders?.[0]?.count || 0,
      user.appointments?.[0]?.count || 0
    ])

    // Create CSV content
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map((row: any[]) => row.join(','))
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `petsmart-users-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to export users'
  } finally {
    exporting.value = false
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
/* Enhanced Users View Styling */
.users-view {
  padding: 32px;
  background: rgb(var(--v-theme-background));
  min-height: 100vh;
}

/* Professional Header */
.page-header {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05) 0%, rgba(var(--v-theme-primary), 0.02) 100%);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 32px;
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
}

/* Header Layout */
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

.add-user-btn, .export-btn {
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.3);
  transition: all 0.3s ease;
}

.add-user-btn:hover, .export-btn:hover {
  box-shadow: 0 6px 16px rgba(var(--v-theme-primary), 0.4);
  transform: translateY(-2px);
}

/* Statistics Cards */
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
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: rgba(var(--v-theme-primary), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Enhanced Filters */
.filters-card {
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  transition: all 0.3s ease;
}

.filters-header {
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.2);
  padding-bottom: 16px;
}

.search-field :deep(.v-field),
.filter-select :deep(.v-field) {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.search-field :deep(.v-field:hover),
.filter-select :deep(.v-field:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.reset-btn {
  font-weight: 600;
}

/* Table Actions */
.actions-column {
  min-width: 120px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  position: relative;
}

.desktop-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.mobile-actions {
  display: none;
}

.action-icon-btn {
  min-width: 32px !important;
  width: 32px !important;
  height: 32px !important;
}

.mobile-action-btn {
  min-height: 36px;
  font-size: 0.875rem;
}

/* Table Wrapper for Horizontal Scrolling */
.table-wrapper {
  width: 100%;
  overflow-x: auto;
  border-radius: 12px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--v-theme-primary), 0.3) transparent;
}

.table-wrapper::-webkit-scrollbar {
  height: 6px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: rgba(var(--v-theme-outline), 0.1);
  border-radius: 3px;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.3);
  border-radius: 3px;
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-primary), 0.5);
}

/* Custom Table Styling */
.modern-custom-table {
  border-radius: 0 0 16px 16px;
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  border-top: none;
  min-width: 800px;
}

.modern-custom-table :deep(thead th) {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  background: rgba(var(--v-theme-primary), 0.02);
  border-bottom: 2px solid rgba(var(--v-theme-primary), 0.1);
  white-space: nowrap;
  padding: 16px 12px;
}

.modern-custom-table :deep(tbody td) {
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.1);
  vertical-align: middle;
  padding: 12px;
}

.modern-custom-table :deep(tbody tr:hover) {
  background: rgba(var(--v-theme-primary), 0.02);
}

.table-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

/* Custom Pagination Footer */
.custom-pagination-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid rgba(var(--v-theme-outline), 0.2);
  background: rgba(var(--v-theme-primary), 0.01);
  border-radius: 0 0 16px 16px;
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
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-btn {
  min-width: 40px;
  min-height: 40px;
}

/* Text Overflow Handling */
.user-name {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.user-username {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 0.7;
}

.user-email {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-info {
  min-width: 150px;
  max-width: 200px;
}

.activity-column {
  min-width: 120px;
}

.stats-column {
  min-width: 100px;
}

.date-column {
  min-width: 100px;
}

/* Table Footer/Pagination Styling */
.modern-table :deep(.v-data-table-footer) {
  padding: 16px;
  border-top: 1px solid rgba(var(--v-theme-outline), 0.2);
  background: rgba(var(--v-theme-primary), 0.01);
}

.modern-table :deep(.v-data-table-footer__items-per-page) {
  margin-right: 16px;
}

.modern-table :deep(.v-data-table-footer__pagination) {
  margin-left: auto;
}



.search-wrapper {
  position: relative;
}

.modern-search :deep(.v-field) {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modern-search :deep(.v-field:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.modern-search :deep(.v-field--focused) {
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.users-table-card {
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  overflow: hidden;
}

.modern-table {
  border-radius: 0;
}

.modern-table :deep(.v-data-table__wrapper) {
  border-radius: 0;
}

.modern-table :deep(.v-data-table-header) {
  background: rgba(var(--v-theme-primary), 0.05);
}

.modern-table :deep(.v-data-table-header th) {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  border-bottom: 1px solid rgba(var(--v-theme-primary), 0.1);
}

.modern-table :deep(.v-data-table__tr:hover) {
  background: rgba(var(--v-theme-primary), 0.02);
}

.modern-table :deep(.v-data-table__td) {
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.1);
  padding: 16px;
}

/* Table cell styling */
.user-avatar {
  border: 2px solid rgba(var(--v-theme-primary), 0.1);
  transition: all 0.2s ease;
}

.user-avatar:hover {
  border-color: rgba(var(--v-theme-primary), 0.3);
  transform: scale(1.05);
}

.user-info {
  min-width: 200px;
  max-width: 250px;
  width: 100%;
}

.user-text-content {
  flex: 1;
  min-width: 0; /* Important for text truncation */
  overflow: hidden;
}

.user-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
  line-height: 1.2;
}

.user-username {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
  line-height: 1.2;
}

.status-chip {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stats-column {
  min-width: 150px;
}

.date-column {
  min-width: 120px;
}

.actions-column {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 180px;
}

.gap-2 {
  gap: 8px;
}

.gap-3 {
  gap: 12px;
}

.gap-4 {
  gap: 16px;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .modern-users-view {
    padding: 20px;
  }
}

@media (max-width: 1024px) {
  .modern-users-view {
    padding: 16px;
  }

  .page-header {
    padding: 16px;
  }

  .modern-table :deep(.v-data-table__wrapper) {
    overflow-x: auto;
  }

  /* Adjust table cell padding for tablets */
  .modern-table :deep(.v-data-table__td) {
    padding: 12px 8px;
  }
}

@media (max-width: 768px) {
  .modern-users-view {
    padding: 12px;
  }

  .page-header {
    padding: 16px;
  }

  /* Responsive table wrapper */
  .table-wrapper {
    margin: 0 -8px;
    padding: 0 8px;
  }

  .modern-table {
    min-width: 650px;
  }

  /* Header Layout Fixes */
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }

  .header-info {
    min-width: unset;
  }

  .header-title {
    font-size: 1.75rem !important;
    line-height: 1.2;
  }

  .header-subtitle {
    font-size: 0.95rem;
    margin-bottom: 16px !important;
  }

  .header-stats {
    gap: 16px;
    margin-bottom: 8px;
  }

  .stat-item {
    font-size: 0.875rem;
  }

  .header-actions {
    width: 100%;
    justify-content: stretch;
    gap: 8px;
  }

  .action-btn {
    flex: 1;
    min-width: 120px;
    min-height: 48px;
  }

  .btn-text {
    font-size: 0.875rem;
  }

  /* Improve filters layout on mobile */
  .filters-card {
    margin-bottom: 16px;
  }

  .filters-card .v-card-text {
    padding: 16px;
  }

  /* Hide some table columns on mobile (Activity and Stats columns) */
  .modern-table :deep(.v-data-table__th:nth-child(4)),
  .modern-table :deep(.v-data-table__td:nth-child(4)),
  .modern-table :deep(.v-data-table__th:nth-child(5)),
  .modern-table :deep(.v-data-table__td:nth-child(5)) {
    display: none !important;
  }

  /* Ensure Actions column is always visible */
  .modern-table :deep(.v-data-table__th:nth-child(7)),
  .modern-table :deep(.v-data-table__td:nth-child(7)) {
    display: table-cell !important;
  }

  /* Reduce table row height */
  .modern-table :deep(.v-data-table__td) {
    padding: 8px 4px !important;
    vertical-align: middle;
    height: auto;
  }

  .modern-table :deep(.v-data-table__tr) {
    height: auto !important;
    min-height: 56px;
  }

  /* Mobile Custom Pagination */
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

  /* Responsive text sizing */
  .user-name {
    max-width: 130px;
    font-size: 0.875rem;
    line-height: 1.3;
  }

  .user-username {
    max-width: 130px;
    font-size: 0.75rem;
    line-height: 1.2;
  }

  .user-email {
    max-width: 150px;
    font-size: 0.875rem;
    line-height: 1.3;
  }

  .user-avatar {
    width: 36px !important;
    height: 36px !important;
  }

  .user-info {
    min-width: 140px;
  }

  /* Switch to mobile actions */
  .actions-column .desktop-actions {
    display: none !important;
  }

  .actions-column .mobile-actions {
    display: flex !important;
    width: 100%;
    justify-content: center;
  }

  /* Mobile text clipping adjustments */
  .user-name {
    max-width: 120px !important;
    font-size: 0.875rem;
  }

  .user-username {
    max-width: 120px !important;
    font-size: 0.75rem;
  }

  .user-info {
    min-width: 140px !important;
    max-width: 160px !important;
  }

  .actions-column {
    min-width: 90px;
    justify-content: center;
  }

  .mobile-action-btn {
    min-height: 40px;
    width: 100%;
    max-width: 100px;
    font-size: 0.8rem;
  }
}

@media (max-width: 640px) {
  .modern-users-view {
    padding: 8px;
  }

  .page-header {
    padding: 12px;
  }

  /* Stack filter controls vertically on smaller screens */
  .filters-card .v-row .v-col:nth-child(1) {
    flex-basis: 100%;
    max-width: 100%;
    margin-bottom: 8px;
  }

  .filters-card .v-row .v-col:nth-child(2),
  .filters-card .v-row .v-col:nth-child(3),
  .filters-card .v-row .v-col:nth-child(4) {
    flex-basis: 50%;
    max-width: 50%;
  }

  .filters-card .v-row .v-col:nth-child(5) {
    flex-basis: 100%;
    max-width: 100%;
    margin-top: 8px;
  }
}

@media (max-width: 480px) {
  .modern-users-view {
    padding: 8px;
  }

  .page-header {
    padding: 12px;
  }

  /* Compact table wrapper */
  .table-wrapper {
    margin: 0 -4px;
    padding: 0 4px;
  }

  .modern-table {
    min-width: 480px;
  }

  /* Header optimizations for small screens */
  .header-title {
    font-size: 1.5rem !important;
    margin-bottom: 8px !important;
  }

  .header-subtitle {
    font-size: 0.875rem;
    margin-bottom: 12px !important;
  }

  .header-stats {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .stat-item {
    font-size: 0.8rem;
  }

  .action-btn {
    min-height: 44px;
    font-size: 0.8rem;
  }

  /* Stack all filter controls vertically on very small screens */
  .filters-card .v-row .v-col {
    flex-basis: 100% !important;
    max-width: 100% !important;
    margin-bottom: 8px;
  }

  .filters-card .v-row .v-col:last-child {
    margin-bottom: 0;
  }

  /* Further simplify table on very small screens */
  .modern-table :deep(.v-data-table__th:nth-child(6)),
  .modern-table :deep(.v-data-table__td:nth-child(6)) {
    display: none;
  }

  /* Compact table rows */
  .modern-table :deep(.v-data-table__tr) {
    min-height: 52px;
  }

  .modern-table :deep(.v-data-table__td) {
    padding: 6px 3px !important;
    font-size: 0.875rem;
  }

  /* Ultra-compact pagination for small screens */
  .modern-table :deep(.v-data-table-footer) {
    padding: 8px 4px;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .modern-table :deep(.v-data-table-footer__items-per-page) {
    margin: 0;
    width: 100%;
    max-width: 200px;
  }

  .modern-table :deep(.v-data-table-footer__pagination) {
    margin: 0;
    width: 100%;
    justify-content: center;
  }

  .modern-table :deep(.v-data-table-footer__info) {
    margin: 0;
    font-size: 0.8rem;
    text-align: center;
  }

  /* Ultra-compact text */
  .user-name {
    max-width: 100px;
    font-size: 0.8rem;
    line-height: 1.2;
  }

  .user-username {
    max-width: 100px;
    font-size: 0.7rem;
  }

  .user-email {
    max-width: 120px;
    font-size: 0.8rem;
  }

  .user-avatar {
    width: 32px !important;
    height: 32px !important;
  }

  .user-info {
    min-width: 120px;
  }

  .user-info .text-body-1 {
    font-size: 0.8rem;
    line-height: 1.2;
  }

  .user-info .text-caption {
    font-size: 0.7rem;
  }

  .actions-column {
    min-width: 80px;
  }

  .mobile-action-btn {
    min-height: 36px;
    font-size: 0.75rem;
    padding: 0 8px;
  }

  /* Improve dialog responsiveness */
  .v-dialog .v-card {
    margin: 8px;
    max-width: calc(100vw - 16px) !important;
  }

  .v-dialog .v-card .v-card-text {
    padding: 16px;
  }

  .v-dialog .v-card .v-row .v-col {
    padding: 4px 8px;
  }
}

@media (max-width: 360px) {
  .modern-users-view {
    padding: 6px;
  }

  .page-header {
    padding: 10px;
  }

  /* Ultra-compact table wrapper */
  .table-wrapper {
    margin: 0 -2px;
    padding: 0 2px;
  }

  .modern-table {
    min-width: 360px;
  }

  /* Ultra-compact header */
  .header-title {
    font-size: 1.25rem !important;
    margin-bottom: 6px !important;
  }

  .header-subtitle {
    font-size: 0.8rem;
    margin-bottom: 10px !important;
  }

  .header-stats {
    gap: 6px;
  }

  .stat-item {
    font-size: 0.75rem;
  }

  .action-btn {
    min-height: 40px;
    font-size: 0.75rem;
    padding: 0 12px;
  }

  /* Ultra-compact table for very small screens */
  .modern-table :deep(.v-data-table__tr) {
    min-height: 48px;
  }

  .modern-table :deep(.v-data-table__td) {
    padding: 4px 2px !important;
    font-size: 0.75rem;
  }

  /* Minimal pagination for ultra-small screens */
  .modern-table :deep(.v-data-table-footer) {
    padding: 6px 2px;
    flex-direction: column;
    gap: 8px;
  }

  .modern-table :deep(.v-data-table-footer__items-per-page) {
    width: 100%;
    max-width: 180px;
  }

  .modern-table :deep(.v-data-table-footer__pagination) {
    width: 100%;
  }

  .modern-table :deep(.v-data-table-footer__info) {
    font-size: 0.75rem;
  }

  /* Minimal text sizing */
  .user-name {
    max-width: 80px;
    font-size: 0.75rem;
    line-height: 1.1;
  }

  .user-username {
    max-width: 80px;
    font-size: 0.65rem;
  }

  .user-email {
    max-width: 100px;
    font-size: 0.75rem;
  }

  .user-avatar {
    width: 28px !important;
    height: 28px !important;
  }

  .user-info {
    min-width: 100px;
  }

  .user-info .text-body-1 {
    font-size: 0.75rem;
    line-height: 1.1;
  }

  .user-info .text-caption {
    font-size: 0.65rem;
  }

  .actions-column {
    min-width: 70px;
  }

  .mobile-action-btn {
    min-height: 32px;
    font-size: 0.7rem;
    padding: 0 6px;
  }

  .mobile-action-btn .ms-1 {
    margin-left: 2px !important;
  }
}

/* Dark theme adjustments */
.v-theme--dark .users-view {
  background: rgb(var(--v-theme-background));
}

.v-theme--dark .page-header {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.1), rgba(var(--v-theme-primary), 0.05));
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.v-theme--dark .stats-card {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-color: rgba(var(--v-theme-outline), 0.2);
}

.v-theme--dark .stats-card:hover {
  background: rgba(var(--v-theme-surface-variant), 0.4);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3) !important;
}

.v-theme--dark .filters-card {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-color: rgba(var(--v-theme-outline), 0.2);
}

.v-theme--dark .users-table-card {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-color: rgba(var(--v-theme-outline), 0.2);
}

.v-theme--dark .modern-table :deep(.v-data-table-header) {
  background: rgba(var(--v-theme-primary), 0.1);
}

.v-theme--dark .modern-table :deep(.v-data-table-footer) {
  background: rgba(var(--v-theme-surface-variant), 0.5);
  border-top-color: rgba(var(--v-theme-outline), 0.2);
}

.v-theme--dark .modern-custom-table {
  border-color: rgba(var(--v-theme-outline), 0.2);
}

.v-theme--dark .user-avatar {
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.v-theme--dark .user-avatar:hover {
  border-color: rgba(var(--v-theme-primary), 0.4);
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

.v-theme--dark .modern-custom-table :deep(thead th) {
  color: rgb(var(--v-theme-on-surface));
  background: rgba(var(--v-theme-primary), 0.1);
  border-bottom-color: rgba(var(--v-theme-primary), 0.2);
}

.v-theme--dark .modern-custom-table :deep(tbody td) {
  border-bottom-color: rgba(var(--v-theme-outline), 0.1);
  color: rgb(var(--v-theme-on-surface));
}

.v-theme--dark .custom-pagination-footer {
  background: rgba(var(--v-theme-surface-variant), 0.5);
  border-top-color: rgba(var(--v-theme-outline), 0.2);
}
</style>
