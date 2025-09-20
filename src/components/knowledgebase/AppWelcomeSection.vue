<template>
  <div class="app-welcome-section">
    <div class="welcome-header">
      <h2 class="welcome-title">Knowledge Base</h2>
      <p class="welcome-description">
        Select an application below to access its documentation, guides, and resources.
      </p>
    </div>

    <div v-if="isLoadingApps" class="loading-state">
      <el-skeleton :rows="2" animated />
      <div class="app-grid-skeleton">
        <el-skeleton-item 
          v-for="i in 4" 
          :key="i" 
          variant="rect" 
          style="height: 200px; border-radius: 12px;" 
        />
      </div>
    </div>

    <div v-else-if="applications.length === 0" class="empty-state">
      <el-empty 
        description="No applications available"
        :image-size="120"
      />
    </div>

    <div v-else class="app-grid">
      <div
        v-for="app in sortedApplications"
        :key="app.id"
        class="app-card"
        @click="$emit('select-app', app.id)"
      >
        <div class="app-card-header">
          <el-button
            :icon="isApplicationFavorite(app.id) ? StarFilled : Star"
            :type="isApplicationFavorite(app.id) ? 'warning' : 'default'"
            size="small"
            circle
            @click="toggleFavorite($event, app.id)"
            :class="{ 'favorite-active': isApplicationFavorite(app.id) }"
          />
        </div>
        <div class="app-card-body">
          <h3 class="app-name">{{ app.name }}</h3>
          <p class="app-description">{{ app.description }}</p>
          
          <div class="app-meta">
            <span class="article-count">{{ getAppArticleCount(app.id) }} articles</span>
            <span v-if="app.hasApi" class="api-badge">API</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics section -->
    <div v-if="applications.length > 0" class="statistics-section">
      <h3 class="section-title">Quick Stats</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ applications.length }}</div>
          <div class="stat-label">Applications</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ totalArticles }}</div>
          <div class="stat-label">Total Articles</div>
        </div>
      </div>
    </div>

    <!-- Favorite Articles section -->
    <div v-if="favoriteArticles.length > 0" class="favorite-articles-section">
      <h3 class="section-title">
        <el-icon class="favorite-icon"><StarFilled /></el-icon>
        Favorite Articles
      </h3>
      <div class="favorite-articles-grid">
        <div
          v-for="article in favoriteArticles.slice(0, 6)"
          :key="article.id"
          class="favorite-article-card"
          @click="navigateToArticle(article)"
        >
          <div class="article-info">
            <h4 class="article-title">{{ article.title }}</h4>
            <div class="article-meta">
              <span class="app-name">{{ article.applicationName }}</span>
              <span class="article-category">{{ article.category }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="favoriteArticles.length > 6" class="view-all-favorites">
        <el-button type="primary" text @click="$emit('navigate-to-section', 'favorites')">
          View All {{ favoriteArticles.length }} Favorite Articles
        </el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, type PropType } from 'vue'
import { useKnowledgebaseStore } from '@/stores/knowledgebase'
import { StarFilled, Star } from '@element-plus/icons-vue'
import type { Application, FavoriteArticle } from '@/types'

export default defineComponent({
  name: 'AppWelcomeSection',
  components: {
    StarFilled,
    Star
  },
  props: {
    applications: {
      type: Array as PropType<Application[]>,
      required: true
    },
    isLoadingApps: {
      type: Boolean,
      default: false
    },
    getAppStatusType: {
      type: Function as PropType<(status: string | undefined) => string>,
      required: true
    },
    getAppArticleCount: {
      type: Function as PropType<(appId: number) => number>,
      required: true
    }
  },
  emits: ['select-app', 'navigate-to-section'],
  setup(props, { emit }) {
    const knowledgebaseStore = useKnowledgebaseStore()

    // Sort applications with favorites first
    const sortedApplications = computed(() => {
      return [...props.applications].sort((a, b) => {
        const aIsFavorite = knowledgebaseStore.isApplicationFavorite(a.id)
        const bIsFavorite = knowledgebaseStore.isApplicationFavorite(b.id)
        
        if (aIsFavorite && !bIsFavorite) return -1
        if (!aIsFavorite && bIsFavorite) return 1
        return a.name.localeCompare(b.name)
      })
    })

    const totalArticles = computed(() => {
      return props.applications.reduce((total, app) => {
        return total + props.getAppArticleCount(app.id)
      }, 0)
    })

    const formatLastUpdated = (date: Date): string => {
      const now = new Date()
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      
      if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`
      } else if (diffInMinutes < 1440) {
        return `${Math.floor(diffInMinutes / 60)}h ago`
      } else {
        return `${Math.floor(diffInMinutes / 1440)}d ago`
      }
    }

    const toggleFavorite = (event: Event, applicationId: number) => {
      event.stopPropagation()
      knowledgebaseStore.toggleApplicationFavorite(applicationId)
    }

    const navigateToArticle = (article: FavoriteArticle) => {
      // First select the application
      emit('select-app', article.applicationId)
      
      // Then navigate to the specific article after a short delay to ensure app is selected
      setTimeout(() => {
        emit('navigate-to-section', 'article', { articleId: article.id, title: article.title })
      }, 100)
    }

    return {
      sortedApplications,
      totalArticles,
      formatLastUpdated,
      toggleFavorite,
      navigateToArticle,
      isApplicationFavorite: knowledgebaseStore.isApplicationFavorite,
      favoriteArticles: knowledgebaseStore.getFavoriteArticles
    }
  }
})
</script>

<style scoped>
.app-welcome-section {
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-header {
  text-align: center;
  margin-bottom: 48px;
}

.welcome-title {
  font-size: 36px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 16px 0;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-description {
  font-size: 18px;
  color: #6b7280;
  margin: 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.loading-state {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.app-grid-skeleton {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.empty-state {
  padding: 64px 0;
}

.app-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
}

.app-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.app-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
}

.app-card-body {
  text-align: center;
}

.app-card-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.favorite-active {
  color: #fbbf24 !important;
  border-color: #fbbf24 !important;
  background-color: #fef3c7 !important;
}

.favorite-active:hover {
  color: #f59e0b !important;
  border-color: #f59e0b !important;
  background-color: #fde68a !important;
}

.app-name {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
}

.app-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.app-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}

.article-count {
  font-size: 12px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 12px;
}

.api-badge {
  font-size: 10px;
  color: #059669;
  background: #d1fae5;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: 500;
}

.statistics-section {
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid #e5e7eb;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 24px 0;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  transition: all 0.2s ease;
}

.stat-card:hover {
  background: #f1f5f9;
  transform: translateY(-2px);
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.favorite-articles-section {
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid #e5e7eb;
}

.favorite-icon {
  color: #f59e0b;
  margin-right: 8px;
}

.favorite-articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.favorite-article-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.favorite-article-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

.article-info {
  text-align: left;
}

.article-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta {
  display: flex;
  gap: 8px;
  align-items: center;
}

.article-meta .app-name {
  font-size: 12px;
  color: #3b82f6;
  background: #eff6ff;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.article-category {
  font-size: 12px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 12px;
}

.view-all-favorites {
  text-align: center;
  margin-top: 16px;
}

@media (max-width: 768px) {
  .app-welcome-section {
    padding: 24px 16px;
  }
  
  .welcome-title {
    font-size: 28px;
  }
  
  .welcome-description {
    font-size: 16px;
  }
  
  .app-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>