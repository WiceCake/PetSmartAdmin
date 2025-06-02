<template>
  <v-dialog
    v-model="isOpen"
    max-width="700"
    persistent
    :retain-focus="false"
  >
    <v-card rounded="xl" class="pet-form-dialog">
      <!-- Header -->
      <v-card-title class="pa-6 pb-4">
        <div class="d-flex align-center">
          <div class="form-icon-container me-4">
            <v-icon 
              :icon="isEditing ? 'mdi-paw' : 'mdi-plus-circle'" 
              :color="isEditing ? 'primary' : 'success'" 
              size="32"
            />
          </div>
          <div class="flex-grow-1">
            <h3 class="text-h5 font-weight-bold mb-1">
              {{ isEditing ? 'Edit Pet Information' : 'Add New Pet' }}
            </h3>
            <p class="text-body-2 text-on-surface-variant mb-0">
              {{ isEditing ? 'Update pet details and information' : 'Register a new pet in the system' }}
            </p>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="handleCancel"
            :disabled="loading"
          />
        </div>
      </v-card-title>

      <!-- Pet Context (for editing) -->
      <v-card-text class="pa-6 pt-2" v-if="isEditing && pet">
        <v-card 
          variant="outlined" 
          class="mb-4 pet-context-card"
          rounded="lg"
        >
          <v-card-text class="pa-4">
            <div class="d-flex align-center">
              <v-avatar 
                color="primary" 
                size="48"
                class="me-3"
              >
                <v-icon 
                  :icon="pet.type === 'Dog' ? 'mdi-dog' : pet.type === 'Cat' ? 'mdi-cat' : 'mdi-paw'" 
                  size="24"
                />
              </v-avatar>
              <div class="flex-grow-1">
                <h4 class="text-h6 font-weight-bold mb-1">
                  {{ pet.name }}
                </h4>
                <p class="text-body-2 text-on-surface-variant mb-0">
                  {{ pet.type }} • {{ pet.gender }}
                </p>
                <p class="text-body-2 text-on-surface-variant mb-0" v-if="pet.owner">
                  Owner: {{ getOwnerDisplayName(pet.owner) }}
                </p>
              </div>
              <v-chip
                :color="pet.is_active ? 'success' : 'default'"
                size="small"
                variant="flat"
              >
                {{ pet.is_active ? 'Active' : 'Inactive' }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-card-text>

      <!-- Form Content -->
      <v-card-text class="pa-6" :class="{ 'pt-2': isEditing && pet }">
        <v-form ref="formRef" v-model="formValid" @submit.prevent="handleSubmit">
          <!-- Error Alert -->
          <v-alert
            v-if="submitError"
            type="error"
            variant="tonal"
            class="mb-4"
            :text="submitError"
            closable
            @click:close="submitError = ''"
          />

          <!-- Success Alert -->
          <v-alert
            v-if="showSuccess"
            type="success"
            variant="tonal"
            class="mb-4"
            text="Pet information saved successfully!"
          />

          <v-row>
            <!-- Pet Name -->
            <v-col cols="12" md="6">
              <div class="section-header">
                <v-icon icon="mdi-tag" size="20" class="me-2" />
                <span class="text-subtitle-2 font-weight-bold">Pet Details</span>
              </div>
              <v-text-field
                v-model="formData.name"
                label="Pet Name"
                variant="outlined"
                :rules="validationRules.petName"
                :error-messages="fieldErrors.name"
                required
                clearable
                hint="Enter the pet's name (2-50 characters)"
                persistent-hint
                @blur="validateField('name')"
                @update:model-value="clearFieldError('name')"
              >
                <template #prepend-inner>
                  <v-icon icon="mdi-tag" size="20" />
                </template>
              </v-text-field>
            </v-col>

            <!-- Pet Type -->
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.type"
                label="Pet Type"
                :items="petTypeOptions"
                variant="outlined"
                :rules="validationRules.petType"
                :error-messages="fieldErrors.type"
                required
                clearable
                hint="Select the type of pet"
                persistent-hint
                @blur="validateField('type')"
                @update:model-value="clearFieldError('type')"
              >
                <template #prepend-inner>
                  <v-icon icon="mdi-paw" size="20" />
                </template>
                <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <v-icon 
                        :icon="item.value === 'Dog' ? 'mdi-dog' : 'mdi-cat'" 
                        size="20" 
                        class="me-2"
                      />
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>

            <!-- Pet Gender -->
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.gender"
                label="Gender"
                :items="genderOptions"
                variant="outlined"
                clearable
                hint="Select the pet's gender (optional)"
                persistent-hint
                @update:model-value="clearFieldError('gender')"
              >
                <template #prepend-inner>
                  <v-icon icon="mdi-gender-male-female" size="20" />
                </template>
              </v-select>
            </v-col>

            <!-- Owner Selection (only for new pets) -->
            <v-col cols="12" v-if="!isEditing">
              <div class="section-header">
                <v-icon icon="mdi-account" size="20" class="me-2" />
                <span class="text-subtitle-2 font-weight-bold">Owner Information</span>
              </div>
              <v-autocomplete
                v-model="formData.user_id"
                label="Pet Owner"
                :items="owners"
                item-title="display_name"
                item-value="id"
                variant="outlined"
                :rules="validationRules.owner"
                :error-messages="fieldErrors.user_id"
                :loading="loadingOwners"
                required
                clearable
                hint="Search and select the pet owner from registered users"
                persistent-hint
                @update:search="searchOwners"
                @blur="validateField('user_id')"
                @update:model-value="clearFieldError('user_id')"
                :custom-filter="() => true"
              >
                <template #prepend-inner>
                  <v-icon icon="mdi-account-search" size="20" />
                </template>
                <template #selection="{ item }">
                  <span>{{ item.raw.display_name }}</span>
                </template>
                <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <v-avatar
                        :image="item.raw.profile_pic"
                        color="primary"
                        size="32"
                      >
                        <span class="text-caption font-weight-bold">
                          {{ getUserInitials(item.raw) }}
                        </span>
                      </v-avatar>
                    </template>
                    <v-list-item-title>
                      {{ item.raw.display_name }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ item.raw.email }}
                      <span v-if="item.raw.username"> • @{{ item.raw.username }}</span>
                    </v-list-item-subtitle>
                  </v-list-item>
                </template>
                <template #no-data>
                  <v-list-item>
                    <v-list-item-title>
                      No users found. Try a different search term.
                    </v-list-item-title>
                  </v-list-item>
                </template>
              </v-autocomplete>
            </v-col>
          </v-row>
        </v-form>
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
          :disabled="!formValid || hasValidationErrors"
          @click="handleSubmit"
          variant="elevated"
          size="large"
          :prepend-icon="isEditing ? 'mdi-content-save' : 'mdi-plus'"
        >
          {{ isEditing ? 'Save Changes' : 'Add Pet' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ApiService } from '@/services/api'
import { useToast } from 'vue-toastification'

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
  display_name?: string
}

