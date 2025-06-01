<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-6">
          <h1 class="text-h4">Notifications</h1>
          <div>
            <v-btn text @click="markAllAsRead" class="mr-2">
              Mark All as Read
            </v-btn>
            <v-btn color="primary" @click="showNewNotificationDialog = true">
              <v-icon left>mdi-plus</v-icon>
              Send Notification
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="3">
        <v-card>
          <v-card-title>Filters</v-card-title>
          <v-list>
            <v-list-item @click="filterType = 'all'" :class="{ 'v-list-item--active': filterType === 'all' }">
              <v-list-item-title>All Notifications</v-list-item-title>
              <v-list-item-action>
                <v-chip small>{{ notifications.length }}</v-chip>
              </v-list-item-action>
            </v-list-item>
            
            <v-list-item @click="filterType = 'unread'" :class="{ 'v-list-item--active': filterType === 'unread' }">
              <v-list-item-title>Unread</v-list-item-title>
              <v-list-item-action>
                <v-chip small color="primary">{{ unreadCount }}</v-chip>
              </v-list-item-action>
            </v-list-item>
            
            <v-list-item @click="filterType = 'system'" :class="{ 'v-list-item--active': filterType === 'system' }">
              <v-list-item-title>System</v-list-item-title>
            </v-list-item>
            
            <v-list-item @click="filterType = 'user'" :class="{ 'v-list-item--active': filterType === 'user' }">
              <v-list-item-title>User Actions</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="9">
        <v-card>
          <v-card-title>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Search notifications..."
              single-line
              hide-details
              clearable
            ></v-text-field>
          </v-card-title>
          
          <v-list>
            <v-list-item
              v-for="notification in filteredNotifications"
              :key="notification.id"
              @click="markAsRead(notification)"
              :class="{ 'notification-unread': !notification.read }"
            >
              <v-list-item-avatar>
                <v-icon :color="getNotificationColor(notification.type)">
                  {{ getNotificationIcon(notification.type) }}
                </v-icon>
              </v-list-item-avatar>
              
              <v-list-item-content>
                <v-list-item-title>{{ notification.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ notification.message }}</v-list-item-subtitle>
                <v-list-item-subtitle class="text-caption">
                  {{ formatDate(notification.createdAt) }}
                </v-list-item-subtitle>
              </v-list-item-content>
              
              <v-list-item-action>
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn icon v-bind="props">
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item @click="markAsRead(notification)">
                      <v-list-item-title>Mark as Read</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="deleteNotification(notification)">
                      <v-list-item-title>Delete</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-list-item-action>
            </v-list-item>
          </v-list>
          
          <div v-if="filteredNotifications.length === 0" class="text-center pa-8">
            <v-icon size="64" color="grey">mdi-bell-outline</v-icon>
            <div class="text-h6 mt-4">No notifications</div>
            <div class="text-body-2 text-grey">You're all caught up!</div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- New Notification Dialog -->
    <v-dialog v-model="showNewNotificationDialog" max-width="600px">
      <v-card>
        <v-card-title>Send Notification</v-card-title>
        <v-card-text>
          <div class="text-center pa-8">
            <v-icon size="64" color="grey">mdi-bell-plus</v-icon>
            <div class="text-h6 mt-4">Notification Form</div>
            <div class="text-body-2 text-grey">Notification creation form will be implemented here</div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showNewNotificationDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="showNewNotificationDialog = false">Send</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Notification {
  id: number
  title: string
  message: string
  type: 'system' | 'user' | 'order' | 'appointment'
  read: boolean
  createdAt: string
}

const search = ref('')
const filterType = ref('all')
const showNewNotificationDialog = ref(false)
const notifications = ref<Notification[]>([])

const unreadCount = computed(() => 
  notifications.value.filter(n => !n.read).length
)

const filteredNotifications = computed(() => {
  let filtered = notifications.value

  // Apply type filter
  if (filterType.value !== 'all') {
    if (filterType.value === 'unread') {
      filtered = filtered.filter(n => !n.read)
    } else {
      filtered = filtered.filter(n => n.type === filterType.value)
    }
  }

  // Apply search filter
  if (search.value) {
    const searchLower = search.value.toLowerCase()
    filtered = filtered.filter(n =>
      n.title.toLowerCase().includes(searchLower) ||
      n.message.toLowerCase().includes(searchLower)
    )
  }

  return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'system': return 'mdi-cog'
    case 'user': return 'mdi-account'
    case 'order': return 'mdi-shopping'
    case 'appointment': return 'mdi-calendar'
    default: return 'mdi-bell'
  }
}

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'system': return 'info'
    case 'user': return 'success'
    case 'order': return 'warning'
    case 'appointment': return 'primary'
    default: return 'grey'
  }
}

const markAsRead = (notification: Notification) => {
  notification.read = true
  // TODO: Update in backend
}

const markAllAsRead = () => {
  notifications.value.forEach(n => n.read = true)
  // TODO: Update in backend
}

const deleteNotification = (notification: Notification) => {
  const index = notifications.value.findIndex(n => n.id === notification.id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
  // TODO: Delete in backend
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

const loadNotifications = async () => {
  // TODO: Implement actual data loading
  notifications.value = [
    {
      id: 1,
      title: 'New Order Received',
      message: 'Order #1234 has been placed by John Doe',
      type: 'order',
      read: false,
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 2,
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur tonight at 2 AM',
      type: 'system',
      read: true,
      createdAt: '2024-01-14T15:30:00Z'
    }
  ]
}

onMounted(() => {
  loadNotifications()
})
</script>

<style scoped>
.notification-unread {
  background-color: rgba(25, 118, 210, 0.05);
  border-left: 4px solid #1976d2;
}
</style>
