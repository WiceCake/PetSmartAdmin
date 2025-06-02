<template>
  <v-dialog
    v-model="isOpen"
    max-width="700"
    persistent
    :retain-focus="false"
  >
    <v-card rounded="xl" class="pet-form-dialog" elevation="8">
      <!-- Professional Header -->
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
            class="ml-2"
          />
        </div>
      </v-card-title>

      <!-- Pet Context Card (Edit Mode) -->
      <v-card-text class="pa-6 pt-2" v-if="isEditing && pet">
        <v-card
          variant="outlined"
          class="mb-4 pet-context-card"
          rounded="lg"
        >
          <v-card-text class="pa-4">
            <div class="d-flex align-center">
              <v-avatar
                :color="getPetAvatarColor(pet.type)"
                size="56"
                class="me-4"
              >
                <v-icon :icon="getPetIcon(pet.type)" size="28" color="white" />
              </v-avatar>
              <div class="flex-grow-1">
                <h4 class="text-h6 font-weight-bold mb-1">
                  {{ pet.name }}
                </h4>
                <div class="d-flex align-center mb-1">
                  <v-chip
                    :color="getTypeColor(pet.type)"
                    size="small"
                    variant="tonal"
                    class="me-2"
                  >
                    {{ pet.type || 'Unknown' }}
                  </v-chip>
                  <v-chip
                    v-if="pet.gender"
                    color="info"
                    size="small"
                    variant="tonal"
                  >
                    <v-icon
                      :icon="pet.gender === 'Male' ? 'mdi-gender-male' : 'mdi-gender-female'"
                      size="14"
                      class="me-1"
                    />
                    {{ pet.gender }}
                  </v-chip>
                </div>
                <p class="text-body-2 text-on-surface-variant mb-0" v-if="pet.owner">
                  <v-icon icon="mdi-account" size="14" class="me-1" />
                  Owner: {{ getOwnerName(pet.owner) }}
                </p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-card-text>

      <!-- Form Content -->
      <v-card-text class="pa-6" :class="{ 'pt-2': isEditing && pet, 'pt-0': !isEditing || !pet }">
        <v-form ref="formRef" v-model="formValid" @submit.prevent="handleSubmit">
          <v-row>
            <!-- Pet Information Section -->
            <v-col cols="12">
              <div class="section-header mb-4">
                <h4 class="text-h6 font-weight-bold d-flex align-center">
                  <v-icon icon="mdi-paw" class="me-2" color="primary" />
                  Pet Information
                </h4>
                <v-divider class="mt-2" />
              </div>
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="formData.name"
                label="Pet Name"
                placeholder="Enter your pet's name"
                variant="outlined"
                :rules="validationRules.petName"
                :error-messages="fieldErrors.name"
                required
                clearable
                @blur="validateField('name')"
                @input="clearFieldError('name')"
              >
                <template #prepend-inner>
                  <v-icon icon="mdi-tag" size="20" />
                </template>
              </v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="formData.type"
                label="Pet Type"
                :items="petTypeOptions"
                variant="outlined"
                :rules="validationRules.petType"
                :error-messages="fieldErrors.type"
                clearable
                @blur="validateField('type')"
                @update:model-value="clearFieldError('type')"
              >
                <template #prepend-inner>
                  <v-icon :icon="getPetIcon(formData.type)" size="20" />
                </template>
                <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <v-icon :icon="getPetIcon(item.value)" :color="getTypeColor(item.value)" />
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="formData.gender"
                label="Gender"
                :items="genderOptions"
                variant="outlined"
                clearable
                @update:model-value="clearFieldError('gender')"
              >
                <template #prepend-inner>
                  <v-icon
                    :icon="formData.gender === 'Male' ? 'mdi-gender-male' : formData.gender === 'Female' ? 'mdi-gender-female' : 'mdi-help'"
                    size="20"
                  />
                </template>
              </v-select>
            </v-col>

            <!-- Owner Information Section (New Pet Only) -->
            <v-col cols="12" v-if="!isEditing">
              <div class="section-header mb-4 mt-2">
                <h4 class="text-h6 font-weight-bold d-flex align-center">
                  <v-icon icon="mdi-account" class="me-2" color="primary" />
                  Owner Information
                </h4>
                <v-divider class="mt-2" />
              </div>
            </v-col>

            <v-col cols="12" v-if="!isEditing">
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
                      <v-avatar size="32" color="primary">
                        <span class="text-caption">{{ getOwnerInitials(item.raw) }}</span>
                      </v-avatar>
                    </template>
                    <v-list-item-subtitle v-if="item.raw.username">
                      @{{ item.raw.username }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </template>
                <template #no-data>
                  <v-list-item>
                    <v-list-item-title>
                      No owners found. Try a different search term.
                    </v-list-item-title>
                  </v-list-item>
                </template>
              </v-autocomplete>
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

        <!-- Success Alert -->
        <v-alert
          v-if="showSuccess"
          type="success"
          variant="tonal"
          class="mt-4"
          rounded="lg"
        >
          <template #prepend>
            <v-icon icon="mdi-check-circle" />
          </template>
          <div class="text-body-2">
            <strong>Success:</strong> Pet {{ isEditing ? 'updated' : 'added' }} successfully!
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

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ApiService } from '@/services/api'
import { useToast } from 'vue-toastification'

