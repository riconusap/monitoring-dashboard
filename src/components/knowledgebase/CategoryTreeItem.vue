<template>
  <div v-if="shouldShowCategory" class="category-item">
    <!-- Category Header -->
    <div 
      class="category-header"
      :class="{ 'expanded': expandedCategories.has(category.id) }"
      :style="{ paddingLeft: (depth * 16 + 8) + 'px' }"
      @click="$emit('toggle-category', category.id)"
    >
      <el-icon class="expand-icon" v-if="hasChildrenOrArticles">
        <ArrowRight v-if="!expandedCategories.has(category.id)" />
        <ArrowDown v-else />
      </el-icon>
      <div v-else class="expand-placeholder"></div>
      <span class="category-name">{{ category.name }}</span>
      <el-badge 
        :value="getCategoryArticleCount(appId, category.id)"
        :hidden="getCategoryArticleCount(appId, category.id) === 0"
        class="category-badge"
        type="primary"
        size="small"
        :max="99"
      />
    </div>
    
    <!-- Category Content (Articles + Children) -->
    <div 
      v-show="expandedCategories.has(category.id)"
      class="category-content"
    >
      <!-- Articles for this category -->
      <div
        v-for="article in getArticlesForCategory(appId, category.id)"
        :key="'article-' + article.id"
        class="menu-item article-item"
        :class="{ 'active': activeMenuItem === `category-${category.id}-article-${article.id}` }"
        :style="{ paddingLeft: ((depth + 1) * 16 + 24) + 'px' }"
        @click="$emit('article-select', { categoryId: category.id, articleId: article.id })"
      >
        <span class="article-title">{{ article.title }}</span>
        <div class="article-meta">
          <el-tag size="small" type="info">{{ article.read_time }}min</el-tag>
        </div>
      </div>
      
      <!-- Recursive Children Categories -->
      <CategoryTreeItem 
        v-for="childCategory in category.children"
        :key="'category-' + childCategory.id"
        :category="childCategory"
        :app-id="appId"
        :active-menu-item="activeMenuItem"
        :expanded-categories="expandedCategories"
        :depth="depth + 1"
        :get-articles-for-category="getArticlesForCategory"
        :get-category-article-count="getCategoryArticleCount"
        @toggle-category="$emit('toggle-category', $event)"
        @article-select="$emit('article-select', $event)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { ArrowRight, ArrowDown } from '@element-plus/icons-vue'

export default defineComponent({
  name: 'CategoryTreeItem',
  components: {
    ArrowRight,
    ArrowDown
  },
  props: {
    category: {
      type: Object,
      required: true
    },
    appId: {
      type: Number,
      required: true
    },
    activeMenuItem: {
      type: String,
      required: true
    },
    expandedCategories: {
      type: Object,
      required: true
    },
    depth: {
      type: Number,
      default: 0
    },
    getArticlesForCategory: {
      type: Function,
      required: true
    },
    getCategoryArticleCount: {
      type: Function,
      required: true
    }
  },
  emits: ['toggle-category', 'article-select'],
  setup(props) {
    const hasChildrenOrArticles = computed(() => {
      const hasChildren = props.category.children && props.category.children.length > 0
      const hasArticles = props.getArticlesForCategory(props.appId, props.category.id).length > 0
      
      // Recursively check if any children have articles
      if (hasChildren && !hasArticles) {
        const hasChildrenWithArticles = props.category.children.some((child: any) => {
          const childHasArticles = props.getArticlesForCategory(props.appId, child.id).length > 0
          if (childHasArticles) return true
          
          // Check grandchildren recursively
          const checkGrandChildren = (category: any): boolean => {
            const grandChildArticles = props.getArticlesForCategory(props.appId, category.id).length > 0
            if (grandChildArticles) return true
            
            if (category.children && category.children.length > 0) {
              return category.children.some((grandChild: any) => checkGrandChildren(grandChild))
            }
            return false
          }
          
          return child.children && child.children.some(checkGrandChildren)
        })
        return hasChildrenWithArticles
      }
      
      return hasChildren || hasArticles
    })

    const shouldShowCategory = computed(() => {
      return hasChildrenOrArticles.value
    })

    return {
      hasChildrenOrArticles,
      shouldShowCategory
    }
  }
})
</script>

<style scoped>
.expand-placeholder {
  width: 12px;
  height: 12px;
}

.category-item {
  width: 100%;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
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

.menu-item.article-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
  color: #374151;
  font-weight: 400;
}

.menu-item.article-item:hover {
  background: #f3f4f6;
  color: #111827;
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
</style>