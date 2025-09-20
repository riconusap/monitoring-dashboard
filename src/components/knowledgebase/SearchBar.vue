<template>
  <div class="search-container">
    <!-- Main Search Input -->
    <div class="search-input-wrapper">
      <el-input
        v-model="localSearchQuery"
        placeholder="Search articles, apps, tags, or content..."
        size="large"
        clearable
        @input="handleSearchInput"
        @clear="handleClear"
        @keyup.enter="handleSearch"
        class="search-input"
      >
        <template #prefix>
          <el-icon class="search-icon">
            <Search />
          </el-icon>
        </template>
        <template #suffix>
          <el-button 
            v-if="isSearching" 
            type="text" 
            :loading="true" 
            size="small"
          />
          <el-button 
            v-else-if="localSearchQuery"
            type="primary" 
            size="small"
            @click="handleSearch"
          >
            Search
          </el-button>
        </template>
      </el-input>

      <!-- Search Suggestions -->
      <div v-if="showSuggestions && searchSuggestions.length > 0" class="suggestions-dropdown">
        <div class="suggestions-header">
          <span class="suggestions-title">Suggestions</span>
        </div>
        <div 
          v-for="suggestion in searchSuggestions" 
          :key="suggestion"
          class="suggestion-item"
          @click="selectSuggestion(suggestion)"
        >
          <el-icon class="suggestion-icon">
            <Search />
          </el-icon>
          <span class="suggestion-text">{{ suggestion }}</span>
        </div>
      </div>
    </div>

    <!-- Advanced Search Options (Collapsible) -->
    <div v-if="showAdvancedOptions" class="advanced-search">
      <div class="search-options-grid">
        <!-- Search Scope -->
        <div class="search-scope">
          <label class="options-label">Search in:</label>
          <div class="scope-checkboxes">
            <el-checkbox 
              v-model="localSearchOptions.searchInTitle"
              @change="updateOptions"
            >
              Title
            </el-checkbox>
            <el-checkbox 
              v-model="localSearchOptions.searchInTags"
              @change="updateOptions"
            >
              Tags
            </el-checkbox>
            <el-checkbox 
              v-model="localSearchOptions.searchInAppName"
              @change="updateOptions"
            >
              App Name
            </el-checkbox>
            <el-checkbox 
              v-model="localSearchOptions.searchInContent"
              @change="updateOptions"
            >
              Content
            </el-checkbox>
          </div>
        </div>

        <!-- App Filter -->
        <div class="app-filter">
          <label class="options-label">Filter by App:</label>
          <el-select
            v-model="selectedAppFilter"
            placeholder="All applications"
            clearable
            @change="updateAppFilter"
            style="width: 100%"
          >
            <el-option
              v-for="app in knowledgebaseApps"
              :key="app.app_id"
              :label="app.name"
              :value="app.app_id"
            />
          </el-select>
        </div>
      </div>

      <!-- Active Filters Display -->
      <div v-if="hasActiveFilters" class="active-filters">
        <span class="filters-label">Active filters:</span>
        <div class="filter-tags">
          <!-- App Filter Tag -->
          <template v-if="searchFilters.appIds.length > 0">
            <el-tag
              v-for="appId in searchFilters.appIds"
              :key="`app-${appId}`"
              closable
              type="primary"
              @close="removeAppFilter(appId)"
            >
              App: {{ getAppName(appId) }}
            </el-tag>
          </template>
          
          <!-- Tag Filter Tags -->
          <el-tag
            v-for="tag in searchFilters.tags"
            :key="`tag-${tag}`"
            closable
            type="success"
            @close="removeTagFilter(tag)"
          >
            Tag: {{ tag }}
          </el-tag>
          
          <!-- Category Filter Tags -->
          <el-tag
            v-for="category in searchFilters.categories"
            :key="`cat-${category}`"
            closable
            type="warning"
            @close="removeCategoryFilter(category)"
          >
            Category: {{ category }}
          </el-tag>
        </div>
        <el-button 
          type="text" 
          size="small" 
          @click="clearAllFilters"
          class="clear-filters-btn"
        >
          Clear all filters
        </el-button>
      </div>

      <!-- Available Tags for Quick Filter -->
      <div v-if="availableTags.length > 0" class="quick-filters">
        <label class="options-label">Quick filter by tags:</label>
        <div class="tag-cloud">
          <el-tag
            v-for="tag in availableTags.slice(0, 20)"
            :key="tag"
            :type="searchFilters.tags.includes(tag) ? 'success' : 'info'"
            :effect="searchFilters.tags.includes(tag) ? 'dark' : 'light'"
            @click="toggleTagFilter(tag)"
            class="clickable-tag"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>
    </div>

    <!-- Toggle Advanced Options -->
    <div class="advanced-toggle">
      <el-button 
        type="text" 
        size="small"
        @click="showAdvancedOptions = !showAdvancedOptions"
        class="toggle-advanced-btn"
      >
        <el-icon class="toggle-icon">
          <ArrowDown v-if="!showAdvancedOptions" />
          <ArrowUp v-else />
        </el-icon>
        {{ showAdvancedOptions ? 'Hide' : 'Show' }} Advanced Options
      </el-button>
    </div>

    <!-- Search Results Count -->
    <div v-if="hasActiveSearch" class="search-results-info">
      <span class="results-count">
        {{ filteredSearchResults.length }} result{{ filteredSearchResults.length !== 1 ? 's' : '' }} found
      </span>
      <el-button 
        type="text" 
        size="small" 
        @click="clearSearch"
        class="clear-search-btn"
      >
        Clear search
      </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Search, ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import type { SearchOptions, SearchFilters } from '@/types/knowledgebase'

