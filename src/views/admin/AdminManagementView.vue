<template>
  <div class="admin-management-container">
    <!-- Header Section -->
    <div class="admin-header mb-8">
      <div class="d-flex align-center justify-space-between">
        <div>
          <h1 class="text-h3 font-weight-bold mb-2">Admin Management</h1>
          <p class="text-body-1 text-medium-emphasis">
            Manage administrator accounts and permissions
          </p>
        </div>
        <v-btn
          color="primary"
          variant="flat"
          prepend-icon="mdi-plus"
          @click="openCreateDialog"
          class="create-btn"
        >
          Add Admin
        </v-btn>
      </div>
    </div>

    <!-- Statistics Cards -->
    <v-row class="mb-8">
      <v-col cols="12" sm="6" md="3">
        <v-card class="stats-card rounded-xl">
          <v-card-text class="pa-6">
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="text-body-2 text-medium-emphasis mb-1">Total Admins</p>
                <h3 class="text-h4 font-weight-bold">{{ stats.totalAdmins }}</h3>
              </div>
              <v-avatar size="48" color="primary" variant="tonal">
                <v-icon size="24">mdi-shield-account</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stats-card rounded-xl">
          <v-card-text class="pa-6">
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="text-body-2 text-medium-emphasis mb-1">Super Admins</p>
                <h3 class="text-h4 font-weight-bold">{{ stats.superAdmins }}</h3>
              </div>
              <v-avatar size="48" color="warning" variant="tonal">
                <v-icon size="24">mdi-shield-crown</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stats-card rounded-xl">
          <v-card-text class="pa-6">
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="text-body-2 text-medium-emphasis mb-1">Regular Admins</p>
                <h3 class="text-h4 font-weight-bold">{{ stats.regularAdmins }}</h3>
              </div>
              <v-avatar size="48" color="info" variant="tonal">
                <v-icon size="24">mdi-account-supervisor</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stats-card rounded-xl">
          <v-card-text class="pa-6">
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="text-body-2 text-medium-emphasis mb-1">Recent Admins</p>
                <h3 class="text-h4 font-weight-bold">{{ stats.recentAdmins }}</h3>
              </div>
              <v-avatar size="48" color="success" variant="tonal">
                <v-icon size="24">mdi-account-plus</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters and Search -->
    <v-card class="filter-card rounded-xl mb-6">
      <v-card-text class="pa-6">
        <v-row align="center">
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchQuery"
              label="Search admins..."
              variant="outlined"
              prepend-inner-icon="mdi-magnify"
              clearable
              @input="debouncedSearch"
              class="search-field"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedRole"
              :items="roleOptions"
              label="Filter by Role"
              variant="outlined"
              clearable
              @update:model-value="loadAdmins"
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="itemsPerPage"
              :items="[10, 25, 50, 100]"
              label="Items per page"
              variant="outlined"
              @update:model-value="loadAdmins"
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Admins Table -->
    <v-card class="admins-table-card rounded-xl">
      <v-card-text class="pa-0">
        <v-data-table
          :headers="headers"
          :items="admins"
          :loading="loading"
          :items-per-page="-1"
          hide-default-footer
          class="admins-table"
          no-data-text="No administrators found"
          loading-text="Loading administrators..."
        >
          <template #item.name="{ item }">
            <div class="d-flex align-center">
              <v-avatar size="32" class="me-3">
                <v-img v-if="item.profile_pic" :src="item.profile_pic" />
                <v-icon v-else>mdi-account</v-icon>
              </v-avatar>
              <div>
                <div class="font-weight-medium">{{ item.first_name }} {{ item.last_name }}</div>
                <div class="text-caption text-medium-emphasis">{{ item.username }}</div>
              </div>
            </div>
          </template>

          <template #item.role="{ item }">
            <v-chip
              :color="item.role === 'super_admin' ? 'warning' : 'info'"
              variant="tonal"
              size="small"
            >
              {{ item.role === 'super_admin' ? 'Super Admin' : 'Admin' }}
            </v-chip>
          </template>

          <template #item.created_at="{ item }">
            {{ formatDate(item.created_at) }}
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex align-center">
              <v-btn
                icon="mdi-pencil"
                variant="text"
                size="small"
                @click="openEditDialog(item)"
                :disabled="item.role === 'super_admin'"
              />
              <v-btn
                icon="mdi-delete"
                variant="text"
                size="small"
                color="error"
                @click="openDeleteDialog(item)"
                :disabled="item.role === 'super_admin'"
              />
            </div>
          </template>
        </v-data-table>
      </v-card-text>

      <!-- Consistent Footer Pattern -->
      <div v-if="!loading && totalItems > 0" class="pagination-footer">
        <v-divider class="footer-divider" />

        <div class="footer-content">
          <div class="footer-info">
            <div class="results-summary">
              <span class="text-body-2 text-medium-emphasis">
                Showing {{ ((currentPage - 1) * itemsPerPage) + 1 }}-{{ Math.min(currentPage * itemsPerPage, totalItems) }} of {{ totalItems }} administrators
              </span>
            </div>

            <div class="items-per-page">
              <span class="text-body-2 text-medium-emphasis me-2">Items per page:</span>
              <v-select
                v-model="itemsPerPage"
                :items="itemsPerPageOptions"
                variant="outlined"
                density="compact"
                hide-details
                class="items-per-page-select"
                @update:model-value="handleItemsPerPageChange"
              />
            </div>
          </div>

          <div class="pagination-controls">
            <v-pagination
              v-model="currentPage"
              :length="Math.ceil(totalItems / itemsPerPage)"
              :total-visible="7"
              @update:model-value="loadAdmins"
              density="comfortable"
              class="custom-pagination"
            />
          </div>
        </div>
      </div>
    </v-card>

    <!-- Create/Edit Admin Dialog -->
    <v-dialog v-model="showFormDialog" max-width="600" persistent>
      <v-card class="admin-form-dialog rounded-xl">
        <div class="modal-header pa-6 pb-4">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon class="me-3" color="primary">
                {{ isEditing ? 'mdi-pencil' : 'mdi-plus' }}
              </v-icon>
              <div>
                <h3 class="text-h5 font-weight-bold">
                  {{ isEditing ? 'Edit Administrator' : 'Add New Administrator' }}
                </h3>
                <p class="text-body-2 text-medium-emphasis ma-0">
                  {{ isEditing ? 'Update administrator information' : 'Create a new administrator account' }}
                </p>
              </div>
            </div>
            <v-btn
              icon="mdi-close"
              variant="text"
              size="small"
              @click="closeFormDialog"
            />
          </div>
        </div>

        <v-divider></v-divider>

        <v-card-text class="pa-6">
          <v-form ref="adminForm" v-model="formValid">
            <div class="form-section mb-6">
              <h4 class="text-subtitle-1 font-weight-medium mb-4">
                <v-icon class="me-2" size="20">mdi-account-details</v-icon>
                Personal Information
              </h4>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.firstName"
                    label="First Name"
                    variant="outlined"
                    :rules="[rules.required]"
                    prepend-inner-icon="mdi-account"
                    class="enhanced-field"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.lastName"
                    label="Last Name"
                    variant="outlined"
                    :rules="[rules.required]"
                    prepend-inner-icon="mdi-account"
                    class="enhanced-field"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.username"
                    label="Username"
                    variant="outlined"
                    prepend-inner-icon="mdi-at"
                    class="enhanced-field"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.email"
                    label="Email Address"
                    type="email"
                    variant="outlined"
                    :rules="[rules.required, rules.email]"
                    prepend-inner-icon="mdi-email"
                    :readonly="isEditing"
                    class="enhanced-field"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.phone"
                    label="Phone Number (Optional)"
                    variant="outlined"
                    prepend-inner-icon="mdi-phone"
                    class="enhanced-field"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="formData.bio"
                    label="Bio"
                    variant="outlined"
                    rows="3"
                    prepend-inner-icon="mdi-text"
                    placeholder="Brief description about the administrator..."
                    class="enhanced-field"
                  ></v-textarea>
                </v-col>
              </v-row>
            </div>

            <div v-if="!isEditing" class="form-section">
              <h4 class="text-subtitle-1 font-weight-medium mb-4">
                <v-icon class="me-2" size="20">mdi-lock</v-icon>
                Security
              </h4>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="formData.password"
                    label="Password"
                    type="password"
                    variant="outlined"
                    :rules="[rules.required, rules.minLength]"
                    prepend-inner-icon="mdi-lock"
                    class="enhanced-field"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="formData.confirmPassword"
                    label="Confirm Password"
                    type="password"
                    variant="outlined"
                    :rules="[rules.required, rules.passwordMatch]"
                    prepend-inner-icon="mdi-lock-check"
                    class="enhanced-field"
                  ></v-text-field>
                </v-col>
              </v-row>
            </div>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-6">
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            class="me-3"
            @click="closeFormDialog"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="saving"
            :disabled="!formValid"
            @click="saveAdmin"
            class="save-btn"
          >
            {{ isEditing ? 'Update' : 'Create' }} Admin
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="500">
      <v-card class="delete-dialog rounded-xl">
        <v-card-title class="pa-6 pb-4">
          <div class="d-flex align-center">
            <v-icon class="me-3" color="error">mdi-alert-circle</v-icon>
            <span class="text-h5 font-weight-bold">Deactivate Administrator</span>
          </div>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pa-6">
          <p class="text-body-1 mb-4">
            Are you sure you want to deactivate this administrator account?
          </p>
          <div v-if="selectedAdmin" class="admin-info pa-4 rounded-lg bg-surface-variant">
            <div class="d-flex align-center">
              <v-avatar size="40" class="me-3">
                <v-img v-if="selectedAdmin.profile_pic" :src="selectedAdmin.profile_pic" />
                <v-icon v-else>mdi-account</v-icon>
              </v-avatar>
              <div>
                <div class="font-weight-medium">{{ selectedAdmin.first_name }} {{ selectedAdmin.last_name }}</div>
                <div class="text-caption text-medium-emphasis">{{ selectedAdmin.email }}</div>
              </div>
            </div>
          </div>
          <p class="text-body-2 text-medium-emphasis mt-4">
            This action will deactivate the account and prevent login access. The account can be reactivated later if needed.
          </p>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-6">
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="closeDeleteDialog"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            :loading="deleting"
            @click="deleteAdmin"
          >
            Deactivate
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { ApiService } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const toast = useToast()
const authStore = useAuthStore()

