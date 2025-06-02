<template>
  <div class="appointments-view">
    <!-- Enhanced Professional Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">Appointments Management</h1>
          <p class="page-subtitle">Schedule, manage, and track all pet appointments and veterinary visits</p>
        </div>
        <div class="header-actions">
          <v-btn
            color="primary"
            size="large"
            variant="flat"
            prepend-icon="mdi-plus"
            class="add-appointment-btn"
            @click="openNewAppointmentDialog"
          >
            Schedule Appointment
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && appointments.length === 0" class="loading-container">
      <v-card class="pa-8 text-center" rounded="lg">
        <v-progress-circular indeterminate color="primary" size="60" width="4" />
        <div class="text-h6 mt-4 mb-2">Loading appointments...</div>
        <div class="text-body-2 text-medium-emphasis">Please wait while we fetch the data</div>
      </v-card>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <v-card class="pa-8 text-center" rounded="lg" color="error" variant="tonal">
        <v-icon size="60" color="error" class="mb-4">mdi-alert-circle</v-icon>
        <div class="text-h6 mb-2">Error Loading Appointments</div>
        <div class="text-body-2 mb-4">{{ error }}</div>
        <v-btn color="error" @click="loadAppointments">
          <v-icon start>mdi-refresh</v-icon>
          Try Again
        </v-btn>
      </v-card>
    </div>

    <!-- Main Content -->
    <div v-else class="appointments-content">
      <!-- Statistics Cards -->
      <v-row class="stats-section mb-6">
        <v-col cols="12" sm="6" md="3">
          <v-card rounded="xl" class="stats-card" elevation="2">
            <v-card-text class="pa-4">
              <div class="d-flex align-center">
                <div class="stats-icon-container me-3">
                  <v-icon icon="mdi-calendar-clock" size="32" color="primary" />
                </div>
                <div>
                  <div class="text-h5 font-weight-bold">{{ totalAppointments }}</div>
                  <div class="text-body-2 text-on-surface-variant">Total Appointments</div>
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
                  <div class="text-h5 font-weight-bold">{{ todayCount }}</div>
                  <div class="text-body-2 text-on-surface-variant">Today's Appointments</div>
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
                  <v-icon icon="mdi-clock-outline" size="32" color="warning" />
                </div>
                <div>
                  <div class="text-h5 font-weight-bold">{{ pendingCount }}</div>
                  <div class="text-body-2 text-on-surface-variant">Pending</div>
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
                  <v-icon icon="mdi-check-all" size="32" color="success" />
                </div>
                <div>
                  <div class="text-h5 font-weight-bold">{{ completedCount }}</div>
                  <div class="text-body-2 text-on-surface-variant">Completed</div>
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
            <h3 class="text-h6 font-weight-bold">Filter & Search Appointments</h3>
            <p class="text-body-2 text-medium-emphasis">Find appointments by pet, owner, status, or date</p>
          </div>

          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="searchQuery"
                label="Search appointments..."
                placeholder="Search by pet name, owner, or status"
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
                v-model="selectedStatus"
                label="Status"
                :items="statusFilterOptions"
                variant="outlined"
                density="comfortable"
                clearable
                @update:model-value="handleStatusFilterChange"
                class="filter-select"
              />
            </v-col>

            <v-col cols="12" md="2">
              <v-text-field
                v-model="selectedDate"
                label="Date"
                type="date"
                variant="outlined"
                density="comfortable"
                clearable
                @update:model-value="handleDateFilterChange"
                class="filter-select"
              />
            </v-col>

            <v-col cols="12" md="2">
              <v-select
                v-model="selectedTimeRange"
                label="Time Range"
                :items="timeRangeOptions"
                variant="outlined"
                density="comfortable"
                clearable
                @update:model-value="handleTimeRangeFilter"
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

      <!-- Appointments Table -->
      <v-card rounded="xl" elevation="2">
        <v-card-title class="pa-6 pb-4">
          <div class="d-flex align-center justify-space-between w-100">
            <h3 class="text-h6 font-weight-bold">Appointment Records</h3>
            <div class="d-flex align-center">
              <span class="text-body-2 text-on-surface-variant me-4">
                {{ appointments.length }} of {{ totalAppointments }} appointments
              </span>

              <v-btn
                variant="text"
                icon="mdi-refresh"
                @click="loadAppointments"
                :loading="loading"
              />
            </div>
          </div>
        </v-card-title>

        <div class="appointments-table-container">
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
                  <div class="mt-2 text-body-2">Loading appointments...</div>
                </td>
              </tr>
              <tr v-else-if="appointments.length === 0">
                <td :colspan="headers.length" class="text-center py-8">
                  <v-icon size="48" color="grey-lighten-2" class="mb-2">mdi-calendar-off</v-icon>
                  <div class="text-h6 mb-2">No appointments found</div>
                  <div class="text-body-2 text-medium-emphasis">
                    {{ searchQuery || selectedStatus || selectedDate ? 'Try adjusting your filters' : 'Start by scheduling your first appointment' }}
                  </div>
                </td>
              </tr>
              <tr v-else v-for="item in appointments" :key="item.id" class="table-row"
                  @click="handleRowClick($event, item)">
                <!-- Pet Name -->
                <td>
                  <div class="pet-info">
                    <div class="font-weight-medium text-body-1 pet-name" :title="item.pet?.name || 'Unknown Pet'">
                      {{ item.pet?.name || 'Unknown Pet' }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ item.pet?.type || 'Unknown Type' }}
                    </div>
                  </div>
                </td>

                <!-- Owner -->
                <td>
                  <div class="owner-info">
                    <div class="text-body-2 font-weight-medium owner-name" :title="getOwnerName(item.user)">
                      {{ getOwnerName(item.user) }}
                    </div>
                  </div>
                </td>

                <!-- Date -->
                <td>
                  <div class="date-column">
                    <div class="text-body-2 font-weight-medium">
                      {{ formatDate(item.appointment_date) }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ formatTime(item.appointment_time) }}
                    </div>
                  </div>
                </td>

                <!-- Status -->
                <td>
                  <v-chip
                    :color="getStatusColor(item.status)"
                    size="small"
                    variant="tonal"
                    class="font-weight-medium"
                  >
                    <v-icon
                      :icon="getStatusIcon(item.status)"
                      size="16"
                      class="me-1"
                    />
                    {{ formatStatusText(item.status) }}
                  </v-chip>
                </td>

                <!-- Actions -->
                <td>
                  <div class="actions-column">
                    <!-- Desktop Actions -->
                    <div class="desktop-actions d-none d-sm-flex">
                      <!-- Mark as Completed (Only for pending/confirmed) -->
                      <v-tooltip
                        v-if="canMarkAsCompleted(item.status)"
                        text="Mark as completed"
                        location="top"
                      >
                        <template #activator="{ props }">
                          <v-btn
                            icon="mdi-check-circle"
                            variant="text"
                            size="small"
                            color="success"
                            v-bind="props"
                            :loading="item.updating"
                            @click.stop="markAsCompleted(item)"
                          />
                        </template>
                      </v-tooltip>

                      <!-- Mark as Cancelled (Only for pending/confirmed) -->
                      <v-tooltip
                        v-if="canMarkAsCancelled(item.status)"
                        text="Mark as cancelled"
                        location="top"
                      >
                        <template #activator="{ props }">
                          <v-btn
                            icon="mdi-cancel"
                            variant="text"
                            size="small"
                            color="warning"
                            v-bind="props"
                            :loading="item.updating"
                            @click.stop="markAsCancelled(item)"
                          />
                        </template>
                      </v-tooltip>
                    </div>

                    <!-- Mobile Actions -->
                    <div class="mobile-actions d-sm-none">
                      <v-menu v-if="canMarkAsCompleted(item.status) || canMarkAsCancelled(item.status)">
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
                          <v-list-item
                            v-if="canMarkAsCompleted(item.status)"
                            @click="markAsCompleted(item)"
                            :disabled="item.updating"
                          >
                            <template #prepend>
                              <v-icon>mdi-check-circle</v-icon>
                            </template>
                            <v-list-item-title>Mark as Completed</v-list-item-title>
                          </v-list-item>

                          <v-list-item
                            v-if="canMarkAsCancelled(item.status)"
                            @click="markAsCancelled(item)"
                            :disabled="item.updating"
                          >
                            <template #prepend>
                              <v-icon>mdi-cancel</v-icon>
                            </template>
                            <v-list-item-title>Mark as Cancelled</v-list-item-title>
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
    </div>

    <!-- Enhanced New Appointment Dialog -->
    <v-dialog v-model="showNewAppointmentDialog" max-width="700px" persistent>
      <v-card class="appointment-form-dialog elevation-12">
        <!-- Enhanced Header -->
        <v-card-title class="dialog-header pa-0">
          <div class="header-content">
            <div class="header-icon-section">
              <v-avatar size="48" color="primary" variant="tonal">
                <v-icon size="24">mdi-calendar-plus</v-icon>
              </v-avatar>
              <div class="header-text">
                <h2 class="header-title">Create New Appointment</h2>
                <p class="header-subtitle">Schedule a new appointment for your pet</p>
              </div>
            </div>
            <v-btn
              icon="mdi-close"
              variant="text"
              size="small"
              class="close-btn"
              @click="closeNewAppointmentDialog"
            />
          </div>
        </v-card-title>

        <v-divider class="header-divider"></v-divider>

        <v-card-text class="form-content">
          <v-form ref="appointmentFormRef" v-model="appointmentFormValid" @submit.prevent="createAppointment">

            <!-- Pet Selection Section -->
            <div class="form-section">
              <div class="section-header">
                <v-icon class="section-icon" color="primary">mdi-dog</v-icon>
                <div class="section-info">
                  <h3 class="section-title">Pet Information</h3>
                  <p class="section-description">Select the pet for this appointment</p>
                </div>
              </div>

              <v-select
                v-model="appointmentForm.pet_id"
                :items="availablePets"
                item-title="display_name"
                item-value="id"
                label="Select Pet"
                variant="outlined"
                :rules="[v => !!v || 'Pet is required']"
                :loading="loadingPets"
                prepend-inner-icon="mdi-dog"
                class="enhanced-select"
                clearable
                required
              >
                <template #no-data>
                  <v-list-item>
                    <v-list-item-title class="text-center text-grey">
                      No pets available
                    </v-list-item-title>
                  </v-list-item>
                </template>
              </v-select>
            </div>

            <!-- Date Selection Section -->
            <div class="form-section">
              <div class="section-header">
                <v-icon class="section-icon" color="primary">mdi-calendar</v-icon>
                <div class="section-info">
                  <h3 class="section-title">Appointment Date</h3>
                  <p class="section-description">Choose your preferred appointment date</p>
                </div>
              </div>

              <v-text-field
                v-model="appointmentForm.appointment_date"
                label="Appointment Date"
                type="date"
                variant="outlined"
                :rules="[v => !!v || 'Date is required']"
                prepend-inner-icon="mdi-calendar"
                class="enhanced-date-field"
                @update:model-value="loadTimeSlots"
                clearable
                required
              />
            </div>

            <!-- Time Slot Selection Section -->
            <div class="form-section">
              <div class="section-header">
                <v-icon class="section-icon" color="primary">mdi-clock-outline</v-icon>
                <div class="section-info">
                  <h3 class="section-title">Available Time Slots</h3>
                  <p class="section-description">Select from available appointment times</p>
                </div>
              </div>

              <v-select
                v-model="appointmentForm.day_slot_id"
                :items="availableTimeSlots"
                item-title="display_text"
                item-value="id"
                label="Select Time Slot"
                variant="outlined"
                :rules="[v => !!v || 'Time slot is required']"
                :loading="loadingTimeSlots"
                :disabled="!appointmentForm.appointment_date"
                prepend-inner-icon="mdi-clock-outline"
                class="enhanced-select"
                clearable
                required
              >
                <template #no-data>
                  <v-list-item>
                    <v-list-item-title class="text-center text-grey">
                      {{ appointmentForm.appointment_date ? 'No available time slots for this date' : 'Please select a date first' }}
                    </v-list-item-title>
                  </v-list-item>
                </template>
              </v-select>
            </div>

            <!-- Status Selection Section -->
            <div class="form-section">
              <div class="section-header">
                <v-icon class="section-icon" color="primary">mdi-check-circle</v-icon>
                <div class="section-info">
                  <h3 class="section-title">Initial Status</h3>
                  <p class="section-description">Set the initial appointment status</p>
                </div>
              </div>

              <v-select
                v-model="appointmentForm.status"
                :items="formStatusOptions"
                label="Initial Status"
                variant="outlined"
                :rules="[v => !!v || 'Status is required']"
                prepend-inner-icon="mdi-check-circle"
                class="enhanced-select"
                clearable
                required
              />
            </div>

          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <!-- Enhanced Actions -->
        <v-card-actions class="form-actions">
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            size="large"
            @click="closeNewAppointmentDialog"
            :disabled="creatingAppointment"
            class="cancel-btn"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            size="large"
            @click="createAppointment"
            :loading="creatingAppointment"
            :disabled="!appointmentFormValid"
            class="create-btn"
          >
            <v-icon start>mdi-calendar-plus</v-icon>
            Create Appointment
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { format } from 'date-fns'
import { debounce } from 'lodash-es'
import { ApiService } from '@/services/api'
import { useToast } from 'vue-toastification'
import { useGlobalRealtime } from '@/composables/useGlobalRealtime'
import type { Database } from '@/config/supabase'

