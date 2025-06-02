<template>
  <div class="modern-user-detail-view">
    <!-- Modern Header -->
    <div class="page-header mb-8">
      <div class="d-flex align-center justify-space-between flex-wrap gap-4">
        <div class="d-flex align-center">
          <v-btn
            icon="mdi-arrow-left"
            variant="text"
            color="primary"
            class="me-4"
            @click="$router.go(-1)"
          />
          <div>
            <h1 class="text-h4 font-weight-bold mb-1">User Details</h1>
            <p class="text-subtitle-1 text-on-surface-variant mb-0">
              View and manage user information
            </p>
          </div>
        </div>

        <div class="d-flex align-center gap-3" v-if="user">
          <v-chip
            :color="getStatusColor(user.profile_visibility)"
            variant="tonal"
            size="large"
            class="font-weight-medium"
          >
            <v-icon
              :icon="user.profile_visibility ? 'mdi-eye' : 'mdi-eye-off'"
              size="16"
              class="me-2"
            />
            {{ user.profile_visibility ? 'Public Profile' : 'Private Profile' }}
          </v-chip>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <v-card class="pa-8 text-center" rounded="xl">
        <v-progress-circular indeterminate color="primary" size="64" class="mb-4" />
        <div class="text-h6 mb-2">Loading user details...</div>
        <div class="text-body-2 text-on-surface-variant">Please wait while we fetch the information</div>
      </v-card>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <v-card class="pa-8 text-center" rounded="xl" color="error" variant="tonal">
        <v-icon icon="mdi-alert-circle" size="64" color="error" class="mb-4" />
        <div class="text-h6 mb-2">Error Loading User</div>
        <div class="text-body-2 mb-4">{{ error }}</div>
        <v-btn color="error" @click="loadUser">Try Again</v-btn>
      </v-card>
    </div>

    <!-- User Content -->
    <v-row v-else-if="user" class="user-content">
      <v-col cols="12" lg="4">
        <!-- User Profile Card -->
        <v-card class="profile-card mb-6" rounded="xl">
          <v-card-text class="pa-8 text-center">
            <v-avatar size="120" class="mb-6 profile-avatar">
              <v-img
                v-if="user.profile_pic"
                :src="user.profile_pic"
                :alt="`${user.first_name} ${user.last_name}`"
              />
              <v-icon v-else size="60" color="primary">mdi-account</v-icon>
            </v-avatar>
            <div class="text-h5 font-weight-bold mb-2">
              {{ user.first_name }} {{ user.last_name }}
            </div>
            <div class="text-body-1 text-on-surface-variant mb-2">
              @{{ user.username || 'No username' }}
            </div>
            <div class="text-body-2 text-on-surface-variant mb-4">
              {{ user.email }}
            </div>
            <div class="text-caption text-on-surface-variant">
              Member since {{ formatDate(user.created_at) }}
            </div>
          </v-card-text>
        </v-card>

        <!-- Contact Information Card -->
        <v-card class="contact-card mb-6" rounded="xl">
          <v-card-title class="pa-6 pb-4">
            <div class="d-flex align-center">
              <v-icon icon="mdi-card-account-details" class="me-2" />
              <span class="text-h6 font-weight-bold">Contact Information</span>
            </div>
          </v-card-title>
          <v-card-text class="pa-6 pt-0">
            <div class="contact-item mb-4">
              <div class="text-subtitle-2 font-weight-bold mb-1">Email Address</div>
              <div class="text-body-1">{{ user.email || 'Not provided' }}</div>
            </div>
            <div class="contact-item mb-4">
              <div class="text-subtitle-2 font-weight-bold mb-1">Mobile Number</div>
              <div class="text-body-1">{{ user.mobile_number || 'Not provided' }}</div>
            </div>
            <div class="contact-item">
              <div class="text-subtitle-2 font-weight-bold mb-1">Bio</div>
              <div class="text-body-1">{{ user.bio || 'No bio provided' }}</div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Actions Card -->
        <v-card class="actions-card" rounded="xl">
          <v-card-title class="pa-6 pb-4">
            <div class="d-flex align-center">
              <v-icon icon="mdi-cog" class="me-2" />
              <span class="text-h6 font-weight-bold">Actions</span>
            </div>
          </v-card-title>
          <v-card-text class="pa-6 pt-0">
            <v-btn
              color="primary"
              variant="elevated"
              block
              class="mb-3"
              prepend-icon="mdi-pencil"
              @click="editUser"
            >
              Edit User
            </v-btn>
            <v-btn
              :color="user.profile_visibility ? 'warning' : 'success'"
              variant="outlined"
              block
              class="mb-3"
              :prepend-icon="user.profile_visibility ? 'mdi-eye-off' : 'mdi-eye'"
              :loading="privacyLoading"
              @click="toggleUserStatus"
            >
              {{ user.profile_visibility ? 'Make Private' : 'Make Public' }}
            </v-btn>
            <v-btn
              color="error"
              variant="outlined"
              block
              prepend-icon="mdi-delete"
              @click="deleteUser"
            >
              Delete User
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="8">
        <!-- Modern Tabs -->
        <v-card class="tabs-card" rounded="xl">
          <v-tabs
            v-model="activeTab"
            class="modern-tabs"
            color="primary"
            slider-color="primary"
          >
            <v-tab value="overview" class="tab-item">
              <v-icon icon="mdi-chart-box" class="me-2" />
              Overview
            </v-tab>
            <v-tab value="pets" class="tab-item">
              <v-icon icon="mdi-paw" class="me-2" />
              Pets ({{ user.pets?.length || 0 }})
            </v-tab>
            <v-tab value="orders" class="tab-item">
              <v-icon icon="mdi-shopping" class="me-2" />
              Orders ({{ user.orders?.length || 0 }})
            </v-tab>
            <v-tab value="appointments" class="tab-item">
              <v-icon icon="mdi-calendar" class="me-2" />
              Appointments ({{ user.appointments?.length || 0 }})
            </v-tab>
          </v-tabs>

          <v-tabs-window v-model="activeTab" class="pa-6">
            <!-- Overview Tab -->
            <v-tabs-window-item value="overview">
              <div class="overview-content">
                <h3 class="text-h6 font-weight-bold mb-4">Account Statistics</h3>
                <v-row>
                  <v-col cols="6" md="3">
                    <v-card class="stat-card text-center pa-4" rounded="lg" variant="tonal" color="primary">
                      <v-icon icon="mdi-shopping" size="32" color="primary" class="mb-2" />
                      <div class="text-h4 font-weight-bold text-primary">{{ user.orders?.length || 0 }}</div>
                      <div class="text-body-2 text-on-surface-variant">Total Orders</div>
                    </v-card>
                  </v-col>
                  <v-col cols="6" md="3">
                    <v-card class="stat-card text-center pa-4" rounded="lg" variant="tonal" color="success">
                      <v-icon icon="mdi-currency-php" size="32" color="success" class="mb-2" />
                      <div class="text-h4 font-weight-bold text-success">₱0</div>
                      <div class="text-body-2 text-on-surface-variant">Total Spent</div>
                    </v-card>
                  </v-col>
                  <v-col cols="6" md="3">
                    <v-card class="stat-card text-center pa-4" rounded="lg" variant="tonal" color="info">
                      <v-icon icon="mdi-paw" size="32" color="info" class="mb-2" />
                      <div class="text-h4 font-weight-bold text-info">{{ user.pets?.length || 0 }}</div>
                      <div class="text-body-2 text-on-surface-variant">Registered Pets</div>
                    </v-card>
                  </v-col>
                  <v-col cols="6" md="3">
                    <v-card class="stat-card text-center pa-4" rounded="lg" variant="tonal" color="warning">
                      <v-icon icon="mdi-calendar" size="32" color="warning" class="mb-2" />
                      <div class="text-h4 font-weight-bold text-warning">{{ user.appointments?.length || 0 }}</div>
                      <div class="text-body-2 text-on-surface-variant">Appointments</div>
                    </v-card>
                  </v-col>
                </v-row>
              </div>
            </v-tabs-window-item>

            <!-- Pets Tab -->
            <v-tabs-window-item value="pets">
              <div class="pets-content">
                <h3 class="text-h6 font-weight-bold mb-4">Registered Pets</h3>
                <div v-if="user.pets && user.pets.length > 0">
                  <v-row>
                    <v-col v-for="pet in user.pets" :key="pet.id" cols="12" md="6">
                      <v-card class="pet-card pa-4" rounded="lg" variant="outlined">
                        <div class="d-flex align-center">
                          <v-avatar size="48" class="me-3">
                            <v-icon color="primary">mdi-paw</v-icon>
                          </v-avatar>
                          <div>
                            <div class="text-h6 font-weight-bold">{{ pet.name }}</div>
                            <div class="text-body-2 text-on-surface-variant">{{ pet.type || 'Unknown type' }}</div>
                          </div>
                        </div>
                      </v-card>
                    </v-col>
                  </v-row>
                </div>
                <div v-else class="text-center py-8">
                  <v-icon icon="mdi-paw" size="64" color="grey" class="mb-4" />
                  <div class="text-h6 mb-2">No pets registered</div>
                  <div class="text-body-2 text-on-surface-variant">This user hasn't registered any pets yet.</div>
                </div>
              </div>
            </v-tabs-window-item>

            <!-- Orders Tab -->
            <v-tabs-window-item value="orders">
              <div class="orders-content">
                <h3 class="text-h6 font-weight-bold mb-4">Order History</h3>
                <div v-if="user.orders && user.orders.length > 0">
                  <v-card v-for="order in user.orders" :key="order.id" class="order-card mb-3" rounded="lg" variant="outlined">
                    <v-card-text class="pa-4">
                      <div class="d-flex align-center justify-space-between">
                        <div>
                          <div class="text-h6 font-weight-bold">Order #{{ order.id }}</div>
                          <div class="text-body-2 text-on-surface-variant">{{ formatDate(order.created_at) }}</div>
                        </div>
                        <div class="text-end">
                          <div class="text-h6 font-weight-bold">₱{{ Number(order.total_amount || 0).toLocaleString() }}</div>
                          <v-chip
                            :color="getOrderStatusColor(order.status)"
                            size="small"
                            variant="tonal"
                          >
                            {{ order.status }}
                          </v-chip>
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </div>
                <div v-else class="text-center py-8">
                  <v-icon icon="mdi-shopping" size="64" color="grey" class="mb-4" />
                  <div class="text-h6 mb-2">No orders found</div>
                  <div class="text-body-2 text-on-surface-variant">This user hasn't placed any orders yet.</div>
                </div>
              </div>
            </v-tabs-window-item>

            <!-- Appointments Tab -->
            <v-tabs-window-item value="appointments">
              <div class="appointments-content">
                <h3 class="text-h6 font-weight-bold mb-4">Appointment History</h3>
                <div v-if="user.appointments && user.appointments.length > 0">
                  <v-card v-for="appointment in user.appointments" :key="appointment.id" class="appointment-card mb-3" rounded="lg" variant="outlined">
                    <v-card-text class="pa-4">
                      <div class="d-flex align-center justify-space-between">
                        <div>
                          <div class="text-h6 font-weight-bold">{{ appointment.service_type || 'Appointment' }}</div>
                          <div class="text-body-2 text-on-surface-variant">
                            {{ formatDate(appointment.appointment_date) }} at {{ appointment.appointment_time }}
                          </div>
                        </div>
                        <v-chip
                          :color="getAppointmentStatusColor(appointment.status)"
                          size="small"
                          variant="tonal"
                        >
                          {{ appointment.status }}
                        </v-chip>
                      </div>
                    </v-card-text>
                  </v-card>
                </div>
                <div v-else class="text-center py-8">
                  <v-icon icon="mdi-calendar" size="64" color="grey" class="mb-4" />
                  <div class="text-h6 mb-2">No appointments found</div>
                  <div class="text-body-2 text-on-surface-variant">This user hasn't scheduled any appointments yet.</div>
                </div>
              </div>
            </v-tabs-window-item>
          </v-tabs-window>
        </v-card>
      </v-col>
    </v-row>

    <!-- Not Found State -->
    <div v-else class="not-found-container">
      <v-card class="pa-8 text-center" rounded="xl">
        <v-icon icon="mdi-account-question" size="64" color="grey" class="mb-4" />
        <div class="text-h6 mb-2">User not found</div>
        <div class="text-body-2 text-on-surface-variant mb-4">The requested user could not be found</div>
        <v-btn color="primary" @click="$router.push('/users')">Back to Users</v-btn>
      </v-card>
    </div>

    <!-- Enhanced Edit User Dialog -->
    <UserFormDialog
      v-model="showEditDialog"
      :user="user"
      :loading="editLoading"
      @submit="handleEditSubmit"
      @cancel="cancelEdit"
    />

    <!-- Enhanced Delete Confirmation Dialog -->
    <UserDeleteDialog
      v-model="showDeleteDialog"
      :user="user"
      :loading="deleteLoading"
      :show-stats="true"
      @confirm="handleDeleteConfirm"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { format } from 'date-fns'
