<template>
  <v-card class="activity-feed">
    <v-card-title class="d-flex align-center justify-space-between pa-6 pb-4">
      <div class="d-flex align-center">
        <v-icon icon="mdi-timeline" class="me-2" />
        <span class="text-h6 font-weight-bold">{{ title }}</span>
      </div>
      <v-btn
        v-if="showViewAll"
        variant="text"
        size="small"
        @click="$emit('viewAll')"
      >
        View All
      </v-btn>
    </v-card-title>

    <v-card-text class="pa-0">
      <div class="activity-list">
        <div
          v-for="(activity, index) in activities"
          :key="activity.id"
          class="activity-item"
          :class="{ 'activity-item--last': index === activities.length - 1 }"
        >
          <!-- Timeline dot -->
          <div class="activity-timeline">
            <div
              class="activity-dot"
              :class="`activity-dot--${activity.type}`"
            >
              <v-icon
                :icon="getActivityIcon(activity.type)"
                size="14"
                color="white"
              />
            </div>
            <div
              v-if="index !== activities.length - 1"
              class="activity-line"
            />
          </div>

          <!-- Activity content -->
          <div class="activity-content">
            <div class="d-flex align-start justify-space-between mb-2">
              <div class="activity-main">
                <h4 class="text-subtitle-1 font-weight-medium mb-1">
                  {{ activity.title }}
                </h4>
                <p class="text-body-2 text-on-surface-variant mb-2">
                  {{ activity.description }}
                </p>
                
                <!-- Activity metadata -->
                <div class="d-flex align-center flex-wrap gap-2">
                  <v-chip
                    v-if="activity.user"
                    size="x-small"
                    variant="tonal"
                    color="primary"
                  >
                    <v-avatar
                      v-if="activity.user.avatar"
                      size="16"
                      class="me-1"
                    >
                      <v-img :src="activity.user.avatar" />
                    </v-avatar>
                    <v-icon
                      v-else
                      icon="mdi-account"
                      size="12"
                      class="me-1"
                    />
                    {{ activity.user.name }}
                  </v-chip>
                  
                  <v-chip
                    v-if="activity.category"
                    size="x-small"
                    variant="outlined"
                  >
                    {{ activity.category }}
                  </v-chip>
                </div>
              </div>

              <div class="activity-time text-caption text-on-surface-variant">
                {{ formatTime(activity.timestamp) }}
              </div>
            </div>

            <!-- Activity actions -->
            <div
              v-if="activity.actions && activity.actions.length > 0"
              class="activity-actions mt-3"
            >
              <v-btn
                v-for="action in activity.actions"
                :key="action.label"
                :color="action.color || 'primary'"
                :variant="action.variant || 'outlined'"
                size="small"
                class="me-2"
                @click="handleAction(action, activity)"
              >
                <v-icon
                  v-if="action.icon"
                  :icon="action.icon"
                  size="16"
                  class="me-1"
                />
                {{ action.label }}
              </v-btn>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div
          v-if="activities.length === 0"
          class="text-center pa-8"
        >
          <v-icon
            icon="mdi-timeline-outline"
            size="48"
            color="on-surface-variant"
            class="mb-4"
          />
          <p class="text-subtitle-1 text-on-surface-variant">
            No recent activity
          </p>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatDistanceToNow } from 'date-fns'

interface ActivityAction {
  label: string
  icon?: string
  color?: string
  variant?: string
  action: string
}

interface ActivityUser {
  name: string
  avatar?: string
}

interface Activity {
  id: string
  title: string
  description: string
  type: 'success' | 'warning' | 'error' | 'info' | 'default'
  timestamp: Date | string
  user?: ActivityUser
  category?: string
  actions?: ActivityAction[]
}

interface Props {
  title?: string
  activities: Activity[]
  showViewAll?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Recent Activity',
  showViewAll: true,
})

const emit = defineEmits<{
  viewAll: []
  action: [action: ActivityAction, activity: Activity]
}>()

const getActivityIcon = (type: string) => {
  const icons = {
    success: 'mdi-check',
    warning: 'mdi-alert',
    error: 'mdi-close',
    info: 'mdi-information',
    default: 'mdi-circle-small',
  }
  return icons[type as keyof typeof icons] || icons.default
}

const formatTime = (timestamp: Date | string) => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  return formatDistanceToNow(date, { addSuffix: true })
}

const handleAction = (action: ActivityAction, activity: Activity) => {
  emit('action', action, activity)
}
</script>

<style scoped>
.activity-feed {
  height: 100%;
}

.activity-list {
  max-height: 400px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  padding: 16px 24px;
  position: relative;
}

.activity-item--last {
  padding-bottom: 24px;
}

.activity-timeline {
  position: relative;
  margin-right: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.activity-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.activity-dot--success {
  background: linear-gradient(135deg, #10B981, #059669);
}

.activity-dot--warning {
  background: linear-gradient(135deg, #F59E0B, #D97706);
}

.activity-dot--error {
  background: linear-gradient(135deg, #EF4444, #DC2626);
}

.activity-dot--info {
  background: linear-gradient(135deg, #3B82F6, #2563EB);
}

.activity-dot--default {
  background: linear-gradient(135deg, #64748B, #475569);
}

.activity-line {
  width: 2px;
  flex: 1;
  background: rgba(0, 0, 0, 0.1);
  margin-top: 8px;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-main {
  flex: 1;
}

.activity-time {
  white-space: nowrap;
  margin-left: 16px;
}

.activity-actions {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding-top: 12px;
}

.gap-2 {
  gap: 8px;
}

/* Scrollbar styling */
.activity-list::-webkit-scrollbar {
  width: 4px;
}

.activity-list::-webkit-scrollbar-track {
  background: transparent;
}

.activity-list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}
</style>