// State
const loading = ref(false)
const admins = ref([])
const stats = ref({
  totalAdmins: 0,
  superAdmins: 0,
  regularAdmins: 0,
  recentAdmins: 0
})

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)

// Filters
const searchQuery = ref('')
const selectedRole = ref('')

// Dialog state
const showFormDialog = ref(false)
const showDeleteDialog = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const deleting = ref(false)
const formValid = ref(false)
const selectedAdmin = ref(null)

// Form data
const formData = ref({
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  phone: '',
  bio: '',
  password: '',
  confirmPassword: ''
})

// Validation rules
const rules = {
  required: (value: any) => !!value || 'This field is required',
  email: (value: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || 'Please enter a valid email address'
  },
  minLength: (value: string) => value.length >= 8 || 'Password must be at least 8 characters',
  passwordMatch: (value: string) => value === formData.value.password || 'Passwords do not match'
}

// Options
const roleOptions = [
  { title: 'All Roles', value: '' },
  { title: 'Super Admin', value: 'super_admin' },
  { title: 'Admin', value: 'admin' }
]

const itemsPerPageOptions = [
  { title: '10', value: 10 },
  { title: '25', value: 25 },
  { title: '50', value: 50 },
  { title: '100', value: 100 }
]

// Table headers
const headers = [
  { title: 'Name', key: 'name', sortable: false },
  { title: 'Email', key: 'email', sortable: true },
  { title: 'Role', key: 'role', sortable: true },
  { title: 'Phone', key: 'phone_number', sortable: false },
  { title: 'Created', key: 'created_at', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' }
]

// Computed properties are handled by v-data-table internally

// Methods
const loadAdmins = async () => {
  loading.value = true
  try {
    const { data, count, error } = await ApiService.getAdminUsers(
      currentPage.value,
      itemsPerPage.value,
      searchQuery.value
    )

    if (error) throw error

    admins.value = data || []
    totalItems.value = count || 0
  } catch (error) {
    toast.error('Failed to load administrators')
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const { data, error } = await ApiService.getAdminStats()
    if (error) throw error
    stats.value = data || stats.value
  } catch (error) {
    // Silent fail for stats loading
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const openCreateDialog = () => {
  isEditing.value = false
  resetForm()
  showFormDialog.value = true
}

const openEditDialog = (admin: any) => {
  isEditing.value = true
  selectedAdmin.value = admin
  formData.value = {
    firstName: admin.first_name || '',
    lastName: admin.last_name || '',
    username: admin.username || '',
    email: admin.email || '',
    phone: admin.phone_number || '',
    bio: admin.bio || '',
    password: '',
    confirmPassword: ''
  }
  showFormDialog.value = true
}

const openDeleteDialog = (admin: any) => {
  selectedAdmin.value = admin
  showDeleteDialog.value = true
}

const closeFormDialog = () => {
  showFormDialog.value = false
  resetForm()
}

const closeDeleteDialog = () => {
  showDeleteDialog.value = false
  selectedAdmin.value = null
}

const resetForm = () => {
  formData.value = {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    bio: '',
    password: '',
    confirmPassword: ''
  }
  selectedAdmin.value = null
}

const saveAdmin = async () => {
  saving.value = true
  try {
    if (isEditing.value) {
      const { data, error } = await ApiService.updateAdminUser(selectedAdmin.value.id, formData.value)
      if (error) throw error
      toast.success('Administrator updated successfully')
    } else {
      const { data, error } = await ApiService.createAdminUser(formData.value, authStore.adminUser?.id)
      if (error) throw error
      toast.success('Administrator created successfully')
    }

    closeFormDialog()
    loadAdmins()
    loadStats()
  } catch (error) {
    toast.error(`Failed to ${isEditing.value ? 'update' : 'create'} administrator`)
  } finally {
    saving.value = false
  }
}

const deleteAdmin = async () => {
  deleting.value = true
  try {
    const { data, error } = await ApiService.deactivateAdminUser(selectedAdmin.value.id)
    if (error) throw error

    toast.success('Administrator deactivated successfully')
    closeDeleteDialog()
    loadAdmins()
    loadStats()
  } catch (error) {

    toast.error('Failed to deactivate administrator')
  } finally {
    deleting.value = false
  }
}

// Event handlers
const handleItemsPerPageChange = () => {
  currentPage.value = 1
  loadAdmins()
}

// Debounced search
let searchTimeout: number
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadAdmins()
  }, 500)
}

