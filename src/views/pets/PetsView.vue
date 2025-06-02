<template>
  <div class="pets-view">
    <!-- Enhanced Professional Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">Pets Management</h1>
          <p class="page-subtitle">Manage pet profiles, medical records, and owner relationships</p>
        </div>
        <div class="header-actions">
          <v-btn
            color="primary"
            size="large"
            variant="flat"
            prepend-icon="mdi-plus"
            class="add-pet-btn"
            @click="addPet"
          >
            Add New Pet
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && pets.length === 0" class="loading-container">
      <v-card rounded="xl" class="pa-8 text-center">
        <v-progress-circular indeterminate color="primary" size="64" class="mb-4" />
        <h3 class="text-h6 mb-2">Loading Pets</h3>
        <p class="text-body-2 text-on-surface-variant">Please wait while we fetch the pet data...</p>
      </v-card>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <v-card rounded="xl" class="pa-8 text-center">
        <v-icon icon="mdi-alert-circle" size="64" color="error" class="mb-4" />
        <h3 class="text-h6 mb-2">Error Loading Pets</h3>
        <p class="text-body-2 text-on-surface-variant mb-4">{{ error }}</p>
        <v-btn color="primary" @click="loadPets">Try Again</v-btn>
      </v-card>
    </div>

    <!-- Main Content -->
    <div v-else class="pets-content">
      <!-- Statistics Cards -->
      <v-row class="stats-section mb-6">
        <v-col cols="12" sm="6" md="3">
          <v-card rounded="xl" class="stats-card" elevation="2">
            <v-card-text class="pa-4">
              <div class="d-flex align-center">
                <div class="stats-icon-container me-3">
                  <v-icon icon="mdi-paw" size="32" color="primary" />
                </div>
                <div>
                  <div class="text-h5 font-weight-bold">{{ totalPets }}</div>
                  <div class="text-body-2 text-on-surface-variant">Total Pets</div>
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
                  <v-icon icon="mdi-dog" size="32" color="success" />
                </div>
                <div>
                  <div class="text-h5 font-weight-bold">{{ dogCount }}</div>
                  <div class="text-body-2 text-on-surface-variant">Dogs</div>
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
                  <v-icon icon="mdi-cat" size="32" color="warning" />
                </div>
                <div>
                  <div class="text-h5 font-weight-bold">{{ catCount }}</div>
                  <div class="text-body-2 text-on-surface-variant">Cats</div>
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
                  <v-icon icon="mdi-heart-pulse" size="32" color="info" />
                </div>
                <div>
                  <div class="text-h5 font-weight-bold">{{ activePets }}</div>
                  <div class="text-body-2 text-on-surface-variant">Active Pets</div>
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
            <h3 class="text-h6 font-weight-bold">Filter & Search Pets</h3>
            <p class="text-body-2 text-medium-emphasis">Find pets by name, type, or owner information</p>
          </div>

          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="searchQuery"
                label="Search pets..."
                placeholder="Search by name, type, or owner"
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
                label="Pet Type"
                :items="petTypeOptions"
                variant="outlined"
                density="comfortable"
                clearable
                @update:model-value="handleTypeFilterChange"
                class="filter-select"
              />
            </v-col>

            <v-col cols="12" md="2">
              <v-select
                v-model="selectedGender"
                label="Gender"
                :items="genderOptions"
                variant="outlined"
                density="comfortable"
                clearable
                @update:model-value="handleGenderFilter"
                class="filter-select"
              />
            </v-col>

            <v-col cols="12" md="2">
              <v-select
                v-model="selectedStatus"
                label="Status"
                :items="statusOptions"
                variant="outlined"
                density="comfortable"
                clearable
                @update:model-value="handleStatusFilter"
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

      <!-- Pets Table -->
      <v-card rounded="xl" elevation="2">
        <v-card-title class="pa-6 pb-4">
          <div class="d-flex align-center justify-space-between w-100">
            <h3 class="text-h6 font-weight-bold">Pet Records</h3>
            <div class="d-flex align-center">
              <span class="text-body-2 text-on-surface-variant me-4">
                {{ pets.length }} of {{ totalPets }} pets
              </span>

              <v-btn
                variant="text"
                icon="mdi-refresh"
                @click="loadPets"
                :loading="loading"
              />
            </div>
          </div>
        </v-card-title>
        <div class="pets-table-container">
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
                  <div class="mt-2 text-body-2">Loading pets...</div>
                </td>
              </tr>
              <tr v-else-if="pets.length === 0">
                <td :colspan="headers.length" class="text-center py-8">
                  <v-icon size="48" color="grey-lighten-2" class="mb-2">mdi-paw-off</v-icon>
                  <div class="text-h6 mb-2">No pets found</div>
                  <div class="text-body-2 text-medium-emphasis">
                    {{ searchQuery || selectedType ? 'Try adjusting your filters' : 'Start by adding your first pet' }}
                  </div>
                </td>
              </tr>
              <tr v-else v-for="item in pets" :key="item.id" class="table-row"
                  @click="handleRowClick($event, item)">
                <!-- Pet Name -->
                <td>
                  <div class="pet-info">
                    <div class="font-weight-medium text-body-1 pet-name" :title="item.name">
                      {{ item.name }}
                    </div>
                  </div>
                </td>

                <!-- Pet Type -->
                <td>
                  <v-chip
                    :color="getTypeColor(item.type)"
                    size="small"
                    variant="tonal"
                    class="font-weight-medium"
                  >
                    {{ item.type || 'Unknown' }}
                  </v-chip>
                </td>

                <!-- Gender -->
                <td>
                  <div class="d-flex align-center" v-if="item.gender">
                    <v-icon :icon="item.gender === 'Male' ? 'mdi-gender-male' : 'mdi-gender-female'" size="16" class="me-1 text-info" />
                    <span class="text-body-2">{{ item.gender }}</span>
                  </div>
                  <span v-else class="text-body-2 text-medium-emphasis">Not specified</span>
                </td>

                <!-- Owner Info -->
                <td>
                  <div class="owner-info" v-if="item.owner">
                    <div class="text-body-2 font-weight-medium">
                      {{ getOwnerName(item.owner) }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      @{{ item.owner.username || 'No username' }}
                    </div>
                  </div>
                  <span v-else class="text-body-2 text-medium-emphasis">No owner</span>
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
                        icon="mdi-pencil"
                        variant="text"
                        size="small"
                        color="primary"
                        @click.stop="editPet(item)"
                      />
                      <v-btn
                        icon="mdi-delete"
                        variant="text"
                        size="small"
                        color="error"
                        @click.stop="deletePet(item)"
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
                          <v-list-item @click="editPet(item)">
                            <template #prepend>
                              <v-icon>mdi-pencil</v-icon>
                            </template>
                            <v-list-item-title>Edit</v-list-item-title>
                          </v-list-item>
                          <v-list-item @click="deletePet(item)">
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
    </div>

    <!-- Enhanced Pet Form Dialog -->
    <SimplePetFormDialog
      v-model="showCreateDialog"
      :pet="editingPet"
      :loading="saving"
      @submit="handlePetSubmit"
      @cancel="closePetDialog"
    />

    <!-- Enhanced Delete Confirmation Dialog -->
    <PetDeleteDialog
      v-model="showDeleteDialog"
      :pet="petToDelete"
      :loading="deleteLoading"
      :show-stats="true"
      @confirm="handleDeleteConfirm"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { format } from 'date-fns'
import { debounce } from 'lodash-es'
import { ApiService } from '@/services/api'
import { useToast } from 'vue-toastification'
import SimplePetFormDialog from '@/components/SimplePetFormDialog.vue'
import PetDeleteDialog from '@/components/PetDeleteDialog.vue'

// Simplified Pet interface matching database structure
interface Pet {
  id: string
  user_id: string | null
  name: string
  type: string | null
  gender: string | null
  created_at: string | null
  is_active: boolean | null
  updated_at: string | null
  owner?: {
    id: string
    username: string | null
    first_name: string | null
    last_name: string | null
  }
}

interface FormData {
  name: string
  type: string
  gender: string
  user_id: string
}

const toast = useToast()

// Reactive state
const loading = ref(true)
const error = ref<string | null>(null)
const pets = ref<Pet[]>([])
const totalPets = ref(0)
const page = ref(1)
const itemsPerPage = ref(10)

// Search and filters
const searchQuery = ref('')
const selectedType = ref('')
const selectedGender = ref('')
const selectedStatus = ref('')

// Dialog state
const showCreateDialog = ref(false)
const editingPet = ref<Pet | null>(null)
const saving = ref(false)

// Delete dialog state
const showDeleteDialog = ref(false)
const petToDelete = ref<Pet | null>(null)
const deleteLoading = ref(false)

// Table configuration
const headers = [
  { title: 'Name', key: 'name', sortable: true, width: '200px', minWidth: '150px' },
  { title: 'Type', key: 'type', sortable: true, width: '120px', minWidth: '100px' },
  { title: 'Gender', key: 'gender', sortable: true, width: '100px', minWidth: '80px' },
  { title: 'Owner', key: 'owner', sortable: false, width: '200px', minWidth: '150px' },
  { title: 'Created', key: 'created_at', sortable: true, width: '120px', minWidth: '100px' },
  { title: 'Actions', key: 'actions', sortable: false, width: '120px', minWidth: '100px' }
]

// Filter options
const petTypeOptions = [
  { title: 'Dog', value: 'Dog' },
  { title: 'Cat', value: 'Cat' }
]

const genderOptions = [
  { title: 'Male', value: 'Male' },
  { title: 'Female', value: 'Female' }
]

const statusOptions = [
  { title: 'Active', value: 'active' },
  { title: 'Inactive', value: 'inactive' }
]

// Computed properties for statistics
// Note: These show counts from current page only due to server-side pagination
// For accurate totals, we would need separate API calls for statistics
const dogCount = computed(() => {
  if (selectedType.value === 'Dog') {
    return totalPets.value // When filtering by Dog, total count is all dogs
  }
  if (selectedType.value === 'Cat') {
    return 0 // When filtering by Cat, no dogs shown
  }
  // When no filter, count dogs in current page (not accurate for total)
  return pets.value.filter((pet: Pet) => pet.type === 'Dog').length
})

const catCount = computed(() => {
  if (selectedType.value === 'Cat') {
    return totalPets.value // When filtering by Cat, total count is all cats
  }
  if (selectedType.value === 'Dog') {
    return 0 // When filtering by Dog, no cats shown
  }
  // When no filter, count cats in current page (not accurate for total)
  return pets.value.filter((pet: Pet) => pet.type === 'Cat').length
})

const activePets = computed(() => {
  return pets.value.filter((pet: Pet) => pet.is_active !== false).length
})

// Debounced search function
const debouncedSearch = debounce(() => {
  page.value = 1
  loadPets()
}, 300)

// Custom pagination functions
const totalPages = computed(() => Math.ceil(totalPets.value / itemsPerPage.value))

const goToPage = (newPage: number) => {
  if (newPage >= 1 && newPage <= totalPages.value && !loading.value) {

    page.value = newPage
    loadPets()
  }
}

const handleItemsPerPageChange = (newItemsPerPage: number) => {

  itemsPerPage.value = newItemsPerPage
  page.value = 1 // Reset to first page
  loadPets()
}

const getPaginationText = () => {
  if (totalPets.value === 0) return '0 of 0'
  const start = (page.value - 1) * itemsPerPage.value + 1
  const end = Math.min(page.value * itemsPerPage.value, totalPets.value)
  return `${start}-${end} of ${totalPets.value}`
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

const handleRowClick = (event: Event, item: Pet) => {
  // Don't trigger row click if clicking on action buttons
  const target = event.target as HTMLElement
  if (target.closest('.actions-column')) {
    return
  }
  // You can add row click functionality here if needed

}



// Watch for searchQuery changes to handle null values
watch(searchQuery, (newValue: string | null | undefined) => {
  if (newValue === null || newValue === undefined) {
    searchQuery.value = ''
  }
  debouncedSearch()
})

// Type filter handlers
const handleTypeFilterChange = (newType: string | null) => {

  selectedType.value = newType || ''
  page.value = 1 // Reset to first page when changing type filter
  loadPets()
}

const handleGenderFilter = () => {
  page.value = 1
  loadPets()
}

const handleStatusFilter = () => {
  page.value = 1
  loadPets()
}

// Helper functions
const getOwnerName = (owner: any): string => {
  if (!owner) return 'Unknown Owner'
  const firstName = owner.first_name || ''
  const lastName = owner.last_name || ''
  const fullName = `${firstName} ${lastName}`.trim()
  return fullName || owner.username || 'Unknown Owner'
}

const getTypeColor = (type: string | null): string => {
  switch (type?.toLowerCase()) {
    case 'dog': return 'success'
    case 'cat': return 'warning'
    case 'bird': return 'info'
    case 'fish': return 'cyan'
    case 'rabbit': return 'pink'
    case 'hamster': return 'amber'
    case 'reptile': return 'deep-purple'
    default: return 'grey'
  }
}

// Simplified helper functions for basic pet data

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A'
  return format(new Date(dateString), 'MMM dd, yyyy')
}

const formatTime = (dateString: string | null) => {
  if (!dateString) return ''
  return format(new Date(dateString), 'HH:mm')
}

// Data loading
const loadPets = async () => {
  loading.value = true
  error.value = null



  try {
    const searchTerm = (searchQuery.value || '').trim()
    const typeFilter = selectedType.value || ''


    const result = await ApiService.getPets(page.value, itemsPerPage.value, searchTerm, typeFilter)


    if (result.error) {

      throw result.error
    }

    // Set the pets data directly from API response
    // Note: Client-side filtering removed to fix pagination issues
    // All filtering should be handled server-side for proper pagination
    pets.value = result.data || []
    totalPets.value = result.count || 0

  } catch (err) {

    error.value = err instanceof Error ? err.message : 'Failed to load pets'
    pets.value = []
    totalPets.value = 0
  } finally {
    loading.value = false
  }
}

// Pet management actions
const addPet = () => {
  editingPet.value = null
  showCreateDialog.value = true
}

const editPet = (pet: Pet) => {
  editingPet.value = pet
  showCreateDialog.value = true
}

const deletePet = (pet: Pet) => {
  petToDelete.value = pet
  showDeleteDialog.value = true
}

const handlePetSubmit = async (formData: FormData) => {
  saving.value = true
  error.value = null

  try {
    if (editingPet.value) {
      // Update existing pet
      const updates = {
        name: formData.name,
        type: formData.type,
        gender: formData.gender
      }

      const result = await ApiService.updatePet(editingPet.value.id, updates)
      if (result.error) throw result.error

      toast.success('Pet updated successfully')
    } else {
      // Create new pet
      const petData = {
        name: formData.name,
        type: formData.type,
        gender: formData.gender,
        user_id: formData.user_id
      }

      const result = await ApiService.createPet(petData)
      if (result.error) throw result.error

      toast.success('Pet added successfully')
    }

    closePetDialog()
    loadPets()
  } catch (err) {

    error.value = err instanceof Error ? err.message : 'Failed to save pet'
    toast.error(error.value)
  } finally {
    saving.value = false
  }
}

const closePetDialog = () => {
  showCreateDialog.value = false
  editingPet.value = null
  saving.value = false
}

const handleDeleteConfirm = async () => {
  if (!petToDelete.value) return

  deleteLoading.value = true

  try {
    const { error } = await ApiService.deletePet(petToDelete.value.id)

    if (error) throw error

    toast.success('Pet deleted successfully')

    // Navigate back to pets list if needed
    loadPets()
  } catch (err) {

    const errorMessage = err instanceof Error ? err.message : 'Failed to delete pet'
    toast.error(errorMessage)
  } finally {
    deleteLoading.value = false
    showDeleteDialog.value = false
  }
}

const cancelDelete = () => {
  showDeleteDialog.value = false
  petToDelete.value = null
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedType.value = ''
  selectedGender.value = ''
  selectedStatus.value = ''
  page.value = 1
  loadPets()
}

onMounted(() => {
  loadPets()
})
</script>

<style scoped>
/* Enhanced Pets View Styling */
.pets-view {
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

.add-pet-btn {
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.3);
  transition: all 0.3s ease;
}

.add-pet-btn:hover {
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

.pets-table-container {
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

/* Custom Pagination Footer */
.custom-pagination-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  background: rgba(76, 175, 80, 0.01);
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

.pet-avatar {
  border: 2px solid rgba(var(--v-theme-primary), 0.1);
  transition: all 0.2s ease;
}

.pet-avatar:hover {
  border-color: rgba(var(--v-theme-primary), 0.3);
  transform: scale(1.05);
}

.pet-info {
  min-width: 120px;
}

.pet-name {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.owner-info {
  min-width: 140px;
}

.pet-details {
  min-width: 100px;
}

.health-status {
  min-width: 120px;
}

.date-column {
  min-width: 80px;
}

.actions-column {
  min-width: 100px;
}

.desktop-actions {
  gap: 4px;
}

.mobile-actions {
  display: none;
}

@media (max-width: 768px) {
  .modern-pets-view {
    padding: 16px;
  }

  .page-header {
    padding: 16px;
  }

  .page-header .d-flex {
    flex-direction: column;
    align-items: flex-start !important;
  }

  .page-header .d-flex > div:last-child {
    margin-top: 16px;
    align-self: stretch;
  }

  .desktop-actions {
    display: none !important;
  }

  .mobile-actions {
    display: block !important;
  }

  .pets-table-container {
    padding: 0 16px 16px;
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
}

/* Dark theme adjustments */
.v-theme--dark .pets-view {
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

.v-theme--dark .stats-icon-container {
  background: rgba(var(--v-theme-primary), 0.15);
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

.v-theme--dark .modern-custom-table :deep(tbody tr:hover) {
  background: rgba(var(--v-theme-primary), 0.05);
}

.v-theme--dark .custom-pagination-footer {
  background: rgba(var(--v-theme-surface-variant), 0.5);
  border-top-color: rgba(var(--v-theme-outline), 0.2);
}

.v-theme--dark .modern-data-table :deep(.v-data-table__th) {
  color: rgb(var(--v-theme-on-surface));
  background: rgba(var(--v-theme-primary), 0.1);
  border-bottom-color: rgba(var(--v-theme-primary), 0.2);
}

.v-theme--dark .modern-data-table :deep(.v-data-table__tr:hover) {
  background: rgba(var(--v-theme-primary), 0.05);
}

.v-theme--dark .modern-data-table :deep(.v-data-table__td) {
  border-bottom-color: rgba(var(--v-theme-outline), 0.1);
  color: rgb(var(--v-theme-on-surface));
}

.v-theme--dark .modern-data-table :deep(.v-data-table-footer) {
  background: rgba(76, 175, 80, 0.02);
}
</style>
