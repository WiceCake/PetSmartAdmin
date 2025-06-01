<template>
  <v-container fluid>
      <v-row>
        <v-col cols="12">
          <h1 class="text-h4 mb-6">State Persistence Test</h1>
          <p class="text-subtitle-1 mb-6">
            This page demonstrates the state persistence features implemented in the admin dashboard.
          </p>
        </v-col>
      </v-row>

      <!-- Sidebar State Test -->
      <v-row>
        <v-col cols="12" md="6">
          <v-card class="mb-4">
            <v-card-title>Sidebar State Persistence</v-card-title>
            <v-card-text>
              <div class="mb-4">
                <h4>Current Sidebar State:</h4>
                <ul>
                  <li>Drawer Open: {{ sidebarStore.drawer ? 'Yes' : 'No' }}</li>
                  <li>Rail Mode: {{ sidebarStore.rail ? 'Yes' : 'No' }}</li>
                  <li>Scroll Position: {{ sidebarStore.scrollPosition }}px</li>
                  <li>Last Route: {{ sidebarStore.lastActiveRoute }}</li>
                </ul>
              </div>
              
              <div class="d-flex gap-2 flex-wrap">
                <v-btn 
                  @click="sidebarStore.toggleDrawer()"
                  color="primary"
                  variant="outlined"
                >
                  Toggle Drawer
                </v-btn>
                <v-btn 
                  @click="sidebarStore.toggleRail()"
                  color="secondary"
                  variant="outlined"
                >
                  Toggle Rail
                </v-btn>
                <v-btn 
                  @click="sidebarStore.reset()"
                  color="warning"
                  variant="outlined"
                >
                  Reset State
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Component State Test -->
        <v-col cols="12" md="6">
          <v-card class="mb-4">
            <v-card-title>Component State Persistence</v-card-title>
            <v-card-text>
              <v-form>
                <v-text-field
                  v-model="componentState.state.testInput"
                  label="Test Input (persisted)"
                  hint="This value persists across navigation"
                  persistent-hint
                  @input="updateComponentState"
                />
                
                <v-slider
                  v-model="componentState.state.testSlider"
                  label="Test Slider (persisted)"
                  min="0"
                  max="100"
                  @update:model-value="updateComponentState"
                />
                
                <v-switch
                  v-model="componentState.state.testSwitch"
                  label="Test Switch (persisted)"
                  @update:model-value="updateComponentState"
                />
                
                <v-select
                  v-model="componentState.state.testSelect"
                  :items="selectItems"
                  label="Test Select (persisted)"
                  @update:model-value="updateComponentState"
                />
              </v-form>
              
              <div class="mt-4">
                <v-btn 
                  @click="componentState.clearState()"
                  color="error"
                  variant="outlined"
                >
                  Clear Component State
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Instructions -->
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title>Testing Instructions</v-card-title>
            <v-card-text>
              <h4>To test state persistence:</h4>
              <ol>
                <li><strong>Sidebar State</strong>: Toggle sidebar settings, then navigate to another page and back</li>
                <li><strong>Scroll Position</strong>: Scroll in the sidebar navigation, navigate away, and return</li>
                <li><strong>Component State</strong>: Fill out the form above, navigate to another page, and return</li>
                <li><strong>Browser Refresh</strong>: Refresh the page to test localStorage persistence</li>
                <li><strong>Responsive Behavior</strong>: Resize the window to test responsive state handling</li>
              </ol>
              
              <v-alert type="info" class="mt-4">
                <strong>Expected Behavior</strong>: All states should be preserved across navigation and browser refreshes.
                The sidebar should maintain its position, the form should retain its values, and the scroll position should be restored.
              </v-alert>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSidebarStore } from '@/stores/sidebar'
import { useComponentState } from '@/composables/useComponentState'

// Sidebar store for testing
const sidebarStore = useSidebarStore()

// Component state for testing
interface TestState {
  testInput: string
  testSlider: number
  testSwitch: boolean
  testSelect: string
}

const componentState = useComponentState<TestState>(
  {
    testInput: '',
    testSlider: 50,
    testSwitch: false,
    testSelect: 'option1'
  },
  {
    key: 'state-persistence-test',
    persistInLocalStorage: true,
    restoreOnActivated: true,
    saveOnDeactivated: true
  }
)

const selectItems = [
  { title: 'Option 1', value: 'option1' },
  { title: 'Option 2', value: 'option2' },
  { title: 'Option 3', value: 'option3' }
]

const updateComponentState = () => {
  componentState.saveState()
}
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