// Lifecycle
onMounted(() => {
  loadStats()
  loadAdmins()
})
</script>

<style scoped>
/* Container */
.admin-management-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

/* Header */
.admin-header {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05) 0%, rgba(var(--v-theme-primary), 0.02) 100%);
  border-radius: 16px;
  padding: 24px;
}

.create-btn {
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.3);
}

/* Stats Cards */
.stats-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.stats-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

/* Filter Card */
.filter-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

/* Table */
.admins-table-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.admins-table :deep(.v-data-table__wrapper) {
  border-radius: 0;
}

.admins-table :deep(.v-data-table-header) {
  background: rgba(var(--v-theme-surface-variant), 0.5);
}

.admins-table :deep(.v-data-table-rows-no-data) {
  text-align: center;
  padding: 60px 20px;
}

/* Pagination */
.custom-pagination :deep(.v-pagination__item) {
  border-radius: 8px;
}

/* Dialog Styling */
.admin-form-dialog {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.modal-header {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05) 0%, rgba(var(--v-theme-primary), 0.02) 100%);
  border-bottom: 1px solid rgba(var(--v-theme-primary), 0.1);
}

.form-section {
  padding: 20px;
  border-radius: 12px;
  background: rgba(var(--v-theme-surface), 0.5);
  border: 1px solid rgba(var(--v-theme-outline), 0.1);
}

