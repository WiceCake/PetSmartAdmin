<template>
  <v-snackbar
    v-model="showConnectionAlert"
    :color="connectionStatus.isConnected ? 'success' : 'error'"
    location="top"
    timeout="-1"
    class="connection-status-snackbar"
  >
    <div class="d-flex align-center">
      <v-icon class="me-2">
        {{ connectionStatus.isConnected ? 'mdi-wifi' : 'mdi-wifi-off' }}
      </v-icon>
      <span>
        {{ connectionStatus.isConnected ? 'Connection restored' : 'Connection lost' }}
      </span>
      <v-spacer />
      <v-btn
        v-if="!connectionStatus.isConnected"
        variant="text"
        size="small"
        :loading="connectionStatus.isReconnecting"
        @click="handleReconnect"
      >
        Reconnect
      </v-btn>
      <v-btn
        v-if="connectionStatus.isConnected"
        icon="mdi-close"
        size="small"
        variant="text"
        @click="showConnectionAlert = false"
      />
    </div>
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { connectionMonitor } from '@/services/connectionMonitor'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const showConnectionAlert = ref(false)
const connectionStatus = ref(connectionMonitor.getStatus())

let statusCheckInterval: number | null = null

// Watch for connection status changes
const updateConnectionStatus = () => {
  const newStatus = connectionMonitor.getStatus()
  const wasConnected = connectionStatus.value.isConnected
  const isConnected = newStatus.isConnected
  
  connectionStatus.value = newStatus
  
  // Show alert when connection state changes
  if (wasConnected !== isConnected) {
    showConnectionAlert.value = true
    
    // Auto-hide success message after 3 seconds
    if (isConnected) {
      setTimeout(() => {
        showConnectionAlert.value = false
      }, 3000)
    }
  }
}

// Handle manual reconnection
const handleReconnect = async () => {
  try {
    await connectionMonitor.reconnect()
    // Also try to recover auth connection
    await authStore.recoverConnection()
  } catch (error) {
    // Silent fail for manual reconnection
  }
}

onMounted(() => {
  // Check status every 2 seconds
  statusCheckInterval = window.setInterval(updateConnectionStatus, 2000)
  
  // Initial status check
  updateConnectionStatus()
})

onUnmounted(() => {
  if (statusCheckInterval) {
    clearInterval(statusCheckInterval)
  }
})
</script>

<style scoped>
.connection-status-snackbar {
  z-index: 9999;
}

.connection-status-snackbar :deep(.v-snackbar__wrapper) {
  min-width: 300px;
  max-width: 500px;
}
</style>
