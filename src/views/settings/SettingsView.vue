<template>
  <v-container fluid class="settings-container">
    <!-- Header Section -->
    <div class="settings-header mb-8">
      <div class="d-flex align-center justify-space-between">
        <div>
          <h1 class="text-h3 font-weight-bold mb-2">Settings</h1>
          <p class="text-body-1 text-medium-emphasis">
            Manage your application preferences and configuration
          </p>
        </div>
        <v-chip
          color="success"
          variant="tonal"
          prepend-icon="mdi-check-circle"
          class="settings-status"
        >
          All Systems Operational
        </v-chip>
      </div>
    </div>

    <v-row>
      <!-- Sidebar Navigation -->
      <v-col cols="12" lg="3" md="4">
        <v-card class="settings-nav rounded-xl" elevation="2">
          <v-card-title class="pa-6 pb-4">
            <div class="d-flex align-center">
              <v-icon color="primary" size="24" class="me-3">mdi-tune</v-icon>
              <span class="text-h6 font-weight-bold">Configuration</span>
            </div>
          </v-card-title>

          <v-divider></v-divider>

          <v-list class="pa-2">
            <v-list-item
              v-for="section in settingSections"
              :key="section.key"
              @click="activeSection = section.key"
              :active="activeSection === section.key"
              class="nav-item rounded-lg ma-1"
              :ripple="false"
            >
              <template v-slot:prepend>
                <v-icon
                  :color="activeSection === section.key ? 'primary' : 'default'"
                  size="20"
                >
                  {{ section.icon }}
                </v-icon>
              </template>

              <v-list-item-title class="font-weight-medium">
                {{ section.title }}
              </v-list-item-title>

              <template v-slot:append v-if="section.badge">
                <v-chip
                  size="x-small"
                  color="error"
                  variant="flat"
                >
                  {{ section.badge }}
                </v-chip>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Content Area -->
      <v-col cols="12" lg="9" md="8">
        <!-- General Settings -->
        <v-card v-if="activeSection === 'general'" class="settings-card rounded-xl" elevation="2">
          <div class="card-header pa-6 pb-4">
            <div class="d-flex align-center">
              <v-icon color="primary" size="28" class="me-3">mdi-cog</v-icon>
              <div>
                <h3 class="text-h5 font-weight-bold">General Settings</h3>
                <p class="text-body-2 text-medium-emphasis ma-0">
                  Configure basic application settings and information
                </p>
              </div>
            </div>
          </div>

          <v-divider></v-divider>

          <v-card-text class="pa-6">
            <v-form ref="generalForm" v-model="generalFormValid">
              <div class="settings-section mb-6">
                <h4 class="text-subtitle-1 font-weight-medium mb-4">
                  <v-icon class="me-2" size="20">mdi-information</v-icon>
                  Basic Information
                </h4>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="settings.general.siteName"
                      label="Site Name"
                      variant="outlined"
                      class="enhanced-field"
                      :rules="[rules.required]"
                      prepend-inner-icon="mdi-web"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="settings.general.siteUrl"
                      label="Site URL"
                      variant="outlined"
                      class="enhanced-field"
                      :rules="[rules.required, rules.url]"
                      prepend-inner-icon="mdi-link"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-textarea
                      v-model="settings.general.description"
                      label="Site Description"
                      variant="outlined"
                      class="enhanced-field"
                      rows="3"
                      prepend-inner-icon="mdi-text"
                    ></v-textarea>
                  </v-col>
                </v-row>
              </div>

              <div class="settings-section">
                <h4 class="text-subtitle-1 font-weight-medium mb-4">
                  <v-icon class="me-2" size="20">mdi-contact-mail</v-icon>
                  Contact Information
                </h4>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="settings.general.contactEmail"
                      label="Contact Email"
                      type="email"
                      variant="outlined"
                      class="enhanced-field"
                      :rules="[rules.required, rules.email]"
                      prepend-inner-icon="mdi-email"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="settings.general.contactPhone"
                      label="Contact Phone"
                      variant="outlined"
                      class="enhanced-field"
                      :rules="[rules.required]"
                      prepend-inner-icon="mdi-phone"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </div>
            </v-form>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions class="pa-6">
            <v-spacer></v-spacer>
            <v-btn
              variant="text"
              class="me-3"
              @click="resetGeneralSettings"
            >
              Reset
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              :loading="saving"
              :disabled="!generalFormValid"
              @click="saveSettings('general')"
              class="save-btn"
            >
              Save Changes
            </v-btn>
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
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { useRoleAccess } from '@/composables/useRoleAccess'

const toast = useToast()
const { visibleSettingsSections } = useRoleAccess()

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
const saving = ref(false)
const generalFormValid = ref(false)

// Form validation rules
const rules = {
  required: (value: any) => !!value || 'This field is required',
  email: (value: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || 'Please enter a valid email address'
  },
  url: (value: string) => {
    try {
      new URL(value)
      return true
    } catch {
      return 'Please enter a valid URL'
    }
  }
}