// Define component name for keep-alive
defineOptions({
  name: 'AppointmentsView'
})

// Type aliases for better readability
type Tables = Database['public']['Tables']
type AppointmentRow = Tables['appointments']['Row']

// Enhanced Appointment interface with relationships
interface Appointment extends AppointmentRow {
  pet?: {
    name: string
    type: string
  }
  user?: {
    username: string | null
    first_name: string | null
    last_name: string | null
  }
  updating?: boolean // For loading states
}

const toast = useToast()

// Real-time functionality
const {
  appointments: realtimeAppointments,
  upcomingAppointmentCount,
  appointmentsLoading: realtimeLoading,
  lastAppointmentUpdate
} = useGlobalRealtime()

// Reactive state
const loading = ref(true)
const error = ref<string | null>(null)
const appointments = ref<Appointment[]>([])
const totalAppointments = ref(0)
const page = ref(1)
const itemsPerPage = ref(10)

// Search and filters
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedDate = ref('')
const selectedTimeRange = ref('')

// Dialog state
const showNewAppointmentDialog = ref(false)
const appointmentFormValid = ref(false)
const appointmentFormRef = ref<any>(null)
const creatingAppointment = ref(false)
const loadingPets = ref(false)
const loadingTimeSlots = ref(false)
const availablePets = ref<Array<{id: string, display_name: string}>>([])
const availableTimeSlots = ref<Array<{id: string, display_text: string, time_slot: string, end_time: string, max_capacity: number}>>([])

