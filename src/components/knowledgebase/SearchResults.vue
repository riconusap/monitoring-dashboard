<template>
  <div v-if="showResults && filteredResults.length > 0" class="search-results">
    <div class="search-results-header">
      <h3 class="results-title">Search Results</h3>
      <span class="results-count">{{ filteredResults.length }} result{{ filteredResults.length !== 1 ? 's' : '' }}</span>
    </div>

    <div class="results-list">
      <div
        v-for="result in filteredResults"
        :key="`${result.type}-${result.id}`"
        class="result-item"
        @click="$emit('selectResult', result)"
      >
        <!-- Result Type Badge -->
        <div class="result-badge">
          <el-tag
            :type="result.type === 'article' ? 'primary' : 'success'"
            size="small"
            effect="light"
          >
            {{ result.type === 'article' ? 'Article' : 'Application' }}
          </el-tag>
        </div>

        <!-- Result Content -->
        <div class="result-content">
          <!-- Title -->
          <h4 class="result-title">
            <span v-html="highlightText(result.title, searchQuery)"></span>
          </h4>

          <!-- Meta Information -->
          <div class="result-meta">
            <span v-if="result.appName" class="meta-item">
              <el-icon class="meta-icon">
                <Document />
              </el-icon>
              {{ result.appName }}
            </span>
            <span v-if="result.categoryName" class="meta-item">
              <el-icon class="meta-icon">
                <Folder />
              </el-icon>
              {{ result.categoryName }}
            </span>
          </div>

          <!-- Snippet -->
          <div v-if="result.snippet" class="result-snippet" v-html="result.snippet"></div>

          <!-- Tags -->
          <div v-if="result.tags && result.tags.length > 0" class="result-tags">
            <el-tag
              v-for="tag in result.tags.slice(0, 5)"
              :key="tag"
              size="small"
              type="info"
              effect="light"
              class="tag-item"
            >
              {{ tag }}
            </el-tag>
            <span v-if="result.tags.length > 5" class="more-tags">
              +{{ result.tags.length - 5 }} more
            </span>
          </div>
        </div>

        <!-- Relevance Score -->
        <div class="result-score">
          <div class="score-bar">
            <div 
              class="score-fill"
              :style="{ width: `${Math.min(result.relevanceScore, 100)}%` }"
            ></div>
          </div>
          <span class="score-value">{{ Math.round(result.relevanceScore) }}%</span>
        </div>
      </div>
    </div>

    <!-- Load More Results (if needed) -->
    <div v-if="canLoadMore" class="load-more">
      <el-button type="text" @click="$emit('loadMore')">
        Load more results
      </el-button>
    </div>
  </div>

  <!-- No Results State -->
  <div v-else-if="showResults && filteredResults.length === 0" class="no-results">
    <div class="no-results-icon">
      <el-icon size="48">
        <Search />
      </el-icon>
    </div>
    <h3 class="no-results-title">No results found</h3>
    <p class="no-results-text">
      Try adjusting your search terms or filters to find what you're looking for.
    </p>
    <div class="search-suggestions">
      <p class="suggestions-title">Suggestions:</p>
      <ul class="suggestions-list">
        <li>Check your spelling</li>
        <li>Try different or more general keywords</li>
        <li>Remove some filters</li>
        <li>Search in different content types</li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { Document, Folder, Search } from '@element-plus/icons-vue'
import type { SearchResult } from '@/types/knowledgebase'

// Props
interface Props {
  results: SearchResult[]
  filteredResults: SearchResult[]
  searchQuery: string
  showResults: boolean
  maxResults?: number
}

const props = withDefaults(defineProps<Props>(), {
  results: () => [],
  filteredResults: () => [],
  searchQuery: '',
  showResults: false,
  maxResults: 50
})

// Emits
interface Emits {
  (e: 'selectResult', result: SearchResult): void
  (e: 'loadMore'): void
}

defineEmits<Emits>()

// Computed
const canLoadMore = computed(() => {
  return props.results.length > props.maxResults
})

// Methods
const highlightText = (text: string, query: string): string => {
  if (!query.trim()) return text
  
  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi')
  return text.replace(regex, '<mark class="search-highlight">$1</mark>')
}

const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
</script>

<style scoped>
.search-results {
  margin-top: 20px;
}

.search-results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.results-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.results-count {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: white;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.result-item:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
  transform: translateY(-1px);
}

.result-badge {
  flex-shrink: 0;
  margin-top: 2px;
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 1.4;
}

.result-title :deep(.search-highlight) {
  background: yellow;
  padding: 1px 2px;
  border-radius: 2px;
  font-weight: 700;
}

.result-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.meta-icon {
  font-size: 12px;
}

.result-snippet {
  margin-bottom: 12px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--el-text-color-regular);
}

.result-snippet :deep(mark) {
  background: yellow;
  padding: 1px 2px;
  border-radius: 2px;
  font-weight: 600;
}

.result-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.tag-item {
  font-size: 11px;
}

.more-tags {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.result-score {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 60px;
}

.score-bar {
  width: 40px;
  height: 6px;
  background: var(--el-border-color-light);
  border-radius: 3px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--el-color-success), var(--el-color-primary));
  transition: width 0.3s ease;
}

.score-value {
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-regular);
}

.load-more {
  text-align: center;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.no-results {
  text-align: center;
  padding: 40px 20px;
  background: white;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  margin-top: 20px;
}

.no-results-icon {
  margin-bottom: 16px;
  color: var(--el-text-color-placeholder);
}

.no-results-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.no-results-text {
  margin: 0 0 24px 0;
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.5;
}

.search-suggestions {
  text-align: left;
  max-width: 300px;
  margin: 0 auto;
}

.suggestions-title {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.suggestions-list {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  color: var(--el-text-color-regular);
  line-height: 1.6;
}

.suggestions-list li {
  margin-bottom: 4px;
}

@media (max-width: 768px) {
  .result-item {
    flex-direction: column;
    gap: 8px;
  }
  
  .result-score {
    flex-direction: row;
    align-self: flex-end;
  }
  
  .score-bar {
    width: 60px;
  }
}
</style>