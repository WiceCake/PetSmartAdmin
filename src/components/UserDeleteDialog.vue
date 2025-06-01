<template>
  <v-dialog
    v-model="isOpen"
    max-width="600"
    persistent
    :retain-focus="false"
  >
    <v-card rounded="xl" class="user-delete-dialog">
      <!-- Header -->
      <v-card-title class="pa-6 pb-4">
        <div class="d-flex align-center">
          <div class="delete-icon-container me-4">
            <v-icon 
              icon="mdi-account-remove" 
              color="error" 
              size="32"
            />
          </div>
          <div class="flex-grow-1">
            <h3 class="text-h5 font-weight-bold text-error mb-1">Delete User Account</h3>
            <p class="text-body-2 text-on-surface-variant mb-0">
              This action will deactivate the user account while preserving all data
            </p>
          </div>
        </div>
      </v-card-title>

      <!-- User Information Card -->
      <v-card-text class="pa-6 pt-2">
        <v-card 
          variant="outlined" 
          class="mb-4 user-info-card"
          rounded="lg"
        >
          <v-card-text class="pa-4">
            <div class="d-flex align-center mb-3">
              <v-avatar 
                :image="user?.profile_pic" 
                color="primary" 
                size="48"
                class="me-3"
              >
                <span class="text-h6 font-weight-bold">
                  {{ getUserInitials(user) }}
                </span>
              </v-avatar>
              <div class="flex-grow-1">
                <h4 class="text-h6 font-weight-bold mb-1">
                  {{ getUserFullName(user) }}
                </h4>
                <p class="text-body-2 text-on-surface-variant mb-0">
                  {{ user?.email }}
                </p>
                <p class="text-body-2 text-on-surface-variant mb-0" v-if="user?.username">
                  @{{ user.username }}
                </p>
              </div>
            </div>
            
            <!-- User Statistics -->
            <div class="user-stats" v-if="showStats">
              <v-divider class="mb-3" />
              <div class="d-flex justify-space-between text-body-2">
                <div class="text-center">
                  <div class="text-h6 font-weight-bold text-primary">{{ user?.pets?.length || 0 }}</div>
                  <div class="text-on-surface-variant">Pets</div>
                </div>
                <div class="text-center">
                  <div class="text-h6 font-weight-bold text-success">{{ user?.orders?.length || 0 }}</div>
                  <div class="text-on-surface-variant">Orders</div>
                </div>
                <div class="text-center">
                  <div class="text-h6 font-weight-bold text-info">{{ user?.appointments?.length || 0 }}</div>
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
            What happens when you delete this user?
          </h4>
          
          <div class="consequences-list">
            <div class="consequence-item d-flex align-start mb-3">
              <v-icon icon="mdi-eye-off" color="warning" class="me-3 mt-1" size="20" />
              <div>
                <div class="text-body-1 font-weight-medium">Account Deactivation</div>
                <div class="text-body-2 text-on-surface-variant">
                  User will be hidden from all admin lists and searches
                </div>
              </div>
            </div>
            
            <div class="consequence-item d-flex align-start mb-3">
              <v-icon icon="mdi-lock" color="error" class="me-3 mt-1" size="20" />
              <div>
                <div class="text-body-1 font-weight-medium">Login Access Disabled</div>
                <div class="text-body-2 text-on-surface-variant">
                  User will no longer be able to log into their account
                </div>
              </div>
            </div>
            
            <div class="consequence-item d-flex align-start mb-3">
              <v-icon icon="mdi-database-check" color="success" class="me-3 mt-1" size="20" />
              <div>
                <div class="text-body-1 font-weight-medium">Data Preservation</div>
                <div class="text-body-2 text-on-surface-variant">
                  All user data, pets, orders, and appointments remain intact for audit purposes
                </div>
              </div>
            </div>
            
            <div class="consequence-item d-flex align-start">
              <v-icon icon="mdi-restore" color="info" class="me-3 mt-1" size="20" />
              <div>
                <div class="text-body-1 font-weight-medium">Reversible Action</div>
                <div class="text-body-2 text-on-surface-variant">
                  Account can be reactivated by database administrators if needed
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
          Delete User Account
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface User {
  id: string
  username: string | null
  first_name: string | null
  last_name: string | null
  email: string
  profile_pic?: string | null
  pets?: any[]
  orders?: any[]
  appointments?: any[]
}

interface Props {
  modelValue: boolean
  user: User | null
  loading?: boolean
  showStats?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  showStats: true
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
  'cancel': []
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const getUserFullName = (user: User | null): string => {
  if (!user) return 'Unknown User'
  const firstName = user.first_name || ''
  const lastName = user.last_name || ''
  const fullName = `${firstName} ${lastName}`.trim()
  return fullName || user.username || user.email || 'Unknown User'
}

const getUserInitials = (user: User | null): string => {
  if (!user) return 'U'
  const firstName = user.first_name || ''
  const lastName = user.last_name || ''
  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }
  if (firstName) return firstName.charAt(0).toUpperCase()
  if (lastName) return lastName.charAt(0).toUpperCase()
  if (user.username) return user.username.charAt(0).toUpperCase()
  if (user.email) return user.email.charAt(0).toUpperCase()
  return 'U'
}

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
  isOpen.value = false
}
</script>

<style scoped>
.user-delete-dialog {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-outline), 0.12);
}

.user-delete-dialog .v-card-title {
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.08);
}

.user-delete-dialog .v-card-actions {
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

.user-info-card {
  background: rgba(var(--v-theme-primary), 0.02);
  border: 1px solid rgba(var(--v-theme-primary), 0.12);
}

.consequences-section {
  margin-top: 8px;
}

.consequence-item {
  padding: 8px 0;
}

.user-stats {
  margin-top: 8px;
}
</style>