// Appointment form data - using reactive for better form field reactivity
const appointmentForm = reactive({
  pet_id: '',
  appointment_date: '',
  day_slot_id: '',
  status: 'Pending'
})

// Status options for the form (matching database constraints)
const formStatusOptions = [
  { title: 'Pending', value: 'Pending' },
  { title: 'Completed', value: 'Completed' }
]

// Table configuration
const headers = [
  { title: 'Pet', key: 'pet', sortable: false, width: '200px', minWidth: '150px' },
  { title: 'Owner', key: 'owner', sortable: false, width: '200px', minWidth: '150px' },
  { title: 'Date & Time', key: 'appointment_date', sortable: true, width: '160px', minWidth: '140px' },
  { title: 'Status', key: 'status', sortable: false, width: '120px', minWidth: '100px' },
  { title: 'Actions', key: 'actions', sortable: false, width: '120px', minWidth: '100px' }
]

// Status options for filtering (matching database constraints)
const statusFilterOptions = [
  { title: 'Pending', value: 'Pending' },
  { title: 'Completed', value: 'Completed' },
  { title: 'Cancelled', value: 'Cancelled' },
  { title: 'Expired', value: 'Expired' }
]

const timeRangeOptions = [
  { title: 'Morning (8AM-12PM)', value: 'morning' },
  { title: 'Afternoon (12PM-5PM)', value: 'afternoon' },
  { title: 'Evening (5PM-8PM)', value: 'evening' }
]

