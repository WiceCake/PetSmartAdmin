<template>
  <v-dialog
    v-model="isOpen"
    max-width="500"
    persistent
    :retain-focus="false"
  >
    <v-card rounded="xl" class="password-reset-dialog">
      <v-card-title class="pa-6 pb-4">
        <div class="d-flex align-center">
          <v-icon 
            icon="mdi-lock-reset" 
            color="primary" 
            class="me-3" 
            size="28" 
          />
          <div>
            <h3 class="text-h5 font-weight-bold">Reset Password</h3>
            <p class="text-body-2 text-on-surface-variant mb-0">
              Set a new password for {{ userName }}
            </p>
          </div>
        </div>
      </v-card-title>

      <v-card-text class="pa-6 pt-2">
        <v-form ref="formRef" v-model="formValid" @submit.prevent="handleReset">
          <v-text-field
            v-model="newPassword"
            label="New Password"
            type="password"
            variant="outlined"
            :rules="passwordRules"
            required
            class="mb-4"
          />
          <v-text-field
            v-model="confirmPassword"
            label="Confirm Password"
            type="password"
            variant="outlined"
            :rules="confirmPasswordRules"
            required
          />
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-6 pt-0">
        <v-spacer />
        <v-btn
          variant="text"
          @click="handleCancel"
          :disabled="loading"
          class="me-2"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          :loading="loading"
          :disabled="!formValid"
          @click="handleReset"
        >
          Reset Password
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  modelValue: boolean
  userName: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'reset': [password: string]
  'cancel': []
}>()

const formRef = ref<any>(null)
const formValid = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const passwordRules = [
  (v: string) => !!v || 'Password is required',
  (v: string) => v.length >= 8 || 'Password must be at least 8 characters',
  (v: string) => /(?=.*[a-z])/.test(v) || 'Password must contain at least one lowercase letter',
  (v: string) => /(?=.*[A-Z])/.test(v) || 'Password must contain at least one uppercase letter',
  (v: string) => /(?=.*\d)/.test(v) || 'Password must contain at least one number'
]

const confirmPasswordRules = [
  (v: string) => !!v || 'Please confirm your password',
  (v: string) => v === newPassword.value || 'Passwords do not match'
]

const handleReset = async () => {
  if (formRef.value && await formRef.value.validate()) {
    emit('reset', newPassword.value)
  }
}

const handleCancel = () => {
  emit('cancel')
  resetForm()
  isOpen.value = false
}

const resetForm = () => {
  newPassword.value = ''
  confirmPassword.value = ''
  formValid.value = false
  if (formRef.value) {
    formRef.value.reset()
    formRef.value.resetValidation()
  }
}

// Reset form when dialog closes
watch(isOpen, (newValue) => {
  if (!newValue) {
    resetForm()
  }
})
</script>

<style scoped>
.password-reset-dialog {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-outline), 0.12);
}

.password-reset-dialog .v-card-title {
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.08);
}

.password-reset-dialog .v-card-actions {
  border-top: 1px solid rgba(var(--v-theme-outline), 0.08);
}
</style>
