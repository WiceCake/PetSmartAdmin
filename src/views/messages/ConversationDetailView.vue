<template>
  <div class="conversation-detail-view">
    <!-- Header -->
    <div class="conversation-header">
      <div class="header-content">
        <div class="back-section">
          <v-btn
            icon="mdi-arrow-left"
            variant="text"
            size="small"
            @click="goBack"
            class="back-btn"
          />
          <div class="conversation-info">
            <h1 class="conversation-title">
              {{ conversation?.subject || 'Conversation' }}
            </h1>
            <p class="conversation-subtitle">
              with {{ getCustomerName(conversation?.user_first_name, conversation?.user_last_name) }}
            </p>
          </div>
        </div>
        
        <div class="header-actions">
          <v-chip
            :color="getStatusColor(conversation?.status)"
            size="small"
            variant="tonal"
            class="status-chip"
          >
            <v-icon
              :icon="conversation?.status === 'pending' ? 'mdi-clock-outline' : 'mdi-check-all'"
              size="16"
              class="me-1"
            />
            {{ conversation?.status }}
          </v-chip>

          <v-btn
            color="success"
            variant="outlined"
            size="small"
            prepend-icon="mdi-check-circle"
            @click="markResolved"
            :disabled="conversation?.status === 'resolved'"
          >
            Mark Resolved
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Customer Info Card -->
    <v-card class="customer-card" v-if="conversation">
      <v-card-text class="customer-content">
        <div class="customer-details">
          <v-avatar size="48" color="primary" class="customer-avatar">
            <span class="text-white">
              {{ getCustomerInitials(conversation.user_first_name, conversation.user_last_name) }}
            </span>
          </v-avatar>
          <div class="customer-info">
            <h3 class="customer-name">
              {{ getCustomerName(conversation.user_first_name, conversation.user_last_name) }}
            </h3>
            <p class="customer-email">{{ conversation.user_email }}</p>
          </div>
        </div>
        
        <div class="conversation-meta">
          <div class="meta-item">
            <v-icon size="16" class="meta-icon">mdi-calendar</v-icon>
            <span class="meta-text">Started {{ formatTimeAgo(conversation.created_at) }}</span>
          </div>
          <div class="meta-item">
            <v-icon size="16" class="meta-icon">mdi-message-text</v-icon>
            <span class="meta-text">{{ conversation.total_messages }} messages</span>
          </div>
          <div class="meta-item">
            <v-icon size="16" class="meta-icon">mdi-update</v-icon>
            <span class="meta-text">Last updated {{ formatTimeAgo(conversation.updated_at) }}</span>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Messages Container -->
    <v-card class="messages-card">
      <div class="messages-container" ref="messagesContainer">
        <!-- Loading State -->
        <div v-if="messagesLoading" class="loading-state">
          <v-progress-circular indeterminate color="primary" size="32" />
          <p class="loading-text">Loading messages...</p>
        </div>

        <!-- Messages List -->
        <div v-else class="messages-list">
          <div
            v-for="message in messages"
            :key="message.id"
            class="message-wrapper"
            :class="{ 'message-admin': message.sender_type === 'admin' }"
          >
            <div class="message-bubble">
              <div class="message-content">
                {{ message.message_content }}
              </div>
              <div class="message-meta">
                <span class="message-time">{{ formatTimeAgo(message.created_at) }}</span>
                <v-icon
                  v-if="message.sender_type === 'user' && message.is_read"
                  size="12"
                  color="primary"
                  class="read-indicator"
                >
                  mdi-check-all
                </v-icon>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Message Input -->
      <div class="message-input-container">
        <v-divider />
        <div class="input-content">
          <v-textarea
            v-model="newMessage"
            placeholder="Type your message..."
            variant="outlined"
            rows="2"
            auto-grow
            max-rows="4"
            class="message-input"
            hide-details
            @keydown.enter.exact.prevent="sendMessage"
            @keydown.enter.shift.exact="newMessage += '\n'"
          />
          <v-btn
            color="primary"
            icon="mdi-send"
            size="large"
            @click="sendMessage"
            :disabled="!newMessage.trim() || sending"
            :loading="sending"
            class="send-btn"
          />
        </div>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useMessaging } from '@/composables/useMessaging'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

// Get conversation ID from route
const conversationId = computed(() => route.params.id as string)

// Use messaging composable - Simplified
const {
  currentConversation: conversation,
  messages,
  messagesLoading,
  sending,
  loadConversation,
  loadMessages,
  sendMessage: sendMessageApi,
  markMessagesAsRead,
  updateConversationStatus,
  setupRealTimeSubscriptions,
  cleanup,
  getStatusColor,
  formatTimeAgo
} = useMessaging()

// Local state - Simplified
const newMessage = ref('')
const messagesContainer = ref<HTMLElement>()

// Utility functions
const getCustomerInitials = (firstName: string, lastName: string) => {
  const first = firstName?.charAt(0) || ''
  const last = lastName?.charAt(0) || ''
  return (first + last) || '?'
}