// Computed properties for statistics (using correct database status values)
const completedCount = computed(() => {
  if (selectedStatus.value === 'Completed') {
    return totalAppointments.value
  }
  if (selectedStatus.value && selectedStatus.value !== 'Completed') {
    return 0
  }
  return appointments.value.filter((apt: Appointment) => apt.status === 'Completed').length
})

const pendingCount = computed(() => {
  if (selectedStatus.value === 'Pending') {
    return totalAppointments.value
  }
  if (selectedStatus.value && selectedStatus.value !== 'Pending') {
    return 0
  }
  return appointments.value.filter((apt: Appointment) => apt.status === 'Pending').length
})

const cancelledCount = computed(() => {
  if (selectedStatus.value === 'Cancelled') {
    return totalAppointments.value
  }
  if (selectedStatus.value && selectedStatus.value !== 'Cancelled') {
    return 0
  }
  return appointments.value.filter((apt: Appointment) => apt.status === 'Cancelled').length
})

const todayCount = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  if (selectedDate.value === today) {
    return totalAppointments.value
  }
  if (selectedDate.value && selectedDate.value !== today) {
    return 0
  }
  return appointments.value.filter((apt: Appointment) => apt.appointment_date === today).length
})

const hasActiveFilters = computed(() =>
  searchQuery.value || selectedStatus.value || selectedDate.value
)

// Real-time watchers
watch(lastAppointmentUpdate, (update) => {
  if (update) {
    // Helper function to get pet name from local data or appointment data
    const getPetNameFromUpdate = (appointment: any) => {
      // First try to get from the appointment's pet relationship (if available)
      if (appointment.pet?.name) {
        return appointment.pet.name
      }

      // If not available, try to find in local appointments data using pet_id
      if (appointment.pet_id) {
        const localAppointment = appointments.value.find(apt => apt.pet_id === appointment.pet_id)
        if (localAppointment?.pet?.name) {
          return localAppointment.pet.name
        }
      }

      // Fallback: try to find by appointment ID in local data
      if (appointment.id) {
        const localAppointment = appointments.value.find(apt => apt.id === appointment.id)
        if (localAppointment?.pet?.name) {
          return localAppointment.pet.name
        }
      }

      // Last resort: return a generic message
      return 'a pet'
    }

    // Show toast notification for new appointments
    if (update.type === 'INSERT') {
      const petName = getPetNameFromUpdate(update.appointment)
      toast.info(`New appointment scheduled for ${petName}`, {
        timeout: 5000
      })
    } else if (update.type === 'UPDATE') {
      const petName = getPetNameFromUpdate(update.appointment)
      toast.success(`Appointment for ${petName} status updated to ${update.appointment.status}`, {
        timeout: 4000
      })
    }

    // Refresh the current page data to show updates
    loadAppointments()
  }
}, { deep: true })