// Props
interface Props {
  searchQuery: string
  isSearching: boolean
  searchOptions: SearchOptions
  searchFilters: SearchFilters
  searchSuggestions: string[]
  availableTags: string[]
  knowledgebaseApps: any[]
  filteredSearchResults: any[]
  hasActiveSearch: boolean
}

const props = withDefaults(defineProps<Props>(), {
  searchQuery: '',
  isSearching: false,
  searchSuggestions: () => [],
  availableTags: () => [],
  knowledgebaseApps: () => [],
  filteredSearchResults: () => [],
  hasActiveSearch: false
})

// Emits
interface Emits {
  (e: 'search', query: string): void
  (e: 'clear'): void
  (e: 'updateOptions', options: Partial<SearchOptions>): void
  (e: 'updateFilters', filters: Partial<SearchFilters>): void
  (e: 'getSuggestions', query: string): void
}

const emit = defineEmits<Emits>()

// Local state
const localSearchQuery = ref(props.searchQuery)
const localSearchOptions = ref<SearchOptions>({ ...props.searchOptions })
const selectedAppFilter = ref<number | null>(null)
const showAdvancedOptions = ref(false)
const showSuggestions = ref(false)
const searchInputTimer = ref<ReturnType<typeof setTimeout> | null>(null)

// Computed
const hasActiveFilters = computed(() => {
  return props.searchFilters.appIds.length > 0 ||
         props.searchFilters.tags.length > 0 ||
         props.searchFilters.categories.length > 0
})

// Methods
const handleSearchInput = (value: string) => {
  localSearchQuery.value = value
  
  // Clear previous timer
  if (searchInputTimer.value) {
    clearTimeout(searchInputTimer.value)
  }
  
  // Show suggestions if query is long enough
  if (value.length >= 2) {
    showSuggestions.value = true
    searchInputTimer.value = setTimeout(() => {
      emit('getSuggestions', value)
    }, 300)
  } else {
    showSuggestions.value = false
  }
}

const handleSearch = () => {
  if (localSearchQuery.value.trim()) {
    emit('search', localSearchQuery.value.trim())
    showSuggestions.value = false
  }
}

const handleClear = () => {
  localSearchQuery.value = ''
  showSuggestions.value = false
  emit('clear')
}

const selectSuggestion = (suggestion: string) => {
  localSearchQuery.value = suggestion
  showSuggestions.value = false
  handleSearch()
}

