<template>
  <div class="knowledgebase-sidebar" :class="{ 'collapsed': collapsed }">
    <!-- Toggle Button -->
    <!-- <div class="sidebar-toggle" @click="$emit('toggle-sidebar')">
      <el-icon>
        <ArrowRight v-if="collapsed" />
        <ArrowLeft v-if="!collapsed" />
      </el-icon>
    </div> -->

    <div v-if="!collapsed" class="sidebar-content">
      <!-- Search -->
      <div class="sidebar-search">
        <el-input
          v-model="localSearchQuery"
          placeholder="Search knowledge base..."
          @input="handleSearchInput"
          @keyup.enter="$emit('search', localSearchQuery)"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- App Selection -->
      <div class="app-selection">
        <h3 class="section-title">Applications</h3>
        <el-select
          :model-value="selectedAppId"
          placeholder="Select Application"
          class="app-select"
          :loading="isLoadingApps"
          clearable
          @change="$emit('app-change', $event)"
          @clear="$emit('app-change', null)"
        >
          <el-option
            v-for="app in applications"
            :key="app.id"
            :label="app.name"
            :value="app.id"
          >
            <div class="app-option">
              <div class="app-info">
                <span class="app-name">{{ app.name }}</span>
                <div class="app-meta">
                  <el-tag 
                    :type="getAppStatusType(app.status)"
                    size="small"
                  >
                    {{ app.status }}
                  </el-tag>
                  <span class="article-count">{{ getAppArticleCount(app.id) }} articles</span>
                </div>
              </div>
            </div>
          </el-option>
        </el-select>
      </div>

      <!-- Navigation Menu -->
      <div v-if="selectedAppId" class="navigation-menu">
        <h3 class="section-title">{{ selectedApp?.name }} Docs</h3>
        
        <!-- Overview -->
        <div class="menu-group">
          <div
            class="menu-item"
            :class="{ 'active': activeMenuItem === 'overview' }"
            @click="$emit('menu-select', 'overview')"
          >
            <span>Overview</span>
          </div>
        </div>

        <!-- Dynamic Tree View Category Menu -->
        <div v-for="category in categories" :key="category.id" class="category-tree">
          <CategoryTreeItem 
            :category="category"
            :app-id="selectedAppId"
            :active-menu-item="activeMenuItem"
            :expanded-categories="expandedCategories"
            :depth="0"
            @toggle-category="toggleCategory"
            @article-select="$emit('article-select', $event)"
            :get-articles-for-category="getArticlesForCategory"
            :get-category-article-count="getCategoryArticleCount"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch, type PropType } from 'vue'
import type { Application } from '@/types'
import {
  ArrowLeft,
  ArrowRight,
  Search
} from '@element-plus/icons-vue'
import CategoryTreeItem from './CategoryTreeItem.vue'

export default defineComponent({
  name: 'KnowledgebaseSidebar',
  components: {
    ArrowLeft,
    ArrowRight,
    Search,
    CategoryTreeItem
  },
  props: {
    collapsed: {
      type: Boolean,
      default: false
    },
    searchQuery: {
      type: String,
      default: ''
    },
    applications: {
      type: Array as PropType<Application[]>,
      required: true
    },
    selectedAppId: {
      type: Number as PropType<number | null>,
      default: null
    },
    selectedApp: {
      type: Object as PropType<Application | undefined>,
      default: undefined
    },
    activeMenuItem: {
      type: String,
      required: true
    },
    isLoadingApps: {
      type: Boolean,
      default: false
    },
    expandedCategories: {
      type: Object,
      required: true
    },
    getAppStatusType: {
      type: Function as PropType<(status: string | undefined) => string>,
      required: true
    },
    getAppArticleCount: {
      type: Function as PropType<(appId: number) => number>,
      required: true
    },
    getCategoriesForApp: {
      type: Function as PropType<(appId: number) => any[]>,
      required: true
    },
    getArticlesForCategory: {
      type: Function as PropType<(appId: number, categoryId: number) => any[]>,
      required: true
    },
    getCategoryArticleCount: {
      type: Function as PropType<(appId: number, categoryId: number) => number>,
      required: true
    }
  },
  emits: ['toggle-sidebar', 'search', 'app-change', 'menu-select', 'toggle-category', 'article-select'],
  setup(props, { emit }) {
    // Local state for search query
    const localSearchQuery = ref(props.searchQuery)
    
    // Watch props to sync local state
    watch(() => props.searchQuery, (newValue) => {
      localSearchQuery.value = newValue
    })
    
    // Handle search input
    const handleSearchInput = (value: string) => {
      localSearchQuery.value = value
      emit('search', value)
    }
    
    const categories = computed(() => {
      if (!props.selectedAppId) return []
      return props.getCategoriesForApp(props.selectedAppId)
    })

    // Fungsi untuk emit toggle kategori ke parent
    const toggleCategory = (categoryId: number) => {
      emit('toggle-category', categoryId)
    }

    const formatCategoryName = (category: string): string => {
      return category
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
    }

    const getCategoryArticleCount = (appId: number, categoryId: number): number => {
      return props.getCategoryArticleCount(appId, categoryId)
    }

    const getArticlesForCategory = (appId: number, categoryId: number): any[] => {
      return props.getArticlesForCategory(appId, categoryId)
    }

    return {
      localSearchQuery,
      handleSearchInput,
      categories,
      toggleCategory,
      formatCategoryName,
      getCategoryArticleCount,
      getArticlesForCategory
    }
  }
})
</script>

<style scoped>
.knowledgebase-sidebar {
  position: relative;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  height: 100vh;
  overflow-y: auto;
  transition: all 0.3s ease;
  width: 300px;
}

.knowledgebase-sidebar.collapsed {
  width: 60px;
}

.sidebar-toggle {
  position: absolute;
  top: 20px;
  right: -15px;
  z-index: 10;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.sidebar-toggle:hover {
  background: #f9fafb;
}

.sidebar-content {
  padding: 24px 16px;
}

.sidebar-search {
  margin-bottom: 24px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.app-selection {
  margin-bottom: 32px;
}

.app-select {
  width: 100%;
}

.app-option {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.app-info {
  flex: 1;
  min-width: 0;
}

.app-name {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 4px;
  display: block;
}

.app-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.article-count {
  font-size: 11px;
  color: #9ca3af;
}

.navigation-menu {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.menu-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.group-title {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  margin: 0 0 4px 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Tree View Styles */
.category-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  color: #374151;
  font-weight: 500;
  user-select: none;
}

.category-header:hover {
  background: #f3f4f6;
  color: #111827;
}

.category-header.child-category {
  font-size: 13px;
  font-weight: 400;
}

.expand-icon {
  font-size: 12px;
  transition: transform 0.2s ease;
  color: #6b7280;
}

.category-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.category-name {
  flex: 1;
  font-weight: inherit;
}

.category-badge {
  margin-left: auto;
}

.category-content {
  overflow: hidden;
  transition: all 0.3s ease;
}

.nested-category {
  border-left: 1px solid #e5e7eb;
  margin-left: 16px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  color: #374151;
}

.menu-item:hover {
  background: #f3f4f6;
  color: #111827;
}

.menu-item.article-item {
  font-size: 13px;
  font-weight: 400;
}

.menu-item .el-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.article-icon {
  font-size: 14px;
  color: #6b7280;
}

.article-title {
  flex: 1;
  line-height: 1.4;
}

.article-meta {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
}

.child-content {
  border-left: 1px solid #e5e7eb;
  margin-left: 8px;
}
</style>