import { useToast } from 'vue-toastification'
import { ApiService } from '@/services/api'
import UserDeleteDialog from '@/components/UserDeleteDialog.vue'
import UserFormDialog from '@/components/UserFormDialog.vue'

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
  pets: any[]
  orders: any[]
  appointments: any[]
}

const route = useRoute()
const router = useRouter()
const toast = useToast()

const loading = ref(true)
const error = ref<string | null>(null)
const user = ref<User | null>(null)
const activeTab = ref('overview')

// Edit user modal state
const showEditDialog = ref(false)
const editLoading = ref(false)

// Delete confirmation dialog state
const showDeleteDialog = ref(false)
const deleteLoading = ref(false)

// Privacy toggle loading state
const privacyLoading = ref(false)

const getStatusColor = (status: boolean | null) => {
  return status ? 'success' : 'default'
}

const getOrderStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pending': return 'warning'
    case 'processing': return 'info'
    case 'shipped': return 'primary'
    case 'delivered': return 'success'
    case 'cancelled': return 'error'
    default: return 'grey'
  }
}

const getAppointmentStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'confirmed': return 'success'
    case 'pending': return 'warning'
    case 'cancelled': return 'error'
    case 'completed': return 'info'
    default: return 'grey'
  }
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A'
  return format(new Date(dateString), 'MMM dd, yyyy')
}