const props = defineProps({
  modelValue: Boolean,
  pet: Object,
  loading: Boolean
})

const emit = defineEmits(['update:modelValue', 'submit', 'cancel'])

const toast = useToast()

// Reactive state
const formRef = ref(null)
const formValid = ref(false)
const owners = ref([])
const loadingOwners = ref(false)
const submitError = ref('')
const showSuccess = ref(false)
const fieldErrors = ref({
  name: '',
  type: '',
  user_id: ''
})
const hasUnsavedChanges = ref(false)

// Form data
const formData = ref({
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
  return Object.values(fieldErrors.value).some(error => error !== '')
})

// Options with enhanced structure
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
    (v) => !!v || 'Pet name is required',
    (v) => (v && v.length >= 2) || 'Pet name must be at least 2 characters',
    (v) => (v && v.length <= 50) || 'Pet name must be less than 50 characters',
    (v) => (v && /^[a-zA-Z0-9\s\-']+$/.test(v)) || 'Pet name contains invalid characters'
  ],
  petType: [
    (v) => !!v || 'Pet type is required'
  ],
  owner: [
    (v) => !!v || 'Pet owner is required'
  ]
}

// Helper functions
const getOwnerName = (owner) => {
  if (!owner) return 'Unknown Owner'
  const firstName = owner.first_name || ''
  const lastName = owner.last_name || ''
  const fullName = `${firstName} ${lastName}`.trim()
  return fullName || owner.username || 'Unknown Owner'
}

const getOwnerInitials = (owner) => {
  if (!owner) return 'U'
  const firstName = owner.first_name || ''
  const lastName = owner.last_name || ''
  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }
  if (firstName) return firstName.charAt(0).toUpperCase()
  if (lastName) return lastName.charAt(0).toUpperCase()
  if (owner.username) return owner.username.charAt(0).toUpperCase()
  return 'U'
}

const getOwnerDisplayName = (owner) => {
  // This is used for the autocomplete item-title and should be clean
  if (!owner) return 'Unknown Owner'
  const firstName = owner.first_name || ''
  const lastName = owner.last_name || ''
  const fullName = `${firstName} ${lastName}`.trim()
  return fullName || owner.username || 'Unknown Owner'
}

const getPetIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'dog': return 'mdi-dog'
    case 'cat': return 'mdi-cat'
    default: return 'mdi-paw'
  }
}

const getTypeColor = (type) => {
  switch (type?.toLowerCase()) {
    case 'dog': return 'success'
    case 'cat': return 'warning'
    default: return 'primary'
  }
}

const getPetAvatarColor = (type) => {
  switch (type?.toLowerCase()) {
    case 'dog': return 'success'
    case 'cat': return 'orange'
    default: return 'primary'
  }
}

// Validation functions
const validateField = (fieldName) => {
  const value = formData.value[fieldName]
  const rules = validationRules[fieldName === 'name' ? 'petName' : fieldName === 'type' ? 'petType' : fieldName === 'user_id' ? 'owner' : null]

  if (!rules) return

  for (const rule of rules) {
    const result = rule(value)
    if (result !== true) {
      fieldErrors.value[fieldName] = result
      return
    }
  }
  fieldErrors.value[fieldName] = ''
}

const clearFieldError = (fieldName) => {
  fieldErrors.value[fieldName] = ''
  hasUnsavedChanges.value = true
}