const getCustomerName = (firstName: string, lastName: string) => {
  const name = `${firstName || ''} ${lastName || ''}`.trim()
  return name || 'Unknown User'
}

// Actions
const goBack = () => {
  router.push('/messages')
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !authStore.adminUser?.id) return

  const messageContent = newMessage.value.trim()
  newMessage.value = ''

  await sendMessageApi(
    conversationId.value,
    authStore.adminUser.id,
    'admin',
    messageContent
  )

  // Scroll to bottom after sending
  await nextTick()
  scrollToBottom()
}

const markResolved = async () => {
  if (conversation.value && conversation.value.status !== 'resolved') {
    try {
      await updateConversationStatus(conversation.value.id, 'resolved')
      toast.success('Conversation marked as resolved')
    } catch (error) {

      toast.error('Failed to mark conversation as resolved')
    }
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadConversation(conversationId.value),
    loadMessages(conversationId.value)
  ])

  // Mark messages as read
  if (authStore.adminUser?.id) {
    await markMessagesAsRead(conversationId.value, authStore.adminUser.id)
  }

  // Setup real-time subscriptions
  setupRealTimeSubscriptions()

  // Scroll to bottom
  await nextTick()
  scrollToBottom()
})

onUnmounted(() => {
  cleanup()
})

// Watch for new messages and scroll to bottom
watch(messages, async () => {
  await nextTick()
  scrollToBottom()
}, { deep: true })
</script>

<style scoped>
/* Conversation Detail View Styles */

.conversation-detail-view {
  padding: 24px;
  background-color: rgb(var(--v-theme-background));
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Header */
.conversation-header {
  background: rgb(var(--v-theme-surface));
  border-radius: 20px;
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  gap: 20px;
}

.back-section {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.back-btn {
  border-radius: 12px !important;
}

.conversation-info {
  flex: 1;
}

.conversation-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.conversation-subtitle {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface-variant));
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-chip,
.priority-chip {
  border-radius: 8px !important;
  font-weight: 500 !important;
}

/* Customer Card */
.customer-card {
  border-radius: 20px !important;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.customer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px !important;
  gap: 20px;
}

.customer-details {
  display: flex;
  align-items: center;
  gap: 16px;
}

.customer-avatar {
  flex-shrink: 0;
}

.customer-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 4px 0;
}

.customer-email {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface-variant));
  margin: 0;
}

.conversation-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-icon {
  color: rgb(var(--v-theme-on-surface-variant));
}

.meta-text {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface-variant));
}

/* Messages Card */
.messages-card {
  flex: 1;
  border-radius: 20px !important;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  max-height: 60vh;
  padding: 20px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 16px;
}

.loading-text {
  color: rgb(var(--v-theme-on-surface-variant));
  margin: 0;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-wrapper {
  display: flex;
  justify-content: flex-start;
}

.message-wrapper.message-admin {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 70%;
  background: rgb(var(--v-theme-surface-variant));
  border-radius: 18px;
  padding: 12px 16px;
  position: relative;
  color: rgb(var(--v-theme-on-surface));
}

.message-admin .message-bubble {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}

.message-content {
  font-size: 0.875rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.message-meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 4px;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.7;
}

.message-admin .message-time {
  color: rgba(255, 255, 255, 0.8);
}

.read-indicator {
  opacity: 0.7;
}

/* Message Input */
.message-input-container {
  flex-shrink: 0;
  background: rgb(var(--v-theme-surface));
}

.input-content {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 16px 20px;
}

.message-input {
  flex: 1;
}

.send-btn {
  border-radius: 12px !important;
  flex-shrink: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .conversation-detail-view {
    padding: 16px;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .customer-content {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .conversation-meta {
    align-items: flex-start;
  }

  .message-bubble {
    max-width: 85%;
  }

  .messages-container {
    max-height: 50vh;
  }
}

/* Form Field Enhancements */
:deep(.v-field) {
  border-radius: 12px !important;
}

:deep(.v-btn) {
  border-radius: 12px !important;
  text-transform: none !important;
  font-weight: 500 !important;
}

:deep(.v-chip) {
  border-radius: 8px !important;
  font-weight: 500 !important;
}

/* Dark theme adjustments */
.v-theme--dark .conversation-header {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-color: rgba(var(--v-theme-outline), 0.2);
}

.v-theme--dark .customer-card {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-color: rgba(var(--v-theme-outline), 0.2);
}

.v-theme--dark .messages-card {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-color: rgba(var(--v-theme-outline), 0.2);
}

.v-theme--dark .message-bubble {
  background: rgba(var(--v-theme-surface-variant), 0.8);
  color: rgb(var(--v-theme-on-surface));
}

.v-theme--dark .message-admin .message-bubble {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}

.v-theme--dark .message-input-container {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-top-color: rgba(var(--v-theme-outline), 0.2);
}
</style>
