<template>
  <v-dialog
    v-model="isOpen"
    max-width="600"
    persistent
    :retain-focus="false"
  >
    <v-card rounded="xl" class="pet-delete-dialog">
      <!-- Header -->
      <v-card-title class="pa-6 pb-4">
        <div class="d-flex align-center">
          <div class="delete-icon-container me-4">
            <v-icon 
              icon="mdi-paw-off" 
              color="error" 
              size="32"
            />
          </div>
          <div class="flex-grow-1">
            <h3 class="text-h5 font-weight-bold text-error mb-1">Delete Pet Record</h3>
            <p class="text-body-2 text-on-surface-variant mb-0">
              This action will deactivate the pet record while preserving all data
            </p>
          </div>
        </div>
      </v-card-title>

      <!-- Pet Information Card -->
      <v-card-text class="pa-6 pt-2">
        <v-card 
          variant="outlined" 
          class="mb-4 pet-info-card"
          rounded="lg"
        >
          <v-card-text class="pa-4">
            <div class="d-flex align-center mb-3">
              <v-avatar 
                :image="pet?.profile_pic" 
                color="primary" 
                size="48"
                class="me-3"
              >
                <v-icon icon="mdi-paw" size="24" />
              </v-avatar>
              <div class="flex-grow-1">
                <h4 class="text-h6 font-weight-bold mb-1">
                  {{ pet?.name }}
                </h4>
                <p class="text-body-2 text-on-surface-variant mb-0">
                  {{ pet?.breed }} {{ pet?.type }} • {{ pet?.gender }}
                </p>
                <p class="text-body-2 text-on-surface-variant mb-0" v-if="pet?.owner">
                  Owner: {{ getOwnerName(pet.owner) }}
                </p>
              </div>
              <div class="d-flex flex-column align-end">
                <v-chip
                  :color="getStatusColor(pet?.status)"
                  size="small"
                  variant="tonal"
                  class="mb-1"
                >
                  {{ pet?.status || 'Active' }}
                </v-chip>
                <v-chip
                  :color="getVaccinationColor(pet?.vaccination_status)"
                  size="small"
                  variant="tonal"
                >
                  {{ formatVaccinationStatus(pet?.vaccination_status) }}
                </v-chip>
              </div>
            </div>
            
            <!-- Pet Statistics -->
            <div class="pet-stats" v-if="showStats && pet">
              <v-divider class="mb-3" />
              <div class="d-flex justify-space-between text-body-2">
                <div class="text-center">
                  <div class="text-h6 font-weight-bold text-info">{{ pet?.age || 'N/A' }}</div>
                  <div class="text-on-surface-variant">Age (years)</div>
                </div>
                <div class="text-center">
                  <div class="text-h6 font-weight-bold text-success">{{ pet?.weight || 'N/A' }}</div>
                  <div class="text-on-surface-variant">Weight (kg)</div>
                </div>
                <div class="text-center">
                  <div class="text-h6 font-weight-bold text-primary">{{ pet?.appointments?.length || 0 }}</div>
                  <div class="text-on-surface-variant">Appointments</div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Warning Message -->
        <v-alert
          type="warning"
          variant="tonal"
          class="mb-4"
          rounded="lg"
        >
          <template #prepend>
            <v-icon icon="mdi-shield-check" />
          </template>
          <div class="text-body-2">
            <strong>Soft Delete Process:</strong> This is a safe, reversible action that preserves data integrity.
          </div>
        </v-alert>

        <!-- What Happens Section -->
        <div class="consequences-section">
          <h4 class="text-h6 font-weight-bold mb-3 d-flex align-center">
            <v-icon icon="mdi-information" class="me-2" color="primary" />
            What happens when you delete this pet record?
          </h4>
          
          <div class="consequences-list">
            <div class="consequence-item d-flex align-start mb-3">
              <v-icon icon="mdi-eye-off" color="warning" class="me-3 mt-1" size="20" />
              <div>
                <div class="text-body-1 font-weight-medium">Record Deactivation</div>
                <div class="text-body-2 text-on-surface-variant">
                  Pet will be hidden from all admin lists and searches
                </div>
              </div>
            </div>
            
            <div class="consequence-item d-flex align-start mb-3">
              <v-icon icon="mdi-calendar-remove" color="error" class="me-3 mt-1" size="20" />
              <div>
                <div class="text-body-1 font-weight-medium">Appointment Restrictions</div>
                <div class="text-body-2 text-on-surface-variant">
                  No new appointments can be scheduled for this pet
                </div>
              </div>
            </div>
            
            <div class="consequence-item d-flex align-start mb-3">
              <v-icon icon="mdi-database-check" color="success" class="me-3 mt-1" size="20" />
              <div>
                <div class="text-body-1 font-weight-medium">Data Preservation</div>
                <div class="text-body-2 text-on-surface-variant">
                  All pet data, medical records, and appointment history remain intact for audit purposes
                </div>
              </div>
            </div>
            
            <div class="consequence-item d-flex align-start">
              <v-icon icon="mdi-restore" color="info" class="me-3 mt-1" size="20" />
              <div>
                <div class="text-body-1 font-weight-medium">Reversible Action</div>
                <div class="text-body-2 text-on-surface-variant">
                  Pet record can be reactivated by database administrators if needed
                </div>
              </div>
            </div>
          </div>
        </div>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="pa-6 pt-0">
        <v-spacer />
        <v-btn
          variant="text"
          @click="handleCancel"
          :disabled="loading"
          class="me-2"
          size="large"
        >
          Cancel
        </v-btn>
        <v-btn
          color="error"
          :loading="loading"
          @click="handleConfirm"
          variant="elevated"
          size="large"
          prepend-icon="mdi-delete"
        >
          Delete Pet Record
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  pet: Object,
  loading: Boolean,
  showStats: Boolean
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const getOwnerName = (owner) => {
  if (!owner) return 'Unknown Owner'
  const firstName = owner.first_name || ''
  const lastName = owner.last_name || ''
  const fullName = `${firstName} ${lastName}`.trim()
  return fullName || owner.username || 'Unknown Owner'
}