.enhanced-field :deep(.v-field) {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.enhanced-field :deep(.v-field:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.enhanced-field :deep(.v-field--focused) {
  box-shadow: 0 4px 16px rgba(var(--v-theme-primary), 0.2);
}

.enhanced-field :deep(.v-field--error) {
  box-shadow: 0 4px 16px rgba(var(--v-theme-error), 0.2);
}

.save-btn {
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.3);
  transition: all 0.3s ease;
}

.save-btn:hover {
  box-shadow: 0 6px 16px rgba(var(--v-theme-primary), 0.4);
  transform: translateY(-1px);
}

.delete-dialog {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.admin-info {
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
}

/* Dark theme support */
.v-theme--dark .admin-form-dialog {
  background: rgb(var(--v-theme-surface));
}

.v-theme--dark .modal-header {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.1) 0%, rgba(var(--v-theme-primary), 0.05) 100%);
  border-bottom-color: rgba(var(--v-theme-primary), 0.2);
}

.v-theme--dark .form-section {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-color: rgba(var(--v-theme-outline), 0.2);
}

.v-theme--dark .enhanced-field :deep(.v-field) {
  background: rgba(var(--v-theme-surface-variant), 0.5);
  border-color: rgba(var(--v-theme-outline), 0.2);
}

.v-theme--dark .admin-info {
  background: rgba(var(--v-theme-surface-variant), 0.5);
  border-color: rgba(var(--v-theme-outline), 0.3);
}

/* Footer Styling - Consistent with other admin pages */
.pagination-footer {
  background: rgba(var(--v-theme-surface), 1);
}

.footer-divider {
  border-color: rgba(var(--v-theme-outline), 0.12);
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  gap: 24px;
}

.footer-info {
  display: flex;
  align-items: center;
  gap: 32px;
}

.results-summary {
  min-width: 200px;
}

.items-per-page {
  display: flex;
  align-items: center;
  gap: 8px;
}

.items-per-page-select {
  width: 80px;
  min-width: 80px;
}

.items-per-page-select :deep(.v-field) {
  border-radius: 8px;
}

.pagination-controls {
  display: flex;
  align-items: center;
}

.custom-pagination :deep(.v-pagination__item) {
  border-radius: 8px;
  font-weight: 500;
}

.custom-pagination :deep(.v-pagination__item--is-active) {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}

/* Responsive footer */
@media (max-width: 960px) {
  .footer-content {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }

  .footer-info {
    flex-direction: column;
    gap: 16px;
    width: 100%;
  }

  .results-summary {
    min-width: auto;
    text-align: center;
  }

  .items-per-page {
    justify-content: center;
  }

  .pagination-controls {
    width: 100%;
    justify-content: center;
  }
}

/* Responsive */
@media (max-width: 960px) {
  .admin-management-container {
    padding: 16px;
  }

  .admin-header {
    padding: 16px;
  }
}
</style>