interface FormData {
  name: string
  type: string
  gender: string
  user_id: string
}

interface Props {
  modelValue: boolean
  pet?: Pet | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  pet: null,
  loading: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': [data: FormData]
  'cancel': []
}>()

const toast = useToast()

// Reactive state
const formRef = ref<any>(null)
const formValid = ref(false)
const owners = ref<User[]>([])
const loadingOwners = ref(false)
const submitError = ref('')
const showSuccess = ref(false)
const fieldErrors = ref<Record<string, string[]>>({})

// Form data
const formData = ref<FormData>({
  name: '',
  type: '',
  gender: '',
  user_id: ''
})

// Computed properties
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEditing = computed(() => !!props.pet)

const hasValidationErrors = computed(() => {
  return Object.values(fieldErrors.value).some(errors => errors.length > 0)
})

// Options
const petTypeOptions = [
  { title: 'Dog', value: 'Dog' },
  { title: 'Cat', value: 'Cat' }
]

const genderOptions = [
  { title: 'Male', value: 'Male' },
  { title: 'Female', value: 'Female' }
]

// Validation rules
const validationRules = {
  petName: [
    (v: string) => !!v || 'Pet name is required',
    (v: string) => (v && v.length >= 2) || 'Pet name must be at least 2 characters',
    (v: string) => (v && v.length <= 50) || 'Pet name must be less than 50 characters',
    (v: string) => (v && /^[a-zA-Z0-9\s\-']+$/.test(v)) || 'Pet name contains invalid characters'
  ],
  petType: [
    (v: string) => !!v || 'Pet type is required'
  ],
  owner: [
    (v: string) => !!v || 'Pet owner is required'
  ]
}

// Helper functions
const getOwnerDisplayName = (owner: any) => {
  if (!owner) return 'Unknown Owner'

  const firstName = owner.first_name || ''
  const lastName = owner.last_name || ''
  const username = owner.username || ''

  if (firstName && lastName) {
    return `${firstName} ${lastName}`
  } else if (firstName) {
    return firstName
  } else if (lastName) {
    return lastName
  } else if (username) {
    return `@${username}`
  } else {
    return owner.email || 'Unknown Owner'
  }
}

const getUserInitials = (user: any) => {
  if (!user) return '?'

  const firstName = user.first_name || ''
  const lastName = user.last_name || ''
  const username = user.username || ''
  const email = user.email || ''

  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  } else if (firstName) {
    return firstName.charAt(0).toUpperCase()
  } else if (lastName) {
    return lastName.charAt(0).toUpperCase()
  } else if (username) {
    return username.charAt(0).toUpperCase()
  } else if (email) {
    return email.charAt(0).toUpperCase()
  } else {
    return '?'
  }
}

// Load owners for autocomplete
const loadOwners = async (search = '') => {
  loadingOwners.value = true
  try {
    const result = await ApiService.getUsers(1, 50, search)
    if (result.error) throw result.error

    // Add display_name property for autocomplete
    owners.value = (result.data || []).map(user => ({
      ...user,
      display_name: getOwnerDisplayName(user)
    }))
  } catch (error) {

    toast.error('Failed to load pet owners')
  } finally {
    loadingOwners.value = false
  }
}

// Search owners with debouncing
let searchTimeout: NodeJS.Timeout
const searchOwners = (search: string) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    if (search && search.length >= 2) {
      loadOwners(search)
    } else if (!search) {
      loadOwners()
    }
  }, 300)
}

