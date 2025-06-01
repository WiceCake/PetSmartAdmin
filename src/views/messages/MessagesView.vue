<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">Messages</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>
            <v-text-field
              v-model="searchMessages"
              append-icon="mdi-magnify"
              label="Search messages..."
              single-line
              hide-details
              clearable
            ></v-text-field>
          </v-card-title>
          
          <v-list>
            <v-list-item
              v-for="message in filteredMessages"
              :key="message.id"
              @click="selectMessage(message)"
              :class="{ 'v-list-item--active': selectedMessage?.id === message.id }"
            >
              <v-list-item-avatar>
                <v-avatar color="primary">
                  {{ message.senderName.charAt(0) }}
                </v-avatar>
              </v-list-item-avatar>
              
              <v-list-item-content>
                <v-list-item-title>{{ message.senderName }}</v-list-item-title>
                <v-list-item-subtitle>{{ message.subject }}</v-list-item-subtitle>
                <v-list-item-subtitle class="text-caption">
                  {{ formatDate(message.createdAt) }}
                </v-list-item-subtitle>
              </v-list-item-content>
              
              <v-list-item-action>
                <v-chip
                  v-if="!message.read"
                  color="primary"
                  small
                  text-color="white"
                >
                  New
                </v-chip>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="8">
        <v-card v-if="selectedMessage" class="fill-height">
          <v-card-title>
            <div>
              <div class="text-h6">{{ selectedMessage.subject }}</div>
              <div class="text-body-2 text-grey">
                From: {{ selectedMessage.senderName }} ({{ selectedMessage.senderEmail }})
              </div>
              <div class="text-body-2 text-grey">
                {{ formatDate(selectedMessage.createdAt) }}
              </div>
            </div>
            <v-spacer></v-spacer>
            <v-btn icon @click="replyToMessage">
              <v-icon>mdi-reply</v-icon>
            </v-btn>
            <v-btn icon @click="deleteMessage">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-card-title>
          
          <v-divider></v-divider>
          
          <v-card-text>
            <div class="message-content">
              {{ selectedMessage.content }}
            </div>
          </v-card-text>
        </v-card>
        
        <v-card v-else class="fill-height d-flex align-center justify-center">
          <div class="text-center">
            <v-icon size="64" color="grey">mdi-message-outline</v-icon>
            <div class="text-h6 mt-4">Select a message</div>
            <div class="text-body-2 text-grey">Choose a message from the list to view its content</div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Message {
  id: number
  senderName: string
  senderEmail: string
  subject: string
  content: string
  read: boolean
  createdAt: string
}

const searchMessages = ref('')
const selectedMessage = ref<Message | null>(null)
const messages = ref<Message[]>([])

const filteredMessages = computed(() => {
  if (!searchMessages.value) return messages.value
  
  const search = searchMessages.value.toLowerCase()
  return messages.value.filter(message =>
    message.senderName.toLowerCase().includes(search) ||
    message.subject.toLowerCase().includes(search) ||
    message.content.toLowerCase().includes(search)
  )
})

const selectMessage = (message: Message) => {
  selectedMessage.value = message
  if (!message.read) {
    message.read = true
    // TODO: Mark as read in backend
  }
}

const replyToMessage = () => {
  console.log('Reply to message:', selectedMessage.value)
}

const deleteMessage = () => {
  console.log('Delete message:', selectedMessage.value)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const loadMessages = async () => {
  // TODO: Implement actual data loading
  messages.value = [
    {
      id: 1,
      senderName: 'John Doe',
      senderEmail: 'john@example.com',
      subject: 'Question about my pet appointment',
      content: 'Hello, I have a question about my upcoming appointment for my dog Buddy...',
      read: false,
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 2,
      senderName: 'Jane Smith',
      senderEmail: 'jane@example.com',
      subject: 'Product inquiry',
      content: 'Hi, I would like to know more about the premium dog food you have...',
      read: true,
      createdAt: '2024-01-14T15:30:00Z'
    }
  ]
}

onMounted(() => {
  loadMessages()
})
</script>

<style scoped>
.message-content {
  white-space: pre-wrap;
  line-height: 1.6;
}
</style>