// Watch for real-time appointments data changes
watch(realtimeAppointments, (newAppointments) => {
  // If we're on the first page and not filtering, use real-time data
  if (page.value === 1 && !searchQuery.value && !selectedStatus.value && !selectedDate.value) {
    appointments.value = newAppointments.slice(0, itemsPerPage.value)
  }
}, { deep: true })

// Watch for upcoming appointment count changes to update stats
watch(upcomingAppointmentCount, (newCount) => {
  if (pendingCount.value !== undefined) {
    // Update pending count in computed property
    loadAppointments()
  }
})

// Debounced search function
const debouncedSearch = debounce(() => {
  page.value = 1
  loadAppointments()
}, 300)

// Custom pagination functions
const totalPages = computed(() => Math.ceil(totalAppointments.value / itemsPerPage.value))

const goToPage = (newPage: number) => {
  if (newPage >= 1 && newPage <= totalPages.value && !loading.value) {

    page.value = newPage
    loadAppointments()
  }
}

const handleItemsPerPageChange = (newItemsPerPage: number) => {

  itemsPerPage.value = newItemsPerPage
  page.value = 1 // Reset to first page
  loadAppointments()
}

const getPaginationText = () => {
  if (totalAppointments.value === 0) return '0 of 0'
  const start = (page.value - 1) * itemsPerPage.value + 1
  const end = Math.min(page.value * itemsPerPage.value, totalAppointments.value)
  return `${start}-${end} of ${totalAppointments.value}`
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

const handleRowClick = (event: Event, item: Appointment) => {
  // Don't trigger row click if clicking on action buttons
  const target = event.target as HTMLElement
  if (target.closest('.actions-column')) {
    return
  }
  // You can add row click functionality here if needed

}

// Watch for searchQuery changes
watch(searchQuery, (newValue: string | null | undefined) => {
  if (newValue === null || newValue === undefined) {
    searchQuery.value = ''
  }
  debouncedSearch()
})

// Watch for appointment form changes to ensure reactivity
watch(() => appointmentForm.appointment_date, (newDate) => {
  if (newDate) {
    loadTimeSlots()
  } else {
    availableTimeSlots.value = []
    appointmentForm.day_slot_id = ''
  }
})

// Force reactivity for form fields
watch(() => appointmentForm.pet_id, () => {
  nextTick(() => {
    // Force Vue to update the component
  })
})

watch(() => appointmentForm.day_slot_id, () => {
  nextTick(() => {
    // Force Vue to update the component
  })
})

watch(() => appointmentForm.status, () => {
  nextTick(() => {
    // Force Vue to update the component
  })
})

// Filter handlers
const handleStatusFilterChange = (newStatus: string | null) => {

  selectedStatus.value = newStatus || ''
  page.value = 1 // Reset to first page when changing status filter
  loadAppointments()
}

const handleDateFilterChange = (newDate: string | null) => {

  selectedDate.value = newDate || ''
  page.value = 1 // Reset to first page when changing date filter
  loadAppointments()
}

const handleTimeRangeFilter = () => {
  page.value = 1
  loadAppointments()
}

// Helper functions
const getOwnerName = (user: any): string => {
  if (!user) return 'Unknown Owner'
  const firstName = user.first_name || ''
  const lastName = user.last_name || ''
  const fullName = `${firstName} ${lastName}`.trim()
  return fullName || user.username || 'Unknown Owner'
}

const getStatusColor = (status: string | null): string => {
  switch (status) {
    case 'Pending': return 'warning'
    case 'Completed': return 'success'
    case 'Cancelled': return 'error'
    case 'Expired': return 'grey'
    default: return 'grey'
  }
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A'
  return format(new Date(dateString), 'MMM dd, yyyy')
}

const formatTime = (timeString: string | null) => {
  if (!timeString) return 'N/A'
  // Handle both time-only strings and full datetime strings
  try {
    if (timeString.includes(':')) {
      // If it's just a time string like "14:30:00"
      const [hours, minutes] = timeString.split(':')
      const date = new Date()
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      return format(date, 'h:mm a')
    }
    return format(new Date(timeString), 'h:mm a')
  } catch {
    return timeString
  }
}

// Data loading
const loadAppointments = async () => {
  loading.value = true
  error.value = null

  try {
    const statusFilter = selectedStatus.value || ''
    const dateFilter = selectedDate.value || ''
    const searchTerm = (searchQuery.value || '').trim()

    const result = await ApiService.getAppointments(
      page.value,
      itemsPerPage.value,
      statusFilter,
      dateFilter,
      searchTerm
    )

    if (result.error) {
      throw result.error
    }

    // Set the appointments data directly from API response
    appointments.value = result.data || []
    totalAppointments.value = result.count || 0

  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load appointments'
    appointments.value = []
    totalAppointments.value = 0
  } finally {
    loading.value = false
  }
}

// Status logic helper functions
const canMarkAsCompleted = (status: string | null): boolean => {
  return status === 'Pending'
}

const canMarkAsCancelled = (status: string | null): boolean => {
  return status === 'Pending'
}

// Appointment management actions
const markAsCompleted = async (appointment: Appointment) => {
  const petName = appointment.pet?.name || 'Unknown Pet'

  // Set loading state
  const appointmentIndex = appointments.value.findIndex((apt: Appointment) => apt.id === appointment.id)
  if (appointmentIndex !== -1) {
    appointments.value[appointmentIndex].updating = true
  }

  try {
    // Call API to update status
    const result = await ApiService.updateAppointmentStatus(appointment.id, 'Completed')

    if (result.error) {
      throw result.error
    }

    // Update local state
    if (appointmentIndex !== -1) {
      appointments.value[appointmentIndex].status = 'Completed'
      appointments.value[appointmentIndex].updating = false
    }

    // Success toast will be shown by real-time watcher

    // Refresh the appointments list
    await loadAppointments()
  } catch (error) {
    toast.error('Failed to update appointment status')

    // Reset loading state
    if (appointmentIndex !== -1) {
      appointments.value[appointmentIndex].updating = false
    }
  }
}

const markAsCancelled = async (appointment: Appointment) => {
  const petName = appointment.pet?.name || 'Unknown Pet'

  // Set loading state
  const appointmentIndex = appointments.value.findIndex((apt: Appointment) => apt.id === appointment.id)
  if (appointmentIndex !== -1) {
    appointments.value[appointmentIndex].updating = true
  }

  try {
    // Call API to update status
    const result = await ApiService.updateAppointmentStatus(appointment.id, 'Cancelled')

    if (result.error) {
      throw result.error
    }

    // Update local state
    if (appointmentIndex !== -1) {
      appointments.value[appointmentIndex].status = 'Cancelled'
      appointments.value[appointmentIndex].updating = false
    }

    // Success toast will be shown by real-time watcher

    // Refresh the appointments list
    await loadAppointments()
  } catch (error) {
    toast.error('Failed to update appointment status')

    // Reset loading state
    if (appointmentIndex !== -1) {
      appointments.value[appointmentIndex].updating = false
    }
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedStatus.value = ''
  selectedDate.value = ''
  selectedTimeRange.value = ''
  page.value = 1
  loadAppointments()
}

// Additional filter handlers
const handleStatusFilterClear = () => {
  selectedStatus.value = ''
  page.value = 1
  loadAppointments()
}

const handleDateFilterClear = () => {
  selectedDate.value = ''
  page.value = 1
  loadAppointments()
}

// Helper functions for status and formatting
const getStatusIcon = (status: string | null) => {
  switch (status) {
    case 'Pending': return 'mdi-clock-outline'
    case 'Completed': return 'mdi-check-all'
    case 'Cancelled': return 'mdi-cancel'
    case 'Expired': return 'mdi-timer-off'
    default: return 'mdi-help-circle-outline'
  }
}

const formatStatusText = (status: string | null) => {
  switch (status) {
    case 'Pending': return 'Pending'
    case 'Completed': return 'Completed'
    case 'Cancelled': return 'Cancelled'
    case 'Expired': return 'Expired'
    default: return 'Unknown'
  }
}

// New appointment form functions
const loadAvailablePets = async () => {
  loadingPets.value = true
  try {
    const result = await ApiService.getPets(1, 100) // Get all pets
    if (result.error) {
      throw result.error
    }

    // Transform pets data for the select dropdown
    availablePets.value = (result.data || []).map((pet: any) => ({
      id: pet.id,
      display_name: `${pet.name} (${pet.type || 'Unknown'}) - Owner: ${pet.owner?.first_name || ''} ${pet.owner?.last_name || ''}`.trim()
    }))
  } catch (error) {
    toast.error('Failed to load pets')
    availablePets.value = []
  } finally {
    loadingPets.value = false
  }
}

const loadTimeSlots = async () => {
  if (!appointmentForm.appointment_date) {
    availableTimeSlots.value = []
    return
  }

  loadingTimeSlots.value = true
  try {
    const result = await ApiService.getAvailableTimeSlots(appointmentForm.appointment_date)
    if (result.error) {
      throw result.error
    }

    // Transform time slots for display
    availableTimeSlots.value = (result.data || []).map((slot: any) => ({
      id: slot.id,
      display_text: `${formatTime(slot.time_slot)} - ${formatTime(slot.end_time)} (${slot.max_capacity} spots available)`,
      time_slot: slot.time_slot,
      end_time: slot.end_time,
      max_capacity: slot.max_capacity
    }))

    // Clear selected slot if it's no longer available
    if (appointmentForm.day_slot_id && !availableTimeSlots.value.find((slot: any) => slot.id === appointmentForm.day_slot_id)) {
      appointmentForm.day_slot_id = ''
    }
  } catch (error) {
    toast.error('Failed to load available time slots')
    availableTimeSlots.value = []
  } finally {
    loadingTimeSlots.value = false
  }
}

const openNewAppointmentDialog = () => {
  showNewAppointmentDialog.value = true
  loadAvailablePets()
}

const closeNewAppointmentDialog = () => {
  showNewAppointmentDialog.value = false
  resetAppointmentForm()
}

const resetAppointmentForm = () => {
  // Reset reactive form object properties
  appointmentForm.pet_id = ''
  appointmentForm.appointment_date = ''
  appointmentForm.day_slot_id = ''
  appointmentForm.status = 'Pending'

  appointmentFormValid.value = false
  availableTimeSlots.value = []

  // Reset form validation
  nextTick(() => {
    if (appointmentFormRef.value) {
      appointmentFormRef.value.resetValidation()
    }
  })
}

const createAppointment = async () => {
  if (!appointmentFormValid.value) return

  creatingAppointment.value = true
  try {
    // Get the selected pet to extract user_id
    const selectedPet = availablePets.value.find((pet: any) => pet.id === appointmentForm.pet_id)
    if (!selectedPet) {
      throw new Error('Selected pet not found')
    }

    // Get pet details to get user_id
    const petResult = await ApiService.getPets(1, 100)
    const petData = petResult.data?.find((pet: any) => pet.id === appointmentForm.pet_id)

    if (!petData?.user_id) {
      throw new Error('Pet owner not found')
    }

    // Get the selected time slot details
    const selectedTimeSlot = availableTimeSlots.value.find((slot: any) => slot.id === appointmentForm.day_slot_id)
    if (!selectedTimeSlot) {
      throw new Error('Selected time slot not found')
    }

    const appointmentData = {
      pet_id: appointmentForm.pet_id,
      user_id: petData.user_id,
      appointment_date: appointmentForm.appointment_date,
      appointment_time: selectedTimeSlot.time_slot,
      day_slot_id: appointmentForm.day_slot_id,
      status: appointmentForm.status
    }

    // Call API to create appointment
    const result = await ApiService.createAppointment(appointmentData)

    if (result.error) {
      throw result.error
    }

    // Show success message with time slot info
    const petName = petData.name || 'Unknown Pet'
    const timeSlotText = selectedTimeSlot.display_text
    toast.success(`Appointment created successfully for ${petName} at ${timeSlotText}`)

    // Close dialog and refresh list
    closeNewAppointmentDialog()
    await loadAppointments()

  } catch (error) {
    toast.error('Failed to create appointment')
  } finally {
    creatingAppointment.value = false
  }
}

onMounted(() => {
  loadAppointments()
})
</script>

<style scoped>
/* Enhanced Appointments View Styling */
.appointments-view {
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

.add-appointment-btn {
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.3);
  transition: all 0.3s ease;
}

.add-appointment-btn:hover {
  box-shadow: 0 6px 16px rgba(var(--v-theme-primary), 0.4);
  transform: translateY(-2px);
}

.loading-container,
.error-container {
  max-width: 600px;
  margin: 0 auto;
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

.appointments-table-container {
  padding: 0 24px 24px;
}

/* Custom Table Styling */
.modern-custom-table {
  border-radius: 0 0 16px 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-top: none;
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
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  vertical-align: middle;
  padding: 12px;
}

.modern-custom-table :deep(tbody tr:hover) {
  background: rgba(76, 175, 80, 0.02);
}

.table-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

/* Text truncation for long names */
.pet-name,
.owner-name {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Actions Column Styling */
.actions-column {
  display: flex;
  align-items: center;
  justify-content: flex-start; /* Left-aligned */
  min-width: 100px; /* Reduced width for fewer buttons */
  padding: 8px 4px;
}

.desktop-actions {
  display: flex;
  align-items: center;
  gap: 4px; /* Good spacing between buttons */
  justify-content: flex-start;
}

.mobile-actions {
  display: flex;
  align-items: center;
  justify-content: flex-start; /* Left-aligned on mobile too */
}

/* Ensure proper button sizing */
.actions-column .v-btn {
  min-width: 32px;
  width: 32px;
  height: 32px;
  flex-shrink: 0; /* Prevent buttons from shrinking */
}

/* Mobile responsive actions */
@media (max-width: 600px) {
  .desktop-actions {
    display: none !important;
  }

  .mobile-actions {
    display: flex !important;
    align-items: center;
    justify-content: flex-start;
  }

  .actions-column {
    min-width: 60px; /* Smaller width on mobile */
  }
}

/* Custom Pagination Styling */
.custom-pagination-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(0, 0, 0, 0.01);
  border-radius: 0 0 16px 16px;
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
  gap: 4px;
}

.page-numbers {
  display: flex;
  gap: 2px;
}

.pagination-btn {
  min-width: 40px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .modern-appointments-view {
    padding: 16px;
  }

  .custom-pagination-footer {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .pagination-info {
    justify-content: space-between;
  }

  .pagination-controls {
    justify-content: center;
  }

  .appointments-table-container {
    padding: 0 16px 16px;
  }

  .pet-name,
  .owner-name {
    max-width: 120px;
  }
}

@media (max-width: 600px) {
  .stats-card .text-h5 {
    font-size: 1.2rem;
  }

  .pet-name,
  .owner-name {
    max-width: 100px;
  }
}

/* Dark theme adjustments */
.v-theme--dark .appointments-view {
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

.v-theme--dark .modern-custom-table :deep(thead th) {
  background: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-on-surface));
  border-bottom-color: rgba(var(--v-theme-primary), 0.2);
}

.v-theme--dark .modern-custom-table :deep(tbody td) {
  border-bottom-color: rgba(var(--v-theme-outline), 0.1);
  color: rgb(var(--v-theme-on-surface));
}

.v-theme--dark .modern-custom-table :deep(tbody tr:hover) {
  background: rgba(var(--v-theme-primary), 0.05);
}

.v-theme--dark .custom-pagination-footer {
  background: rgba(var(--v-theme-surface-variant), 0.5);
  border-top-color: rgba(var(--v-theme-outline), 0.2);
}

/* Enhanced Appointment Form Dialog Styling */
.appointment-form-dialog {
  border-radius: 20px;
  overflow: hidden;
}

/* Enhanced Header */
.dialog-header {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05) 0%, rgba(var(--v-theme-primary), 0.02) 100%);
  border-bottom: 1px solid rgba(var(--v-theme-primary), 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
}

.header-icon-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.header-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.9);
  margin: 0;
}