// Validation functions
const validateField = async (fieldName: string) => {
  if (!formRef.value) return false

  const field = formRef.value.$el.querySelector(`[name="${fieldName}"]`)
  if (field) {
    // Trigger validation for the specific field
    await formRef.value.validate()
  }
  return true
}

const clearFieldError = (fieldName: string) => {
  if (fieldErrors.value[fieldName]) {
    fieldErrors.value[fieldName] = []
  }
  submitError.value = ''
}

const validateForm = async () => {
  if (!formRef.value) return false

  const { valid } = await formRef.value.validate()
  return valid
}

// Form management
const populateForm = () => {
  if (props.pet) {
    formData.value = {
      name: props.pet.name || '',
      type: props.pet.type || '',
      gender: props.pet.gender || '',
      user_id: props.pet.user_id || ''
    }
  } else {
    resetForm()
  }
}

const resetForm = () => {
  formData.value = {
    name: '',
    type: '',
    gender: '',
    user_id: ''
  }
  fieldErrors.value = {}
  submitError.value = ''
  showSuccess.value = false

  if (formRef.value) {
    formRef.value.resetValidation()
  }
}

// Event handlers
const handleSubmit = async () => {
  submitError.value = ''
  showSuccess.value = false

  const isValid = await validateForm()
  if (!isValid) {
    submitError.value = 'Please fix the validation errors before submitting.'
    return
  }

  try {
    emit('submit', { ...formData.value })
    showSuccess.value = true

    // Show success message and close modal after delay
    setTimeout(() => {
      showSuccess.value = false
      isOpen.value = false
    }, 1500)

  } catch (error) {

    submitError.value = 'Failed to save pet. Please try again.'
  }
}

const handleCancel = () => {
  emit('cancel')
  isOpen.value = false
}

// Watchers
watch(() => props.pet, populateForm, { immediate: true })

watch(isOpen, (newValue) => {
  if (newValue) {
    populateForm()
    if (!isEditing.value) {
      loadOwners()
    }
  } else {
    resetForm()
  }
})

// Lifecycle
onMounted(() => {
  if (!isEditing.value) {
    loadOwners()
  }
})
</script>

<style scoped>
.pet-form-dialog {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-outline), 0.12);
}

.pet-form-dialog .v-card-title {
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.08);
}

.pet-form-dialog .v-card-actions {
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

.pet-context-card {
  background: rgba(var(--v-theme-primary), 0.02);
  border: 1px solid rgba(var(--v-theme-primary), 0.12);
}

.section-header {
  margin-bottom: 16px;
}
</style>