// Form validation rules
const validationRules = {
  required: (v: string) => !!v || 'This field is required',
  maxLength: (max: number) => (v: string) => !v || v.length <= max || `Must be less than ${max} characters`
}

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

const editUser = () => {
  if (!user.value) return
  showEditDialog.value = true
}

const cancelEdit = () => {
  showEditDialog.value = false
}

const handleEditSubmit = async (formData: FormData) => {
  if (!user.value) return

  editLoading.value = true

  try {
    const { data, error } = await ApiService.updateUser(user.value.id, {
      first_name: formData.first_name,
      last_name: formData.last_name,
      username: formData.username,
      mobile_number: formData.mobile_number || null,
      bio: formData.bio || null
    })

    if (error) throw error

    // Update local user data
    if (data) {
      user.value = { ...user.value, ...data }
    }

    toast.success('User updated successfully!')
    showEditDialog.value = false
  } catch (err) {

    const errorMessage = err instanceof Error ? err.message : 'Failed to update user'
    toast.error(errorMessage)
  } finally {
    editLoading.value = false
  }
}

const toggleUserStatus = async () => {
  if (!user.value) return

  privacyLoading.value = true

  try {
    const newVisibility = !user.value.profile_visibility
    const { error } = await ApiService.updateUser(user.value.id, {
      profile_visibility: newVisibility
    })

    if (error) throw error

    user.value.profile_visibility = newVisibility

    const statusText = newVisibility ? 'public' : 'private'
    toast.success(`User profile set to ${statusText}`)
  } catch (err) {

    const errorMessage = err instanceof Error ? err.message : 'Failed to update user status'
    toast.error(errorMessage)
  } finally {
    privacyLoading.value = false
  }
}