.header-subtitle {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
  margin: 0;
}

.close-btn {
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.close-btn:hover {
  opacity: 1;
}

.header-divider {
  border-color: rgba(var(--v-theme-primary), 0.1);
}

/* Enhanced Form Content */
.form-content {
  padding: 32px;
  background: rgba(255, 255, 255, 0.98);
}

.form-section {
  margin-bottom: 32px;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.section-icon {
  margin-top: 2px;
  flex-shrink: 0;
}

.section-info {
  flex: 1;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.9);
  margin: 0 0 4px 0;
}

.section-description {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
  margin: 0;
  line-height: 1.4;
}

/* Enhanced Form Fields */
.enhanced-select,
.enhanced-date-field {
  margin-top: 8px;
}

.enhanced-select :deep(.v-field),
.enhanced-date-field :deep(.v-field) {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.enhanced-select :deep(.v-field:hover),
.enhanced-date-field :deep(.v-field:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.enhanced-select :deep(.v-field--focused),
.enhanced-date-field :deep(.v-field--focused) {
  box-shadow: 0 4px 16px rgba(var(--v-theme-primary), 0.2);
}

/* Enhanced Actions */
.form-actions {
  padding: 24px 32px;
  background: rgba(248, 250, 252, 0.8);
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.cancel-btn {
  color: rgba(0, 0, 0, 0.6);
  font-weight: 500;
}

.create-btn {
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.3);
  transition: all 0.3s ease;
}

.create-btn:hover {
  box-shadow: 0 6px 16px rgba(var(--v-theme-primary), 0.4);
  transform: translateY(-1px);
}

/* Dark Theme Adjustments */
.v-theme--dark .header-title {
  color: rgba(255, 255, 255, 0.9);
}

.v-theme--dark .header-subtitle {
  color: rgba(255, 255, 255, 0.6);
}

.v-theme--dark .form-content {
  background: rgba(30, 30, 30, 0.98);
}

.v-theme--dark .section-header {
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.v-theme--dark .section-title {
  color: rgba(255, 255, 255, 0.9);
}

.v-theme--dark .section-description {
  color: rgba(255, 255, 255, 0.6);
}

.v-theme--dark .form-actions {
  background: rgba(20, 20, 20, 0.8);
  border-top-color: rgba(255, 255, 255, 0.08);
}

.v-theme--dark .cancel-btn {
  color: rgba(255, 255, 255, 0.6);
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    padding: 20px 24px;
  }

  .header-icon-section {
    gap: 12px;
  }

  .header-title {
    font-size: 1.25rem;
  }

  .form-content {
    padding: 24px;
  }

  .form-section {
    margin-bottom: 24px;
  }

  .section-header {
    gap: 12px;
    margin-bottom: 16px;
    padding-bottom: 12px;
  }

  .form-actions {
    padding: 20px 24px;
  }
}
</style>