const updateOptions = () => {
  emit('updateOptions', { ...localSearchOptions.value })
}

const updateAppFilter = (appId: number | null) => {
  if (appId) {
    emit('updateFilters', { 
      appIds: [appId] 
    })
    localSearchOptions.value.selectedAppId = appId
  } else {
    emit('updateFilters', { 
      appIds: [] 
    })
    localSearchOptions.value.selectedAppId = undefined
  }
  emit('updateOptions', { ...localSearchOptions.value })
}

const removeAppFilter = (appId: number) => {
  const newAppIds = props.searchFilters.appIds.filter(id => id !== appId)
  emit('updateFilters', { appIds: newAppIds })
  if (newAppIds.length === 0) {
    selectedAppFilter.value = null
  }
}

const removeTagFilter = (tag: string) => {
  const newTags = props.searchFilters.tags.filter(t => t !== tag)
  emit('updateFilters', { tags: newTags })
}

const removeCategoryFilter = (category: string) => {
  const newCategories = props.searchFilters.categories.filter(c => c !== category)
  emit('updateFilters', { categories: newCategories })
}

const toggleTagFilter = (tag: string) => {
  const currentTags = [...props.searchFilters.tags]
  const index = currentTags.indexOf(tag)
  
  if (index > -1) {
    currentTags.splice(index, 1)
  } else {
    currentTags.push(tag)
  }
  
  emit('updateFilters', { tags: currentTags })
}

const clearAllFilters = () => {
  selectedAppFilter.value = null
  emit('updateFilters', { 
    appIds: [], 
    tags: [], 
    categories: [] 
  })
}

const clearSearch = () => {
  handleClear()
}

const getAppName = (appId: number): string => {
  const app = props.knowledgebaseApps.find(a => a.app_id === appId)
  return app ? app.name : 'Unknown App'
}

// Watchers
watch(() => props.searchQuery, (newValue) => {
  localSearchQuery.value = newValue
})

watch(() => props.searchOptions, (newValue) => {
  localSearchOptions.value = { ...newValue }
  selectedAppFilter.value = newValue.selectedAppId || null
}, { deep: true })

// Handle click outside to close suggestions
onMounted(() => {
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement
    if (!target.closest('.search-container')) {
      showSuggestions.value = false
    }
  })
})
</script>

<style scoped>
.search-container {
  margin-bottom: 20px;
}

.search-input-wrapper {
  position: relative;
}

.search-input {
  --el-input-border-radius: 8px;
}

.search-icon {
  color: var(--el-text-color-placeholder);
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
}

.suggestions-header {
  padding: 8px 12px;
  border-bottom: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color-page);
}

.suggestions-title {
  font-size: 12px;
  color: var(--el-text-color-regular);
  font-weight: 500;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.suggestion-item:hover {
  background: var(--el-bg-color-page);
}

.suggestion-icon {
  margin-right: 8px;
  color: var(--el-text-color-placeholder);
  font-size: 14px;
}

.suggestion-text {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.advanced-search {
  margin-top: 16px;
  padding: 16px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
}

.search-options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .search-options-grid {
    grid-template-columns: 1fr;
  }
}

.options-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-regular);
  margin-bottom: 8px;
}

.scope-checkboxes {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.active-filters {
  margin-bottom: 16px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid var(--el-border-color-lighter);
}

.filters-label {
  font-size: 12px;
  color: var(--el-text-color-regular);
  font-weight: 500;
  margin-bottom: 8px;
  display: block;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.clear-filters-btn {
  font-size: 12px;
}

.quick-filters {
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.clickable-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.clickable-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.advanced-toggle {
  margin-top: 12px;
  text-align: center;
}

.toggle-advanced-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}

.toggle-icon {
  font-size: 12px;
}

.search-results-info {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--el-color-primary-light-9);
  border-radius: 6px;
  font-size: 14px;
}

.results-count {
  color: var(--el-color-primary);
  font-weight: 500;
}

.clear-search-btn {
  font-size: 12px;
}
</style>