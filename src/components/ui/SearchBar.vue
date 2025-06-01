<template>
  <div class="search-bar-container">
    <v-text-field
      v-model="searchQuery"
      :placeholder="placeholder"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      density="comfortable"
      hide-details
      clearable
      class="search-field"
      @input="handleInput"
      @keydown.enter="handleSearch"
      @click:clear="handleClear"
    >
      <template v-slot:append-inner>
        <v-btn
          v-if="showSearchButton"
          icon="mdi-tune"
          variant="text"
          size="small"
          @click="showFilters = !showFilters"
        />
      </template>
    </v-text-field>

    <!-- Quick filters -->
    <v-expand-transition>
      <v-card
        v-if="showFilters && filters.length > 0"
        class="mt-2 pa-4"
        variant="outlined"
      >
        <div class="d-flex flex-wrap gap-2">
          <v-chip
            v-for="filter in filters"
            :key="filter.key"
            :color="filter.active ? 'primary' : 'default'"
            :variant="filter.active ? 'flat' : 'outlined'"
            size="small"
            clickable
            @click="toggleFilter(filter)"
          >
            <v-icon
              v-if="filter.icon"
              :icon="filter.icon"
              size="16"
              class="me-1"
            />
            {{ filter.label }}
          </v-chip>
        </div>
        
        <v-divider class="my-3" />
        
        <div class="d-flex justify-space-between align-center">
          <v-btn
            variant="text"
            size="small"
            @click="clearAllFilters"
          >
            Clear All
          </v-btn>
          <v-btn
            color="primary"
            size="small"
            @click="applyFilters"
          >
            Apply Filters
          </v-btn>
        </div>
      </v-card>
    </v-expand-transition>

    <!-- Search suggestions -->
    <v-menu
      v-model="showSuggestions"
      :close-on-content-click="false"
      location="bottom"
      offset="4"
    >
      <template v-slot:activator="{ props }">
        <div v-bind="props" style="display: none;"></div>
      </template>
      
      <v-card
        v-if="suggestions.length > 0"
        max-width="400"
        class="suggestions-card"
      >
        <v-list density="compact">
          <v-list-subheader>Suggestions</v-list-subheader>
          <v-list-item
            v-for="suggestion in suggestions"
            :key="suggestion.id"
            @click="selectSuggestion(suggestion)"
          >
            <template v-slot:prepend>
              <v-icon
                :icon="suggestion.icon || 'mdi-magnify'"
                size="20"
              />
            </template>
            <v-list-item-title>{{ suggestion.title }}</v-list-item-title>
            <v-list-item-subtitle v-if="suggestion.subtitle">
              {{ suggestion.subtitle }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

interface Filter {
  key: string
  label: string
  icon?: string
  active: boolean
}

interface Suggestion {
  id: string
  title: string
  subtitle?: string
  icon?: string
  data?: any
}

interface Props {
  placeholder?: string
  showSearchButton?: boolean
  filters?: Filter[]
  suggestions?: Suggestion[]
  debounceMs?: number
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search...',
  showSearchButton: true,
  filters: () => [],
  suggestions: () => [],
  debounceMs: 300,
})

const emit = defineEmits<{
  search: [query: string]
  filter: [filters: Filter[]]
  suggestion: [suggestion: Suggestion]
  clear: []
}>()

const searchQuery = ref('')
const showFilters = ref(false)
const showSuggestions = ref(false)
const debounceTimer = ref<NodeJS.Timeout | null>(null)

const activeFilters = computed(() => 
  props.filters.filter(filter => filter.active)
)

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const query = target.value

  // Clear existing timer
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value)
  }

  // Set new timer
  debounceTimer.value = setTimeout(() => {
    emit('search', query)
    showSuggestions.value = query.length > 0 && props.suggestions.length > 0
  }, props.debounceMs)
}

const handleSearch = () => {
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value)
  }
  emit('search', searchQuery.value)
  showSuggestions.value = false
}

const handleClear = () => {
  searchQuery.value = ''
  showSuggestions.value = false
  emit('clear')
  emit('search', '')
}

const toggleFilter = (filter: Filter) => {
  filter.active = !filter.active
  emit('filter', [...props.filters])
}

const clearAllFilters = () => {
  props.filters.forEach(filter => {
    filter.active = false
  })
  emit('filter', [...props.filters])
}

const applyFilters = () => {
  showFilters.value = false
  emit('filter', [...props.filters])
}

const selectSuggestion = (suggestion: Suggestion) => {
  searchQuery.value = suggestion.title
  showSuggestions.value = false
  emit('suggestion', suggestion)
  emit('search', suggestion.title)
}

// Close suggestions when clicking outside
watch(searchQuery, (newValue) => {
  if (!newValue) {
    showSuggestions.value = false
  }
})
</script>

<style scoped>
.search-bar-container {
  position: relative;
  width: 100%;
}

.search-field {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.search-field :deep(.v-field) {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-field :deep(.v-field:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.search-field :deep(.v-field--focused) {
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.suggestions-card {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.gap-2 {
  gap: 8px;
}
</style>