const deleteUser = () => {
  if (!user.value) return
  showDeleteDialog.value = true
}

const cancelDelete = () => {
  showDeleteDialog.value = false
}

const handleDeleteConfirm = async () => {
  if (!user.value) return

  deleteLoading.value = true

  try {
    const { error } = await ApiService.deleteUser(user.value.id)

    if (error) throw error

    toast.success('User deleted successfully')

    // Navigate back to users list
    router.push('/users')
  } catch (err) {

    const errorMessage = err instanceof Error ? err.message : 'Failed to delete user'
    toast.error(errorMessage)
  } finally {
    deleteLoading.value = false
    showDeleteDialog.value = false
  }
}

const viewOrder = (orderId: string) => {
  router.push(`/orders/${orderId}`)
}

const loadUser = async () => {
  loading.value = true
  error.value = null

  try {
    const userId = route.params.id as string
    const { data, error: apiError } = await ApiService.getUserById(userId)

    if (apiError) {
      throw apiError
    }

    if (!data) {
      throw new Error('User not found')
    }

    user.value = data
  } catch (err) {

    error.value = err instanceof Error ? err.message : 'Failed to load user'
    user.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUser()
})
</script>

<style scoped>
.modern-user-detail-view {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(99, 102, 241, 0.02));
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(99, 102, 241, 0.1);
}

