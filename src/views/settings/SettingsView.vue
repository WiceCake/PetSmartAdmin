<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">Settings</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="3">
        <v-card>
          <v-list>
            <v-list-item
              v-for="section in settingSections"
              :key="section.key"
              @click="activeSection = section.key"
              :class="{ 'v-list-item--active': activeSection === section.key }"
            >
              <v-list-item-avatar>
                <v-icon>{{ section.icon }}</v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>{{ section.title }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="9">
        <!-- General Settings -->
        <v-card v-if="activeSection === 'general'">
          <v-card-title>General Settings</v-card-title>
          <v-card-text>
            <v-form>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="settings.general.siteName"
                    label="Site Name"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="settings.general.siteUrl"
                    label="Site URL"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="settings.general.description"
                    label="Site Description"
                    rows="3"
                  ></v-textarea>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="settings.general.contactEmail"
                    label="Contact Email"
                    type="email"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="settings.general.contactPhone"
                    label="Contact Phone"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="saveSettings('general')">Save Changes</v-btn>
          </v-card-actions>
        </v-card>

        <!-- Notifications Settings -->
        <v-card v-if="activeSection === 'notifications'">
          <v-card-title>Notification Settings</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12">
                <v-switch
                  v-model="settings.notifications.emailNotifications"
                  label="Email Notifications"
                  color="primary"
                ></v-switch>
              </v-col>
              <v-col cols="12">
                <v-switch
                  v-model="settings.notifications.orderNotifications"
                  label="Order Notifications"
                  color="primary"
                ></v-switch>
              </v-col>
              <v-col cols="12">
                <v-switch
                  v-model="settings.notifications.appointmentNotifications"
                  label="Appointment Notifications"
                  color="primary"
                ></v-switch>
              </v-col>
              <v-col cols="12">
                <v-switch
                  v-model="settings.notifications.systemNotifications"
                  label="System Notifications"
                  color="primary"
                ></v-switch>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="saveSettings('notifications')">Save Changes</v-btn>
          </v-card-actions>
        </v-card>

        <!-- Security Settings -->
        <v-card v-if="activeSection === 'security'">
          <v-card-title>Security Settings</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12">
                <v-switch
                  v-model="settings.security.twoFactorAuth"
                  label="Two-Factor Authentication"
                  color="primary"
                ></v-switch>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="settings.security.sessionTimeout"
                  label="Session Timeout (minutes)"
                  type="number"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="settings.security.maxLoginAttempts"
                  label="Max Login Attempts"
                  type="number"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-switch
                  v-model="settings.security.requirePasswordChange"
                  label="Require Password Change Every 90 Days"
                  color="primary"
                ></v-switch>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="saveSettings('security')">Save Changes</v-btn>
          </v-card-actions>
        </v-card>

        <!-- API Settings -->
        <v-card v-if="activeSection === 'api'">
          <v-card-title>API Settings</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="settings.api.supabaseUrl"
                  label="Supabase URL"
                  readonly
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="settings.api.supabaseKey"
                  label="Supabase Anon Key"
                  type="password"
                  readonly
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-switch
                  v-model="settings.api.enableRateLimit"
                  label="Enable API Rate Limiting"
                  color="primary"
                ></v-switch>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="settings.api.rateLimit"
                  label="Requests per minute"
                  type="number"
                  :disabled="!settings.api.enableRateLimit"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="saveSettings('api')">Save Changes</v-btn>
          </v-card-actions>
        </v-card>

        <!-- Backup Settings -->
        <v-card v-if="activeSection === 'backup'">
          <v-card-title>Backup & Maintenance</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12">
                <v-switch
                  v-model="settings.backup.autoBackup"
                  label="Automatic Backups"
                  color="primary"
                ></v-switch>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="settings.backup.frequency"
                  :items="backupFrequencyOptions"
                  label="Backup Frequency"
                  :disabled="!settings.backup.autoBackup"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="settings.backup.retentionDays"
                  label="Retention Period (days)"
                  type="number"
                  :disabled="!settings.backup.autoBackup"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <div class="text-subtitle-2 mb-4">Manual Actions</div>
                <v-btn color="primary" class="mr-2 mb-2" @click="createBackup">
                  Create Backup Now
                </v-btn>
                <v-btn color="warning" class="mr-2 mb-2" @click="clearCache">
                  Clear Cache
                </v-btn>
                <v-btn color="info" class="mb-2" @click="runMaintenance">
                  Run Maintenance
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="saveSettings('backup')">Save Changes</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Settings {
  general: {
    siteName: string
    siteUrl: string
    description: string
    contactEmail: string
    contactPhone: string
  }
  notifications: {
    emailNotifications: boolean
    orderNotifications: boolean
    appointmentNotifications: boolean
    systemNotifications: boolean
  }
  security: {
    twoFactorAuth: boolean
    sessionTimeout: number
    maxLoginAttempts: number
    requirePasswordChange: boolean
  }
  api: {
    supabaseUrl: string
    supabaseKey: string
    enableRateLimit: boolean
    rateLimit: number
  }
  backup: {
    autoBackup: boolean
    frequency: string
    retentionDays: number
  }
}

const activeSection = ref('general')

const settingSections = [
  { key: 'general', title: 'General', icon: 'mdi-cog' },
  { key: 'notifications', title: 'Notifications', icon: 'mdi-bell' },
  { key: 'security', title: 'Security', icon: 'mdi-shield' },
  { key: 'api', title: 'API', icon: 'mdi-api' },
  { key: 'backup', title: 'Backup', icon: 'mdi-backup-restore' }
]

const backupFrequencyOptions = [
  { title: 'Daily', value: 'daily' },
  { title: 'Weekly', value: 'weekly' },
  { title: 'Monthly', value: 'monthly' }
]

const settings = ref<Settings>({
  general: {
    siteName: 'PetSmart Admin',
    siteUrl: 'https://admin.petsmart.com',
    description: 'Admin dashboard for PetSmart application',
    contactEmail: 'admin@petsmart.com',
    contactPhone: '+1 (555) 123-4567'
  },
  notifications: {
    emailNotifications: true,
    orderNotifications: true,
    appointmentNotifications: true,
    systemNotifications: false
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    requirePasswordChange: true
  },
  api: {
    supabaseUrl: 'https://your-project.supabase.co',
    supabaseKey: '••••••••••••••••••••••••••••••••',
    enableRateLimit: true,
    rateLimit: 100
  },
  backup: {
    autoBackup: true,
    frequency: 'daily',
    retentionDays: 30
  }
})

const saveSettings = (section: string) => {
  console.log(`Saving ${section} settings:`, settings.value[section as keyof Settings])
  // TODO: Implement actual settings save
}

const createBackup = () => {
  console.log('Creating backup...')
  // TODO: Implement backup creation
}

const clearCache = () => {
  console.log('Clearing cache...')
  // TODO: Implement cache clearing
}

const runMaintenance = () => {
  console.log('Running maintenance...')
  // TODO: Implement maintenance tasks
}

const loadSettings = async () => {
  // TODO: Load settings from backend
  console.log('Loading settings...')
}

onMounted(() => {
  loadSettings()
})
</script>