const allSettingSections = [
  { key: 'general', title: 'General', icon: 'mdi-cog' },
  { key: 'notifications', title: 'Notifications', icon: 'mdi-bell' },
  { key: 'security', title: 'Security', icon: 'mdi-shield' },
  { key: 'api', title: 'API', icon: 'mdi-api' },
  { key: 'backup', title: 'Backup', icon: 'mdi-backup-restore' }
]

// Filtered settings sections based on role
const settingSections = computed(() => {
  return allSettingSections.filter(section => visibleSettingsSections.value.includes(section.key))
})

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

const saveSettings = async (section: string) => {
  saving.value = true
  try {


    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully`)
  } catch (error) {

    toast.error('Failed to save settings')
  } finally {
    saving.value = false
  }
}

const resetGeneralSettings = () => {
  settings.value.general = {
    siteName: 'PetSmart Admin',
    siteUrl: 'https://admin.petsmart.com',
    description: 'Admin dashboard for PetSmart application',
    contactEmail: 'admin@petsmart.com',
    contactPhone: '+1 (555) 123-4567'
  }
  toast.info('General settings reset to defaults')
}

const createBackup = async () => {
  try {

    toast.info('Creating backup...')

    // Simulate backup creation
    await new Promise(resolve => setTimeout(resolve, 2000))

    toast.success('Backup created successfully')
  } catch (error) {
    toast.error('Failed to create backup')
  }
}

const clearCache = async () => {
  try {

    toast.info('Clearing cache...')

    // Simulate cache clearing
    await new Promise(resolve => setTimeout(resolve, 1000))

    toast.success('Cache cleared successfully')
  } catch (error) {
    toast.error('Failed to clear cache')
  }
}

const runMaintenance = async () => {
  try {

    toast.info('Running maintenance tasks...')

    // Simulate maintenance
    await new Promise(resolve => setTimeout(resolve, 3000))

    toast.success('Maintenance completed successfully')
  } catch (error) {
    toast.error('Maintenance failed')
  }
}

const loadSettings = async () => {
  try {

    // TODO: Load settings from backend
    // For now, using default values
  } catch (error) {

    toast.error('Failed to load settings')
  }
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
/* Settings Container */
.settings-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* Header Styling */
.settings-header {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05) 0%, rgba(var(--v-theme-primary), 0.02) 100%);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
}

.settings-status {
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Navigation Styling */
.settings-nav {
  position: sticky;
  top: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.nav-item {
  margin: 4px 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px !important;
}

.nav-item:hover {
  background: rgba(var(--v-theme-primary), 0.08) !important;
  transform: translateX(4px);
}

.nav-item.v-list-item--active {
  background: rgba(var(--v-theme-primary), 0.12) !important;
  color: rgb(var(--v-theme-primary)) !important;
  transform: translateX(8px);
  box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.2);
}

/* Card Styling */
.settings-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.settings-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.card-header {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05) 0%, rgba(var(--v-theme-primary), 0.02) 100%);
  border-bottom: 1px solid rgba(var(--v-theme-primary), 0.1);
}

/* Settings Sections */
.settings-section {
  padding: 20px;
  border-radius: 12px;
  background: rgba(var(--v-theme-surface), 0.5);
  border: 1px solid rgba(var(--v-theme-outline), 0.1);
}

/* Enhanced Form Fields */
.enhanced-field :deep(.v-field) {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.enhanced-field :deep(.v-field:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.enhanced-field :deep(.v-field--focused) {
  box-shadow: 0 4px 16px rgba(var(--v-theme-primary), 0.2);
}

.enhanced-field :deep(.v-field--error) {
  box-shadow: 0 4px 16px rgba(var(--v-theme-error), 0.2);
}

/* Button Styling */
.save-btn {
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.3);
  transition: all 0.3s ease;
}

.save-btn:hover {
  box-shadow: 0 6px 16px rgba(var(--v-theme-primary), 0.4);
  transform: translateY(-1px);
}

/* Dark theme adjustments */
.v-theme--dark .settings-header {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.1), rgba(var(--v-theme-primary), 0.05));
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.v-theme--dark .settings-nav {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-color: rgba(var(--v-theme-outline), 0.2);
}

.v-theme--dark .settings-card {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-color: rgba(var(--v-theme-outline), 0.2);
}

.v-theme--dark .card-header {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.1), rgba(var(--v-theme-primary), 0.05));
  border-bottom-color: rgba(var(--v-theme-primary), 0.2);
}

.v-theme--dark .settings-section {
  background: rgba(var(--v-theme-surface-variant), 0.2);
  border-color: rgba(var(--v-theme-outline), 0.1);
}

.v-theme--dark .nav-item:hover {
  background: rgba(var(--v-theme-primary), 0.12) !important;
}

.v-theme--dark .nav-item.v-list-item--active {
  background: rgba(var(--v-theme-primary), 0.15) !important;
}

/* Responsive Design */
@media (max-width: 960px) {
  .settings-nav {
    position: static;
    margin-bottom: 24px;
  }

  .nav-item:hover,
  .nav-item.v-list-item--active {
    transform: none;
  }
}

@media (max-width: 600px) {
  .settings-header {
    padding: 16px;
    margin-bottom: 24px;
  }

  .settings-section {
    padding: 16px;
  }
}
</style>
