<template>
  <div class="faq-list">
    <div class="faq-header">
      <div class="search-section">
        <div class="search-box">
          <input
            v-model="searchQuery"
            @input="handleSearch"
            type="text"
            placeholder="Search FAQs..."
            class="search-input"
          />
          <button 
            v-if="searchQuery" 
            @click="clearSearch" 
            class="clear-search"
          >
            ×
          </button>
        </div>
        
        <div class="category-filter">
          <label>Category:</label>
          <select v-model="selectedCategory" @change="handleCategoryChange" class="category-select">
            <option 
              v-for="category in knowledgebaseStore.getCategories" 
              :key="category" 
              :value="category"
            >
              {{ category === 'all' ? 'All Categories' : category }}
            </option>
          </select>
        </div>
      </div>
      
      <div class="results-info">
        <span v-if="!knowledgebaseStore.isLoading">
          {{ knowledgebaseStore.getFaqs.length }} FAQ{{ knowledgebaseStore.getFaqs.length !== 1 ? 's' : '' }} found
        </span>
      </div>
    </div>

    <div v-if="knowledgebaseStore.isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading FAQs...</p>
    </div>

    <div v-else-if="knowledgebaseStore.error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Failed to load FAQs</h3>
      <p>{{ knowledgebaseStore.error }}</p>
      <button @click="reloadFaqs" class="retry-btn">Try Again</button>
    </div>

    <div v-else-if="knowledgebaseStore.getFaqs.length === 0" class="empty-state">
      <div class="empty-icon">🔍</div>
      <h3>No FAQs found</h3>
      <p v-if="searchQuery">Try adjusting your search terms or category filter.</p>
      <p v-else>No FAQs are available at the moment.</p>
    </div>

    <div v-else class="faq-items">
      <div 
        v-for="faq in knowledgebaseStore.getFaqs" 
        :key="faq.id" 
        class="faq-item"
        :class="{ 'expanded': expandedItems.includes(faq.id) }"
      >
        <div 
          class="faq-question" 
          @click="toggleExpand(faq.id)"
          role="button"
          tabindex="0"
          @keydown.enter="toggleExpand(faq.id)"
          @keydown.space="toggleExpand(faq.id)"
        >
          <h3>{{ faq.question }}</h3>
          <div class="faq-meta">
            <span class="faq-category">{{ faq.category }}</span>
            <span class="faq-date">{{ formatDate(faq.createdAt) }}</span>
          </div>
          <div class="expand-icon">
            <span v-if="expandedItems.includes(faq.id)">−</span>
            <span v-else>+</span>
          </div>
        </div>
        
        <div v-if="expandedItems.includes(faq.id)" class="faq-answer">
          <div class="answer-content">
            {{ faq.answer }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useKnowledgebaseStore } from '@/stores/knowledgebase'

// Define component name for better debugging
defineOptions({
  name: 'FaqList'
})

const knowledgebaseStore = useKnowledgebaseStore()

const searchQuery = ref('')
const selectedCategory = ref('all')
const expandedItems = ref<number[]>([])

let searchTimeout: number | null = null

const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  searchTimeout = window.setTimeout(async () => {
    if (searchQuery.value.trim()) {
      await knowledgebaseStore.searchFAQsAction(searchQuery.value)
    } else {
      knowledgebaseStore.clearSearch()
    }
  }, 300) // Debounce search by 300ms
}

const clearSearch = () => {
  searchQuery.value = ''
  knowledgebaseStore.clearSearch()
}

const handleCategoryChange = () => {
  knowledgebaseStore.setCategory(selectedCategory.value)
}

const toggleExpand = (id: number) => {
  const index = expandedItems.value.indexOf(id)
  if (index > -1) {
    expandedItems.value.splice(index, 1)
  } else {
    expandedItems.value.push(id)
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const reloadFaqs = async () => {
  await knowledgebaseStore.fetchFAQs()
}

onMounted(async () => {
  await knowledgebaseStore.fetchFAQs()
})
</script>

<style scoped>
.faq-list {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.faq-header {
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.search-section {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  align-items: end;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease-in-out;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.clear-search {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 18px;
  color: #6b7280;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.clear-search:hover {
  background: #f3f4f6;
  color: #374151;
}

.category-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #374151;
}

.category-select {
  padding: 8px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  cursor: pointer;
}

.results-info {
  color: #6b7280;
  font-size: 14px;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  text-align: center;
}

.loading-state {
  color: #6b7280;
}

.error-state {
  color: #dc2626;
}

.empty-state {
  color: #6b7280;
}

.error-icon,
.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-btn {
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 16px;
}

.retry-btn:hover {
  background: #2563eb;
}

.faq-items {
  max-height: 600px;
  overflow-y: auto;
}

.faq-item {
  border-bottom: 1px solid #e5e7eb;
}

.faq-item:last-child {
  border-bottom: none;
}

.faq-question {
  padding: 20px 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: background-color 0.2s ease-in-out;
}

.faq-question:hover {
  background: #f9fafb;
}

.faq-question h3 {
  flex: 1;
  margin: 0;
  color: #1f2937;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
}

.faq-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: right;
}

.faq-category {
  font-size: 12px;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.faq-date {
  font-size: 11px;
  color: #9ca3af;
}

.expand-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  color: #6b7280;
  transition: all 0.2s ease-in-out;
}

.faq-item.expanded .expand-icon {
  background: #3b82f6;
  color: white;
}

.faq-answer {
  border-top: 1px solid #f3f4f6;
  background: #fafafa;
}

.answer-content {
  padding: 20px 24px;
  color: #4b5563;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .faq-header {
    padding: 16px;
  }
  
  .search-section {
    flex-direction: column;
    gap: 12px;
  }
  
  .faq-question {
    padding: 16px;
    flex-wrap: wrap;
  }
  
  .faq-meta {
    order: -1;
    text-align: left;
    flex-direction: row;
    gap: 8px;
  }
  
  .answer-content {
    padding: 16px;
  }
}
</style>