.loading-container,
.error-container,
.not-found-container {
  max-width: 600px;
  margin: 0 auto;
}

.user-content {
  margin-top: 0;
}

.profile-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.profile-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.profile-avatar {
  border: 3px solid rgba(99, 102, 241, 0.1);
  transition: all 0.2s ease;
}

.profile-avatar:hover {
  border-color: rgba(99, 102, 241, 0.3);
  transform: scale(1.05);
}

.contact-card,
.actions-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.contact-card:hover,
.actions-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.contact-item {
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.contact-item:last-child {
  border-bottom: none;
}

.tabs-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.modern-tabs {
  background: rgba(99, 102, 241, 0.02);
  border-bottom: 1px solid rgba(99, 102, 241, 0.1);
}

.tab-item {
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.025em;
}

.stat-card {
  transition: all 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.pet-card,
.order-card,
.appointment-card {
  transition: all 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.pet-card:hover,
.order-card:hover,
.appointment-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .modern-user-detail-view {
    padding: 16px;
  }

  .page-header {
    padding: 16px;
  }
}

@media (max-width: 768px) {
  .page-header .d-flex {
    flex-direction: column;
    align-items: flex-start !important;
  }

  .page-header .d-flex > div:last-child {
    margin-top: 16px;
    align-self: stretch;
  }

  .user-content .v-col:first-child {
    order: 2;
  }

  .user-content .v-col:last-child {
    order: 1;
  }
}

/* Dark theme adjustments */
.v-theme--dark .page-header {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0.05));
  border-color: rgba(99, 102, 241, 0.2);
}

.v-theme--dark .profile-card,
.v-theme--dark .contact-card,
.v-theme--dark .actions-card,
.v-theme--dark .tabs-card {
  border-color: rgba(255, 255, 255, 0.1);
}

.v-theme--dark .modern-tabs {
  background: rgba(99, 102, 241, 0.05);
  border-bottom-color: rgba(99, 102, 241, 0.2);
}

.v-theme--dark .contact-item {
  border-bottom-color: rgba(255, 255, 255, 0.05);
}

.v-theme--dark .stat-card,
.v-theme--dark .pet-card,
.v-theme--dark .order-card,
.v-theme--dark .appointment-card {
  border-color: rgba(255, 255, 255, 0.08);
}
</style>
