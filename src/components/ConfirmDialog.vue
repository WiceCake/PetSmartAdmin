<template>
  <v-dialog
    v-model="isOpen"
    max-width="500"
    persistent
    :retain-focus="false"
  >
    <v-card rounded="xl" class="confirm-dialog">
      <v-card-title class="pa-6 pb-4">
        <div class="d-flex align-center">
          <v-icon 
            :icon="icon" 
            :color="iconColor" 
            class="me-3" 
            size="28" 
          />
          <div>
            <h3 class="text-h5 font-weight-bold">{{ title }}</h3>
            <p class="text-body-2 text-on-surface-variant mb-0">
              {{ subtitle }}
            </p>
          </div>
        </div>
      </v-card-title>

      <v-card-text class="pa-6 pt-2">
        <div class="text-body-1" v-html="message"></div>
      </v-card-text>

      <v-card-actions class="pa-6 pt-0">
        <v-spacer />
        <v-btn
          variant="text"
          @click="handleCancel"
          :disabled="loading"
          class="me-2"
        >
          {{ cancelText }}
        </v-btn>
        <v-btn
          :color="confirmColor"
          :loading="loading"
          @click="handleConfirm"
          :variant="confirmVariant"
        >
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue: boolean
  title: string
  subtitle?: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmColor?: string
  confirmVariant?: string
  icon?: string
  iconColor?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  confirmColor: 'error',
  confirmVariant: 'flat',
  icon: 'mdi-alert-circle',
  iconColor: 'error',
  loading: false
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

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
  isOpen.value = false
}
</script>

<style scoped>
.confirm-dialog {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-outline), 0.12);
}

.confirm-dialog .v-card-title {
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.08);
}

.confirm-dialog .v-card-actions {
  border-top: 1px solid rgba(var(--v-theme-outline), 0.08);
}
</style>
