<template>
  <v-card
    class="stats-card"
    :class="{ 'stats-card--clickable': clickable }"
    @click="handleClick"
  >
    <v-card-text class="pa-6">
      <div class="d-flex align-center justify-space-between mb-4">
        <div class="stats-icon" :class="`bg-${color}`">
          <v-icon :icon="icon" size="24" color="white" />
        </div>
        <v-menu v-if="showMenu">
          <template v-slot:activator="{ props }">
            <v-btn
              icon="mdi-dots-vertical"
              variant="text"
              size="small"
              v-bind="props"
            />
          </template>
          <v-list>
            <v-list-item
              v-for="action in menuActions"
              :key="action.title"
              @click="action.action"
            >
              <v-list-item-title>{{ action.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <div class="mb-2">
        <h3 class="text-h4 font-weight-bold text-on-surface mb-1">
          {{ formattedValue }}
        </h3>
        <p class="text-subtitle-2 text-on-surface-variant mb-0">
          {{ title }}
        </p>
      </div>

      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-chip
            v-if="trend !== null"
            :color="trendColor"
            variant="tonal"
            size="small"
            class="trend-chip"
          >
            <v-icon
              :icon="trendIcon"
              size="14"
              class="me-1"
            />
            {{ Math.abs(trend) }}%
          </v-chip>
        </div>
        
        <div v-if="subtitle" class="text-caption text-on-surface-variant">
          {{ subtitle }}
        </div>
      </div>

      <!-- Progress bar for percentage values -->
      <v-progress-linear
        v-if="showProgress"
        :model-value="progressValue"
        :color="color"
        height="4"
        rounded
        class="mt-4"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface MenuAction {
  title: string
  action: () => void
}

interface Props {
  title: string
  value: string | number
  icon: string
  color?: string
  trend?: number | null
  subtitle?: string
  clickable?: boolean
  showMenu?: boolean
  menuActions?: MenuAction[]
  showProgress?: boolean
  progressValue?: number
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
  trend: null,
  subtitle: '',
  clickable: false,
  showMenu: false,
  menuActions: () => [],
  showProgress: false,
  progressValue: 0,
})

const emit = defineEmits<{
  click: []
}>()

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString()
  }
  return props.value
})

const trendColor = computed(() => {
  if (props.trend === null) return 'grey'
  return props.trend >= 0 ? 'success' : 'error'
})

const trendIcon = computed(() => {
  if (props.trend === null) return ''
  return props.trend >= 0 ? 'mdi-trending-up' : 'mdi-trending-down'
})

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}
</script>

<style scoped>
.stats-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.stats-card--clickable {
  cursor: pointer;
}

.stats-card--clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
}

.stats-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.stats-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0));
}

.bg-primary {
  background: linear-gradient(135deg, #6366F1, #4F46E5);
}

.bg-success {
  background: linear-gradient(135deg, #10B981, #059669);
}

.bg-warning {
  background: linear-gradient(135deg, #F59E0B, #D97706);
}

.bg-error {
  background: linear-gradient(135deg, #EF4444, #DC2626);
}

.bg-info {
  background: linear-gradient(135deg, #3B82F6, #2563EB);
}

.bg-secondary {
  background: linear-gradient(135deg, #64748B, #475569);
}

.trend-chip {
  font-weight: 600;
  font-size: 0.75rem;
}

.stats-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--v-theme-primary), var(--v-theme-primary-lighten-1));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stats-card:hover::before {
  opacity: 1;
}
</style>