// Data loading functions
const loadOwners = async () => {
  loadingOwners.value = true
  try {
    const result = await ApiService.getUsers(1, 100, '')
    if (result.data) {
      owners.value = result.data.map(user => ({
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        display_name: getOwnerDisplayName(user)
      }))
    }
  } catch (error) {

    submitError.value = 'Failed to load pet owners. Please try again.'
  } finally {
    loadingOwners.value = false
  }
}

const searchOwners = async (search) => {
  if (search && search.length > 2) {
    loadingOwners.value = true
    try {
      const result = await ApiService.getUsers(1, 50, search)
      if (result.data) {
        owners.value = result.data.map(user => ({
          id: user.id,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          display_name: getOwnerDisplayName(user)
        }))
      }
    } catch (error) {

      submitError.value = 'Failed to search owners. Please try again.'
    } finally {
      loadingOwners.value = false
    }
  }
}

const populateForm = () => {
  if (props.pet) {
    formData.value = {
      name: props.pet.name || '',
      type: props.pet.type || '',
      gender: props.pet.gender || '',
      user_id: props.pet.user_id || ''
    }
    hasUnsavedChanges.value = false
  }
}

const resetForm = () => {
  formData.value = {
    name: '',
    type: '',
    gender: '',
    user_id: ''
  }
  fieldErrors.value = {
    name: '',
    type: '',
    user_id: ''
  }
  submitError.value = ''
  showSuccess.value = false
  hasUnsavedChanges.value = false
  if (formRef.value) {
    formRef.value.resetValidation()
  }
}

const validateForm = async () => {
  if (!formRef.value) return false

  // Validate all fields
  validateField('name')
  validateField('type')
  if (!isEditing.value) {
    validateField('user_id')
  }

  const { valid } = await formRef.value.validate()
  return valid && !hasValidationErrors.value
}

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
    hasUnsavedChanges.value = false

    // Show success message and close modal after delay
    setTimeout(() => {
      showSuccess.value = false
      isOpen.value = false
    }, 1500)

  } catch (error) {

    submitError.value = 'Failed to save pet. Please try again.'
  }
}

const handleCancel = async () => {
  if (hasUnsavedChanges.value) {
    const confirmed = await new Promise((resolve) => {
      // Simple confirmation - in a real app you might use a proper dialog
      const result = confirm('You have unsaved changes. Are you sure you want to cancel?')
      resolve(result)
    })

    if (!confirmed) return
  }

  emit('cancel')
  isOpen.value = false
}

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

onMounted(() => {
  if (!isEditing.value) {
    loadOwners()
  }
})
</script>

<script>
export default {
  name: 'SimplePetFormDialog'
}
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
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 56px;
  min-height: 56px;
}

.pet-context-card {
  background: rgba(var(--v-theme-primary), 0.02);
  border: 1px solid rgba(var(--v-theme-primary), 0.12);
}

.section-header {
  margin-bottom: 16px;
}

.section-header h4 {
  color: rgb(var(--v-theme-on-surface));
  margin-bottom: 8px;
}

.section-header .v-divider {
  opacity: 0.12;
}

/* Form field enhancements */
.v-text-field .v-field__prepend-inner {
  padding-inline-end: 8px;
}

.v-select .v-field__prepend-inner {
  padding-inline-end: 8px;
}

.v-autocomplete .v-field__prepend-inner {
  padding-inline-end: 8px;
}

/* Responsive design */
@media (max-width: 768px) {
  .pet-form-dialog {
    margin: 16px;
    max-width: calc(100vw - 32px) !important;
  }

  .form-icon-container {
    min-width: 48px;
    min-height: 48px;
    padding: 8px;
  }

  .form-icon-container .v-icon {
    font-size: 24px !important;
  }
}

/* Animation enhancements */
.v-dialog-transition-enter-active,
.v-dialog-transition-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.v-dialog-transition-enter-from,
.v-dialog-transition-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Focus and hover states */
.v-btn:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}

.pet-context-card:hover {
  background: rgba(var(--v-theme-primary), 0.04);
  transition: background-color 0.2s ease;
}

/* Loading state styling */
.v-btn--loading {
  pointer-events: none;
}

.v-btn--loading .v-btn__content {
  opacity: 0.6;
}
</style>