const getStatusColor = (status) => {
  switch (status) {
    case 'active': return 'success'
    case 'inactive': return 'default'
    case 'medical_care': return 'warning'
    case 'lost': return 'error'
    case 'deceased': return 'error'
    default: return 'success'
  }
}

const getVaccinationColor = (status) => {
  switch (status) {
    case 'up_to_date': return 'success'
    case 'overdue': return 'error'
    case 'partial': return 'warning'
    case 'unknown': return 'default'
    default: return 'success'
  }
}

const formatVaccinationStatus = (status) => {
  switch (status) {
    case 'up_to_date': return 'Up to Date'
    case 'overdue': return 'Overdue'
    case 'partial': return 'Partial'
    case 'unknown': return 'Unknown'
    default: return 'Up to Date'
  }
}

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
  isOpen.value = false
}
</script>

<script>
export default {
  name: 'PetDeleteDialog'
}
</script>

<style scoped>
.pet-delete-dialog {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-outline), 0.12);
}

.pet-delete-dialog .v-card-title {
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.08);
}

.pet-delete-dialog .v-card-actions {
  border-top: 1px solid rgba(var(--v-theme-outline), 0.08);
}

.delete-icon-container {
  background: rgba(var(--v-theme-error), 0.1);
  border-radius: 50%;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pet-info-card {
  background: rgba(var(--v-theme-primary), 0.02);
  border: 1px solid rgba(var(--v-theme-primary), 0.12);
}

.consequences-section {
  margin-top: 8px;
}

.consequence-item {
  padding: 8px 0;
}

.pet-stats {
  margin-top: 8px;
}
</style>
