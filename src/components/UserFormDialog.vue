<template>
  <v-dialog
    v-model="isOpen"
    max-width="700"
    persistent
    :retain-focus="false"
  >
    <v-card rounded="xl" class="user-form-dialog">
      <!-- Header -->
      <v-card-title class="pa-6 pb-4">
        <div class="d-flex align-center">
          <div class="form-icon-container me-4">
            <v-icon 
              :icon="isEditing ? 'mdi-account-edit' : 'mdi-account-plus'" 
              :color="isEditing ? 'primary' : 'success'" 
              size="32"
            />
          </div>
          <div class="flex-grow-1">
            <h3 class="text-h5 font-weight-bold mb-1">
              {{ isEditing ? 'Edit User Account' : 'Create New User Account' }}
            </h3>
            <p class="text-body-2 text-on-surface-variant mb-0">
              {{ isEditing ? 'Update user profile information and settings' : 'Add a new user to the system with profile details' }}
            </p>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="handleCancel"
            :disabled="loading"
            class="ml-2"
          />
        </div>
      </v-card-title>

      <!-- User Context (for editing) -->
      <v-card-text class="pa-6 pt-2" v-if="isEditing && user">
        <v-card 
          variant="outlined" 
          class="mb-4 user-context-card"
          rounded="lg"
        >
          <v-card-text class="pa-4">
            <div class="d-flex align-center">
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
              <v-chip
                :color="user?.profile_visibility ? 'success' : 'default'"
                size="small"
                variant="tonal"
              >
                {{ user?.profile_visibility ? 'Public' : 'Private' }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-card-text>

      <!-- Form Content -->
      <v-card-text class="pa-6" :class="{ 'pt-2': isEditing && user, 'pt-0': !isEditing || !user }">
        <v-form ref="formRef" v-model="formValid" @submit.prevent="handleSubmit">
          <v-row>
            <!-- Personal Information Section -->
            <v-col cols="12">
              <div class="section-header mb-4">
                <h4 class="text-h6 font-weight-bold d-flex align-center">
                  <v-icon icon="mdi-account" class="me-2" color="primary" />
                  Personal Information
                </h4>
                <v-divider class="mt-2" />
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.first_name"
                label="First Name"
                placeholder="Enter first name"
                variant="outlined"
                :rules="validationRules.required"
                :error-messages="fieldErrors.first_name"
                required
                clearable
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.last_name"
                label="Last Name"
                placeholder="Enter last name"
                variant="outlined"
                :rules="validationRules.required"
                :error-messages="fieldErrors.last_name"
                required
                clearable
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.username"
                label="Username"
                placeholder="Enter unique username"
                variant="outlined"
                :rules="validationRules.username"
                :error-messages="fieldErrors.username"
                required
                clearable
                hint="Must be unique, 3+ characters, letters/numbers/underscores only"
                persistent-hint
              />
            </v-col>

            <!-- Account Information Section -->
            <v-col cols="12">
              <div class="section-header mb-4 mt-2">
                <h4 class="text-h6 font-weight-bold d-flex align-center">
                  <v-icon icon="mdi-email" class="me-2" color="primary" />
                  Account Information
                </h4>
                <v-divider class="mt-2" />
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.email"
                label="Email Address"
                placeholder="Enter email address"
                type="email"
                variant="outlined"
                :rules="validationRules.email"
                :error-messages="fieldErrors.email"
                :disabled="isEditing"
                required
                clearable
                :hint="isEditing ? 'Email cannot be changed after account creation' : 'Will be used for login and notifications'"
                persistent-hint
              />
            </v-col>

            <v-col cols="12" md="6" v-if="!isEditing">
              <v-text-field
                v-model="formData.password"
                label="Password"
                placeholder="Enter secure password"
                :type="showPassword ? 'text' : 'password'"
                variant="outlined"
                :rules="validationRules.password"
                :error-messages="fieldErrors.password"
                required
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword"
                hint="Minimum 8 characters with letters and numbers"
                persistent-hint
              />
            </v-col>

            <!-- Contact Information Section -->
            <v-col cols="12">
              <div class="section-header mb-4 mt-2">
                <h4 class="text-h6 font-weight-bold d-flex align-center">
                  <v-icon icon="mdi-phone" class="me-2" color="primary" />
                  Contact Information
                </h4>
                <v-divider class="mt-2" />
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.mobile_number"
                label="Mobile Number"
                placeholder="Enter mobile number"
                variant="outlined"
                :rules="validationRules.phone"
                :error-messages="fieldErrors.mobile_number"
                type="tel"
                clearable
                hint="Optional: Include country code (e.g., +1234567890)"
                persistent-hint
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="formData.bio"
                label="Bio / Description"
                placeholder="Enter a brief description about the user (optional)"
                variant="outlined"
                rows="3"
                counter="500"
                :rules="validationRules.maxLength(500)"
                :error-messages="fieldErrors.bio"
                clearable
                hint="Optional: Brief description or notes about the user"
                persistent-hint
              />
            </v-col>
          </v-row>
        </v-form>

        <!-- Error Alert -->
        <v-alert
          v-if="submitError"
          type="error"
          variant="tonal"
          class="mt-4"
          rounded="lg"
          closable
          @click:close="submitError = ''"
        >
          <template #prepend>
            <v-icon icon="mdi-alert-circle" />
          </template>
          <div class="text-body-2">
            <strong>Error:</strong> {{ submitError }}
          </div>
        </v-alert>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="pa-6 pt-0">
        <v-spacer />
        <v-btn
          variant="text"
          @click="handleCancel"
          :disabled="loading"
          size="large"
        >
          Cancel
        </v-btn>
        <v-btn
          :color="isEditing ? 'primary' : 'success'"
          :loading="loading"
          :disabled="!formValid"
          @click="handleSubmit"
          variant="elevated"
          size="large"
          :prepend-icon="isEditing ? 'mdi-content-save' : 'mdi-account-plus'"
        >
          {{ isEditing ? 'Save Changes' : 'Create User' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface User {
  id: string
  username: string | null
  first_name: string | null
  last_name: string | null
  email: string
  mobile_number?: string | null
  bio?: string | null
  profile_pic?: string | null
  profile_visibility?: boolean | null
}

interface FormData {
  first_name: string
  last_name: string
  username: string
  email: string
  password: string
  mobile_number: string
  bio: string
}

interface Props {
  modelValue: boolean
  user?: User | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  user: null,
  loading: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': [data: FormData]
  'cancel': []
}>()

// Reactive state
const formRef = ref<any>(null)
const formValid = ref(false)
const showPassword = ref(false)
const submitError = ref('')
const fieldErrors = ref<Record<string, string[]>>({})

// Form data
const formData = ref<FormData>({
  first_name: '',
  last_name: '',
  username: '',
  email: '',
  password: '',
  mobile_number: '',
  bio: ''
})

// Computed properties
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEditing = computed(() => !!props.user)

// Validation rules
const validationRules = {
  required: [(v: string) => !!v || 'This field is required'],
  email: [
    (v: string) => !!v || 'Email is required',
    (v: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(v) || 'Please enter a valid email address'
    }
  ],
  password: [
    (v: string) => {
      if (isEditing.value) return true
      return !!v || 'Password is required for new users'
    },
    (v: string) => {
      if (!v && isEditing.value) return true
      return v.length >= 8 || 'Password must be at least 8 characters'
    }
  ],
  username: [
    (v: string) => !!v || 'Username is required',
    (v: string) => v.length >= 3 || 'Username must be at least 3 characters',
    (v: string) => {
      const pattern = /^[a-zA-Z0-9_]+$/
      return pattern.test(v) || 'Username can only contain letters, numbers, and underscores'
    }
  ],
  phone: [
    (v: string) => {
      if (!v) return true
      const pattern = /^[\+]?[1-9][\d]{0,15}$/
      return pattern.test(v) || 'Please enter a valid phone number'
    }
  ],
  maxLength: (max: number) => [
    (v: string) => {
      if (!v) return true
      return v.length <= max || `Maximum ${max} characters allowed`
    }
  ]
}

// Helper functions
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

const populateForm = () => {
  if (props.user) {
    formData.value = {
      first_name: props.user.first_name || '',
      last_name: props.user.last_name || '',
      username: props.user.username || '',
      email: props.user.email || '',
      password: '',
      mobile_number: props.user.mobile_number || '',
      bio: props.user.bio || ''
    }
  }
}

const resetForm = () => {
  formData.value = {
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    mobile_number: '',
    bio: ''
  }
  submitError.value = ''
  fieldErrors.value = {}
  if (formRef.value) {
    formRef.value.resetValidation()
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  const { valid } = await formRef.value.validate()
  if (!valid) return
  
  submitError.value = ''
  emit('submit', { ...formData.value })
}

const handleCancel = () => {
  emit('cancel')
  isOpen.value = false
}

// Watch for user changes to populate form
watch(() => props.user, populateForm, { immediate: true })

// Watch for dialog open/close to reset form
watch(isOpen, (newValue) => {
  if (newValue) {
    populateForm()
  } else {
    resetForm()
  }
})
</script>

<style scoped>
.user-form-dialog {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-outline), 0.12);
}

.user-form-dialog .v-card-title {
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.08);
}

.user-form-dialog .v-card-actions {
  border-top: 1px solid rgba(var(--v-theme-outline), 0.08);
}

.form-icon-container {
  background: rgba(var(--v-theme-primary), 0.1);
  border-radius: 50%;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-context-card {
  background: rgba(var(--v-theme-primary), 0.02);
  border: 1px solid rgba(var(--v-theme-primary), 0.12);
}

.section-header {
  margin-bottom: 16px;
}
</style>
